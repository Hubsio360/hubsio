
import { useState, useEffect, useCallback } from 'react';
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

  // Get the current values of all impact scale ratings
  const impactScaleRatings = form.watch('impactScaleRatings') || {};

  useEffect(() => {
    const loadScales = async () => {
      try {
        console.log("Ensuring default scales exist for company:", companyId);
        // Ensure default scales exist for this company
        await ensureDefaultScalesExist(companyId);
        
        // Fetch company risk scales
        await fetchCompanyRiskScales(companyId);
      } catch (error) {
        console.error("Error loading risk scales:", error);
      }
    };
    
    loadScales();
  }, [companyId, fetchCompanyRiskScales, ensureDefaultScalesExist]);

  useEffect(() => {
    if (companyRiskScales && companyRiskScales.length > 0) {
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
      
      setImpactScales(impacts);
      setLikelihoodScale(likelihood || null);
      
      // Initialize impact scale ratings if not already set
      const currentRatings = form.getValues('impactScaleRatings') || {};
      const initialRatings = { ...currentRatings };
      let hasNewRatings = false;
      
      impacts.forEach(scale => {
        if (!initialRatings[scale.id]) {
          initialRatings[scale.id] = 'low';
          hasNewRatings = true;
        }
      });
      
      if (hasNewRatings) {
        form.setValue('impactScaleRatings', initialRatings);
      }
      
      // Set the first impact scale as active if there is one and no active scale is set
      if (impacts.length > 0 && !activeImpactScale) {
        console.log("Setting first impact scale as active:", impacts[0].id);
        setActiveImpactScale(impacts[0].id);
      }
    }
  }, [companyRiskScales, activeImpactScale, form]);

  // Calculate main impact level based on the maximum value from all scale ratings
  useEffect(() => {
    if (Object.keys(impactScaleRatings).length > 0) {
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
      form.setValue('rawImpact', maxImpactLevel);
      form.setValue('impactLevel', maxImpactLevel);
    }
  }, [impactScaleRatings, form]);

  // Handle change for a specific impact scale
  const handleImpactScaleChange = useCallback((scaleId: string, value: RiskLevel) => {
    console.log(`useRiskAssessment: Updating impact scale ${scaleId} to ${value}`);
    const newRatings = { ...impactScaleRatings };
    newRatings[scaleId] = value;
    form.setValue('impactScaleRatings', newRatings);
  }, [impactScaleRatings, form]);

  return {
    loading,
    impactScales,
    likelihoodScale,
    activeImpactScale,
    setActiveImpactScale,
    impactScaleRatings,
    handleImpactScaleChange
  };
};
