
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RiskVulnerability } from '@/types';

interface VulnerabilitiesTabProps {
  isLoading: boolean;
  riskVulnerabilities: RiskVulnerability[];
}

const VulnerabilitiesTab = ({ isLoading, riskVulnerabilities }: VulnerabilitiesTabProps) => {
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
          <CardTitle>Vulnérabilités</CardTitle>
          <CardDescription>Liste des vulnérabilités identifiées</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle vulnérabilité
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle vulnérabilité</DialogTitle>
              <DialogDescription>
                Identifiez une vulnérabilité potentielle dans votre organisation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea className="w-full" placeholder="Nom de la vulnérabilité" />
              <Textarea className="w-full" placeholder="Catégorie de la vulnérabilité" />
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
        {riskVulnerabilities.length === 0 ? (
          <div className="text-center py-6">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              Aucune vulnérabilité identifiée
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une première vulnérabilité
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle vulnérabilité</DialogTitle>
                  <DialogDescription>
                    Identifiez une vulnérabilité potentielle dans votre organisation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea className="w-full" placeholder="Nom de la vulnérabilité" />
                  <Textarea className="w-full" placeholder="Catégorie de la vulnérabilité" />
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskVulnerabilities.map(vulnerability => (
                <TableRow key={vulnerability.id}>
                  <TableCell className="font-medium">{vulnerability.name}</TableCell>
                  <TableCell>{vulnerability.category}</TableCell>
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

export default VulnerabilitiesTab;
