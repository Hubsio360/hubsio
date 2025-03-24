
import { useToast } from '@/hooks/use-toast';

/**
 * Creates an error handler function
 */
export const createErrorHandler = (toast: ReturnType<typeof useToast>['toast']) => {
  return (error: any, defaultMessage: string) => {
    console.error('Erreur:', error);
    toast({
      title: "Erreur",
      description: error.message || defaultMessage,
      variant: "destructive",
    });
  };
};
