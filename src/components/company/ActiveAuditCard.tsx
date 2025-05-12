
import { Link } from 'react-router-dom';
import { AlertCircle, CalendarIcon, FileText, MoveRight, Plus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Audit } from '@/types';

interface ActiveAuditCardProps {
  inProgressAudits: Audit[];
  companyId: string;
  formatFramework: (frameworkId: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
}

const ActiveAuditCard = ({ 
  inProgressAudits, 
  companyId,
  formatFramework,
  getStatusBadge 
}: ActiveAuditCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Audit actif</CardTitle>
      </CardHeader>
      <CardContent>
        {inProgressAudits.length > 0 ? (
          <div className="space-y-3">
            {inProgressAudits.map(audit => (
              <div key={audit.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">Audit en cours</div>
                  {getStatusBadge(audit.status)}
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Période:</span>
                    <span>
                      {new Date(audit.startDate).toLocaleDateString('fr-FR')} - {new Date(audit.endDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Référentiel:</span>
                    <span>{formatFramework(audit.frameworkId)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  asChild
                >
                  <Link to={`/audit/${audit.id}`}>
                    Continuer
                    <MoveRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              Aucun audit en cours
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {inProgressAudits.length === 0 && (
          <Button className="w-full" variant="outline" asChild>
            <Link to={`/new-audit/${companyId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Démarrer un audit
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ActiveAuditCard;
