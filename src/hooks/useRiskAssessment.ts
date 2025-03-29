
import { useState, useEffect } from 'react';
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
      
      // Set the first impact scale as active if there is one and no active scale is set
      if (impacts.length > 0 && !activeImpactScale) {
        setActiveImpactScale(impacts[0].id);
      }
    }
  }, [companyRiskScales, activeImpactScale]);

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
      
      // Set the main impact value (which will be stored in the database)
      form.setValue('rawImpact', maxImpactLevel);
      form.setValue('impactLevel', maxImpactLevel);
    }
  }, [impactScaleRatings, form]);

  // Handle change for a specific impact scale
  const handleImpactScaleChange = (scaleId: string, value: RiskLevel) => {
    const newRatings = { ...impactScaleRatings };
    newRatings[scaleId] = value;
    form.setValue('impactScaleRatings', newRatings);
  };

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
