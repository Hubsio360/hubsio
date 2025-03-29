
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useSessionCheck() {
  const { toast } = useToast();
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Vérifier la session au montage du composant
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setSessionError("Session d'authentification invalide. Veuillez vous reconnecter.");
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter pour continuer",
          variant: "destructive",
        });
      }
    };
    
    checkSession();
  }, [toast]);

  return { sessionError };
}
