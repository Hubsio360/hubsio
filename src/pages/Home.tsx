
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
  FileText, 
  Sparkles,
  AlertCircle,
  CheckCircle,
  MoveRight
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const Home = () => {
  const { companies, addCompany, enrichCompanyData, getAuditsByCompanyId } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [newCompany, setNewCompany] = useState({ name: '', activity: '' });
  const [isEnriching, setIsEnriching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.activity && company.activity.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompany.name.trim()) {
      toast({
        title: "Champ requis",
        description: "Le nom de l'entreprise est obligatoire",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const company = await addCompany({
        name: newCompany.name,
        activity: newCompany.activity,
      });
      
      toast({
        title: "Entreprise ajoutée",
        description: `${company.name} a été ajoutée avec succès`,
      });
      
      setNewCompany({ name: '', activity: '' });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'entreprise",
        variant: "destructive",
      });
    }
  };

  const handleEnrichCompany = async () => {
    if (!newCompany.name.trim()) {
      toast({
        title: "Champ requis",
        description: "Le nom de l'entreprise est obligatoire",
        variant: "destructive",
      });
      return;
    }
    
    setIsEnriching(true);
    
    try {
      // Créer d'abord l'entreprise
      const company = await addCompany({
        name: newCompany.name,
      });
      
      // Puis l'enrichir
      await enrichCompanyData(company.id);
      
      toast({
        title: "Données enrichies",
        description: `Les informations de ${company.name} ont été complétées automatiquement`,
      });
      
      setNewCompany({ name: '', activity: '' });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enrichir les données de l'entreprise",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clients</h1>
          <p className="text-muted-foreground">
            Gérez vos entreprises à auditer
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un client</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle entreprise à auditer
                </DialogDescription>
              </DialogHeader>
              <form ref={formRef} onSubmit={handleAddCompany}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="required">
                      Nom de l'entreprise
                    </Label>
                    <Input
                      id="name"
                      autoComplete="organization"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="activity">
                      Activité principale
                    </Label>
                    <Input
                      id="activity"
                      value={newCompany.activity}
                      onChange={(e) => setNewCompany({ ...newCompany, activity: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleEnrichCompany}
                    disabled={isEnriching}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isEnriching ? 'Enrichissement...' : 'Enrichir les informations'}
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? `Aucun résultat pour "${searchTerm}"`
              : "Vous n'avez pas encore ajouté de clients"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre premier client
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const companyAudits = getAuditsByCompanyId(company.id);
            const totalAudits = companyAudits.length;
            const hasCompletedAudits = companyAudits.some(audit => audit.status === 'completed');
            
            return (
              <Card key={company.id} className="overflow-hidden card-hover">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl truncate" title={company.name}>
                      {company.name}
                    </CardTitle>
                    {hasCompletedAudits && (
                      <Badge variant="secondary" className="h-6">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Audité
                      </Badge>
                    )}
                  </div>
                  {company.activity && (
                    <CardDescription className="line-clamp-2" title={company.activity}>
                      {company.activity}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <ScrollArea className="h-28">
                    <div className="space-y-2">
                      {company.creationYear && (
                        <div className="flex items-start text-sm">
                          <Building2 className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Création:</span> {company.creationYear}
                            {company.parentCompany && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Groupe: {company.parentCompany}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {company.marketScope && (
                        <div className="flex items-center text-sm">
                          <span className="flex-shrink-0 w-6"></span>
                          <div>
                            <span className="text-muted-foreground">Marché:</span> {company.marketScope}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start text-sm">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-muted-foreground">Audits:</span> {totalAudits}
                        </div>
                      </div>
                      
                      {company.lastAuditDate && (
                        <div className="flex items-start text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Dernier audit:</span>{' '}
                            {new Date(company.lastAuditDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full justify-between" variant="outline">
                    <Link to={`/company/${company.id}`}>
                      Voir les audits
                      <MoveRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
