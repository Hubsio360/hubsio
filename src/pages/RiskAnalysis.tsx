
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ShieldAlert, 
  AlertCircle, 
  Plus, 
  Building2, 
  Shield, 
  FileText, 
  Layers, 
  Wrench, 
  UserX,
  ChevronRight
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { 
  RiskLevel, 
  RiskStatus, 
  RiskScope, 
  RiskTreatmentStrategy 
} from '@/types';

const RiskAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getCompanyById, 
    riskAssets,
    riskThreats,
    riskVulnerabilities,
    riskScenarios,
    riskTreatments,
    loading,
    fetchRiskAssetsByCompanyId,
    fetchRiskThreatsByCompanyId,
    fetchRiskVulnerabilitiesByCompanyId,
    fetchRiskScenariosByCompanyId
  } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchRiskAssetsByCompanyId(id);
      fetchRiskThreatsByCompanyId(id);
      fetchRiskVulnerabilitiesByCompanyId(id);
      fetchRiskScenariosByCompanyId(id);
    }
  }, [id, fetchRiskAssetsByCompanyId, fetchRiskThreatsByCompanyId, fetchRiskVulnerabilitiesByCompanyId, fetchRiskScenariosByCompanyId]);

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

  const getRiskLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Faible</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Moyen</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">Élevé</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Critique</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  const getRiskStatusBadge = (status: RiskStatus) => {
    switch (status) {
      case 'identified':
        return <Badge variant="outline">Identifié</Badge>;
      case 'analyzed':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Analysé</Badge>;
      case 'treated':
        return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">Traité</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Accepté</Badge>;
      case 'monitored':
        return <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20">Surveillé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRiskScopeBadge = (scope: RiskScope) => {
    switch (scope) {
      case 'technical':
        return <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20">Technique</Badge>;
      case 'organizational':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Organisationnel</Badge>;
      case 'human':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Humain</Badge>;
      case 'physical':
        return <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20">Physique</Badge>;
      case 'environmental':
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Environnemental</Badge>;
      default:
        return <Badge>{scope}</Badge>;
    }
  };
  
  const getRiskTreatmentStrategyBadge = (strategy: RiskTreatmentStrategy) => {
    switch (strategy) {
      case 'reduce':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Réduire</Badge>;
      case 'maintain':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Maintenir</Badge>;
      case 'avoid':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Éviter</Badge>;
      case 'share':
        return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">Partager</Badge>;
      default:
        return <Badge>{strategy}</Badge>;
    }
  };

  const isLoading = loading.riskAssets || loading.riskThreats || loading.riskVulnerabilities || loading.riskScenarios || loading.riskTreatments;

  // Calculate risk metrics
  const totalScenarios = riskScenarios.length;
  const criticalScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'critical').length;
  const highScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'high').length;
  const mediumScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'medium').length;
  const lowScenarios = riskScenarios.filter(scenario => scenario.riskLevel === 'low').length;
  
  const treatedScenarios = riskScenarios.filter(scenario => scenario.status === 'treated' || scenario.status === 'accepted').length;
  const treatmentRate = totalScenarios > 0 ? Math.round((treatedScenarios / totalScenarios) * 100) : 0;

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
          <Button asChild>
            <Link to={`/risk-analysis/new-scenario/${company.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau scénario de risque
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalScenarios}</div>
            <p className="text-muted-foreground text-sm">Scénarios de risque</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-600">Critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalScenarios}</div>
            <p className="text-muted-foreground text-sm">Scénarios critiques</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-amber-600">Non traités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{totalScenarios - treatedScenarios}</div>
            <p className="text-muted-foreground text-sm">Scénarios à traiter</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-600">Taux de traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{treatmentRate}%</div>
            <p className="text-muted-foreground text-sm">Risques traités</p>
          </CardContent>
        </Card>
      </div>

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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Répartition des risques par niveau</CardTitle>
                  <CardDescription>Aperçu de la criticité des risques identifiés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center p-4 border rounded-md bg-red-50">
                      <span className="text-2xl font-bold text-red-600">{criticalScenarios}</span>
                      <span className="text-sm text-red-600">Critique</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-md bg-orange-50">
                      <span className="text-2xl font-bold text-orange-600">{highScenarios}</span>
                      <span className="text-sm text-orange-600">Élevé</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-md bg-yellow-50">
                      <span className="text-2xl font-bold text-yellow-600">{mediumScenarios}</span>
                      <span className="text-sm text-yellow-600">Moyen</span>
                    </div>
                    <div className="flex flex-col items-center p-4 border rounded-md bg-green-50">
                      <span className="text-2xl font-bold text-green-600">{lowScenarios}</span>
                      <span className="text-sm text-green-600">Faible</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risques prioritaires</CardTitle>
                  <CardDescription>Scénarios de risque critiques et élevés</CardDescription>
                </CardHeader>
                <CardContent>
                  {riskScenarios.filter(scenario => 
                    scenario.riskLevel === 'critical' || scenario.riskLevel === 'high'
                  ).length === 0 ? (
                    <div className="text-center py-6">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Aucun risque critique ou élevé identifié
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scénario</TableHead>
                          <TableHead>Niveau</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riskScenarios
                          .filter(scenario => scenario.riskLevel === 'critical' || scenario.riskLevel === 'high')
                          .slice(0, 5)
                          .map(scenario => (
                            <TableRow key={scenario.id}>
                              <TableCell className="font-medium">{scenario.name}</TableCell>
                              <TableCell>{getRiskLevelBadge(scenario.riskLevel)}</TableCell>
                              <TableCell>{getRiskStatusBadge(scenario.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/risk-analysis/scenario/${scenario.id}`}>
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="#" onClick={() => setActiveTab('scenarios')}>
                      Voir tous les scénarios
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="scenarios" className="animate-fade-in">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scénarios de risque</CardTitle>
                  <CardDescription>Liste des scénarios de risque identifiés</CardDescription>
                </div>
                <Button asChild>
                  <Link to={`/risk-analysis/new-scenario/${company.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau scénario
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {riskScenarios.length === 0 ? (
                  <div className="text-center py-6">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-4">
                      Aucun scénario de risque identifié
                    </p>
                    <Button asChild>
                      <Link to={`/risk-analysis/new-scenario/${company.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer un premier scénario
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scénario</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Portée</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskScenarios.map(scenario => (
                        <TableRow key={scenario.id}>
                          <TableCell className="font-medium">{scenario.name}</TableCell>
                          <TableCell>{getRiskLevelBadge(scenario.riskLevel)}</TableCell>
                          <TableCell>{getRiskScopeBadge(scenario.scope)}</TableCell>
                          <TableCell>{getRiskStatusBadge(scenario.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/risk-analysis/scenario/${scenario.id}`}>
                                Détails
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assets" className="animate-fade-in">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Actifs</CardTitle>
                  <CardDescription>Liste des actifs identifiés</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvel actif
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un nouvel actif</DialogTitle>
                      <DialogDescription>
                        Identifiez un actif primordial ou de support pour votre organisation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Form fields would go here */}
                      <p className="text-sm text-muted-foreground">
                        Formulaire d'ajout d'actif à implémenter.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button>Ajouter</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {riskAssets.length === 0 ? (
                  <div className="text-center py-6">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-4">
                      Aucun actif identifié
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un premier actif
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter un nouvel actif</DialogTitle>
                          <DialogDescription>
                            Identifiez un actif primordial ou de support pour votre organisation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {/* Form fields would go here */}
                          <p className="text-sm text-muted-foreground">
                            Formulaire d'ajout d'actif à implémenter.
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                          </DialogClose>
                          <Button>Ajouter</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Valeur</TableHead>
                        <TableHead>Propriétaire</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskAssets.map(asset => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{asset.value}</TableCell>
                          <TableCell>{asset.owner || 'Non défini'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="threats" className="animate-fade-in">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Menaces</CardTitle>
                  <CardDescription>Liste des menaces identifiées</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle menace
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle menace</DialogTitle>
                      <DialogDescription>
                        Identifiez une menace potentielle pour votre organisation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Form fields would go here */}
                      <p className="text-sm text-muted-foreground">
                        Formulaire d'ajout de menace à implémenter.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button>Ajouter</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {riskThreats.length === 0 ? (
                  <div className="text-center py-6">
                    <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-4">
                      Aucune menace identifiée
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter une première menace
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter une nouvelle menace</DialogTitle>
                          <DialogDescription>
                            Identifiez une menace potentielle pour votre organisation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {/* Form fields would go here */}
                          <p className="text-sm text-muted-foreground">
                            Formulaire d'ajout de menace à implémenter.
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                          </DialogClose>
                          <Button>Ajouter</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskThreats.map(threat => (
                        <TableRow key={threat.id}>
                          <TableCell className="font-medium">{threat.name}</TableCell>
                          <TableCell>{threat.category}</TableCell>
                          <TableCell>{threat.source}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vulnerabilities" className="animate-fade-in">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vulnérabilités</CardTitle>
                  <CardDescription>Liste des vulnérabilités identifiées</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle vulnérabilité
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle vulnérabilité</DialogTitle>
                      <DialogDescription>
                        Identifiez une vulnérabilité potentielle dans votre organisation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Form fields would go here */}
                      <p className="text-sm text-muted-foreground">
                        Formulaire d'ajout de vulnérabilité à implémenter.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button>Ajouter</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {riskVulnerabilities.length === 0 ? (
                  <div className="text-center py-6">
                    <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-4">
                      Aucune vulnérabilité identifiée
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter une première vulnérabilité
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter une nouvelle vulnérabilité</DialogTitle>
                          <DialogDescription>
                            Identifiez une vulnérabilité potentielle dans votre organisation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {/* Form fields would go here */}
                          <p className="text-sm text-muted-foreground">
                            Formulaire d'ajout de vulnérabilité à implémenter.
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                          </DialogClose>
                          <Button>Ajouter</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskVulnerabilities.map(vulnerability => (
                        <TableRow key={vulnerability.id}>
                          <TableCell className="font-medium">{vulnerability.name}</TableCell>
                          <TableCell>{vulnerability.category}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskAnalysis;
