
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TopicsList from '@/components/audit-plan/TopicsList';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckIcon, Clock, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuditTheme } from '@/types';
import ThemeDurationSelector from '@/components/audit-plan/ThemeDurationSelector';
import AuditDaysSelector from '@/components/audit-plan/AuditDaysSelector';
import PlanSummary from '@/components/audit-plan/PlanSummary';

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
    fetchTopics,
    fetchThemes,
    themes,
    fetchInterviewsByAuditId,
    generateAuditPlan,
    getAuditById
  } = useData();
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState('options');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [themeDurations, setThemeDurations] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);
  const [interviews, setInterviews] = useState<number>(0);
  const [existingInterviews, setExistingInterviews] = useState<number>(0);
  const [existingThemes, setExistingThemes] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState(false);
  const [maxHoursPerDay] = useState(8); // 8 hours per day maximum

  // Default durations for opening and closing meetings
  const OPENING_MEETING_DURATION = 60; // 60 minutes
  const CLOSING_MEETING_DURATION = 60; // 60 minutes
  
  // Always include opening and closing meetings
  const hasOpeningClosing = true;

  // Load existing data for this audit
  useEffect(() => {
    const loadExistingData = async () => {
      if (!auditId || initialLoad) return;
      
      try {
        // Load existing interviews for this audit
        const existingInterviewsData = await fetchInterviewsByAuditId(auditId);
        setExistingInterviews(existingInterviewsData.length);
        
        // Calculate unique themes from existing interviews
        const uniqueThemes = new Set(existingInterviewsData.map(interview => interview.themeId).filter(Boolean));
        setExistingThemes(uniqueThemes.size);
        
        // Load available themes
        await fetchThemes();
        await fetchTopics();

        // Initialize theme durations with defaults
        const initialThemeDurations: Record<string, number> = {};
        themes.forEach(theme => {
          initialThemeDurations[theme.id] = 60; // Default 60 minutes
        });
        setThemeDurations(initialThemeDurations);
        
        setInitialLoad(true);
      } catch (error) {
        console.error("Error loading existing audit data:", error);
      }
    };
    
    loadExistingData();
  }, [auditId, fetchInterviewsByAuditId, fetchThemes, fetchTopics, initialLoad, themes]);

  // Calculate total interview hours and required days
  const {
    totalHours,
    totalInterviews,
    requiredDays
  } = useMemo(() => {
    // Calculate the total interview time in minutes
    let totalMinutes = 0;
    let interviewCount = 0;
    
    // Add time for opening and closing meetings
    if (hasOpeningClosing) {
      totalMinutes += OPENING_MEETING_DURATION + CLOSING_MEETING_DURATION;
      interviewCount += 2;
    }
    
    // Add time for each selected topic/theme
    selectedTopicIds.forEach(topicId => {
      // Find all themes related to this topic
      const relatedThemeIds = themes
        .filter(theme => theme.id === topicId) // For now, assuming topic IDs match theme IDs
        .map(theme => theme.id);
      
      relatedThemeIds.forEach(themeId => {
        if (themeId) {
          const duration = themeDurations[themeId] || 60;
          totalMinutes += duration;
          interviewCount += 1;
        }
      });
    });

    // Convert minutes to hours
    const hours = Math.ceil(totalMinutes / 60);
    
    // Calculate available hours per day, accounting for lunch break
    const availableHoursPerDay = maxHoursPerDay - 1.5; // 8 hour day minus 1.5 hour lunch break
    
    // Calculate required days
    const days = Math.ceil(hours / availableHoursPerDay);
    
    return {
      totalHours: hours,
      totalInterviews: interviewCount,
      requiredDays: days,
      availableHoursPerDay
    };
  }, [selectedTopicIds, themeDurations, themes, hasOpeningClosing, maxHoursPerDay]);

  // Handle duration change for a specific theme
  const handleThemeDurationChange = (themeId: string, duration: number) => {
    setThemeDurations(prev => ({
      ...prev,
      [themeId]: duration
    }));
  };

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

    // Check if we have enough days selected
    if (selectedDays.length < requiredDays) {
      toast({
        title: "Jours insuffisants",
        description: `Vous avez besoin d'au moins ${requiredDays} jours pour couvrir toutes les thématiques sélectionnées`,
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Generate the audit plan with correct arguments
      await generateAuditPlan(auditId, startDate, endDate, {
        topicIds: selectedTopicIds,
        selectedDays: selectedDays,
        themeDurations: themeDurations,
        maxHoursPerDay: maxHoursPerDay
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
              Une réunion d'ouverture et de clôture seront automatiquement incluses.
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
                    onSelectionChange={setSelectedTopicIds} 
                  />
                </CardContent>
              </Card>
              
              {selectedTopicIds.length > 0 && themes.length > 0 && (
                <ThemeDurationSelector
                  themes={themes.filter(theme => selectedTopicIds.includes(theme.id))}
                  themeDurations={themeDurations}
                  onDurationChange={handleThemeDurationChange}
                />
              )}
              
              <AuditDaysSelector
                startDate={startDate}
                endDate={endDate}
                selectedDays={selectedDays}
                onSelectedDaysChange={setSelectedDays}
                requiredHours={totalHours}
                availableHoursPerDay={maxHoursPerDay - 1.5} // Accounting for lunch break
              />
            </div>
            
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Résumé du plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlanSummary 
                    businessDays={selectedDays.length}
                    requiredDays={requiredDays}
                    topicsCount={selectedTopicIds.length}
                    interviewsCount={totalInterviews}
                    totalHours={totalHours}
                    maxHoursPerDay={maxHoursPerDay}
                    hasOpeningClosing={hasOpeningClosing}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={generatePlan} 
                    disabled={
                      generating || 
                      selectedTopicIds.length === 0 || 
                      selectedDays.length === 0 ||
                      selectedDays.length < requiredDays
                    }
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
