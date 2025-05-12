
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Calendar, FileText, MoveRight, Globe, User } from 'lucide-react';
import { Company } from '@/types';

interface ClientCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onView: (companyId: string) => void;
  onEnrich: (companyId: string) => void;
  isEnriching?: boolean;
}

export const ClientCard = ({ 
  company, 
  onEdit, 
  onView, 
  onEnrich,
  isEnriching 
}: ClientCardProps) => {
  const hasEnrichedData = company.activity || company.creationYear || company.marketScope || company.parentCompany;

  return (
    <Card className="overflow-hidden h-full flex flex-col card-hover">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl truncate" title={company.name}>
            {company.name}
          </CardTitle>
          {hasEnrichedData ? (
            <Badge variant="secondary" className="h-6">
              <User className="h-3 w-3 mr-1" />
              Enrichi
            </Badge>
          ) : (
            <Badge variant="outline" className="h-6 text-muted-foreground">
              Basique
            </Badge>
          )}
        </div>
        {company.activity && (
          <CardDescription className="line-clamp-2" title={company.activity}>
            {company.activity}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4 flex-grow">
        <ScrollArea className="h-28">
          <div className="space-y-2">
            {company.creationYear && (
              <div className="flex items-start text-sm">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Création:</span> {company.creationYear}
                  {company.parentCompany && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Groupe: {company.parentCompany}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {company.marketScope && (
              <div className="flex items-start text-sm">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Marché:</span> {company.marketScope}
                </div>
              </div>
            )}
            
            {company.lastAuditDate && (
              <div className="flex items-start text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Dernier audit:</span>{' '}
                  {new Date(company.lastAuditDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button 
          onClick={() => onEdit(company)} 
          size="sm" 
          variant="outline"
        >
          Éditer
        </Button>
        
        {!hasEnrichedData ? (
          <Button
            onClick={() => onEnrich(company.id)}
            size="sm"
            variant="secondary"
            disabled={isEnriching}
          >
            {isEnriching ? 'Enrichissement...' : 'Enrichir'}
          </Button>
        ) : (
          <Button 
            onClick={() => onView(company.id)} 
            size="sm" 
            className="justify-between"
          >
            Voir
            <MoveRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
