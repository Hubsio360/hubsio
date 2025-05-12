
import { Building2, Globe, InfoIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { Company } from '@/types';

interface CompanyInfoCardProps {
  company: Company;
  isEnrichingClient: boolean;
  onEnrichCompany: () => void;
}

const CompanyInfoCard = ({ company, isEnrichingClient, onEnrichCompany }: CompanyInfoCardProps) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Informations</CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEnrichCompany}
          disabled={isEnrichingClient}
        >
          {isEnrichingClient ? (
            <>
              <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
              Enrichissement...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Enrichir les données
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Création:</span>
              <span>{company.creationYear || 'Non renseigné'}</span>
            </div>
            
            {company.parentCompany && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Groupe:</span>
                <span>{company.parentCompany}</span>
              </div>
            )}
            
            {company.marketScope && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Marché:</span>
                <span>{company.marketScope}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {company.activity && (
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-1 flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  Activité:
                </span>
                <p className="text-sm pl-6">{company.activity}</p>
              </div>
            )}
            
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground mr-2">Total audits:</span>
              <span>{company.audits?.length || 0}</span>
            </div>
            
            {company.lastAuditDate && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Dernier audit:</span>
                <span>{new Date(company.lastAuditDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;
