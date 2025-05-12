import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Company } from '@/types';
import { ClientCard } from '@/components/clients/ClientCard';
import { EditClientDialog } from '@/components/clients/EditClientDialog';

const Home = () => {
  const navigate = useNavigate();
  const { companies, addCompany, updateCompany, enrichCompanyData, loading: dataLoading } = useData();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [newCompany, setNewCompany] = useState({ name: '', activity: '' });
  const [isEnrichingClient, setIsEnrichingClient] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Filtrer les entreprises sans utiliser fetchCompanies
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.activity && company.activity.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Make sure isLoading is always a boolean
  const isLoading = authLoading || (
    typeof dataLoading === 'object' && dataLoading.companies !== undefined
      ? dataLoading.companies === true
      : false
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour ajouter un client",
        variant: "destructive",
      });
      return;
    }
    
    if (!newCompany.name.trim()) {
      toast({
        title: "Champ requis",
        description: "Le nom du client est obligatoire",
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
        title: "Client ajouté",
        description: `${company.name} a été ajouté avec succès`,
      });
      
      setNewCompany({ name: '', activity: '' });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le client",
        variant: "destructive",
      });
    }
  };

  const handleEnrichCompany = async (companyId: string) => {
    setIsEnrichingClient(companyId);
    
    try {
      const enrichedCompany = await enrichCompanyData(companyId);
      
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
      setIsEnrichingClient(null);
    }
  };

  const handleEnrichNewCompany = async () => {
    if (!newCompany.name.trim()) {
      toast({
        title: "Champ requis",
        description: "Le nom du client est obligatoire",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Créer d'abord l'entreprise
      const company = await addCompany({
        name: newCompany.name,
      });
      
      setIsAddDialogOpen(false);
      
      // Puis l'enrichir
      handleEnrichCompany(company.id);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le client",
        variant: "destructive",
      });
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
  };

  const handleSaveCompany = async (companyData: Partial<Company>) => {
    if (!editingCompany) return;
    
    try {
      await updateCompany(editingCompany.id, companyData);
      toast({
        title: "Client modifié",
        description: "Les informations du client ont été mises à jour avec succès"
      });
    } catch (error: any) {
      console.error('Erreur lors de la modification du client:', error);
      throw error;
    }
  };

  // Ajouter un message d'authentification si nécessaire
  const renderAuthMessage = () => {
    if (!user && !authLoading) {
      return (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">
              Vous n'êtes pas connecté. Certaines fonctionnalités comme l'ajout de clients ne seront pas disponibles.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Composant d'état de chargement
  const renderLoadingState = () => {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 animate-fade-in">
      {renderAuthMessage()}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clients</h1>
          <p className="text-muted-foreground">
            Gérez vos clients et leurs informations
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
              disabled={isLoading}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-shrink-0" disabled={isLoading || !user}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un client</DialogTitle>
                <DialogDescription>
                  Créez un nouveau client à gérer
                </DialogDescription>
              </DialogHeader>
              <form ref={formRef} onSubmit={handleAddCompany}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="required">
                      Nom du client
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
                    onClick={handleEnrichNewCompany}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ajouter et enrichir
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

      {isLoading ? (
        renderLoadingState()
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? `Aucun résultat pour "${searchTerm}"`
              : "Vous n'avez pas encore ajouté de clients"}
          </p>
          {!searchTerm && user && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre premier client
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <ClientCard
              key={company.id}
              company={company}
              onEdit={handleEditCompany}
              onView={(id) => navigate(`/company/${id}`)}
              onEnrich={handleEnrichCompany}
              isEnriching={isEnrichingClient === company.id}
            />
          ))}
        </div>
      )}

      <EditClientDialog
        company={editingCompany}
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        onSave={handleSaveCompany}
      />
    </div>
  );
};

export default Home;
