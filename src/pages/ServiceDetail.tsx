
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ConsultingProjectCard from '@/components/services/ConsultingProjectCard';
import RssiServiceInfo from '@/components/services/RssiServiceInfo';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertCircle,
  Briefcase,
  Calendar as CalendarIcon,
  FileCheck,
  FileText,
  Plus,
  Shield,
  Trash2,
  ClipboardList,
  User,
  Clock,
} from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    services,
    consultingProjects,
    rssiServices,
    getConsultingProjectsByServiceId,
    getRssiServicesByServiceId,
    getFrameworkById,
    getCompanyById,
    loading
  } = useData();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!id) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Identifiant de service manquant</AlertDescription>
        </Alert>
      </div>
    );
  }

  const service = services.find(s => s.id === id);
  
  if (!service) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Service non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  const company = getCompanyById(service.companyId);
  const projects = getConsultingProjectsByServiceId(service.id);
  const rssiService = getRssiServicesByServiceId(service.id);

  const getServiceTypeDisplay = () => {
    switch (service.type) {
      case 'conseil':
        return 'Service de conseil';
      case 'audit':
        return 'Service d\'audit';
      case 'rssi_as_service':
        return 'RSSI as a Service (Kollègue)';
      default:
        return 'Service';
    }
  };

  const getServiceTypeIcon = () => {
    switch (service.type) {
      case 'conseil':
        return <Briefcase className="h-6 w-6 text-blue-600" />;
      case 'audit':
        return <FileCheck className="h-6 w-6 text-green-600" />;
      case 'rssi_as_service':
        return <Shield className="h-6 w-6 text-purple-600" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getStatusBadge = () => {
    switch (service.status.toLowerCase()) {
      case 'actif':
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            Actif
          </Badge>
        );
      case 'terminé':
        return (
          <Badge variant="outline">
            Terminé
          </Badge>
        );
      case 'suspendu':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            Suspendu
          </Badge>
        );
      default:
        return <Badge variant="outline">{service.status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Link
              to={`/company/${service.companyId}`}
              className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
            >
              {company ? company.name : 'Client'}
            </Link>
            <span className="text-muted-foreground text-sm mr-2">/</span>
            <h1 className="text-2xl font-bold flex items-center">
              {getServiceTypeIcon()}
              <span className="ml-2">{getServiceTypeDisplay()}</span>
            </h1>
            <div className="ml-3">{getStatusBadge()}</div>
          </div>
          <p className="text-muted-foreground">
            {service.description || `Service créé le ${format(new Date(service.createdAt || ''), 'dd/MM/yyyy', { locale: fr })}`}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/edit-service/${service.id}`}>
              Modifier
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Détails du service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Date de début:</span>
                  <span>{format(new Date(service.startDate), 'dd/MM/yyyy', { locale: fr })}</span>
                </div>
                
                {service.endDate && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Date de fin:</span>
                    <span>{format(new Date(service.endDate), 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Client:</span>
                  <Link to={`/company/${service.companyId}`} className="text-blue-600 hover:underline">
                    {company ? company.name : service.companyId}
                  </Link>
                </div>
              </div>
              
              <div className="space-y-3">
                {service.type === 'conseil' && (
                  <div className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Projets:</span>
                    <span>{projects.length}</span>
                  </div>
                )}
                
                {service.type === 'rssi_as_service' && rssiService && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Allocation mensuelle:</span>
                    <span>{rssiService.allocationTime} heures</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Créé le:</span>
                  <span>{format(new Date(service.createdAt || ''), 'dd/MM/yyyy', { locale: fr })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.type === 'conseil' && (
              <Button className="w-full" variant="outline" asChild>
                <Link to={`/new-consulting-project/${service.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un projet
                </Link>
              </Button>
            )}
            
            {service.type === 'audit' && (
              <Button className="w-full" variant="outline" asChild>
                <Link to={`/new-audit/${service.companyId}?serviceId=${service.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel audit
                </Link>
              </Button>
            )}
            
            <Button className="w-full" variant="outline" asChild>
              <Link to={`/company/${service.companyId}`}>
                Retour au client
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {service.type === 'conseil' && projects.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Projets de conseil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <ConsultingProjectCard 
                key={project.id} 
                project={project} 
                framework={project.frameworkId ? getFrameworkById(project.frameworkId) : undefined} 
              />
            ))}
          </div>
        </div>
      )}

      {service.type === 'rssi_as_service' && rssiService && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Détails RSSI as a Service</h2>
          <RssiServiceInfo rssiService={rssiService} />
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce service ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à ce service seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                // Implémentation de la suppression
                toast({
                  title: "Service supprimé",
                  description: "Le service a été supprimé avec succès",
                });
                navigate(`/company/${service.companyId}`);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceDetail;
