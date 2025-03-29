
import { useState, useEffect, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useData } from '@/contexts/DataContext';
import { RiskLevel } from '@/types';
import { RiskScaleWithLevels } from '@/types/risk-scales';
import { RiskScenarioFormValues } from '@/components/risk-analysis/new-scenario/RiskScenarioForm';

export const useRiskAssessment = (
  form: UseFormReturn<RiskScenarioFormValues>,
  companyId: string
) => {
  const { companyRiskScales, loading, fetchCompanyRiskScales, ensureDefaultScalesExist } = useData();
  const [impactScales, setImpactScales] = useState<RiskScaleWithLevels[]>([]);
  const [likelihoodScale, setLikelihoodScale] = useState<RiskScaleWithLevels | null>(null);
  const [activeImpactScale, setActiveImpactScale] = useState<string | null>(null);
  const [processedScaleIds, setProcessedScaleIds] = useState<Set<string>>(new Set());
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  // Get the current values of all impact scale ratings
  const impactScaleRatings = form.watch('impactScaleRatings') || {};

  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      console.log("useRiskAssessment: Cleanup complete - component unmounted");
    };
  }, []);

  // Chargement initial des échelles et initialisation
  useEffect(() => {
    let isEffectActive = true;
    
    const loadScales = async () => {
      try {
        if (!companyId || !isMounted.current) return;
        
        console.log("Ensuring default scales exist for company:", companyId);
        // Ensure default scales exist for this company
        await ensureDefaultScalesExist(companyId);
        
        // Fetch company risk scales
        if (isMounted.current && isEffectActive) {
          await fetchCompanyRiskScales(companyId);
        }
      } catch (error) {
        console.error("Error loading risk scales:", error);
      }
    };
    
    if (companyId) {
      loadScales();
    }
    
    return () => {
      isEffectActive = false;
    };
  }, [companyId, fetchCompanyRiskScales, ensureDefaultScalesExist]);

  // Separation des échelles d'impact et de probabilité
  useEffect(() => {
    if (!isMounted.current || !companyRiskScales) return;
    
    let isEffectActive = true;
    
    if (companyRiskScales.length > 0 && isEffectActive) {
      // Filter active scales by category
      const activeScales = companyRiskScales.filter(scale => scale.isActive || scale.is_active);
      
      // Get impact scales
      const impacts = activeScales.filter(scale => {
        const category = scale.scaleType?.category || '';
        return category.includes('impact') || 
               !category.includes('likelihood'); // Consider scales without specific category as impact
      });
      
      // Get likelihood scale
      const likelihood = activeScales.find(scale => {
        const category = scale.scaleType?.category || '';
        return category.includes('likelihood');
      });
      
      console.log("Filtered impact scales:", impacts.map(s => s.scaleType?.name || 'unknown'));
      console.log("Likelihood scale:", likelihood?.scaleType?.name || 'none');
      
      if (isMounted.current && isEffectActive) {
        setImpactScales(impacts);
        setLikelihoodScale(likelihood || null);
      }
      
      // Track which scales we've already processed to avoid duplicate initializations
      const newProcessedIds = new Set(processedScaleIds);
      
      // Initialize impact scale ratings if not already set
      const currentRatings = form.getValues('impactScaleRatings') || {};
      const initialRatings = { ...currentRatings };
      let hasNewRatings = false;
      
      impacts.forEach(scale => {
        // Only set default value if we haven't processed this scale before
        if (!processedScaleIds.has(scale.id) && !initialRatings[scale.id]) {
          initialRatings[scale.id] = 'low';
          hasNewRatings = true;
          newProcessedIds.add(scale.id);
        }
      });
      
      if (hasNewRatings && isMounted.current && isEffectActive) {
        console.log("Setting initial impact scale ratings:", initialRatings);
        form.setValue('impactScaleRatings', initialRatings);
        setProcessedScaleIds(newProcessedIds);
      }
      
      // Set the first impact scale as active if there is one and no active scale is set
      if (impacts.length > 0 && !activeImpactScale && isMounted.current && isEffectActive) {
        console.log("Setting first impact scale as active:", impacts[0].id, impacts[0].scaleType?.name);
        setActiveImpactScale(impacts[0].id);
      }
    }
    
    return () => {
      isEffectActive = false;
    };
  }, [companyRiskScales, activeImpactScale, form, processedScaleIds]);

  // Calculate main impact level based on the maximum value from all scale ratings
  useEffect(() => {
    if (!isMounted.current) return;
    
    let isEffectActive = true;
    
    if (Object.keys(impactScaleRatings).length > 0 && isEffectActive) {
      const impactValues = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
      let maxImpactValue = 1; // Default to low
      
      // Find the maximum impact level from all scales
      Object.values(impactScaleRatings).forEach(level => {
        const riskLevel = level as RiskLevel;
        const impactValue = impactValues[riskLevel] || 1;
        if (impactValue > maxImpactValue) {
          maxImpactValue = impactValue;
        }
      });
      
      // Convert back to string value
      let maxImpactLevel: RiskLevel = 'low';
      if (maxImpactValue === 2) maxImpactLevel = 'medium';
      if (maxImpactValue === 3) maxImpactLevel = 'high';
      if (maxImpactValue === 4) maxImpactLevel = 'critical';
      
      console.log(`Setting rawImpact to ${maxImpactLevel} based on impact scale ratings:`, impactScaleRatings);
      
      // Set the main impact value (which will be stored in the database)
      if (isMounted.current && isEffectActive) {
        form.setValue('rawImpact', maxImpactLevel);
        form.setValue('impactLevel', maxImpactLevel);
      }
    }
    
    return () => {
      isEffectActive = false;
    };
  }, [impactScaleRatings, form]);

  // Handle change for a specific impact scale
  const handleImpactScaleChange = useCallback((scaleId: string, value: RiskLevel) => {
    if (!isMounted.current) return;
    
    console.log(`useRiskAssessment: Updating impact scale ${scaleId} to ${value}`);
    const newRatings = { ...impactScaleRatings };
    newRatings[scaleId] = value;
    form.setValue('impactScaleRatings', newRatings);
  }, [impactScaleRatings, form]);

  // Reset function to clear state when modal closes
  const reset = useCallback(() => {
    if (!isMounted.current) return;
    
    console.log("useRiskAssessment: Resetting state");
    setImpactScales([]);
    setLikelihoodScale(null);
    setActiveImpactScale(null);
    setProcessedScaleIds(new Set());
  }, []);

  return {
    loading,
    impactScales,
    likelihoodScale,
    activeImpactScale,
    setActiveImpactScale,
    impactScaleRatings,
    handleImpactScaleChange,
    reset
  };
};
