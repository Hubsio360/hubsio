
import { Link } from 'react-router-dom';
import { AlertCircle, MoveRight, Plus, CalendarIcon, Users, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Audit, Framework } from '@/types';

interface AuditsTabContentProps {
  loading: boolean;
  audits: Audit[];
  companyId: string;
  getFrameworkById: (id: string) => Framework | undefined;
  getStatusBadge: (status: string) => JSX.Element;
  openDeleteDialog: (auditId: string) => void;
}

const AuditsTabContent = ({ 
  loading, 
  audits, 
  companyId,
  getFrameworkById, 
  getStatusBadge,
  openDeleteDialog 
}: AuditsTabContentProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (audits.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun audit trouvé</h3>
          <p className="text-muted-foreground mb-6">
            Cette entreprise n'a pas encore d'historique d'audit
          </p>
          <Button asChild>
            <Link to={`/new-audit/${companyId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un premier audit
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {audits.map(audit => {
        const framework = getFrameworkById(audit.frameworkId);
        return (
          <Card key={audit.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg">
                  {framework ? framework.name : 'Audit'} - {new Date(audit.startDate).toLocaleDateString('fr-FR')}
                </CardTitle>
                {getStatusBadge(audit.status)}
              </div>
              <CardDescription>
                {audit.scope || 'Audit complet'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {new Date(audit.startDate).toLocaleDateString('fr-FR')} - {new Date(audit.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>1 auditeur</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                asChild
              >
                <Link to={`/audit/${audit.id}`}>
                  Voir les détails
                  <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={() => openDeleteDialog(audit.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default AuditsTabContent;
