
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceType } from '@/types';
import ServiceCard from '@/components/services/ServiceCard';
import ConsultingProjectCard from '@/components/services/ConsultingProjectCard';
import RssiServiceInfo from '@/components/services/RssiServiceInfo';
import {
  BarChart3,
  Building2,
  Calendar,
  Clock,
  FileText,
  Globe,
  AlertCircle,
  Plus,
  FileCheck,
  FileClock,
  AlertTriangle,
  MoveRight,
  Calendar as CalendarIcon,
  Users,
  Trash2,
  Briefcase,
  Shield,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getCompanyById, 
    getAuditsByCompanyId, 
    getFrameworkById, 
    getAuditById, 
    deleteAudit,
    fetchAudits,
    getServicesByCompanyId,
    getConsultingProjectsByServiceId,
    getRssiServicesByServiceId,
    fetchServices,
    fetchConsultingProjects,
    fetchRssiServices,
    loading
  } = useData();
  const [activeTab, setActiveTab] = useState('services');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
    fetchServices();
    fetchConsultingProjects();
    fetchRssiServices();
  }, [fetchAudits, fetchServices, fetchConsultingProjects, fetchRssiServices]);

  if (!id) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Identifiant d'entreprise manquant</AlertDescription>
        </Alert>
      </div>
    );
  }

  const company = getCompanyById(id);
  const audits = getAuditsByCompanyId(id);
  const services = getServicesByCompanyId(id);

  // Organiser les services par type
  const consultingServices = services.filter(service => service.type === 'conseil');
  const auditServices = services.filter(service => service.type === 'audit');
  const rssiServices = services.filter(service => service.type === 'rssi_as_service');

  if (!company) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Entreprise non trouvée</AlertDescription>
        </Alert>
      </div>
    );
  }

  const completedAudits = audits.filter(audit => audit.status === 'completed');
  const inProgressAudits = audits.filter(audit => audit.status === 'in_progress');

  const handleDeleteAudit = async () => {
    if (!auditToDelete) return;
    
    try {
      await deleteAudit(auditToDelete);
      toast({
        title: "Audit supprimé",
        description: "L'audit a été supprimé avec succès.",
      });
      setDeleteDialogOpen(false);
      setAuditToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'audit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'audit.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (auditId: string) => {
    setAuditToDelete(auditId);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            <FileCheck className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
            <FileClock className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Brouillon
          </Badge>
        );
      case 'review':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            En revue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatFramework = (frameworkId: string) => {
    const framework = getFrameworkById(frameworkId);
    return framework ? `${framework.name} (${framework.version})` : 'Inconnu';
  };

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'conseil':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'audit':
        return <FileCheck className="h-5 w-5 text-green-600" />;
      case 'rssi_as_service':
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-600" />;
    }
  };

  const getServiceTitle = (type: ServiceType) => {
    switch (type) {
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

  const renderConsultingProjects = (serviceId: string) => {
    const projects = getConsultingProjectsByServiceId(serviceId);
    if (projects.length === 0) return null;

    return (
      <div className="mt-3">
        <h4 className="text-sm font-medium mb-2">Projets associés:</h4>
        <div className="space-y-2">
          {projects.map(project => (
            <ConsultingProjectCard 
              key={project.id} 
              project={project} 
              framework={project.frameworkId ? getFrameworkById(project.frameworkId) : undefined} 
            />
          ))}
        </div>
      </div>
    );
  };

  const renderRssiServiceInfo = (serviceId: string) => {
    const rssiService = getRssiServicesByServiceId(serviceId);
    if (!rssiService) return null;

    return (
      <div className="mt-3">
        <RssiServiceInfo rssiService={rssiService} />
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
            >
              Clients
            </Link>
            <span className="text-muted-foreground text-sm mr-2">/</span>
            <h1 className="text-2xl font-bold">{company.name}</h1>
          </div>
          <p className="text-muted-foreground">{company.activity}</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/risk-analysis/${company.id}`}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Analyse des risques
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/new-service/${company.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau service
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/new-audit/${company.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel audit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Création:</span>
                  <span>{company.creationYear || 'Non renseigné'}</span>
                </div>
                
                {company.parentCompany && (
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Groupe:</span>
                    <span>{company.parentCompany}</span>
                  </div>
                )}
                
                {company.marketScope && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Marché:</span>
                    <span>{company.marketScope}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Services actifs:</span>
                  <span>{services.filter(s => s.status.toLowerCase() === 'actif').length}</span>
                </div>
                
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Total audits:</span>
                  <span>{audits.length}</span>
                </div>
                
                {company.lastAuditDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Dernier audit:</span>
                    <span>{new Date(company.lastAuditDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Audit actif</CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressAudits.length > 0 ? (
              <div className="space-y-3">
                {inProgressAudits.map(audit => (
                  <div key={audit.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">Audit en cours</div>
                      {getStatusBadge(audit.status)}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-1">Période:</span>
                        <span>
                          {new Date(audit.startDate).toLocaleDateString('fr-FR')} - {new Date(audit.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-1">Référentiel:</span>
                        <span>{formatFramework(audit.frameworkId)}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      asChild
                    >
                      <Link to={`/audit/${audit.id}`}>
                        Continuer
                        <MoveRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">
                  Aucun audit en cours
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            {inProgressAudits.length === 0 && (
              <Button className="w-full" variant="outline" asChild>
                <Link to={`/new-audit/${company.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Démarrer un audit
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="services" className="inline-flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="audits" className="inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Historique des audits
          </TabsTrigger>
          <TabsTrigger value="reports" className="inline-flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapports générés
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="animate-fade-in">
          {loading.services ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun service trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  Cette entreprise n'a pas encore de services enregistrés
                </p>
                <Button asChild>
                  <Link to={`/new-service/${company.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un service
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Services de conseil */}
              {consultingServices.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    Services de conseil
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consultingServices.map(service => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        title={getServiceTitle(service.type)}
                        icon={getServiceIcon(service.type)}
                        detailsPath={`/service/${service.id}`}
                        additionalInfo={renderConsultingProjects(service.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Services d'audit */}
              {auditServices.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                    Services d'audit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {auditServices.map(service => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        title={getServiceTitle(service.type)}
                        icon={getServiceIcon(service.type)}
                        detailsPath={`/service/${service.id}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Services RSSI */}
              {rssiServices.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-600" />
                    RSSI as a Service (Kollègue)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rssiServices.map(service => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        title={getServiceTitle(service.type)}
                        icon={getServiceIcon(service.type)}
                        detailsPath={`/service/${service.id}`}
                        additionalInfo={renderRssiServiceInfo(service.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-center">
                <Button asChild>
                  <Link to={`/new-service/${company.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un nouveau service
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audits" className="animate-fade-in">
          {loading.audits ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : audits.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun audit trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  Cette entreprise n'a pas encore d'historique d'audit
                </p>
                <Button asChild>
                  <Link to={`/new-audit/${company.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un premier audit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {audits.map(audit => {
                const framework = getFrameworkById(audit.frameworkId);
                return (
                  <Card key={audit.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">
                          {framework ? framework.name : 'Audit'} - {new Date(audit.startDate).toLocaleDateString('fr-FR')}
                        </CardTitle>
                        {getStatusBadge(audit.status)}
                      </div>
                      <CardDescription>
                        {audit.scope || 'Audit complet'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {new Date(audit.startDate).toLocaleDateString('fr-FR')} - {new Date(audit.endDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>1 auditeur</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        asChild
                      >
                        <Link to={`/audit/${audit.id}`}>
                          Voir les détails
                          <MoveRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        onClick={() => openDeleteDialog(audit.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reports" className="animate-fade-in">
          <Card>
            <CardContent className="pt-6 text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Rapports d'audit</h3>
              <p className="text-muted-foreground mb-6">
                Les rapports générés pour cette entreprise apparaîtront ici une fois validés
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet audit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à cet audit seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAudit}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyDetail;
