
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  onRetry: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRetry }) => {
  return (
    <div className="py-6 text-center text-sm flex flex-col items-center gap-2">
      Aucun modèle disponible
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
        <RefreshCw className="h-4 w-4 mr-2" />
        Recharger
      </Button>
    </div>
  );
};

export default EmptyState;
