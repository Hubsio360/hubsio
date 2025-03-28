
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RiskAsset } from '@/types';

interface AssetsTabProps {
  isLoading: boolean;
  riskAssets: RiskAsset[];
}

const AssetsTab = ({ isLoading, riskAssets }: AssetsTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Actifs</CardTitle>
          <CardDescription>Liste des actifs identifiés</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel actif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel actif</DialogTitle>
              <DialogDescription>
                Identifiez un actif primordial ou de support pour votre organisation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea className="w-full" placeholder="Nom de l'actif" />
              <Textarea className="w-full" placeholder="Catégorie de l'actif" />
              <Textarea className="w-full" placeholder="Valeur de l'actif" />
              <Textarea className="w-full" placeholder="Propriétaire de l'actif" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {riskAssets.length === 0 ? (
          <div className="text-center py-6">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              Aucun actif identifié
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un premier actif
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel actif</DialogTitle>
                  <DialogDescription>
                    Identifiez un actif primordial ou de support pour votre organisation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea className="w-full" placeholder="Nom de l'actif" />
                  <Textarea className="w-full" placeholder="Catégorie de l'actif" />
                  <Textarea className="w-full" placeholder="Valeur de l'actif" />
                  <Textarea className="w-full" placeholder="Propriétaire de l'actif" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button>Ajouter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskAssets.map(asset => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>{asset.value}</TableCell>
                  <TableCell>{asset.owner || 'Non défini'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetsTab;
