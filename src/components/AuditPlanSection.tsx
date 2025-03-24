
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { AuditInterview } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';
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
  const [selectedInterview, setSelectedInterview] = useState<AuditInterview | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Charger les données de base
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchTopics();
        const interviewsData = await fetchInterviewsByAuditId(auditId);
        setInterviews(interviewsData);
      } catch (error) {
        console.error('Error loading audit plan data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du plan d\'audit',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (auditId) {
      loadData();
    }
  }, [auditId]);

  // Charger les interviews après génération du plan
  const refreshInterviews = async () => {
    try {
      const interviewsData = await fetchInterviewsByAuditId(auditId);
      setInterviews(interviewsData);
      
      // Si des interviews ont été générées, passer à l'onglet calendrier
      if (interviewsData.length > 0 && activeTab === 'generate') {
        setActiveTab('calendar');
      }
    } catch (error) {
      console.error('Error refreshing interviews:', error);
    }
  };

  // Gérer l'édition d'une interview
  const handleEditInterview = (interview: AuditInterview) => {
    setSelectedInterview(interview);
    setIsEditDrawerOpen(true);
  };

  // Fermer le tiroir d'édition
  const handleCloseEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setSelectedInterview(null);
  };

  // Sauvegarder les modifications d'une interview
  const handleSaveInterview = () => {
    refreshInterviews();
    handleCloseEditDrawer();
  };

  // Supprimer une interview
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
              <TabsTrigger value="generate" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Générer un plan
              </TabsTrigger>
            </TabsList>
            
            {activeTab === 'calendar' && (
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
          
          <TabsContent value="generate" className="mt-0">
            <AuditPlanGenerator
              auditId={auditId}
              startDate={startDate}
              endDate={endDate}
              onPlanGenerated={refreshInterviews}
            />
          </TabsContent>
        </Tabs>
        
        {/* Tiroir pour l'édition des interviews */}
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
