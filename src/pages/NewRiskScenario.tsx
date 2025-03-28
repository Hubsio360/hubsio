
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { RiskLevel, RiskStatus, RiskScope } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  description: z.string().min(5, { message: 'La description doit contenir au moins 5 caractères' }),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Veuillez sélectionner un niveau de risque',
  }),
  status: z.enum(['identified', 'analyzed', 'treated', 'accepted', 'monitored'], {
    required_error: 'Veuillez sélectionner un statut',
  }),
  scope: z.enum(['technical', 'organizational', 'human', 'physical', 'environmental'], {
    required_error: 'Veuillez sélectionner une portée',
  }),
  impactDescription: z.string().min(1, { message: 'Veuillez décrire l\'impact' }),
  impactLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Veuillez sélectionner un niveau d\'impact',
  }),
  likelihood: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Veuillez sélectionner une probabilité',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const NewRiskScenario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    companies,
    createRiskScenario
  } = useData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      riskLevel: 'medium',
      impactLevel: 'medium',
      status: 'identified',
      scope: 'technical',
      impactDescription: '',
      likelihood: 'medium',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!id) return;

    try {
      const newScenario = {
        companyId: id,
        name: values.name,
        description: values.description,
        riskLevel: values.riskLevel as RiskLevel,
        impactLevel: values.impactLevel as RiskLevel,
        likelihood: values.likelihood as RiskLevel,
        status: values.status as RiskStatus,
        scope: values.scope as RiskScope,
        impactDescription: values.impactDescription,
      };

      await createRiskScenario(newScenario);
      
      toast({
        title: "Scénario créé",
        description: "Le scénario de risque a été créé avec succès",
      });
      
      navigate(`/risk-analysis/${id}`);
    } catch (error) {
      console.error('Erreur lors de la création du scénario:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du scénario",
      });
    }
  };

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

  // Find the company by ID using the companies array
  const company = companies.find(company => company.id === id);

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

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link
            to={`/company/${id}`}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
          >
            {company.name}
          </Link>
          <span className="text-muted-foreground text-sm mr-2">/</span>
          <Link
            to={`/risk-analysis/${id}`}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center mr-2"
          >
            Analyse des risques
          </Link>
          <span className="text-muted-foreground text-sm mr-2">/</span>
          <h1 className="text-2xl font-bold flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-amber-500" />
            Nouveau scénario de risque
          </h1>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Créer un nouveau scénario de risque</CardTitle>
          <CardDescription>
            Définissez les détails du scénario de risque pour l'analyse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du scénario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Perte de données client" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nom court et descriptif du scénario de risque
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez le scénario de risque en détail..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Description détaillée du scénario incluant les éléments déclencheurs et les conséquences potentielles
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau de risque</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un niveau" />
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
                        Évaluation du niveau de risque global
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un statut" />
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
                      <FormDescription>
                        État actuel du traitement du risque
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portée</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une portée" />
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
                    <FormDescription>
                      Domaine principal concerné par ce risque
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="impactDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description de l'impact</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez l'impact potentiel..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Conséquences en cas de réalisation du risque
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="impactLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau d'impact</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un niveau d'impact" />
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
                          Gravité de l'impact en cas d'incident
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="likelihood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probabilité</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une probabilité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Faible</SelectItem>
                            <SelectItem value="medium">Moyenne</SelectItem>
                            <SelectItem value="high">Élevée</SelectItem>
                            <SelectItem value="critical">Très élevée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Probabilité d'occurrence du risque
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/risk-analysis/${id}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button type="submit">Créer le scénario</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRiskScenario;
