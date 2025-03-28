
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import ScenarioTemplateSelect from '@/components/risk-analysis/ScenarioTemplateSelect';
import { ErrorState, LoadingState } from '@/components/risk-analysis/new-scenario/ErrorState';
import { RiskScenarioForm } from '@/components/risk-analysis/new-scenario/RiskScenarioForm';
import PageHeader from '@/components/risk-analysis/new-scenario/PageHeader';
import { useNewRiskScenario } from '@/hooks/useNewRiskScenario';
import { EnhancedTemplate } from '@/hooks/useScenarioTemplates';

const NewRiskScenario = () => {
  const { id } = useParams<{ id: string }>();
  const formRef = useRef<any>(null);
  
  // Vérifier que l'ID de l'entreprise est présent
  if (!id) {
    return <ErrorState title="Erreur" description="Identifiant d'entreprise manquant" />;
  }

  const { company, isLoading, handleSubmit } = useNewRiskScenario(id);

  // Fonction pour gérer la sélection d'un modèle
  const handleTemplateSelect = (template: EnhancedTemplate) => {
    if (formRef.current && formRef.current.handleTemplateSelect) {
      formRef.current.handleTemplateSelect(template);
    }
  };

  // Afficher l'état de chargement
  if (isLoading) {
    return <LoadingState />;
  }

  // Vérifier que l'entreprise existe
  if (!company) {
    return <ErrorState title="Erreur" description="Entreprise non trouvée" />;
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <PageHeader companyId={id} companyName={company.name} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panneau de sélection de modèle */}
        <div className="md:col-span-1">
          <ScenarioTemplateSelect onSelect={handleTemplateSelect} />
        </div>
        
        {/* Formulaire principal */}
        <div className="md:col-span-2">
          <RiskScenarioForm 
            ref={formRef}
            onSubmit={handleSubmit} 
            companyId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default NewRiskScenario;
