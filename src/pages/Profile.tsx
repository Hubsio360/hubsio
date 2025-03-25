import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, User, FileText, Key, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, isLoading } = useAuth();
  const { audits, loading } = useData();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const userAudits = audits?.filter(
    (audit) => audit.createdById === user?.id
  ) || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Simuler une mise à jour (à implémenter avec Supabase)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Simuler une mise à jour (à implémenter avec Supabase)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
      
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du mot de passe.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <div className="flex-shrink-0">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            
            {user.role === "admin" && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                Administrateur
              </Badge>
            )}
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Membre depuis {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Informations personnelles</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Mes audits</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Permissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles ici. Ces informations seront visibles par les autres utilisateurs.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre.email@exemple.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar (URL)</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    placeholder="https://exemple.com/votre-avatar.jpg"
                    defaultValue={user.avatar}
                  />
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour utiliser l'avatar par défaut basé sur votre nom.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Mettre à jour le profil"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Modifiez votre mot de passe et gérez les paramètres de sécurité de votre compte.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Mettre à jour le mot de passe"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle>Mes audits</CardTitle>
              <CardDescription>
                Liste des audits auxquels vous participez ou que vous avez créés.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.audits ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userAudits.length > 0 ? (
                <div className="space-y-4">
                  {userAudits.map((audit) => (
                    <div
                      key={audit.id}
                      className="border rounded-lg p-4 flex justify-between items-center hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold">Audit {audit.id.substring(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {audit.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/audit/${audit.id}`}>
                          Voir les détails
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Vous n'avez pas encore créé ou participé à des audits.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions et rôles</CardTitle>
              <CardDescription>
                Vos permissions et rôles dans l'application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-semibold">Rôle utilisateur</h3>
                    <p className="text-sm text-muted-foreground">
                      Votre niveau d'accès dans l'application
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold mb-4">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Accès aux audits</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vous pouvez consulter et participer aux audits.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Shield className={user.role === "admin" ? "h-5 w-5 text-green-500" : "h-5 w-5 text-gray-300"} />
                        <span className="font-medium">Gestion des utilisateurs</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.role === "admin" 
                          ? "Vous pouvez gérer les utilisateurs." 
                          : "Réservé aux administrateurs."}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Shield className={user.role === "admin" || user.role === "auditor" ? "h-5 w-5 text-green-500" : "h-5 w-5 text-gray-300"} />
                        <span className="font-medium">Création d'audits</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.role === "admin" || user.role === "auditor" 
                          ? "Vous pouvez créer de nouveaux audits." 
                          : "Réservé aux auditeurs et administrateurs."}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Shield className={user.role === "admin" ? "h-5 w-5 text-green-500" : "h-5 w-5 text-gray-300"} />
                        <span className="font-medium">Configuration du système</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.role === "admin" 
                          ? "Vous pouvez configurer le système." 
                          : "Réservé aux administrateurs."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
