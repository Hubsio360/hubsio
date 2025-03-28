
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
      <span>{error}</span>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
        <RefreshCw className="h-4 w-4 mr-2" />
        Réessayer
      </Button>
    </div>
  );
};

export default ErrorState;
