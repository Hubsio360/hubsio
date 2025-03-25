
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  interviews: AuditInterview[];
  loading?: boolean;
  onEditInterview?: (interview: AuditInterview) => void;
}

const AuditPlanCalendar: React.FC<AuditPlanCalendarProps> = ({ 
  auditId, 
  interviews, 
  loading = false,
  onEditInterview 
}) => {
  const { getParticipantsByInterviewId, themes } = useData();
  const [participants, setParticipants] = useState<Record<string, InterviewParticipant[]>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fonction memoizée pour calculer les jours qui contiennent des interviews
  const interviewDays = useMemo(() => {
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

  // Charger les participants pour chaque interview
  useEffect(() => {
    const loadParticipants = async () => {
      // Ne charger les participants que si nous avons des interviews
      if (!interviews || interviews.length === 0) {
        return;
      }
      
      setLoadingParticipants(true);
      setParticipantsError(null);
      
      try {
        const participantsMap: Record<string, InterviewParticipant[]> = {};
        
        const uniqueInterviewIds = interviews
          .filter(interview => interview && interview.id && typeof interview.id === 'string')
          .map(interview => interview.id);
        
        console.log(`Loading participants for ${uniqueInterviewIds.length} interviews`);
        
        // Utiliser Promise.allSettled pour éviter l'échec complet si une requête échoue
        const results = await Promise.allSettled(
          uniqueInterviewIds.map(async (interviewId) => {
            try {
              // Vérifier si l'ID est au format attendu par la DB
              // Pour les interviews générées localement, nous pouvons simplement retourner un tableau vide
              if (!interviewId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
                return { interviewId, participants: [] };
              }
              
              const interviewParticipants = await getParticipantsByInterviewId(interviewId);
              return { interviewId, participants: interviewParticipants || [] };
            } catch (error) {
              console.error(`Error loading participants for interview ${interviewId}:`, error);
              return { interviewId, participants: [], error };
            }
          })
        );
        
        // Traiter les résultats
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { interviewId, participants } = result.value;
            participantsMap[interviewId] = participants;
          }
        });
        
        setParticipants(participantsMap);
      } catch (error) {
        console.error('Error loading participants:', error);
        setParticipantsError('Impossible de charger les participants');
      } finally {
        setLoadingParticipants(false);
      }
    };
    
    loadParticipants();
  }, [interviews, getParticipantsByInterviewId]);

  // Filtrer les interviews par date sélectionnée
  const selectedDateInterviews = useMemo(() => {
    return interviews
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
  }, [interviews, selectedDate]);

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
            className="rounded-md border mx-auto pointer-events-auto"
            modifiers={{
              hasInterview: interviewDays,
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
                {loading ? (
                  'Chargement des interviews...'
                ) : selectedDateInterviews.length > 0
                  ? `${selectedDateInterviews.length} interview${selectedDateInterviews.length > 1 ? 's' : ''} planifiée${selectedDateInterviews.length > 1 ? 's' : ''}`
                  : 'Aucune interview planifiée pour cette date'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du plan d'audit...</p>
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
