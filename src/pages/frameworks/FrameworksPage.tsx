
import React, { useEffect, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Framework } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { EditFrameworkDialog } from './components/EditFrameworkDialog';
import { DeleteFrameworkDialog } from './components/DeleteFrameworkDialog';
import { ImportFrameworkSheet } from './components/ImportFrameworkSheet';
import { FrameworksList } from './components/FrameworksList';
import { FrameworkControls } from './components/FrameworkControls';
import { NoFrameworksCard } from './components/NoFrameworksCard';

const FrameworksPage: React.FC = () => {
  const { frameworks, fetchFrameworks, deleteFramework, loading } = useData();
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [frameworkToEdit, setFrameworkToEdit] = useState<Framework | null>(null);
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null);

  // Fetch frameworks on component mount
  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  // Get selected framework
  const selectedFramework = selectedFrameworkId 
    ? frameworks?.find(f => f.id === selectedFrameworkId) 
    : null;

  // Handle framework selection
  const handleFrameworkSelect = (frameworkId: string) => {
    setSelectedFrameworkId(frameworkId);
  };

  // Handle adding a new framework
  const handleAddFramework = () => {
    setIsAddDialogOpen(true);
  };

  // Handle editing a framework
  const handleEditFramework = (framework: Framework) => {
    setFrameworkToEdit(framework);
    setIsEditDialogOpen(true);
  };

  // Handle deleting a framework
  const handleDeleteFramework = (framework: Framework) => {
    setFrameworkToDelete(framework);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (!frameworkToDelete) return;

    try {
      await deleteFramework(frameworkToDelete.id);
      toast({
        title: 'Framework supprimé',
        description: `${frameworkToDelete.name} a été supprimé avec succès`,
      });

      // If the deleted framework was selected, clear selection
      if (selectedFrameworkId === frameworkToDelete.id) {
        setSelectedFrameworkId(null);
      }
    } catch (error) {
      console.error('Error deleting framework:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du framework',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setFrameworkToDelete(null);
    }
  };

  // Handle framework import
  const handleImportFramework = () => {
    setIsImportSheetOpen(true);
  };

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Référentiels d'audit</h1>
        <div className="flex space-x-2">
          <Button onClick={handleAddFramework}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un référentiel
          </Button>
          <Button variant="outline" onClick={handleImportFramework}>
            Importer un référentiel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Référentiels disponibles</h2>
          
          {loading.frameworks ? (
            <div className="flex justify-center p-8">
              <p>Chargement des référentiels...</p>
            </div>
          ) : frameworks && frameworks.length > 0 ? (
            <FrameworksList 
              frameworks={frameworks}
              selectedFrameworkId={selectedFrameworkId}
              onSelect={handleFrameworkSelect}
              onEdit={handleEditFramework}
              onDelete={handleDeleteFramework}
            />
          ) : (
            <NoFrameworksCard onAddClick={handleAddFramework} />
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">
            {selectedFramework 
              ? `Contrôles du référentiel: ${selectedFramework.name} v${selectedFramework.version}` 
              : 'Sélectionnez un référentiel pour voir ses contrôles'}
          </h2>
          
          {selectedFramework && (
            <FrameworkControls
              frameworkId={selectedFramework.id}
            />
          )}
        </div>
      </div>

      {/* Dialogs and Sheets */}
      <EditFrameworkDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        isCreating={true}
      />
      
      <EditFrameworkDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setFrameworkToEdit(null);
        }}
        isCreating={false}
        framework={frameworkToEdit}
      />
      
      <DeleteFrameworkDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setFrameworkToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        framework={frameworkToDelete}
      />
      
      <ImportFrameworkSheet
        open={isImportSheetOpen}
        onOpenChange={setIsImportSheetOpen}
      />
    </div>
  );
};

export default FrameworksPage;
