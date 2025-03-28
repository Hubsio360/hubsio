
import React, { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskLevel, RiskStatus, RiskScope } from '@/types';
import { RiskScenarioTemplate } from '@/contexts/data/hooks/useRiskScenarioTemplates';

// Schéma de validation du formulaire
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

// Define the type only once
type RiskScenarioFormValues = z.infer<typeof formSchema>;

interface RiskScenarioFormProps {
  onSubmit: (values: RiskScenarioFormValues) => Promise<void>;
  companyId: string;
  defaultValues?: Partial<RiskScenarioFormValues>;
}

// Utilisation de forwardRef pour pouvoir exposer des méthodes au parent
const RiskScenarioForm = forwardRef<
  { handleTemplateSelect: (template: RiskScenarioTemplate) => void },
  RiskScenarioFormProps
>(({ onSubmit, companyId, defaultValues = {
  name: '',
  description: '',
  riskLevel: 'medium',
  impactLevel: 'medium',
  status: 'identified',
  scope: 'technical',
  impactDescription: '',
  likelihood: 'medium',
} }, ref) => {
  const navigate = useNavigate();
  const form = useForm<RiskScenarioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Méthode pour mettre à jour le formulaire à partir d'un modèle sélectionné
  const handleTemplateSelect = (template: RiskScenarioTemplate) => {
    if (!template) return;
    
    // Extract scenario name - typically the first sentence or part before ":"
    let name = template.scenario_description;
    if (name.includes(':')) {
      name = name.split(':')[0].trim();
    } else if (name.includes('.')) {
      name = name.split('.')[0].trim();
    } else if (name.length > 50) {
      name = name.substring(0, 50) + '...';
    }
    
    // Set form values based on template
    form.setValue('name', name);
    form.setValue('description', template.scenario_description);
    
    // Set a default scope based on domain
    const domain = template.domain.toLowerCase();
    if (domain.includes('rgpd') || domain.includes('confidentialité')) {
      form.setValue('scope', 'organizational');
    } else if (domain.includes('sécurité') || domain.includes('controle d\'acces')) {
      form.setValue('scope', 'technical');
    } else if (domain.includes('formation')) {
      form.setValue('scope', 'human');
    }
    
    // Set default impact description
    form.setValue('impactDescription', `Impact potentiel lié à "${template.domain}"`);
  };

  // Expose les méthodes au parent via useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleTemplateSelect
  }));

  return (
    <Card>
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
                onClick={() => navigate(`/risk-analysis/${companyId}`)}
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
  );
});

RiskScenarioForm.displayName = "RiskScenarioForm";

// Export with a cleaner approach - fixing the conflict
export { RiskScenarioForm, formSchema };
export type { RiskScenarioFormValues };

