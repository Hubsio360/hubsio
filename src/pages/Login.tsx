
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, LockKeyhole, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur SecuReporter",
      });
      navigate('/');
    } catch (error) {
      setError('Identifiants incorrects');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-primary mb-2">SecuReporter</h1>
          <p className="text-muted-foreground">Plateforme d'audits cybersécurité</p>
        </div>

        <Card className="glass animate-scale-in">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Accédez à votre espace de travail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full transition-all" 
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center w-full">
              Pour les besoins de la démo, utilisez:
            </div>
            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 w-full">
              <div className="border rounded p-2">
                <div className="font-medium">Admin</div>
                <div>admin@secureport.fr</div>
              </div>
              <div className="border rounded p-2">
                <div className="font-medium">Auditeur</div>
                <div>auditeur@secureport.fr</div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
