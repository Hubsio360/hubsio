
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, VideoIcon, Users, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { AuditInterview, InterviewParticipant, User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format, isToday, isTomorrow, parseISO, addMinutes } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface AuditPlanCalendarProps {
  auditId: string;
  onEditInterview?: (interview: AuditInterview) => void;
}

const AuditPlanCalendar: React.FC<AuditPlanCalendarProps> = ({ auditId, onEditInterview }) => {
  const { fetchInterviewsByAuditId, getParticipantsByInterviewId, themes } = useData();
  const [interviews, setInterviews] = useState<AuditInterview[]>([]);
  const [participants, setParticipants] = useState<Record<string, InterviewParticipant[]>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fonction memoizée pour calculer les jours qui contiennent des interviews
  const getInterviewDays = useCallback(() => {
    const days = new Set<number>();
    
    interviews.forEach((interview) => {
      try {
        const date = parseISO(interview.startTime);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          
          // Créer une date sans heure pour comparer uniquement les jours
          const dayDate = new Date(year, month, day);
          days.add(dayDate.getTime());
        }
      } catch (error) {
        console.error('Invalid date in interview:', interview.startTime);
      }
    });
    
    return Array.from(days).map(timestamp => new Date(timestamp));
  }, [interviews]);

  // Fonction pour charger les interviews
  const loadInterviews = useCallback(async () => {
    if (!auditId) return;
    
    setLoading(true);
    setLoadError(null);
    
    try {
      const interviewsData = await fetchInterviewsByAuditId(auditId);
      
      if (interviewsData && Array.isArray(interviewsData)) {
        setInterviews(interviewsData);
        
        // Charger les participants pour chaque interview
        if (interviewsData.length > 0) {
          const participantsMap: Record<string, InterviewParticipant[]> = {};
          
          await Promise.all(
            interviewsData.map(async (interview) => {
              if (interview && interview.id) {
                try {
                  const interviewParticipants = await getParticipantsByInterviewId(interview.id);
                  if (interviewParticipants && Array.isArray(interviewParticipants)) {
                    participantsMap[interview.id] = interviewParticipants;
                  }
                } catch (error) {
                  console.error(`Error loading participants for interview ${interview.id}:`, error);
                }
              }
            })
          );
          
          setParticipants(participantsMap);
        }
      } else {
        setInterviews([]);
        console.warn('No interviews data or invalid data returned');
      }
    } catch (error) {
      console.error('Error loading audit interviews:', error);
      setLoadError('Impossible de charger le plan d\'audit');
    } finally {
      setLoading(false);
    }
  }, [auditId, fetchInterviewsByAuditId, getParticipantsByInterviewId]);

  // Charger les interviews au démarrage
  useEffect(() => {
    if (auditId) {
      loadInterviews();
    }
  }, [auditId, loadInterviews]);

  // Filtrer les interviews par date sélectionnée
  const selectedDateInterviews = interviews
    .filter((interview) => {
      if (!selectedDate || !interview.startTime) return false;
      
      try {
        const interviewDate = parseISO(interview.startTime);
        if (isNaN(interviewDate.getTime())) return false;
        
        return (
          interviewDate.getDate() === selectedDate.getDate() &&
          interviewDate.getMonth() === selectedDate.getMonth() &&
          interviewDate.getFullYear() === selectedDate.getFullYear()
        );
      } catch (error) {
        console.error('Error parsing date:', interview.startTime);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime();
      } catch (error) {
        return 0;
      }
    });

  // Fonction pour calculer l'heure de fin d'une interview
  const getEndTime = (startTime: string, durationMinutes: number) => {
    try {
      const date = parseISO(startTime);
      if (isNaN(date.getTime())) return new Date();
      return addMinutes(date, durationMinutes);
    } catch (error) {
      console.error('Error calculating end time:', error);
      return new Date();
    }
  };

  // Formatter l'heure de l'interview
  const formatInterviewTime = (startTime: string, durationMinutes: number) => {
    try {
      const start = parseISO(startTime);
      if (isNaN(start.getTime())) return "Heure invalide";
      
      const end = getEndTime(startTime, durationMinutes);
      
      return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    } catch (error) {
      console.error('Error formatting interview time:', error);
      return "Heure invalide";
    }
  };

  // Formatter la date relative (aujourd'hui, demain, etc.)
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return "Date invalide";
      
      if (isToday(date)) {
        return 'Aujourd\'hui';
      } else if (isTomorrow(date)) {
        return 'Demain';
      } else {
        return format(date, 'EEEE d MMMM', { locale: fr });
      }
    } catch (error) {
      console.error('Error formatting relative date:', error);
      return "Date invalide";
    }
  };

  // Obtenir le nom de la thématique à partir de l'ID
  const getThemeName = (themeId: string | undefined) => {
    if (!themeId) return 'Sans thème';
    const theme = themes.find(t => t.id === themeId);
    return theme ? theme.name : 'Sans thème';
  };

  // Gestionnaire pour réessayer le chargement
  const handleRetry = () => {
    loadInterviews();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Calendrier</CardTitle>
          <CardDescription>Sélectionnez une date pour voir les interviews planifiées</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={fr}
            className="rounded-md border mx-auto"
            modifiers={{
              hasInterview: getInterviewDays(),
            }}
            modifiersClassNames={{
              hasInterview: 'bg-blue-100 font-bold',
            }}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {selectedDate ? (
                  <>
                    <CalendarDays className="inline-block mr-2 h-5 w-5" />
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </>
                ) : (
                  'Interviews'
                )}
              </CardTitle>
              <CardDescription>
                {loadError ? (
                  'Erreur de chargement'
                ) : selectedDateInterviews.length > 0
                  ? `${selectedDateInterviews.length} interview${selectedDateInterviews.length > 1 ? 's' : ''} planifiée${selectedDateInterviews.length > 1 ? 's' : ''}`
                  : 'Aucune interview planifiée pour cette date'}
              </CardDescription>
            </div>
            {loadError && (
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Réessayer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du plan d'audit...</p>
            </div>
          ) : loadError ? (
            <div className="py-8 text-center border rounded-lg">
              <p className="text-muted-foreground">{loadError}</p>
              <Button variant="outline" className="mt-4" onClick={handleRetry}>
                Réessayer
              </Button>
            </div>
          ) : selectedDateInterviews.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {selectedDateInterviews.map((interview) => (
                  <Card key={interview.id} className="overflow-hidden">
                    <div className="bg-primary h-2"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{interview.title}</CardTitle>
                          {interview.themeId && (
                            <Badge className="mt-1 mb-1" variant="outline">
                              {getThemeName(interview.themeId)}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEditInterview && onEditInterview(interview)}
                        >
                          Modifier
                        </Button>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatInterviewTime(interview.startTime, interview.durationMinutes)}
                        <span className="mx-2">·</span>
                        <Badge variant="outline" className="ml-1 font-normal">
                          {interview.durationMinutes} min
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {interview.description && (
                        <p className="text-sm text-muted-foreground mb-3">{interview.description}</p>
                      )}
                      
                      {interview.controlRefs && (
                        <div className="mb-3 p-2 bg-muted/30 rounded-md">
                          <div className="flex items-center text-sm font-medium mb-1">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Clauses/Contrôles</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {interview.controlRefs}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {interview.location && (
                          <Badge variant="secondary" className="font-normal">
                            {interview.location}
                          </Badge>
                        )}
                        {interview.meetingLink && (
                          <a 
                            href={interview.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                          >
                            <VideoIcon className="h-3 w-3 mr-1" />
                            Lien visioconférence
                          </a>
                        )}
                      </div>
                      
                      {participants[interview.id] && participants[interview.id].length > 0 ? (
                        <div className="mt-2">
                          <div className="flex items-center text-sm text-muted-foreground mb-1">
                            <Users className="h-4 w-4 mr-1" />
                            <span>Participants ({participants[interview.id].length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {participants[interview.id].map((participant) => (
                              <Badge 
                                key={`${interview.id}-${participant.userId}`}
                                variant="outline" 
                                className="font-normal"
                              >
                                {participant.role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <Users className="h-4 w-4 inline-block mr-1" />
                          Aucun participant
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center border rounded-lg">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-medium mb-1">Aucune interview planifiée</h3>
              <p className="text-sm text-muted-foreground">
                Il n'y a pas d'interviews prévues pour cette date
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditPlanCalendar;
