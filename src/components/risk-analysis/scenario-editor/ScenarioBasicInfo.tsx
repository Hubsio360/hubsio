
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ScenarioBasicInfo() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informations de base</h3>
      
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom du scénario</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nom du scénario de risque" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Description détaillée du scénario de risque" 
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Périmètre</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un périmètre" />
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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="impactDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description de l'impact</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Description détaillée des impacts potentiels" 
                className="min-h-[80px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
