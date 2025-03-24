
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Edit,
  FileCheck,
  FileClock,
  FileText,
  ListChecks,
  Plus,
  Sparkles,
  User,
} from 'lucide-react';
import { FindingCategory, FindingStatus } from '@/types';

// Utilitaire pour afficher la catégorie de constat
const getCategoryBadge = (category: FindingCategory) => {
  switch (category) {
    case 'non_conformity_major':
      return (
        <Badge variant="destructive" className="bg-red-500 text-white">
          Non-conformité majeure
        </Badge>
      );
    case 'non_conformity_minor':
      return (
        <Badge className="bg-orange-500/90 text-white">
          Non-conformité mineure
        </Badge>
      );
    case 'sensitive_point':
      return (
        <Badge className="bg-amber-500 text-white">
          Point sensible
        </Badge>
      );
    case 'improvement_opportunity':
      return (
        <Badge className="bg-blue-500 text-white">
          Opportunité d'amélioration
        </Badge>
      );
    case 'strength':
      return (
        <Badge className="bg-green-500 text-white">
          Point fort
        </Badge>
      );
    default:
      return <Badge variant="outline">{category}</Badge>;
  }
};

// Utilitaire pour afficher le statut d'un constat
const getStatusBadge = (status: FindingStatus) => {
  switch (status) {
    case 'draft':
      return (
        <Badge variant="outline" className="bg-muted">
          <Clock className="h-3 w-3 mr-1" />
          Brouillon
        </Badge>
      );
    case 'pending_review':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          À valider
        </Badge>
      );
    case 'validated':
      return (
        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Validé
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const AuditDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getAuditById, 
    getCompanyById, 
    getFrameworkById, 
    getAuditStepsByAuditId, 
    getFindingsByAuditStepId,
    getControlById,
    addFinding,
    updateFinding,
    controls
  } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('steps');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [newFinding, setNewFinding] = useState({
    rawText: '',
    controlId: '',
    category: 'non_conformity_minor' as FindingCategory,
  });
  const [isSubmittingFinding, setIsSubmittingFinding] = useState(false);
  const [isRefinementLoading, setIsRefinementLoading] = useState<Record<string, boolean>>({});

  if (!id) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Identifiant d'audit manquant</AlertDescription>
        </Alert>
      </div>
    );
  }

  const audit = getAuditById(id);
  
  if (!audit) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Audit non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  const company = getCompanyById(audit.companyId);
  const framework = getFrameworkById(audit.frameworkId);
  const auditSteps = getAuditStepsByAuditId(id);
  
  const selectedStep = selectedStepId 
    ? auditSteps.find(step => step.id === selectedStepId) 
    : auditSteps[0];
    
  const stepFindings = selectedStep 
    ? getFindingsByAuditStepId(selectedStep.id) 
    : [];
    
  const getAuditStatusBadge = (status: string) => {
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
  
  // Contrôles disponibles pour l'étape sélectionnée
  const availableControls = selectedStep
    ? controls.filter(control => 
        control.frameworkId === audit.frameworkId && 
        selectedStep.controlIds.includes(control.id)
      )
    : [];
    
  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStep) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une étape",
        variant: "destructive",
      });
      return;
    }
    
    if (!newFinding.rawText.trim()) {
      toast({
        title: "Champ requis",
        description: "Le texte du constat est obligatoire",
        variant: "destructive",
      });
      return;
    }
    
    if (!newFinding.controlId) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un contrôle",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour ajouter un constat",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingFinding(true);
    
    try {
      await addFinding({
        auditStepId: selectedStep.id,
        controlId: newFinding.controlId,
        authorId: user.id,
        rawText: newFinding.rawText,
        category: newFinding.category,
        status: 'draft',
      });
      
      toast({
        title: "Constat ajouté",
        description: "Le constat a été ajouté avec succès",
      });
      
      setNewFinding({
        rawText: '',
        controlId: '',
        category: 'non_conformity_minor',
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le constat",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFinding(false);
    }
  };
  
  const handleRefineFinding = async (findingId: string) => {
    const finding = stepFindings.find(f => f.id === findingId);
    
    if (!finding) {
      toast({
        title: "Erreur",
        description: "Constat non trouvé",
        variant: "destructive",
      });
      return;
    }
    
    setIsRefinementLoading(prev => ({ ...prev, [findingId]: true }));
    
    // Simuler l'appel à l'IA pour la reformulation
    setTimeout(async () => {
      const refinedText = `${finding.rawText} [REFORMULÉ] - Dans le cadre de l'évaluation du contrôle, il a été constaté que les mesures implémentées ne répondent pas entièrement aux exigences normatives.`;
      
      try {
        await updateFinding(findingId, {
          refinedText,
          status: 'pending_review',
        });
        
        toast({
          title: "Texte reformulé",
          description: "Le constat a été reformulé et proposé pour validation",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de reformuler le constat",
          variant: "destructive",
        });
      } finally {
        setIsRefinementLoading(prev => ({ ...prev, [findingId]: false }));
      }
    }, 1500);
  };
  
  const handleValidateFinding = async (findingId: string) => {
    try {
      await updateFinding(findingId, {
        status: 'validated',
      });
      
      toast({
        title: "Constat validé",
        description: "Le constat a été validé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le constat",
        variant: "destructive",
      });
    }
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
            {company && (
              <>
                <Link
                  to={`/company/${company.id}`}
                  className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
                >
                  {company.name}
                </Link>
                <span className="text-muted-foreground text-sm mr-2">/</span>
              </>
            )}
            <h1 className="text-2xl font-bold">Audit</h1>
            {getAuditStatusBadge(audit.status)}
          </div>
          <p className="text-muted-foreground">
            {framework ? `${framework.name} (${framework.version})` : 'Audit'} - 
            {new Date(audit.startDate).toLocaleDateString('fr-FR')} au {new Date(audit.endDate).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Générer le rapport
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
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Période:</span>
                  <span>
                    {new Date(audit.startDate).toLocaleDateString('fr-FR')} au {new Date(audit.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Référentiel:</span>
                  <span>{framework ? `${framework.name} (${framework.version})` : 'Non défini'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Auditeur:</span>
                  <span>{user?.name || 'Non défini'}</span>
                </div>
                
                {audit.scope && (
                  <div className="flex items-start">
                    <ListChecks className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground mr-2">Périmètre:</span>
                      <span>{audit.scope}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Étapes</div>
                <div className="font-medium">{auditSteps.length}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Constats</div>
                <div className="font-medium">
                  {stepFindings.length} ajoutés
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Constats validés</div>
                <div className="font-medium">
                  {stepFindings.filter(f => f.status === 'validated').length} / {stepFindings.length}
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Rapport</div>
                <div>
                  {stepFindings.every(f => f.status === 'validated') ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="steps" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="steps" className="inline-flex items-center">
            <ListChecks className="h-4 w-4 mr-2" />
            Plan d'audit
          </TabsTrigger>
          <TabsTrigger value="findings" className="inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Constats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="steps" className="animate-fade-in">
          {auditSteps.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune étape définie</h3>
                <p className="text-muted-foreground mb-6">
                  Cet audit n'a pas encore d'étapes définies
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Étapes</CardTitle>
                    <CardDescription>
                      Sélectionnez une étape pour ajouter des constats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="space-y-2">
                      {auditSteps.map((step) => {
                        const stepHasFindings = getFindingsByAuditStepId(step.id).length > 0;
                        return (
                          <Button
                            key={step.id}
                            variant={selectedStepId === step.id ? "default" : "outline"}
                            className="w-full justify-start text-left flex items-start"
                            onClick={() => setSelectedStepId(step.id)}
                          >
                            <div className="flex items-center">
                              <div className="mr-2">
                                {stepHasFindings ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full border text-xs font-medium">
                                    {step.order}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{step.title}</div>
                                {step.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {step.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                {selectedStep ? (
                  <>
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{selectedStep.title}</CardTitle>
                            {selectedStep.description && (
                              <CardDescription>
                                {selectedStep.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="outline">
                            Étape {selectedStep.order}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <h3 className="text-sm font-medium mb-2">Contrôles à évaluer :</h3>
                        <div className="space-y-3">
                          {availableControls.map(control => (
                            <div key={control.id} className="rounded-md border p-3">
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-medium">{control.referenceCode}</div>
                                <Badge variant="outline" className="ml-2">
                                  {framework?.name || 'Référentiel'}
                                </Badge>
                              </div>
                              <div className="text-sm font-medium mb-1">{control.title}</div>
                              <div className="text-sm text-muted-foreground">{control.description}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Ajouter un constat</CardTitle>
                        <CardDescription>
                          Enregistrez vos constats pour cette étape
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddFinding} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="rawText" className="required">Constat</Label>
                            <Textarea
                              id="rawText"
                              placeholder="Décrivez votre constat..."
                              className="min-h-[100px]"
                              value={newFinding.rawText}
                              onChange={(e) => setNewFinding({ ...newFinding, rawText: e.target.value })}
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="control" className="required">Contrôle associé</Label>
                              <Select
                                value={newFinding.controlId}
                                onValueChange={(value) => setNewFinding({ ...newFinding, controlId: value })}
                                required
                              >
                                <SelectTrigger id="control">
                                  <SelectValue placeholder="Sélectionner un contrôle" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableControls.map((control) => (
                                    <SelectItem key={control.id} value={control.id}>
                                      {control.referenceCode} - {control.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="category" className="required">Catégorie</Label>
                              <Select
                                value={newFinding.category}
                                onValueChange={(value) => setNewFinding({ ...newFinding, category: value as FindingCategory })}
                                required
                              >
                                <SelectTrigger id="category">
                                  <SelectValue placeholder="Sélectionner une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="non_conformity_major">Non-conformité majeure</SelectItem>
                                  <SelectItem value="non_conformity_minor">Non-conformité mineure</SelectItem>
                                  <SelectItem value="sensitive_point">Point sensible</SelectItem>
                                  <SelectItem value="improvement_opportunity">Opportunité d'amélioration</SelectItem>
                                  <SelectItem value="strength">Point fort</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmittingFinding}>
                              {isSubmittingFinding ? 'Ajout...' : 'Ajouter le constat'}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune étape sélectionnée</h3>
                      <p className="text-muted-foreground mb-6">
                        Veuillez sélectionner une étape pour afficher les détails et ajouter des constats
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="findings" className="animate-fade-in">
          <div className="space-y-6">
            {auditSteps.map((step) => {
              const findings = getFindingsByAuditStepId(step.id);
              
              return (
                <Card key={step.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {step.title}
                      </CardTitle>
                      <Badge variant="outline">
                        Étape {step.order}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {findings.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Aucun constat pour cette étape</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {findings.map((finding) => {
                          const control = getControlById(finding.controlId);
                          return (
                            <div key={finding.id} className="rounded-md border p-4">
                              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                <div className="flex items-center">
                                  <div className="font-medium text-sm mr-2">
                                    {control?.referenceCode || 'Contrôle'}
                                  </div>
                                  {getCategoryBadge(finding.category)}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(finding.status)}
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="text-sm font-medium mb-1 flex items-center">
                                  <span className="mr-2">Constat brut</span>
                                  {finding.status === 'draft' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 px-2"
                                      onClick={() => handleRefineFinding(finding.id)}
                                      disabled={isRefinementLoading[finding.id]}
                                    >
                                      {isRefinementLoading[finding.id] ? (
                                        <span>Reformulation...</span>
                                      ) : (
                                        <>
                                          <Sparkles className="h-3 w-3 mr-1" />
                                          <span>Reformuler</span>
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <div className="text-sm p-3 bg-muted/50 rounded-md">
                                  {finding.rawText}
                                </div>
                              </div>
                              
                              {finding.refinedText && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium mb-1 flex items-center">
                                    <span className="mr-2">Constat reformulé</span>
                                    {finding.status === 'pending_review' && user?.role !== 'auditor' && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 px-2"
                                        onClick={() => handleValidateFinding(finding.id)}
                                      >
                                        <Check className="h-3 w-3 mr-1" />
                                        <span>Valider</span>
                                      </Button>
                                    )}
                                  </div>
                                  <div className="text-sm p-3 bg-accent/50 rounded-md">
                                    {finding.refinedText}
                                  </div>
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground flex items-center justify-between mt-4">
                                <div>
                                  Ajouté le {new Date(finding.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {finding.status === 'draft' && (
                                    <Button size="sm" variant="ghost" className="h-7 px-2">
                                      <Edit className="h-3 w-3 mr-1" />
                                      Modifier
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => {
                        setSelectedStepId(step.id);
                        setActiveTab('steps');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un constat à cette étape
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditDetail;
