
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, FileText, BarChart3, ShieldAlert } from 'lucide-react';

// Import refactored components
import PageHeader from '@/components/company/PageHeader';
import CompanyInfoCard from '@/components/company/CompanyInfoCard';
import ActiveAuditCard from '@/components/company/ActiveAuditCard';
import AuditsTabContent from '@/components/company/tabs/AuditsTabContent';
import RiskAnalysisTabContent from '@/components/company/tabs/RiskAnalysisTabContent';
import ReportsTabContent from '@/components/company/tabs/ReportsTabContent';
import DeleteAuditDialog from '@/components/company/DeleteAuditDialog';
import StatusBadge from '@/components/company/StatusBadge';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getCompanyById, 
    getAuditsByCompanyId, 
    getFrameworkById, 
    deleteAudit,
    fetchAudits,
    enrichCompanyData,
    loading
  } = useData();
  const [activeTab, setActiveTab] = useState('audits');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);
  const [isEnrichingClient, setIsEnrichingClient] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

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

  const handleEnrichCompany = async () => {
    setIsEnrichingClient(true);
    
    try {
      const enrichedCompany = await enrichCompanyData(id);
      
      toast({
        title: "Données enrichies",
        description: `Les informations de ${enrichedCompany.name} ont été complétées automatiquement`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enrichir les données du client",
        variant: "destructive",
      });
    } finally {
      setIsEnrichingClient(false);
    }
  };

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
    return <StatusBadge status={status} />;
  };

  const formatFramework = (frameworkId: string) => {
    const framework = getFrameworkById(frameworkId);
    return framework ? `${framework.name} (${framework.version})` : 'Inconnu';
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <PageHeader company={company} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CompanyInfoCard 
          company={company} 
          isEnrichingClient={isEnrichingClient} 
          onEnrichCompany={handleEnrichCompany}
          auditCount={audits.length} // Pass the audit count here
        />

        <ActiveAuditCard 
          inProgressAudits={inProgressAudits}
          companyId={id}
          formatFramework={formatFramework}
          getStatusBadge={getStatusBadge}
        />
      </div>

      <Tabs defaultValue="audits" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="audits" className="inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Audits
          </TabsTrigger>
          <TabsTrigger value="risk-analysis" className="inline-flex items-center">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Analyse des risques
          </TabsTrigger>
          <TabsTrigger value="reports" className="inline-flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="audits" className="animate-fade-in">
          <AuditsTabContent 
            loading={loading.audits}
            audits={audits}
            companyId={id}
            getFrameworkById={getFrameworkById}
            getStatusBadge={getStatusBadge}
            openDeleteDialog={openDeleteDialog}
          />
        </TabsContent>
        
        <TabsContent value="risk-analysis" className="animate-fade-in">
          <RiskAnalysisTabContent companyId={id} />
        </TabsContent>
        
        <TabsContent value="reports" className="animate-fade-in">
          <ReportsTabContent />
        </TabsContent>
      </Tabs>

      <DeleteAuditDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteAudit}
      />
    </div>
  );
};

export default CompanyDetail;
