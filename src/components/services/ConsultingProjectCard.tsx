
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ConsultingProject, Framework } from '@/types';
import { FileText, MoveRight } from 'lucide-react';

interface ConsultingProjectCardProps {
  project: ConsultingProject;
  framework?: Framework;
}

const ConsultingProjectCard: React.FC<ConsultingProjectCardProps> = ({ project, framework }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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
      case 'planifié':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            Planifié
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
          <CardTitle className="text-md">{project.name}</CardTitle>
          {getStatusBadge(project.status)}
        </div>
        <CardDescription>
          {project.scope || 'Aucune portée définie'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {framework && (
          <div className="flex items-center text-sm">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Référentiel: {framework.name} v{framework.version}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          asChild
          className="w-full"
          size="sm"
        >
          <Link to={`/consulting-project/${project.id}`}>
            Détails du projet
            <MoveRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConsultingProjectCard;
