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
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AuditorsSelect } from '@/components/AuditorsSelect';
import { Audit, FindingCategory, FindingStatus, User, UserRole } from '@/types';
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
  User as UserIcon,
  Calendar,
  LayoutTemplate,
  PencilLine,
} from 'lucide-react';
import AuditPlanSection from '@/components/AuditPlanSection';

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
    frameworks,
    getAuditStepsByAuditId, 
    getFindingsByAuditStepId,
    getControlById,
    addFinding,
    updateFinding,
    updateAudit,
    controls,
    assignAuditors,
    getAuditAuditors
  } = useData();
  const { user, getUsers } = useAuth();
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
  const [showPlanSection, setShowPlanSection] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    scope: '',
    startDate: '',
    endDate: '',
    frameworkId: '',
    auditorIds: [] as { userId: string, roleInAudit: 'lead' | 'participant' }[]
  });
  const [isLoadingAuditors, setIsLoadingAuditors] = useState(false);
  const [auditAuditors, setAuditAuditors] = useState<{ userId: string, roleInAudit: 'lead' | 'participant' }[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

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
  
  const availableControls = selectedStep
    ? controls.filter(control => 
        control.frameworkId === audit.frameworkId && 
        selectedStep.controlIds?.includes(control.id)
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

  const handleOpenEditDialog = async () => {
    setIsLoadingAuditors(true);
    try {
      const auditors = await getAuditAuditors(id || '');
      setAuditAuditors(auditors);
      
      const fetchedUsers = await getUsers();
      setAvailableUsers(fetchedUsers);
      
      setEditFormData({
        scope: audit?.scope || '',
        startDate: audit?.startDate.split('T')[0] || '',
        endDate: audit?.endDate.split('T')[0] || '',
        frameworkId: audit?.frameworkId || '',
        auditorIds: auditors
      });
      
      setIsLoadingAuditors(false);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error('Erreur lors du chargement des auditeurs:', error);
      setIsLoadingAuditors(false);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations des auditeurs",
        variant: "destructive",
      });
    }
  };

  const handleAuditorSelect = (userId: string, role: 'lead' | 'participant') => {
    setEditFormData(prev => {
      const newAuditorIds = [...prev.auditorIds];
      const existingIndex = newAuditorIds.findIndex(a => a.userId === userId);
      
      if (existingIndex >= 0) {
        newAuditorIds[existingIndex].roleInAudit = role;
      } else {
        newAuditorIds.push({ userId, roleInAudit: role });
      }
      
      return { ...prev, auditorIds: newAuditorIds };
    });
  };

  const handleAuditorRemove = (userId: string) => {
    setEditFormData(prev => ({
      ...prev,
      auditorIds: prev.auditorIds.filter(a => a.userId !== userId)
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updates: Partial<Audit> = {
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        scope: editFormData.scope,
        frameworkId: editFormData.frameworkId || audit.frameworkId
      };
      
      await updateAudit(id || '', updates);
      
      if (editFormData.auditorIds.length > 0) {
        await assignAuditors(id || '', editFormData.auditorIds);
      }
      
      toast({
        title: "Succès",
        description: "Les informations de l'audit ont été mises à jour",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations de l'audit",
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
          <Button 
            variant="outline" 
            onClick={handleOpenEditDialog}
            className="flex items-center"
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Modifier l'audit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowPlanSection(!showPlanSection)}
            className="flex items-center"
          >
            <LayoutTemplate className="mr-2 h-4 w-4" />
            {showPlanSection ? "Masquer le plan d'audit" : "Plan d'audit"}
          </Button>
          <Button variant="outline" disabled>
            <FileText className="mr-2 h-4 w-4" />
            Générer le rapport
          </Button>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier les informations de l'audit</DialogTitle>
            <DialogDescription>
              Mettre à jour les détails de l'audit {framework?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scope" className="text-right">
                  Périmètre
                </Label>
                <Textarea
                  id="scope"
                  value={editFormData.scope}
                  onChange={(e) => setEditFormData({...editFormData, scope: e.target.value})}
                  className="col-span-3"
                  placeholder="Définir le périmètre de l'audit..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="framework" className="text-right">
                  Référentiel
                </Label>
                <Select
                  value={editFormData.frameworkId}
                  onValueChange={(value) => setEditFormData({...editFormData, frameworkId: value})}
                >
                  <SelectTrigger id="framework" className="col-span-3">
                    <SelectValue placeholder="Sélectionner un référentiel" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((fw) => (
                      <SelectItem key={fw.id} value={fw.id}>
                        {fw.name} ({fw.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">
                  Auditeurs
                </Label>
                <div className="col-span-3">
                  {isLoadingAuditors ? (
                    <div className="text-sm text-muted-foreground">Chargement des auditeurs...</div>
                  ) : (
                    <AuditorsSelect
                      auditors={availableUsers}
                      selectedAuditors={editFormData.auditorIds}
                      onAuditorSelect={handleAuditorSelect}
                      onAuditorRemove={handleAuditorRemove}
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer les modifications</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showPlanSection && (
        <div className="mb-8">
          <AuditPlanSection 
            auditId={id || ''} 
            startDate={audit.startDate} 
            endDate={audit.endDate} 
          />
        </div>
      )}

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
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Client:</span>
                  <span>{company?.name || 'Non défini'}</span>
                </div>
                
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Statut:</span>
                  <span>{audit.status}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Périmètre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {audit.scope || 'Aucun périmètre défini'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Étapes de l'audit</CardTitle>
            <CardDescription>
              Sélectionnez une étape pour voir ses constats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="steps">Étapes</TabsTrigger>
                <TabsTrigger value="findings">Constats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="steps">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditSteps.length > 0 ? (
                    auditSteps.map((step) => (
                      <Card 
                        key={step.id} 
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selectedStepId === step.id ? 'border-primary' : ''
                        }`}
                        onClick={() => setSelectedStepId(step.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {step.title}
                          </CardTitle>
                          <CardDescription>
                            {step.controlIds?.length || 0} contrôle(s)
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStepId(step.id);
                              setActiveTab('findings');
                            }}
                          >
                            Voir les constats
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center p-8">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune étape d'audit</h3>
                      <p className="text-muted-foreground mb-4">
                        Cet audit ne comporte pas encore d'étapes.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="findings">
                {selectedStep ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-medium">{selectedStep.title}</h3>
                        <p className="text-muted-foreground">
                          {stepFindings.length} constat(s)
                        </p>
                      </div>
                      
                      <Button onClick={() => setActiveTab('steps')} variant="outline" size="sm">
                        Revenir aux étapes
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Ajouter un constat</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleAddFinding} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="controlId">Contrôle concerné</Label>
                                <Select
                                  value={newFinding.controlId}
                                  onValueChange={(value) => setNewFinding({...newFinding, controlId: value})}
                                >
                                  <SelectTrigger id="controlId">
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
                                <Label htmlFor="category">Catégorie</Label>
                                <Select
                                  value={newFinding.category}
                                  onValueChange={(value: FindingCategory) => 
                                    setNewFinding({...newFinding, category: value})
                                  }
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
                            
                            <div className="space-y-2">
                              <Label htmlFor="rawText">Description du constat</Label>
                              <Textarea
                                id="rawText"
                                value={newFinding.rawText}
                                onChange={(e) => setNewFinding({...newFinding, rawText: e.target.value})}
                                placeholder="Décrivez votre constat..."
                                rows={4}
                              />
                            </div>
                            
                            <Button type="submit" disabled={isSubmittingFinding}>
                              {isSubmittingFinding ? "Ajout en cours..." : "Ajouter le constat"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                      
                      {stepFindings.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Constats existants</h3>
                          
                          {stepFindings.map((finding) => {
                            const control = finding.controlId ? getControlById(finding.controlId) : null;
                            return (
                              <Card key={finding.id}>
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getCategoryBadge(finding.category)}
                                      {getStatusBadge(finding.status)}
                                    </div>
                                    <CardDescription>
                                      {control ? `${control.referenceCode} - ${control.title}` : 'Contrôle inconnu'}
                                    </CardDescription>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Texte brut</h4>
                                      <p>{finding.rawText}</p>
                                    </div>
                                    
                                    {finding.refinedText && (
                                      <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Texte reformulé</h4>
                                        <p>{finding.refinedText}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                  {finding.status === 'draft' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRefineFinding(finding.id)}
                                      disabled={isRefinementLoading[finding.id]}
                                    >
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      {isRefinementLoading[finding.id] ? "Reformulation..." : "Reformuler"}
                                    </Button>
                                  )}
                                  
                                  {finding.status === 'pending_review' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleValidateFinding(finding.id)}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Valider
                                    </Button>
                                  )}
                                </CardFooter>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-muted/50 rounded-lg">
                          <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Aucun constat</h3>
                          <p className="text-muted-foreground mb-4">
                            Cette étape ne comporte pas encore de constats.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune étape sélectionnée</h3>
                    <p className="text-muted-foreground mb-4">
                      Veuillez sélectionner une étape pour voir ses constats.
                    </p>
                    <Button onClick={() => setActiveTab('steps')} variant="outline">
                      Voir les étapes
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditDetail;

