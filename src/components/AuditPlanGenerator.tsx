
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, CalendarRange } from '@/components/ui/calendar';
import { addDays, format, isBefore, differenceInDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TopicsList from '@/components/audit-plan/TopicsList';
import AuditStatsSummary from '@/components/audit-plan/AuditStatsSummary';
import { Separator } from '@/components/ui/separator';
import DateSelector from '@/components/audit-plan/DateSelector';
import { AlertCircle, CheckIcon, Clock, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuditPlanGeneratorProps {
  auditId: string;
  startDate: string;
  endDate: string;
  onPlanGenerated?: (targetTab?: string) => void;
}

export const AuditPlanGenerator: React.FC<AuditPlanGeneratorProps> = ({
  auditId,
  startDate,
  endDate,
  onPlanGenerated
}) => {
  const { 
    getTopics, 
    getTopicsByIds,
    fetchInterviewsByAuditId,
    generateAuditPlan,
    getAuditById
  } = useData();
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState('options');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [duration, setDuration] = useState('60');
  const [interviewsPerDay, setInterviewsPerDay] = useState('3');
  const [generating, setGenerating] = useState(false);
  const [interviews, setInterviews] = useState<number>(0);
  const [themes, setThemes] = useState<number>(0);
  const [existingInterviews, setExistingInterviews] = useState<number>(0);
  const [existingThemes, setExistingThemes] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState(false);

  // Load existing data for this audit
  React.useEffect(() => {
    const loadExistingData = async () => {
      if (!auditId || initialLoad) return;
      
      try {
        // Load existing interviews for this audit
        const existingInterviewsData = await fetchInterviewsByAuditId(auditId);
        setExistingInterviews(existingInterviewsData.length);
        
        // Calculate unique themes from existing interviews
        const uniqueThemes = new Set(existingInterviewsData.map(interview => interview.themeId).filter(Boolean));
        setExistingThemes(uniqueThemes.size);
        
        setInitialLoad(true);
      } catch (error) {
        console.error("Error loading existing audit data:", error);
      }
    };
    
    loadExistingData();
  }, [auditId, fetchInterviewsByAuditId, initialLoad]);

  // Update stats when selections change
  React.useEffect(() => {
    // Calculate number of interviews based on selected days and interviews per day
    const interviewCount = selectedDays.length * parseInt(interviewsPerDay || '0');
    setInterviews(interviewCount);
    
    // Set themes count based on selected topics
    setThemes(selectedTopicIds.length);
  }, [selectedDays, interviewsPerDay, selectedTopicIds]);

  const generatePlan = async () => {
    if (!auditId) {
      toast({
        title: "Erreur",
        description: "ID d'audit manquant",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopicIds.length === 0) {
      toast({
        title: "Thématiques requises",
        description: "Veuillez sélectionner au moins une thématique",
        variant: "destructive",
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Jours requis",
        description: "Veuillez sélectionner au moins un jour pour les interviews",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Generate the audit plan
      await generateAuditPlan(auditId, startDate, endDate, {
        topicIds: selectedTopicIds,
        selectedDays: selectedDays,
        durationMinutes: parseInt(duration),
        interviewsPerDay: parseInt(interviewsPerDay),
      });

      toast({
        title: "Plan d'audit généré",
        description: "Le plan d'audit a été généré avec succès",
      });

      // Notify parent component about successful generation
      if (onPlanGenerated) {
        onPlanGenerated('calendar');
      }
    } catch (error) {
      console.error("Error generating audit plan:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le plan d'audit",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="options">
            <Clock className="h-4 w-4 mr-2" />
            Options de planification
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="options" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ce module va automatiquement générer un plan d'audit incluant des entretiens pour chaque thématique sélectionnée.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thématiques à auditer</CardTitle>
                  <CardDescription>
                    Sélectionnez les thématiques à inclure dans votre plan d'audit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TopicsList 
                    auditId={auditId} 
                    selectedTopicIds={selectedTopicIds} 
                    onTopicSelectionChange={setSelectedTopicIds} 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Jours d'audit</CardTitle>
                  <CardDescription>
                    Sélectionnez les jours pendant lesquels vous souhaitez planifier des entretiens
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <DateSelector 
                    startDate={startDate} 
                    endDate={endDate} 
                    selectedDays={selectedDays}
                    onSelectedDaysChange={setSelectedDays}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Paramètres des entretiens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Durée des entretiens</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Sélectionner une durée" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">2 heures</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interviewsPerDay">Entretiens par jour</Label>
                      <Select value={interviewsPerDay} onValueChange={setInterviewsPerDay}>
                        <SelectTrigger id="interviewsPerDay">
                          <SelectValue placeholder="Sélectionner un nombre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 entretien</SelectItem>
                          <SelectItem value="2">2 entretiens</SelectItem>
                          <SelectItem value="3">3 entretiens</SelectItem>
                          <SelectItem value="4">4 entretiens</SelectItem>
                          <SelectItem value="5">5 entretiens</SelectItem>
                          <SelectItem value="6">6 entretiens</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Résumé du plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <AuditStatsSummary 
                    interviews={interviews}
                    themes={themes}
                    existingInterviews={existingInterviews}
                    existingThemes={existingThemes}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generatePlan} 
                    disabled={generating || selectedTopicIds.length === 0 || selectedDays.length === 0}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Générer le plan
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditPlanGenerator;
