
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Service } from '@/types';
import { CalendarIcon, ClockIcon, FileText, MoveRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ServiceCardProps {
  service: Service;
  title: string;
  icon: React.ReactNode;
  detailsPath: string;
  additionalInfo?: React.ReactNode;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  title, 
  icon, 
  detailsPath,
  additionalInfo 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'actif':
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            Actif
          </Badge>
        );
      case 'en_cours':
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
            En cours
          </Badge>
        );
      case 'terminé':
        return (
          <Badge variant="outline">
            Terminé
          </Badge>
        );
      case 'suspendu':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            Suspendu
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {icon}
            <CardTitle className="text-lg ml-2">{title}</CardTitle>
          </div>
          {getStatusBadge(service.status)}
        </div>
        <CardDescription>
          {service.description || 'Aucune description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Début: {format(new Date(service.startDate), 'dd/MM/yyyy', { locale: fr })}</span>
          </div>
          {service.endDate && (
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Fin: {format(new Date(service.endDate), 'dd/MM/yyyy', { locale: fr })}</span>
            </div>
          )}
        </div>
        {additionalInfo}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          asChild
          className="w-full"
        >
          <Link to={detailsPath}>
            Voir les détails
            <MoveRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
