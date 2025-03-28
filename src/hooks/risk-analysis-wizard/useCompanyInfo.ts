
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanyInfo, BusinessProcess } from './types';

export function useCompanyInfo() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    description: '',
    activities: ''
  });
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);

  // Update company name
  const updateCompanyName = (name: string) => {
    setCompanyInfo(prev => ({ ...prev, name }));
  };

  // Update company description
  const updateCompanyDescription = (description: string) => {
    setCompanyInfo(prev => ({ ...prev, description }));
  };

  // Update company activities
  const updateCompanyActivities = (activities: string) => {
    setCompanyInfo(prev => ({ ...prev, activities }));
  };

  // Fetch company info
  const fetchCompanyInfo = async () => {
    if (!companyInfo.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom de l'entreprise",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Appel de la fonction Edge pour obtenir les infos de l\'entreprise');
      
      const { data, error } = await supabase.functions.invoke('ai-risk-analysis', {
        body: {
          action: 'getCompanyInfo',
          data: { companyName: companyInfo.name.trim() }
        }
      });

      if (error) {
        console.error('Erreur lors de l\'appel à la fonction Edge:', error);
        throw new Error(`Erreur lors de la récupération des données: ${error.message}`);
      }

      console.log('Données reçues de la fonction Edge:', data);
      
      // Mise à jour des informations de l'entreprise
      setCompanyInfo(prev => ({
        ...prev, 
        description: data.description || '',
        activities: data.activities || ''
      }));

      // Extraire et créer automatiquement les processus métier à partir des activités
      // Maintenant nous vérifions si data.activities est un array ou une string
      let processLines: string[] = [];
      
      if (Array.isArray(data.activities)) {
        // Si c'est un array, l'utiliser directement
        processLines = data.activities;
      } else if (typeof data.activities === 'string') {
        // Si c'est une string, la diviser en lignes
        processLines = data.activities.split('\n')
          .filter(line => line.trim().startsWith('-'));
      }
      
      if (processLines.length > 0) {
        const newProcesses = processLines.map((process, index) => ({
          id: `process-${Date.now()}-${index}`,
          name: typeof process === 'string' && process.startsWith('-') 
            ? process.substring(1).trim() 
            : process
        }));
        
        setBusinessProcesses(newProcesses);
        console.log(`${newProcesses.length} processus métier extraits et ajoutés automatiquement:`, newProcesses);
      } else {
        console.log('Aucun processus métier n\'a pu être extrait des données reçues');
      }

      setLoading(false);
      toast({
        title: "Succès",
        description: "Informations sur l'entreprise récupérées avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de récupérer les informations de l'entreprise",
        variant: "destructive",
      });
    }
  };

  // Add a business process
  const addBusinessProcess = (processName: string) => {
    if (!processName.trim()) return;
    
    const newProcessItem: BusinessProcess = {
      id: `process-${Date.now()}`,
      name: processName.trim()
    };
    
    setBusinessProcesses([...businessProcesses, newProcessItem]);
  };

  // Remove a business process
  const removeBusinessProcess = (id: string) => {
    setBusinessProcesses(businessProcesses.filter(process => process.id !== id));
  };

  return {
    loading,
    companyInfo,
    businessProcesses,
    updateCompanyName,
    updateCompanyDescription,
    updateCompanyActivities,
    fetchCompanyInfo,
    addBusinessProcess,
    removeBusinessProcess,
    setCompanyInfo,
    setBusinessProcesses
  };
}
