
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ServiceType } from '@/types';

const NewService = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getCompanyById, addService, addConsultingProject, addRssiService, getFrameworkById, frameworks } = useData();

  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceType>('conseil');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState('actif');

  // Champs pour les projets de conseil
  const [projectName, setProjectName] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [frameworkId, setFrameworkId] = useState('');

  // Champs pour les services RSSI
  const [allocationTime, setAllocationTime] = useState<number>(0);
  const [mainContactName, setMainContactName] = useState('');
  const [slaDetails, setSlaDetails] = useState('');

  const company = id ? getCompanyById(id) : null;

  if (!id || !company) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Entreprise non trouvée</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!startDate) {
        throw new Error("Veuillez sélectionner une date de début");
      }

      // Formatage des dates
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

      // Création du service
      const service = await addService({
        companyId: id,
        type: serviceType,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status,
        description,
      });

      console.log('Service créé:', service);

      // En fonction du type de service, ajouter des données spécifiques
      if (serviceType === 'conseil' && projectName) {
        const project = await addConsultingProject({
          serviceId: service.id,
          name: projectName,
          scope: projectScope,
          status: 'en_cours',
          frameworkId: frameworkId || undefined,
        });
        console.log('Projet de conseil créé:', project);
      }

      if (serviceType === 'rssi_as_service') {
        const hours = parseInt(allocationTime.toString());
        if (isNaN(hours) || hours <= 0) {
          throw new Error("Le temps d'allocation doit être un nombre positif");
        }

        const rssiService = await addRssiService({
          serviceId: service.id,
          allocationTime: hours,
          mainContactName: mainContactName || undefined,
          status: 'actif',
          slaDetails: slaDetails || undefined,
        });
        console.log('Service RSSI créé:', rssiService);
      }

      toast({
        title: "Service créé",
        description: "Le service a été créé avec succès",
      });

      navigate(`/company/${id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création du service:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link
          to={`/company/${id}`}
          className="text-muted-foreground hover:text-foreground text-sm flex items-center"
        >
          ← Retour à la page entreprise
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nouveau service pour {company.name}</h1>
        <p className="text-muted-foreground">Choisissez le type de service et remplissez les informations nécessaires</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Fournissez les informations de base pour ce service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Type de service</Label>
              <Select 
                value={serviceType} 
                onValueChange={(value: ServiceType) => setServiceType(value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type de service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conseil">Service de conseil</SelectItem>
                  <SelectItem value="audit">Service d'audit</SelectItem>
                  <SelectItem value="rssi_as_service">RSSI as a Service (Kollègue)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date de fin (optionnelle)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setEndDate(date)}
                      initialFocus
                      disabled={(date) => date < startDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le service..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Champs spécifiques pour le service de conseil */}
        {serviceType === 'conseil' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Détails du projet de conseil</CardTitle>
              <CardDescription>
                Informations spécifiques sur le projet de conseil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nom du projet</Label>
                <Input
                  id="project-name"
                  placeholder="Nom du projet de conseil"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-scope">Périmètre du projet (optionnel)</Label>
                <Textarea
                  id="project-scope"
                  placeholder="Décrivez le périmètre du projet..."
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="framework">Référentiel associé (optionnel)</Label>
                <Select 
                  value={frameworkId} 
                  onValueChange={setFrameworkId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un référentiel (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.name} ({framework.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Champs spécifiques pour le service RSSI */}
        {serviceType === 'rssi_as_service' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Détails du service RSSI</CardTitle>
              <CardDescription>
                Informations spécifiques sur le service RSSI as a Service (Kollègue)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allocation-time">Temps alloué (heures par mois)</Label>
                <Input
                  id="allocation-time"
                  type="number"
                  min={0}
                  placeholder="Heures par mois"
                  value={allocationTime}
                  onChange={(e) => setAllocationTime(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main-contact">Contact principal (optionnel)</Label>
                <Input
                  id="main-contact"
                  placeholder="Nom du contact principal"
                  value={mainContactName}
                  onChange={(e) => setMainContactName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sla-details">Détails SLA (optionnel)</Label>
                <Textarea
                  id="sla-details"
                  placeholder="Détails des accords de niveau de service..."
                  value={slaDetails}
                  onChange={(e) => setSlaDetails(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            onClick={() => navigate(`/company/${id}`)}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le service
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewService;
