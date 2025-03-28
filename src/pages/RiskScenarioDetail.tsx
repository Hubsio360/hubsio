
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { 
  RiskScenario, 
  RiskAsset, 
  RiskTreatment,
  RiskLevel, 
  RiskStatus, 
  RiskScope,
  RiskTreatmentStrategy
} from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  AlertCircle, 
  ChevronLeft, 
  FileEdit, 
  Save, 
  Trash2, 
  Plus, 
  Shield, 
  Wrench,
  ArrowLeft,
  Pencil
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  getRiskLevelBadge, 
  getRiskStatusBadge, 
  getRiskScopeBadge,
  getRiskTreatmentStrategyBadge
} from '@/components/risk-analysis/utils/riskBadges';
import { useForm } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

const RiskScenarioDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  const {
    riskScenarios,
    riskAssets,
    riskThreats,
    riskVulnerabilities,
    riskTreatments,
    loading,
    fetchRiskTreatmentsByScenarioId,
    updateRiskScenario,
    deleteRiskScenario,
    fetchRiskAssetsByCompanyId,
    getRiskScenarioAssets,
    addRiskTreatment,
    updateRiskTreatment,
    deleteRiskTreatment,
    associateRiskScenarioWithAsset,
    removeRiskScenarioAssetAssociation
  } = useData();

  const [currentScenario, setCurrentScenario] = useState<RiskScenario | null>(null);
  const [scenarioAssets, setScenarioAssets] = useState<RiskAsset[]>([]);
  const [scenarioTreatments, setScenarioTreatments] = useState<RiskTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form for scenario editing
  const scenarioForm = useForm({
    defaultValues: {
      name: '',
      description: '',
      impactDescription: '',
      impactLevel: 'medium' as RiskLevel,
      likelihood: 'medium' as RiskLevel,
      riskLevel: 'medium' as RiskLevel,
      status: 'identified' as RiskStatus,
      scope: 'technical' as RiskScope,
      threatId: '',
      vulnerabilityId: ''
    }
  });

  // Form for treatment editing
  const treatmentForm = useForm({
    defaultValues: {
      strategy: 'reduce' as RiskTreatmentStrategy,
      description: '',
      responsible: '',
      deadline: '',
      status: 'planned',
      residualRiskLevel: 'low' as RiskLevel
    }
  });

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    // Find current scenario
    const scenario = riskScenarios.find(s => s.id === id);
    if (scenario) {
      setCurrentScenario(scenario);
      
      // Fetch treatments for this scenario
      fetchRiskTreatmentsByScenarioId(id).then(treatments => {
        setScenarioTreatments(treatments);
      });
      
      // Fetch assets associated with this scenario
      if (scenario.companyId) {
        fetchRiskAssetsByCompanyId(scenario.companyId);
        getRiskScenarioAssets(id).then(assets => {
          setScenarioAssets(assets);
          setSelectedAssets(assets.map(asset => asset.id));
        });
      }
      
      // Set form values
      scenarioForm.reset({
        name: scenario.name,
        description: scenario.description || '',
        impactDescription: scenario.impactDescription || '',
        impactLevel: scenario.impactLevel,
        likelihood: scenario.likelihood,
        riskLevel: scenario.riskLevel,
        status: scenario.status,
        scope: scenario.scope,
        threatId: scenario.threatId || '',
        vulnerabilityId: scenario.vulnerabilityId || ''
      });
      
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [id, riskScenarios, fetchRiskTreatmentsByScenarioId, fetchRiskAssetsByCompanyId, getRiskScenarioAssets, scenarioForm]);

  if (!id) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Identifiant de scénario manquant</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-20 mr-2" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Scénario de risque non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSaveScenario = (data: any) => {
    if (!currentScenario) return;
    
    updateRiskScenario(currentScenario.id, data)
      .then((updatedScenario) => {
        setCurrentScenario(updatedScenario);
        toast({
          title: "Succès",
          description: "Scénario de risque mis à jour avec succès",
        });
        setIsEditing(false);
      })
      .catch((error) => {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le scénario",
          variant: "destructive",
        });
      });
  };

  const handleDeleteScenario = () => {
    if (!currentScenario) return;
    
    deleteRiskScenario(currentScenario.id)
      .then((success) => {
        if (success) {
          toast({
            title: "Succès",
            description: "Scénario de risque supprimé avec succès",
          });
          navigate(`/risk-analysis/${currentScenario.companyId}`);
        } else {
          throw new Error("Échec de la suppression");
        }
      })
      .catch((error) => {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le scénario",
          variant: "destructive",
        });
      });
  };

  const handleAddTreatment = (data: any) => {
    if (!currentScenario) return;
    
    const newTreatment = {
      ...data,
      riskScenarioId: currentScenario.id
    };
    
    addRiskTreatment(newTreatment)
      .then((treatment) => {
        setScenarioTreatments(prev => [...prev, treatment]);
        toast({
          title: "Succès",
          description: "Traitement ajouté avec succès",
        });
        setIsAddingTreatment(false);
        treatmentForm.reset();
      })
      .catch((error) => {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le traitement",
          variant: "destructive",
        });
      });
  };

  const handleDeleteTreatment = (treatmentId: string) => {
    deleteRiskTreatment(treatmentId)
      .then((success) => {
        if (success) {
          setScenarioTreatments(prev => prev.filter(t => t.id !== treatmentId));
          toast({
            title: "Succès",
            description: "Traitement supprimé avec succès",
          });
        } else {
          throw new Error("Échec de la suppression");
        }
      })
      .catch((error) => {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le traitement",
          variant: "destructive",
        });
      });
  };

  const handleAssetChange = (assetId: string, checked: boolean) => {
    if (checked) {
      // Add asset association
      associateRiskScenarioWithAsset(currentScenario.id, assetId)
        .then((success) => {
          if (success) {
            setSelectedAssets(prev => [...prev, assetId]);
            const asset = riskAssets.find(a => a.id === assetId);
            if (asset) {
              setScenarioAssets(prev => [...prev, asset]);
            }
          }
        });
    } else {
      // Remove asset association
      removeRiskScenarioAssetAssociation(currentScenario.id, assetId)
        .then((success) => {
          if (success) {
            setSelectedAssets(prev => prev.filter(id => id !== assetId));
            setScenarioAssets(prev => prev.filter(asset => asset.id !== assetId));
          }
        });
    }
  };

  const calculateRiskLevel = (impact: RiskLevel, likelihood: RiskLevel): RiskLevel => {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    const score = levels[impact] * levels[likelihood];
    
    if (score >= 9) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  };

  const handleImpactLikelihoodChange = () => {
    const impact = scenarioForm.getValues('impactLevel');
    const likelihood = scenarioForm.getValues('likelihood');
    const calculatedRiskLevel = calculateRiskLevel(impact as RiskLevel, likelihood as RiskLevel);
    scenarioForm.setValue('riskLevel', calculatedRiskLevel);
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link to={`/risk-analysis/${currentScenario.companyId}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à l'analyse
              </Link>
            </Button>
          </div>
          {!isEditing ? (
            <h1 className="text-2xl font-bold">{currentScenario.name}</h1>
          ) : (
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Modification du scénario</h1>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {getRiskLevelBadge(currentScenario.riskLevel)}
            {getRiskScopeBadge(currentScenario.scope)}
            {getRiskStatusBadge(currentScenario.status)}
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={scenarioForm.handleSubmit(handleSaveScenario)}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </>
          )}
          
          {deleteConfirm && (
            <Alert variant="destructive" className="absolute top-24 right-4 w-auto">
              <AlertTitle>Confirmer la suppression</AlertTitle>
              <AlertDescription>
                Êtes-vous sûr de vouloir supprimer ce scénario de risque ?
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteScenario}>
                    Confirmer
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="inline-flex items-center">
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="assets" className="inline-flex items-center">
            Actifs concernés
          </TabsTrigger>
          <TabsTrigger value="treatment" className="inline-flex items-center">
            Traitement du risque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Détails du scénario</CardTitle>
                <CardDescription>Modifier les informations du scénario de risque</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...scenarioForm}>
                  <form className="space-y-4">
                    <FormField
                      control={scenarioForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du scénario</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={scenarioForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={scenarioForm.control}
                        name="threatId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Menace</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une menace" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Aucune menace</SelectItem>
                                {riskThreats.map(threat => (
                                  <SelectItem key={threat.id} value={threat.id}>
                                    {threat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scenarioForm.control}
                        name="vulnerabilityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vulnérabilité</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une vulnérabilité" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">Aucune vulnérabilité</SelectItem>
                                {riskVulnerabilities.map(vuln => (
                                  <SelectItem key={vuln.id} value={vuln.id}>
                                    {vuln.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={scenarioForm.control}
                      name="impactDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description de l'impact</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={scenarioForm.control}
                        name="impactLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Niveau d'impact</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleImpactLikelihoodChange();
                              }} 
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Faible</SelectItem>
                                <SelectItem value="medium">Moyen</SelectItem>
                                <SelectItem value="high">Élevé</SelectItem>
                                <SelectItem value="critical">Critique</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scenarioForm.control}
                        name="likelihood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Probabilité</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleImpactLikelihoodChange();
                              }} 
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Faible</SelectItem>
                                <SelectItem value="medium">Moyenne</SelectItem>
                                <SelectItem value="high">Élevée</SelectItem>
                                <SelectItem value="critical">Très élevée</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scenarioForm.control}
                        name="riskLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Niveau de risque</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Faible</SelectItem>
                                <SelectItem value="medium">Moyen</SelectItem>
                                <SelectItem value="high">Élevé</SelectItem>
                                <SelectItem value="critical">Critique</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Ce niveau est calculé automatiquement, mais peut être ajusté manuellement.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={scenarioForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="identified">Identifié</SelectItem>
                                <SelectItem value="analyzed">Analysé</SelectItem>
                                <SelectItem value="treated">Traité</SelectItem>
                                <SelectItem value="accepted">Accepté</SelectItem>
                                <SelectItem value="monitored">Surveillé</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scenarioForm.control}
                        name="scope"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portée</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une portée" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="technical">Technique</SelectItem>
                                <SelectItem value="organizational">Organisationnel</SelectItem>
                                <SelectItem value="human">Humain</SelectItem>
                                <SelectItem value="physical">Physique</SelectItem>
                                <SelectItem value="environmental">Environnemental</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Description du scénario</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>{currentScenario.description || "Aucune description fournie."}</p>
                  
                  {(currentScenario.threatId || currentScenario.vulnerabilityId) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {currentScenario.threatId && (
                        <div>
                          <h4 className="text-md font-semibold mb-2">Menace</h4>
                          <p className="text-sm">
                            {riskThreats.find(t => t.id === currentScenario.threatId)?.name || "Inconnue"}
                          </p>
                        </div>
                      )}
                      
                      {currentScenario.vulnerabilityId && (
                        <div>
                          <h4 className="text-md font-semibold mb-2">Vulnérabilité</h4>
                          <p className="text-sm">
                            {riskVulnerabilities.find(v => v.id === currentScenario.vulnerabilityId)?.name || "Inconnue"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {currentScenario.impactDescription && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-2">Impact potentiel</h4>
                      <p>{currentScenario.impactDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Évaluation du risque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Niveau d'impact</h4>
                      <div>{getRiskLevelBadge(currentScenario.impactLevel)}</div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Probabilité</h4>
                      <div>{getRiskLevelBadge(currentScenario.likelihood)}</div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Niveau de risque</h4>
                      <div className="text-xl font-bold flex items-center">
                        {getRiskLevelBadge(currentScenario.riskLevel)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Statut</h4>
                      <div>{getRiskStatusBadge(currentScenario.status)}</div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Portée</h4>
                      <div>{getRiskScopeBadge(currentScenario.scope)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="animate-fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actifs concernés</CardTitle>
                <CardDescription>Les actifs affectés par ce scénario de risque</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {riskAssets.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Aucun actif disponible</AlertTitle>
                  <AlertDescription>
                    Aucun actif n'a été créé pour cette entreprise. Veuillez d'abord créer des actifs.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskAssets.map(asset => (
                    <div key={asset.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`asset-${asset.id}`}
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={(checked) => handleAssetChange(asset.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`asset-${asset.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {asset.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="animate-fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Traitement du risque</CardTitle>
                <CardDescription>Actions pour traiter ce scénario de risque</CardDescription>
              </div>
              {!isAddingTreatment && (
                <Button onClick={() => setIsAddingTreatment(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un traitement
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isAddingTreatment ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Nouveau traitement</h3>
                  <Form {...treatmentForm}>
                    <form className="space-y-4">
                      <FormField
                        control={treatmentForm.control}
                        name="strategy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stratégie de traitement</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une stratégie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="reduce">Réduire</SelectItem>
                                <SelectItem value="maintain">Maintenir</SelectItem>
                                <SelectItem value="avoid">Éviter</SelectItem>
                                <SelectItem value="share">Partager</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={treatmentForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description des mesures</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={treatmentForm.control}
                          name="responsible"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsable</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={treatmentForm.control}
                          name="deadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date d'échéance</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={treatmentForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statut</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un statut" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="planned">Planifié</SelectItem>
                                  <SelectItem value="in_progress">En cours</SelectItem>
                                  <SelectItem value="completed">Complété</SelectItem>
                                  <SelectItem value="on_hold">En attente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={treatmentForm.control}
                          name="residualRiskLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niveau de risque résiduel</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un niveau" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Faible</SelectItem>
                                  <SelectItem value="medium">Moyen</SelectItem>
                                  <SelectItem value="high">Élevé</SelectItem>
                                  <SelectItem value="critical">Critique</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddingTreatment(false)}>
                          Annuler
                        </Button>
                        <Button onClick={treatmentForm.handleSubmit(handleAddTreatment)}>
                          <Save className="h-4 w-4 mr-2" />
                          Enregistrer
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : null}
              
              {scenarioTreatments.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun traitement défini pour ce scénario de risque.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ajoutez des traitements pour réduire le niveau de risque.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stratégie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Risque résiduel</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenarioTreatments.map(treatment => (
                      <TableRow key={treatment.id}>
                        <TableCell>
                          {getRiskTreatmentStrategyBadge(treatment.strategy)}
                        </TableCell>
                        <TableCell>{treatment.description}</TableCell>
                        <TableCell>{treatment.responsible || "-"}</TableCell>
                        <TableCell>{treatment.deadline ? new Date(treatment.deadline).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{treatment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {treatment.residualRiskLevel 
                            ? getRiskLevelBadge(treatment.residualRiskLevel)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTreatment(treatment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskScenarioDetail;
