import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ShieldAlert, Sparkles, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Layers, Wrench, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { OrganizationContextDialog } from '@/components/risk-analysis/OrganizationContextDialog';
import RiskScalesDialog from '@/components/risk-analysis/RiskScalesDialog';

// Import the component files
import RiskSummaryCards from '@/components/risk-analysis/RiskSummaryCards';
import OverviewTab from '@/components/risk-analysis/OverviewTab';
import ScenariosTab from '@/components/risk-analysis/ScenariosTab';
import AssetsTab from '@/components/risk-analysis/AssetsTab';
import ThreatsTab from '@/components/risk-analysis/ThreatsTab';
import VulnerabilitiesTab from '@/components/risk-analysis/VulnerabilitiesTab';

const RiskAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    companies,
    riskAssets,
    riskThreats,
    riskVulnerabilities,
    riskScenarios,
    loading,
    fetchRiskAssetsByCompanyId,
    fetchRiskThreatsByCompanyId,
    fetchRiskVulnerabilitiesByCompanyId,
    fetchRiskScenariosByCompanyId,
    fetchCompanyRiskScales
  } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const [openContextDialog, setOpenContextDialog] = useState(false);
  const [openScalesDialog, setOpenScalesDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Promise.all([
        fetchRiskAssetsByCompanyId(id),
        fetchRiskThreatsByCompanyId(id),
        fetchRiskVulnerabilitiesByCompanyId(id),
        fetchRiskScenariosByCompanyId(id),
        fetchCompanyRiskScales(id)
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [id, fetchRiskAssetsByCompanyId, fetchRiskThreatsByCompanyId, fetchRiskVulnerabilitiesByCompanyId, fetchRiskScenariosByCompanyId, fetchCompanyRiskScales]);

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

  const company = companies.find(company => company.id === id);

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

  const totalScenarios = riskScenarios.length;
  const criticalScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'critical').length;
  const highScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'high').length;
  const mediumScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'medium').length;
  const lowScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'low').length;
  
  const treatedScenarios = riskScenarios.filter(scenario => scenario.status === 'treated' || scenario.status === 'accepted').length;
  const treatmentRate = totalScenarios > 0 ? Math.round((treatedScenarios / totalScenarios) * 100) : 0;
  const nonTreatedScenarios = totalScenarios - treatedScenarios;

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Link
              to={`/company/${company.id}`}
              className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
            >
              {company.name}
            </Link>
            <span className="text-muted-foreground text-sm mr-2">/</span>
            <h1 className="text-2xl font-bold flex items-center">
              <ShieldAlert className="mr-2 h-6 w-6 text-amber-500" />
              Analyse des risques
            </h1>
          </div>
          <p className="text-muted-foreground">
            Analyse et gestion des risques selon la norme ISO/IEC 27005:2018
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenScalesDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Échelles de risque
          </Button>
          <Button onClick={() => setOpenContextDialog(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Commencer l'analyse
          </Button>
        </div>
      </div>

      <RiskSummaryCards 
        totalScenarios={totalScenarios}
        criticalScenarios={criticalScenarios}
        nonTreatedScenarios={nonTreatedScenarios}
        treatmentRate={treatmentRate}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="inline-flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Scénarios de risque
          </TabsTrigger>
          <TabsTrigger value="assets" className="inline-flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Actifs
          </TabsTrigger>
          <TabsTrigger value="threats" className="inline-flex items-center">
            <UserX className="h-4 w-4 mr-2" />
            Menaces
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="inline-flex items-center">
            <Wrench className="h-4 w-4 mr-2" />
            Vulnérabilités
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <OverviewTab 
            isLoading={isLoading}
            riskScenarios={riskScenarios}
            criticalScenarios={criticalScenarios}
            highScenarios={highScenarios}
            mediumScenarios={mediumScenarios}
            lowScenarios={lowScenarios}
            onTabChange={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="scenarios" className="animate-fade-in">
          <ScenariosTab 
            isLoading={isLoading}
            riskScenarios={riskScenarios}
            companyId={company.id}
          />
        </TabsContent>

        <TabsContent value="assets" className="animate-fade-in">
          <AssetsTab 
            isLoading={isLoading}
            riskAssets={riskAssets}
          />
        </TabsContent>

        <TabsContent value="threats" className="animate-fade-in">
          <ThreatsTab 
            isLoading={isLoading}
            riskThreats={riskThreats}
          />
        </TabsContent>

        <TabsContent value="vulnerabilities" className="animate-fade-in">
          <VulnerabilitiesTab 
            isLoading={isLoading}
            riskVulnerabilities={riskVulnerabilities}
          />
        </TabsContent>
      </Tabs>

      <OrganizationContextDialog 
        open={openContextDialog}
        onOpenChange={setOpenContextDialog}
        companyId={id}
        companyName={company.name}
        onEnrichSuccess={() => {
          toast({
            title: "Succès",
            description: "Le contexte de l'organisation a été enrichi avec succès",
            variant: "default",
          });
        }}
      />

      {openScalesDialog && (
        <RiskScalesDialog
          open={openScalesDialog}
          onOpenChange={setOpenScalesDialog}
          companyId={id}
        />
      )}
    </div>
  );
};

export default RiskAnalysis;
