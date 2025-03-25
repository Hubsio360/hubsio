
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LayoutIcon, Upload, Calendar, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eachDayOfInterval, addBusinessDays, isWeekend, subBusinessDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '@/contexts/DataContext';
import DateSelector from './audit-plan/DateSelector';
import AuditStatsSummary from './audit-plan/AuditStatsSummary';
import TopicsList from './audit-plan/TopicsList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuditPlanGeneratorProps {
  auditId: string;
  startDate: string;
  endDate: string;
  onPlanGenerated?: () => void;
}

const AuditPlanGenerator: React.FC<AuditPlanGeneratorProps> = ({
  auditId,
  startDate,
  endDate,
  onPlanGenerated
}) => {
  const { generateAuditPlan, fetchTopics, topics, themes, fetchThemes, importStandardAuditPlan } = useData();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [planStartDate, setPlanStartDate] = useState<Date | undefined>(new Date(startDate));
  const [planEndDate, setPlanEndDate] = useState<Date | undefined>(new Date(endDate));
  const [activeTab, setActiveTab] = useState('dates');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [availableThemes, setAvailableThemes] = useState<any[]>([]);

  // Charge les thèmes au chargement du composant
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchTopics();
        const themeData = await fetchThemes();
        setAvailableThemes(themeData);
        
        // Par défaut, toutes les thématiques sont sélectionnées
        if (themeData && themeData.length > 0) {
          const themeIds = themeData.map(theme => theme.id);
          setSelectedThemes(themeIds);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données initiales:", error);
      }
    };
    
    loadInitialData();
  }, [fetchTopics, fetchThemes]);

  const handleGeneratePlan = async () => {
    if (!planStartDate || !planEndDate) {
      toast({
        title: 'Dates manquantes',
        description: 'Veuillez sélectionner une date de début et de fin pour le plan d\'audit',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      if (topics.length === 0) {
        await fetchTopics();
      }
      
      const success = await generateAuditPlan(
        auditId,
        planStartDate.toISOString(),
        planEndDate.toISOString()
      );
      
      if (success) {
        toast({
          title: 'Plan d\'audit généré',
          description: 'Le plan d\'audit a été généré avec succès',
          variant: 'default',
        });
        
        if (onPlanGenerated) {
          onPlanGenerated();
        }
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la génération du plan d\'audit',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating audit plan:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du plan d\'audit',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportStandardPlan = async () => {
    console.log(`Initiating plan import for audit ID: ${auditId}`);
    
    // Vérifier que l'audit ID est valide
    if (!auditId) {
      toast({
        title: 'Erreur',
        description: 'ID d\'audit invalide',
        variant: 'destructive',
      });
      return;
    }
    
    // Vérifier qu'il y a des thèmes sélectionnés
    if (selectedThemes.length === 0) {
      toast({
        title: 'Aucune thématique sélectionnée',
        description: 'Veuillez sélectionner au moins une thématique pour le plan d\'audit',
        variant: 'destructive',
      });
      return;
    }
    
    setIsImporting(true);
    setImportSuccess(null);
    
    try {
      // Filtrer les thèmes disponibles selon les thèmes sélectionnés
      const selectedThemesData = availableThemes.filter(theme => selectedThemes.includes(theme.id));
      
      console.log(`Selected themes: ${selectedThemesData.map(t => t.name).join(', ')}`);
      
      // Créer le plan d'audit avec planData vide pour forcer l'utilisation du plan standard
      // mais avec les thèmes sélectionnés
      const success = await importStandardAuditPlan(auditId, [], selectedThemesData);
      
      if (success) {
        toast({
          title: 'Plan d\'audit créé',
          description: 'Le plan d\'audit standard a été créé avec succès',
          variant: 'default',
        });
        
        setImportSuccess(true);
        
        if (onPlanGenerated) {
          onPlanGenerated();
        }
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la création du plan d\'audit standard',
          variant: 'destructive',
        });
        setImportSuccess(false);
      }
    } catch (error) {
      console.error('Error importing standard audit plan:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du plan d\'audit standard',
        variant: 'destructive',
      });
      setImportSuccess(false);
    } finally {
      setIsImporting(false);
    }
  };

  const businessDays = planStartDate && planEndDate
    ? eachDayOfInterval({ start: planStartDate, end: planEndDate }).filter(date => !isWeekend(date)).length
    : 0;

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setPlanStartDate(date);
      if (planEndDate && date > planEndDate) {
        setPlanEndDate(addBusinessDays(date, 5));
      }
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setPlanEndDate(date);
      if (planStartDate && date < planStartDate) {
        setPlanStartDate(subBusinessDays(date, 5));
      }
    }
  };

  const handleThemeSelectionChange = (selectedThemeIds: string[]) => {
    console.log(`Theme selection changed to: ${selectedThemeIds.join(', ')}`);
    setSelectedThemes(selectedThemeIds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LayoutIcon className="h-5 w-5 mr-2" />
          Génération du plan d'audit
        </CardTitle>
        <CardDescription>
          Définissez les dates et les thématiques pour générer automatiquement votre plan d'audit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="dates" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Étape 1: Dates
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              Étape 2: Thématiques
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dates" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateSelector
                id="start-date"
                label="Date de début"
                selectedDate={planStartDate}
                onSelect={handleStartDateChange}
              />
              
              <DateSelector
                id="end-date"
                label="Date de fin"
                selectedDate={planEndDate}
                onSelect={handleEndDateChange}
                minDate={planStartDate}
              />
            </div>
            
            <AuditStatsSummary 
              businessDays={businessDays} 
              topicsCount={topics.length} 
            />
          </TabsContent>
          
          <TabsContent value="themes" className="space-y-4">
            <TopicsList 
              topics={topics} 
              onSelectionChange={handleThemeSelectionChange}
            />
            
            {importSuccess === true && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-600">Plan d'audit créé avec succès</AlertTitle>
                <AlertDescription className="text-green-600">
                  Le plan d'audit standard a été créé avec {selectedThemes.length} thématiques. Vous pouvez maintenant visualiser et modifier les interviews dans l'onglet Calendrier.
                </AlertDescription>
              </Alert>
            )}
            
            {importSuccess === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de création</AlertTitle>
                <AlertDescription>
                  Une erreur est survenue lors de la création du plan d'audit. Veuillez réessayer.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {activeTab === 'dates' ? (
          <>
            <Button variant="outline" disabled>
              Étape précédente
            </Button>
            <Button onClick={() => setActiveTab('themes')}>
              Étape suivante: Thématiques
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setActiveTab('dates')}>
              Retour aux dates
            </Button>
            <Button onClick={handleImportStandardPlan} disabled={isImporting || selectedThemes.length === 0}>
              {isImporting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Génération en cours...
                </>
              ) : (
                'Générer le plan'
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuditPlanGenerator;
