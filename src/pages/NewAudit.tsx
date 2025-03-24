
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, CheckCircle2, FileText, Info, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AuditorsSelect, Auditor } from '@/components/AuditorsSelect';

const NewAudit = () => {
  const { id: companyId } = useParams<{ id: string }>();
  const { getCompanyById, frameworks, addAudit, assignAuditors } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [auditData, setAuditData] = useState({
    frameworkId: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    scope: '',
  });
  
  const [auditors, setAuditors] = useState<Auditor[]>([
    { id: 'bill-id', name: 'Bill', email: 'bill@secureport.fr' },
    { id: 'boull-id', name: 'Boull', email: 'boull@secureport.fr' }
  ]);
  
  const [selectedAuditors, setSelectedAuditors] = useState<{ userId: string; roleInAudit: 'lead' | 'participant' }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!companyId) {
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

  const company = getCompanyById(companyId);

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

  const handleAddAuditor = (userId: string, roleInAudit: 'lead' | 'participant') => {
    setSelectedAuditors((prev) => [...prev, { userId, roleInAudit }]);
  };

  const handleRemoveAuditor = (userId: string) => {
    setSelectedAuditors((prev) => prev.filter((auditor) => auditor.userId !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auditData.frameworkId) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner un référentiel",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer un audit",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newAudit = await addAudit({
        companyId,
        frameworkId: auditData.frameworkId,
        startDate: auditData.startDate.toISOString(),
        endDate: auditData.endDate.toISOString(),
        scope: auditData.scope,
        createdById: user.id,
        status: 'draft',
      });
      
      // Assign auditors if selected
      if (selectedAuditors.length > 0) {
        await assignAuditors(newAudit.id, selectedAuditors);
      }
      
      toast({
        title: "Audit créé",
        description: "L'audit a été créé avec succès",
      });
      
      navigate(`/audit/${newAudit.id}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'audit",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
            <Link
              to={`/company/${companyId}`}
              className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
            >
              {company.name}
            </Link>
            <span className="text-muted-foreground text-sm mr-2">/</span>
            <h1 className="text-2xl font-bold">Nouvel audit</h1>
          </div>
          <p className="text-muted-foreground">
            Configurez les paramètres du nouvel audit pour {company.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'audit</CardTitle>
                <CardDescription>
                  Définissez les paramètres essentiels de l'audit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="framework" className="required">Référentiel</Label>
                    <Select
                      value={auditData.frameworkId}
                      onValueChange={(value) => setAuditData({ ...auditData, frameworkId: value })}
                      required
                    >
                      <SelectTrigger id="framework" className="w-full">
                        <SelectValue placeholder="Sélectionner un référentiel" />
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="required">Date de début</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {auditData.startDate ? (
                              format(auditData.startDate, 'PPP', { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={auditData.startDate}
                            onSelect={(date) => date && setAuditData({ ...auditData, startDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="required">Date de fin</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {auditData.endDate ? (
                              format(auditData.endDate, 'PPP', { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={auditData.endDate}
                            onSelect={(date) => date && setAuditData({ ...auditData, endDate: date })}
                            initialFocus
                            disabled={(date) => date < auditData.startDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scope">Périmètre</Label>
                    <Textarea
                      id="scope"
                      placeholder="Décrivez le périmètre de l'audit (systèmes concernés, applications, etc.)"
                      value={auditData.scope}
                      onChange={(e) => setAuditData({ ...auditData, scope: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label>Équipe d'audit</Label>
                    <AuditorsSelect
                      auditors={auditors}
                      selectedAuditors={selectedAuditors}
                      onAuditorSelect={handleAddAuditor}
                      onAuditorRemove={handleRemoveAuditor}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" asChild>
                    <Link to={`/company/${companyId}`}>Annuler</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Création...' : 'Créer l\'audit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Sélection du référentiel</p>
                  <p className="text-muted-foreground">
                    Le référentiel détermine les contrôles qui seront évalués pendant l'audit. Le plan d'audit sera généré automatiquement selon ce référentiel.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Planification des dates</p>
                  <p className="text-muted-foreground">
                    Les dates d'audit définissent la période pendant laquelle se dérouleront les entretiens et vérifications.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Équipe d'audit</p>
                  <p className="text-muted-foreground">
                    Vous pouvez ajouter des auditeurs à l'équipe qui participeront à la réalisation de l'audit.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Plan d'audit</p>
                  <p className="text-muted-foreground">
                    Un plan d'audit sera automatiquement généré en fonction du référentiel sélectionné.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Étapes suivantes</p>
                  <p className="text-muted-foreground">
                    Après la création de l'audit, vous pourrez saisir vos constats et les faire valider.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewAudit;
