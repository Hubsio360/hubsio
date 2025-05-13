
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuditInterview, AuditTopic, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, Users, Trash2, Mail, Plus, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface TimeOption {
  value: string;
  label: string;
}

// Générer des options de temps par intervalles de 15 minutes
const generateTimeOptions = (): TimeOption[] => {
  const options: TimeOption[] = [];
  
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({
        value,
        label: value,
      });
    }
  }
  
  return options;
};

const timeOptions = generateTimeOptions();
const durationOptions = [15, 30, 45, 60, 75, 90, 120, 150, 180, 210, 240].map(duration => ({
  value: duration.toString(),
  label: `${duration} minutes`,
}));

interface EditInterviewDrawerProps {
  interview: AuditInterview | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

const EditInterviewDrawer: React.FC<EditInterviewDrawerProps> = ({
  interview,
  open,
  onClose,
  onSave,
  onDelete,
}) => {
  const { 
    updateInterview, 
    deleteInterview, 
    topics, 
    fetchTopics, 
    addParticipant, 
    removeParticipant, 
    getParticipantsByInterviewId 
  } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeValue, setTimeValue] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantRole, setNewParticipantRole] = useState('Participant');
  const [isSendingInvitations, setIsSendingInvitations] = useState(false);
  
  // Charger les thématiques si nécessaire
  useEffect(() => {
    if (open && topics.length === 0) {
      fetchTopics();
    }
  }, [open, topics]);
  
  // Charger les participants de l'interview
  useEffect(() => {
    const loadParticipants = async () => {
      if (interview) {
        try {
          const interviewParticipants = await getParticipantsByInterviewId(interview.id);
          setParticipants(interviewParticipants);
        } catch (error) {
          console.error('Error loading interview participants:', error);
        }
      }
    };
    
    if (open && interview) {
      loadParticipants();
    }
  }, [open, interview]);
  
  // Initialiser le formulaire avec les données de l'interview
  useEffect(() => {
    if (interview) {
      setTitle(interview.title);
      setDescription(interview.description || '');
      setTopicId(interview.topicId);
      
      const interviewDate = parseISO(interview.startTime);
      setDate(interviewDate);
      setTimeValue(format(interviewDate, 'HH:mm'));
      setDurationMinutes(interview.durationMinutes.toString());
      setLocation(interview.location || '');
      setMeetingLink(interview.meetingLink || '');
    } else {
      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setTopicId(undefined);
      setDate(undefined);
      setTimeValue('09:00');
      setDurationMinutes('60');
      setLocation('');
      setMeetingLink('');
    }
  }, [interview]);
  
  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!interview) return;
    
    if (!title || !date) {
      toast({
        title: 'Champs obligatoires',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Construire la date de début avec l'heure sélectionnée
      const [hours, minutes] = timeValue.split(':').map(Number);
      const startTime = setMinutes(setHours(date, hours), minutes);
      
      const updatedInterview = await updateInterview(interview.id, {
        title,
        description: description || undefined,
        topicId: topicId || undefined,
        startTime: startTime.toISOString(),
        durationMinutes: parseInt(durationMinutes, 10),
        location: location || undefined,
        meetingLink: meetingLink || undefined,
      });
      
      if (updatedInterview) {
        toast({
          title: 'Interview mise à jour',
          description: 'L\'interview a été mise à jour avec succès',
        });
        onSave();
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la mise à jour de l\'interview',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de l\'interview',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Supprimer l'interview
  const handleDelete = async () => {
    if (!interview) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteInterview(interview.id);
      
      if (success) {
        toast({
          title: 'Interview supprimée',
          description: 'L\'interview a été supprimée avec succès',
        });
        if (onDelete) {
          onDelete();
        }
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression de l\'interview',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression de l\'interview',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Générer un lien de visioconférence
  const generateMeetLink = () => {
    const meetCode = Math.random().toString(36).substring(2, 10);
    setMeetingLink(`https://meet.google.com/${meetCode}`);
  };

  // Ajouter un participant
  const handleAddParticipant = async () => {
    if (!interview) return;
    
    if (!newParticipantEmail || !newParticipantEmail.includes('@')) {
      toast({
        title: "Format d'email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Simuler l'ajout d'un participant (dans un vrai cas, il faudrait récupérer ou créer l'utilisateur)
      const dummyUserId = `user-${Math.random().toString(36).substring(2, 10)}`;
      
      const success = await addParticipant({
        interviewId: interview.id,
        userId: dummyUserId,
        role: newParticipantRole
      });
      
      if (success) {
        // Rafraîchir la liste des participants
        const updatedParticipants = await getParticipantsByInterviewId(interview.id);
        setParticipants(updatedParticipants);
        
        toast({
          title: "Participant ajouté",
          description: `${newParticipantEmail} a été ajouté comme ${newParticipantRole}`,
        });
        
        // Réinitialiser le formulaire
        setNewParticipantEmail('');
        setNewParticipantRole('Participant');
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le participant",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du participant",
        variant: "destructive",
      });
    }
  };

  // Envoyer des invitations aux participants
  const handleSendInvitations = async () => {
    if (!interview || participants.length === 0) return;
    
    setIsSendingInvitations(true);
    
    try {
      // Simuler l'envoi d'invitations
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Invitations envoyées",
        description: `${participants.length} invitation(s) ont été envoyées aux participants`,
      });
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi des invitations",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvitations(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Modifier l'interview</DrawerTitle>
          <DrawerDescription>
            Modifiez les détails de l'interview d'audit
          </DrawerDescription>
        </DrawerHeader>
        
        <ScrollArea className="px-4 max-h-[calc(90vh-14rem)]">
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="required">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'interview"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de l'interview"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic">Thématique</Label>
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Sélectionner une thématique" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="required">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, 'PPP', { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={fr}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time" className="required">Heure</Label>
                <Select value={timeValue} onValueChange={setTimeValue}>
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Sélectionner une heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration" className="required">Durée</Label>
              <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Sélectionner une durée" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lieu de l'interview (optionnel)"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="meetingLink">Lien de visioconférence</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateMeetLink}
                  type="button"
                >
                  Générer un lien
                </Button>
              </div>
              <Input
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Lien de visioconférence (optionnel)"
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Participants
                </Label>
                <Badge variant="outline">{participants.length} participant(s)</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    type="email"
                    placeholder="Email du participant"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={newParticipantRole}
                    onValueChange={setNewParticipantRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Auditeur">Auditeur</SelectItem>
                      <SelectItem value="Audité">Audité</SelectItem>
                      <SelectItem value="Participant">Participant</SelectItem>
                      <SelectItem value="Observateur">Observateur</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddParticipant}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {participants.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {participants.map((participant) => (
                    <div
                      key={`${participant.interviewId}-${participant.userId}`}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{participant.role.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Utilisateur</div>
                          <div className="text-sm text-muted-foreground">{participant.role}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.interviewId, participant.userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={handleSendInvitations}
                    disabled={isSendingInvitations || participants.length === 0}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isSendingInvitations ? "Envoi en cours..." : "Envoyer les invitations"}
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md">
                  <p className="text-muted-foreground">Aucun participant</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DrawerFooter className="px-4 pt-2">
          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading || isDeleting}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isLoading || isDeleting}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditInterviewDrawer;
