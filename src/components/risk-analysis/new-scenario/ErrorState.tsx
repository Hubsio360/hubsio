
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  description: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title, description }) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
};

export const LoadingState: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p>Chargement des données...</p>
      </div>
    </div>
  );
};
