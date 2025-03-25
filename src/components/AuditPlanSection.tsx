
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { AuditInterview } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus, Layers } from 'lucide-react';
import AuditPlanCalendar from './AuditPlanCalendar';
import AuditPlanGenerator from './AuditPlanGenerator';
import EditInterviewDrawer from './EditInterviewDrawer';
import { useToast } from '@/hooks/use-toast';

interface AuditPlanSectionProps {
  auditId: string;
  startDate: string;
  endDate: string;
}

const AuditPlanSection: React.FC<AuditPlanSectionProps> = ({
  auditId,
  startDate,
  endDate,
}) => {
  const { fetchInterviewsByAuditId, fetchTopics } = useData();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('calendar');
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<AuditInterview | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [interviewsByTheme, setInterviewsByTheme] = useState<Record<string, AuditInterview[]>>({});
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!auditId) {
        console.log('No audit ID provided, skipping data load');
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }
      
      if (loadAttempted && initialLoadComplete) {
        // Évite les rechargements répétés qui causent le scintillement
        return;
      }
      
      setLoading(true);
      setLoadError(null);
      
      try {
        // Chargement des topics avec gestion d'erreur silencieuse
        try {
          await fetchTopics();
        } catch (topicError) {
          console.error('Error loading topics, continuing with interviews:', topicError);
        }
        
        // Chargement des interviews
        try {
          const interviewsData = await fetchInterviewsByAuditId(auditId);
          console.log('Loaded interviews:', interviewsData);
          
          if (interviewsData && Array.isArray(interviewsData)) {
            setInterviews(interviewsData);
            
            // Organiser les interviews par thème
            const themeMap: Record<string, AuditInterview[]> = {};
            interviewsData.forEach(interview => {
              const theme = interview.themeId || 'Sans thème';
              if (!themeMap[theme]) {
                themeMap[theme] = [];
              }
              themeMap[theme].push(interview);
            });
            setInterviewsByTheme(themeMap);
          } else {
            console.warn('No valid interviews data returned');
            setInterviews([]);
            setInterviewsByTheme({});
          }
        } catch (interviewError) {
          console.error('Error loading interviews:', interviewError);
          setLoadError('Impossible de charger les interviews');
          setInterviews([]);
          setInterviewsByTheme({});
        }
      } catch (error) {
        console.error('Error loading audit plan data:', error);
        setLoadError('Impossible de charger les données du plan d\'audit');
      } finally {
        setLoading(false);
        setLoadAttempted(true);
        setInitialLoadComplete(true);
      }
    };
    
    if (auditId) {
      loadData();
    }
  }, [auditId, fetchInterviewsByAuditId, fetchTopics, loadAttempted, initialLoadComplete]);

  const refreshInterviews = async () => {
    if (!auditId) {
      console.log('No audit ID provided, skipping refresh');
      return;
    }
    
    setLoading(true);
    setLoadError(null);
    
    try {
      console.log('Refreshing interviews for audit:', auditId);
      const interviewsData = await fetchInterviewsByAuditId(auditId);
      console.log('Refreshed interviews:', interviewsData);
      
      if (interviewsData && Array.isArray(interviewsData)) {
        setInterviews(interviewsData);
        
        const themeMap: Record<string, AuditInterview[]> = {};
        interviewsData.forEach(interview => {
          const theme = interview.themeId || 'Sans thème';
          if (!themeMap[theme]) {
            themeMap[theme] = [];
          }
          themeMap[theme].push(interview);
        });
        setInterviewsByTheme(themeMap);
        
        if (interviewsData.length > 0 && activeTab === 'generate') {
          setActiveTab('calendar');
        }
      }
    } catch (error) {
      console.error('Error refreshing interviews:', error);
      setLoadError('Impossible de rafraîchir les interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleEditInterview = (interview: AuditInterview) => {
    setSelectedInterview(interview);
    setIsEditDrawerOpen(true);
  };

  const handleCloseEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setSelectedInterview(null);
  };

  const handleSaveInterview = () => {
    refreshInterviews();
    handleCloseEditDrawer();
  };

  const handleDeleteInterview = () => {
    refreshInterviews();
    handleCloseEditDrawer();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="themes" className="flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                Thématiques
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Générer un plan
              </TabsTrigger>
            </TabsList>
            
            {(activeTab === 'calendar' || activeTab === 'themes') && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedInterview(null);
                  setIsEditDrawerOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            )}
          </div>
          
          <TabsContent value="calendar" className="mt-0">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement du plan d'audit...</p>
              </div>
            ) : loadError ? (
              <div className="py-8 text-center border rounded-lg">
                <p className="text-muted-foreground">{loadError}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setLoadAttempted(false);
                    setInitialLoadComplete(false);
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : interviews.length > 0 ? (
              <AuditPlanCalendar 
                auditId={auditId} 
                onEditInterview={handleEditInterview} 
              />
            ) : (
              <div className="py-16 text-center border rounded-lg">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune interview planifiée</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Aucune interview n'a encore été planifiée pour cet audit. Vous pouvez générer un plan automatiquement ou ajouter des interviews manuellement.
                </p>
                <Button onClick={() => setActiveTab('generate')}>
                  Générer un plan d'audit
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="themes" className="mt-0">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des thématiques...</p>
              </div>
            ) : loadError ? (
              <div className="py-8 text-center border rounded-lg">
                <p className="text-muted-foreground">{loadError}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setLoadAttempted(false);
                    setInitialLoadComplete(false);
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : Object.keys(interviewsByTheme).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(interviewsByTheme).map(([theme, themeInterviews]) => (
                  <Card key={theme} className="overflow-hidden">
                    <div className="bg-primary h-1"></div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-3">{theme}</h3>
                      <div className="space-y-3">
                        {themeInterviews.map(interview => (
                          <div 
                            key={interview.id} 
                            className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleEditInterview(interview)}
                          >
                            <div className="flex justify-between">
                              <div className="font-medium">{interview.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(interview.startTime).toLocaleDateString()} - {interview.durationMinutes} min
                              </div>
                            </div>
                            {interview.controlRefs && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Clause/Contrôle: {interview.controlRefs}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border rounded-lg">
                <Layers className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune thématique définie</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Aucune thématique n'a encore été définie pour cet audit. Vous pouvez générer un plan automatiquement ou ajouter des interviews manuellement.
                </p>
                <Button onClick={() => setActiveTab('generate')}>
                  Générer un plan d'audit
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="generate" className="mt-0">
            <AuditPlanGenerator
              auditId={auditId}
              startDate={startDate}
              endDate={endDate}
              onPlanGenerated={refreshInterviews}
            />
          </TabsContent>
        </Tabs>
        
        <EditInterviewDrawer
          interview={selectedInterview}
          open={isEditDrawerOpen}
          onClose={handleCloseEditDrawer}
          onSave={handleSaveInterview}
          onDelete={handleDeleteInterview}
        />
      </CardContent>
    </Card>
  );
};

export default AuditPlanSection;
