
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { AuditInterview } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus, Layers, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<AuditInterview | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [interviewsByTheme, setInterviewsByTheme] = useState<Record<string, AuditInterview[]>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [planExists, setPlanExists] = useState(false);

  // Fonction memoizée pour charger les données
  const loadData = useCallback(async () => {
    if (!auditId) {
      console.log('No audit ID provided, skipping data load');
      setLoading(false);
      setInitialLoading(false);
      setDataLoaded(true);
      return;
    }
    
    if (loading || dataLoaded) {
      console.log('Data already loading or loaded, skipping duplicate load');
      return;
    }
    
    console.log('Loading audit plan data for audit:', auditId);
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
          // Si des interviews existent dans la base de données, le plan existe
          // IMPORTANT: N'utiliser que les interviews avec un vrai ID de base de données (UUID format)
          const realInterviews = interviewsData.filter(interview => 
            interview.id && typeof interview.id === 'string' && 
            interview.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
          );
          
          setPlanExists(realInterviews.length > 0);
          setInterviews(realInterviews);
          
          // Organiser les interviews par thème
          const themeMap: Record<string, AuditInterview[]> = {};
          realInterviews.forEach(interview => {
            const theme = interview.themeId || 'Sans thème';
            if (!themeMap[theme]) {
              themeMap[theme] = [];
            }
            themeMap[theme].push(interview);
          });
          setInterviewsByTheme(themeMap);
        } else {
          console.warn('No valid interviews data returned');
          setPlanExists(false);
          setInterviews([]);
          setInterviewsByTheme({});
        }
      } catch (interviewError) {
        console.error('Error loading interviews:', interviewError);
        setLoadError('Impossible de charger les interviews');
        setPlanExists(false);
        setInterviews([]);
        setInterviewsByTheme({});
      }
    } catch (error) {
      console.error('Error loading audit plan data:', error);
      setLoadError('Impossible de charger les données du plan d\'audit');
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setDataLoaded(true);
    }
  }, [auditId, fetchInterviewsByAuditId, fetchTopics, loading, dataLoaded]);

  // Charger les données une seule fois au démarrage
  useEffect(() => {
    if (auditId && !dataLoaded) {
      loadData();
    }
  }, [auditId, loadData, dataLoaded]);

  const refreshInterviews = async () => {
    if (!auditId) {
      console.log('No audit ID provided, skipping refresh');
      return;
    }
    
    setLoading(true);
    setLoadError(null);
    setDataLoaded(false);
    
    try {
      console.log('Refreshing interviews for audit:', auditId);
      const interviewsData = await fetchInterviewsByAuditId(auditId);
      console.log('Refreshed interviews:', interviewsData);
      
      if (interviewsData && Array.isArray(interviewsData)) {
        // Filtrer pour n'avoir que les vrais interviews (avec UUID valide)
        const realInterviews = interviewsData.filter(interview => 
          interview.id && typeof interview.id === 'string' && 
          interview.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        );
        
        // Mettre à jour l'état du plan
        setPlanExists(realInterviews.length > 0);
        setInterviews(realInterviews);
        
        const themeMap: Record<string, AuditInterview[]> = {};
        realInterviews.forEach(interview => {
          const theme = interview.themeId || 'Sans thème';
          if (!themeMap[theme]) {
            themeMap[theme] = [];
          }
          themeMap[theme].push(interview);
        });
        setInterviewsByTheme(themeMap);
        
        toast({
          title: "Plan d'audit mis à jour",
          description: "Le plan d'audit a été actualisé avec succès",
        });
        
        if (realInterviews.length > 0 && activeTab === 'generate') {
          setActiveTab('calendar');
        }
      } else {
        setPlanExists(false);
      }
    } catch (error) {
      console.error('Error refreshing interviews:', error);
      setLoadError('Impossible de rafraîchir les interviews');
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir le plan d'audit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDataLoaded(true);
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

  // Si aucun plan n'existe et qu'on est sur l'onglet calendrier, rediriger vers l'onglet génération
  useEffect(() => {
    if (dataLoaded && !planExists && activeTab !== 'generate') {
      setActiveTab('generate');
    }
  }, [dataLoaded, planExists, activeTab]);

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center" disabled={!planExists}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="themes" className="flex items-center" disabled={!planExists}>
                <Layers className="h-4 w-4 mr-2" />
                Thématiques
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Générer un plan
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {planExists && (activeTab === 'calendar' || activeTab === 'themes') && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshInterviews}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                  
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
                </>
              )}
            </div>
          </div>
          
          <TabsContent value="calendar" className="mt-0">
            {initialLoading ? (
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
                    setDataLoaded(false);
                    loadData();
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : planExists && interviews.length > 0 ? (
              <AuditPlanCalendar 
                auditId={auditId} 
                interviews={interviews}
                loading={loading}
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
            {initialLoading ? (
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
                    setDataLoaded(false);
                    loadData();
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : planExists && Object.keys(interviewsByTheme).length > 0 ? (
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
