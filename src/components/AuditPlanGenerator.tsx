import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, UsersIcon, ClockIcon, LayoutIcon, CheckIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, eachDayOfInterval, addBusinessDays, isWeekend, addDays, subBusinessDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

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
              <div className="space-y-2">
                <Label htmlFor="start-date">Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {planStartDate ? (
                        format(planStartDate, 'PPP', { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={planStartDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {planEndDate ? (
                        format(planEndDate, 'PPP', { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={planEndDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                      locale={fr}
                      disabled={(date) => date < (planStartDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Récapitulatif</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    Durée
                  </div>
                  <div className="text-2xl font-semibold">
                    {businessDays} <span className="text-sm font-normal">jours</span>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1 flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    Thématiques
                  </div>
                  <div className="text-2xl font-semibold">
                    {topics.length} <span className="text-sm font-normal">sujets</span>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    Interviews
                  </div>
                  <div className="text-2xl font-semibold">
                    {topics.length} <span className="text-sm font-normal">sessions</span>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1 flex items-center">
                    <CheckIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    Couverture
                  </div>
                  <div className="text-2xl font-semibold">
                    100<span className="text-sm font-normal">%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="topics">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Thématiques d'audit disponibles</Label>
                {topics.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {topics.map((topic) => (
                        <div 
                          key={topic.id} 
                          className="flex items-center p-2 border rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{topic.name}</div>
                            {topic.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {topic.description}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-2">
                            Inclus
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Toutes les thématiques seront incluses dans le plan d'audit généré.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md">
                    <h3 className="text-lg font-medium mb-2">Aucune thématique disponible</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous devez créer des thématiques d'audit avant de pouvoir générer un plan.
                    </p>
                  </div>
                )}
              </div>
            </div>
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
