
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LayoutIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eachDayOfInterval, addBusinessDays, isWeekend, subBusinessDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '@/contexts/DataContext';
import DateSelector from './audit-plan/DateSelector';
import AuditStatsSummary from './audit-plan/AuditStatsSummary';
import TopicsList from './audit-plan/TopicsList';

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
  const { generateAuditPlan, fetchTopics, topics } = useData();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [planStartDate, setPlanStartDate] = useState<Date | undefined>(new Date(startDate));
  const [planEndDate, setPlanEndDate] = useState<Date | undefined>(new Date(endDate));
  const [activeTab, setActiveTab] = useState('dates');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LayoutIcon className="h-5 w-5 mr-2" />
          Génération du plan d'audit
        </CardTitle>
        <CardDescription>
          Définissez les paramètres pour générer automatiquement votre plan d'audit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="dates">Dates d'audit</TabsTrigger>
            <TabsTrigger value="topics">Thématiques ({topics.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dates" className="space-y-4">
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
          
          <TabsContent value="topics">
            <TopicsList topics={topics} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab(activeTab === 'dates' ? 'topics' : 'dates')}>
          {activeTab === 'dates' ? 'Voir les thématiques' : 'Retour aux dates'}
        </Button>
        <Button onClick={handleGeneratePlan} disabled={isGenerating || (!planStartDate || !planEndDate)}>
          {isGenerating ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Génération en cours...
            </>
          ) : (
            'Générer le plan'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuditPlanGenerator;
