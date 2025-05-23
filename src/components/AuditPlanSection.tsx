import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { AuditInterview } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus, RefreshCw } from 'lucide-react';
import AuditPlanCalendar from './AuditPlanCalendar';
import AuditPlanGenerator from './AuditPlanGenerator';
import EditInterviewDrawer from './EditInterviewDrawer';
import { useToast } from '@/hooks/use-toast';

interface AuditPlanSectionProps {
  auditId: string;
  frameworkId?: string;
  startDate: string;
  endDate: string;
}

const AuditPlanSection: React.FC<AuditPlanSectionProps> = ({
  auditId,
  frameworkId,
  startDate,
  endDate,
}) => {
  const { fetchInterviewsByAuditId, fetchTopics } = useData();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('generate');
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [interviewsByTheme, setInterviewsByTheme] = useState<Record<string, AuditInterview[]>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<AuditInterview | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [planExists, setPlanExists] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);

  const loadData = useCallback(async () => {
    if (!auditId) {
      console.log('No audit ID provided, skipping data load');
      setLoading(false);
      setInitialLoading(false);
      setDataLoaded(true);
      return;
    }
    
    if (loading || (dataLoaded && !forceRefresh)) {
      console.log('Data already loading or loaded, skipping duplicate load');
      return;
    }
    
    console.log('Loading audit plan data for audit:', auditId);
    setLoading(true);
    setLoadError(null);
    
    try {
      try {
        await fetchTopics();
      } catch (topicError) {
        console.error('Error loading topics, continuing with interviews:', topicError);
      }
      
      try {
        console.log('Fetching interviews with audit ID:', auditId);
        const interviewsData = await fetchInterviewsByAuditId(auditId);
        console.log('Loaded interviews:', interviewsData);
        
        if (interviewsData && Array.isArray(interviewsData)) {
          const realInterviews = interviewsData.filter(interview => 
            interview.id && typeof interview.id === 'string' && 
            interview.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
          );
          
          console.log('Valid interviews filtered:', realInterviews.length);
          setPlanExists(realInterviews.length > 0);
          setInterviews(realInterviews);
          
          const themeMap: Record<string, AuditInterview[]> = {};
          realInterviews.forEach(interview => {
            let theme = 'Sans thème';
            if (interview.themeId) {
              theme = interview.themeId;
            } else if (interview.topicId) {
              theme = interview.topicId;
            }
            
            if (!themeMap[theme]) {
              themeMap[theme] = [];
            }
            themeMap[theme].push(interview);
          });
          console.log('Interviews organized by theme:', themeMap);
          setInterviewsByTheme(themeMap);
          
          // If interviews exist, update the active tab if it's on generate
          if (realInterviews.length > 0 && activeTab === 'generate') {
            console.log('Setting active tab to "steps" as interviews exist');
            setActiveTab('calendar');
          }
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
      setForceRefresh(false);
    }
  }, [auditId, fetchInterviewsByAuditId, fetchTopics, loading, dataLoaded, forceRefresh]);

  useEffect(() => {
    if (auditId && (!dataLoaded || forceRefresh)) {
      loadData();
    }
  }, [auditId, loadData, dataLoaded, forceRefresh]);

  const refreshInterviews = async (targetTab?: string) => {
    if (!auditId) {
      console.log('No audit ID provided, skipping refresh');
      return;
    }
    
    console.log('Force refreshing interviews for audit:', auditId);
    setLoading(true);
    setLoadError(null);
    setDataLoaded(false);
    setForceRefresh(true);
    
    try {
      console.log('Explicitly refreshing interviews for audit:', auditId);
      const interviewsData = await fetchInterviewsByAuditId(auditId);
      console.log('Refreshed interviews:', interviewsData);
      
      if (interviewsData && Array.isArray(interviewsData)) {
        const realInterviews = interviewsData.filter(interview => 
          interview.id && typeof interview.id === 'string' && 
          interview.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        );
        
        console.log('Valid interviews after refresh:', realInterviews.length);
        setPlanExists(realInterviews.length > 0);
        setInterviews(realInterviews);
        
        const themeMap: Record<string, AuditInterview[]> = {};
        realInterviews.forEach(interview => {
          let theme = 'Sans thème';
          if (interview.themeId) {
            theme = interview.themeId;
          } else if (interview.topicId) {
            theme = interview.topicId;
          }
          
          if (!themeMap[theme]) {
            themeMap[theme] = [];
          }
          themeMap[theme].push(interview);
        });
        console.log('Updated interviews by theme:', themeMap);
        setInterviewsByTheme(themeMap);
        
        toast({
          title: "Plan d'audit mis à jour",
          description: `Plan actualisé avec ${realInterviews.length} interviews`,
        });
        
        if (realInterviews.length > 0) {
          if (targetTab) {
            console.log(`Setting active tab to "${targetTab}" as requested`);
            setActiveTab(targetTab);
          } else if (activeTab === 'generate') {
            console.log('Setting active tab to "steps" as interviews exist');
            setActiveTab('calendar');
          }
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
      setForceRefresh(false);
    }
  };

  const handleRefreshClick = () => {
    refreshInterviews();
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
              <TabsTrigger value="generate" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Générer un plan
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center" disabled={!planExists}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendrier
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {planExists && (activeTab === 'calendar') && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefreshClick}
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
          
          <TabsContent value="generate" className="mt-0">
            <AuditPlanGenerator
              auditId={auditId}
              frameworkId={frameworkId}
              startDate={startDate}
              endDate={endDate}
              onPlanGenerated={refreshInterviews}
            />
          </TabsContent>
          
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
                    setForceRefresh(true);
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
