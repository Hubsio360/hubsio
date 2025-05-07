
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, FileEdit, Search, Download, Mail, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CtiResultViewer from '@/components/cti/CtiResultViewer';
import CtiResultEditor from '@/components/cti/CtiResultEditor';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface CtiResult {
  id?: string;
  title: string;
  query: string;
  content: string;
  createdAt?: string;
}

const CTI = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CtiResult | null>(null);
  const [savedResults, setSavedResults] = useState<CtiResult[]>([]);
  const [activeTab, setActiveTab] = useState('query');

  // Fetch saved CTI results when the component loads
  React.useEffect(() => {
    fetchSavedResults();
  }, []);

  const fetchSavedResults = async () => {
    try {
      const { data, error } = await supabase
        .from('cti_results')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setSavedResults(data);
    } catch (error) {
      console.error('Error fetching saved results:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les résultats sauvegardés",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez saisir une requête",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate-cti-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: query }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setResult({
        title: `Analyse CTI: ${query.slice(0, 50)}${query.length > 50 ? '...' : ''}`,
        query: query,
        content: data.generatedText || data.text || '',
        createdAt: new Date().toISOString(),
      });
      
      setActiveTab('result');
      
      toast({
        title: "Analyse générée",
        description: "L'analyse CTI a été générée avec succès",
      });
    } catch (error) {
      console.error('Error generating CTI insights:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'analyse CTI",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveResult = async () => {
    if (!result) return;
    
    try {
      const { data, error } = await supabase
        .from('cti_results')
        .insert([
          {
            title: result.title,
            query: result.query,
            content: result.content,
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Résultat sauvegardé",
        description: "L'analyse CTI a été sauvegardée avec succès",
      });
      
      fetchSavedResults();
    } catch (error) {
      console.error('Error saving result:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde de l'analyse CTI",
      });
    }
  };

  const loadResult = (savedResult: CtiResult) => {
    setResult(savedResult);
    setQuery(savedResult.query);
    setActiveTab('result');
  };

  const exportAsPDF = () => {
    toast({
      title: "Export PDF",
      description: "La fonctionnalité d'export PDF sera bientôt disponible",
    });
    // Implement PDF export functionality
  };

  const sendByEmail = () => {
    toast({
      title: "Envoi par email",
      description: "La fonctionnalité d'envoi par email sera bientôt disponible",
    });
    // Implement email sending functionality
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl animate-fade-in">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Cyber Threat Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            Générez des renseignements sur les menaces cyber à l'aide de l'intelligence artificielle
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="query">Nouvelle recherche</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="query" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recherche CTI</CardTitle>
                <CardDescription>
                  Entrez votre requête pour analyser les menaces cyber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Exemple: Quelles sont les dernières menaces affectant le secteur bancaire en 2025?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          Analyse en cours...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Analyser les menaces
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {result && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{result.title}</CardTitle>
                  <CardDescription>
                    Résultat généré le {new Date(result.createdAt || '').toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CtiResultViewer content={result.content} />
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('result')}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Éditer
                  </Button>
                  <Button variant="outline" onClick={saveResult}>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={exportAsPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                  <Button variant="outline" onClick={sendByEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="result">
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Éditer le résultat</CardTitle>
                  <CardDescription>
                    Personnalisez le résultat de votre analyse CTI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CtiResultEditor
                    content={result.content}
                    onChange={(newContent) => setResult({...result, content: newContent})}
                  />
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('query')}>
                    Retour
                  </Button>
                  <Button variant="outline" onClick={saveResult}>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={exportAsPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                  <Button variant="outline" onClick={sendByEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des recherches CTI</CardTitle>
                <CardDescription>
                  Consultez vos analyses précédentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedResults.length > 0 ? (
                  <div className="space-y-4">
                    {savedResults.map((savedResult) => (
                      <Card key={savedResult.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => loadResult(savedResult)}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">{savedResult.title}</CardTitle>
                          <CardDescription>
                            {new Date(savedResult.createdAt || '').toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-2">
                          <p className="line-clamp-2 text-sm text-muted-foreground">{savedResult.query}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune recherche sauvegardée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CTI;
