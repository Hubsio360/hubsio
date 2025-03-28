
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { UserX, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RiskThreat } from '@/types';

interface ThreatsTabProps {
  isLoading: boolean;
  riskThreats: RiskThreat[];
}

const ThreatsTab = ({ isLoading, riskThreats }: ThreatsTabProps) => {
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
          <CardTitle>Menaces</CardTitle>
          <CardDescription>Liste des menaces identifiées</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle menace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle menace</DialogTitle>
              <DialogDescription>
                Identifiez une menace potentielle pour votre organisation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea className="w-full" placeholder="Nom de la menace" />
              <Textarea className="w-full" placeholder="Catégorie de la menace" />
              <Textarea className="w-full" placeholder="Source de la menace" />
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
        {riskThreats.length === 0 ? (
          <div className="text-center py-6">
            <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              Aucune menace identifiée
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une première menace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle menace</DialogTitle>
                  <DialogDescription>
                    Identifiez une menace potentielle pour votre organisation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea className="w-full" placeholder="Nom de la menace" />
                  <Textarea className="w-full" placeholder="Catégorie de la menace" />
                  <Textarea className="w-full" placeholder="Source de la menace" />
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
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskThreats.map(threat => (
                <TableRow key={threat.id}>
                  <TableCell className="font-medium">{threat.name}</TableCell>
                  <TableCell>{threat.category}</TableCell>
                  <TableCell>{threat.source}</TableCell>
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

export default ThreatsTab;
