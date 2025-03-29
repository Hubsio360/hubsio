
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
  const { companyRiskScales, loading } = useData();
  const [activeImpactScale, setActiveImpactScale] = useState<string | null>(null);
  const [impactScaleRatings, setImpactScaleRatings] = useState<Record<string, RiskLevel>>({});
  const isInitialized = useRef(false);

  // Extract impact scales
  const impactScales = companyRiskScales
    .filter(scale => 
      scale.scaleType?.category === 'impact' && 
      scale.is_active && 
      scale.levels && 
      scale.levels.length > 0
    )
    .sort((a, b) => {
      // Sort by a predefined order
      const order: Record<string, number> = {
        'financial_impact': 1,
        'regulatory_impact': 2,
        'individual_impact': 3,
        'reputational_impact': 4,
        'productivity_impact': 5
      };
      
      const aName = a.scaleType?.name || '';
      const bName = b.scaleType?.name || '';
      
      return (order[aName] || 999) - (order[bName] || 999);
    });

  // Get the likelihood scale
  const likelihoodScale = companyRiskScales.find(
    scale => scale.scaleType?.category === 'likelihood' && scale.is_active
  );

  // Initialize impactScaleRatings from form value or set defaults
  useEffect(() => {
    if (isInitialized.current || !impactScales.length) return;
    
    const formRatings = form.getValues('impactScaleRatings') || {};
    
    // Create initial impact scale ratings
    const initialRatings: Record<string, RiskLevel> = {};
    
    impactScales.forEach(scale => {
      // Use existing rating from form or initialize with 'medium'
      initialRatings[scale.id] = formRatings[scale.id] || 'medium';
    });
    
    // If we don't have an active scale but we have impact scales, set the first one as active
    if (!activeImpactScale && impactScales.length > 0) {
      setActiveImpactScale(impactScales[0].id);
    }
    
    // Update form with all impact scale ratings
    form.setValue('impactScaleRatings', initialRatings);
    setImpactScaleRatings(initialRatings);
    
    // Use the highest impact rating for the overall impact level
    updateOverallImpactLevel(initialRatings);
    
    isInitialized.current = true;
  }, [impactScales, form, activeImpactScale]);

  // Handle impact scale change
  const handleImpactScaleChange = useCallback((scaleId: string, level: RiskLevel) => {
    // Update the specific scale rating
    setImpactScaleRatings(prev => {
      const updated = { ...prev, [scaleId]: level };
      
      // Update the form value
      form.setValue('impactScaleRatings', updated);
      
      // Update the overall impact level
      updateOverallImpactLevel(updated);
      
      return updated;
    });
  }, [form]);

  // Helper to update the overall impact level based on all scale ratings
  const updateOverallImpactLevel = useCallback((ratings: Record<string, RiskLevel>) => {
    if (!Object.keys(ratings).length) return;
    
    // Find the highest impact level among all scales
    const levels: RiskLevel[] = Object.values(ratings);
    const levelValues: Record<RiskLevel, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    
    // Sort by severity (highest first)
    levels.sort((a, b) => levelValues[b] - levelValues[a]);
    
    // Use the highest level as the overall impact level
    const highestLevel = levels[0] || 'medium';
    form.setValue('rawImpact', highestLevel);
  }, [form]);

  return {
    impactScales,
    likelihoodScale,
    activeImpactScale,
    setActiveImpactScale,
    impactScaleRatings,
    handleImpactScaleChange,
    loading
  };
};
