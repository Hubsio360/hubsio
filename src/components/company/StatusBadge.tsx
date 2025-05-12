
import { FileCheck, FileClock, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
          <FileCheck className="h-3 w-3 mr-1" />
          Terminé
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
          <FileClock className="h-3 w-3 mr-1" />
          En cours
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Brouillon
        </Badge>
      );
    case 'review':
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          En revue
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default StatusBadge;
