
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage audit assignments
 */
export const useAuditAssignments = () => {
  const { toast } = useToast();

  /**
   * Assigns auditors to an audit
   */
  const assignAuditors = useCallback(async (
    auditId: string, 
    auditorIds: { userId: string, roleInAudit: 'lead' | 'participant' }[]
  ): Promise<boolean> => {
    try {
      console.log(`Assignation des auditeurs à l'audit ${auditId}:`, auditorIds);
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validAuditorIds = auditorIds.filter(auditor => uuidRegex.test(auditor.userId));
      
      if (validAuditorIds.length === 0) {
        console.warn('Aucun ID d\'auditeur valide trouvé');
        return true;
      }
      
      // Format data for insertion
      const auditUsersData = validAuditorIds.map(auditor => ({
        audit_id: auditId,
        user_id: auditor.userId,
        role_in_audit: auditor.roleInAudit
      }));
      
      // Insert assignments into database
      const { error } = await supabase
        .from('audit_users')
        .insert(auditUsersData);
      
      if (error) {
        console.error('Erreur lors de l\'assignation des auditeurs:', error);
        throw new Error(`Erreur lors de l'assignation des auditeurs: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      handleError(error, "Impossible d'assigner les auditeurs");
      return false;
    }
  }, []);

  /**
   * Gets auditors assigned to an audit
   */
  const getAuditAuditors = useCallback(async (
    auditId: string
  ): Promise<{ userId: string, roleInAudit: 'lead' | 'participant' }[]> => {
    try {
      console.log(`Récupération des auditeurs pour l'audit ${auditId}`);
      
      // Get assignments from database
      const { data, error } = await supabase
        .from('audit_users')
        .select('*')
        .eq('audit_id', auditId);
      
      if (error) {
        console.error('Erreur lors de la récupération des auditeurs:', error);
        throw new Error(`Erreur lors de la récupération des auditeurs: ${error.message}`);
      }
      
      // Format returned data
      return data.map(item => ({
        userId: item.user_id,
        roleInAudit: item.role_in_audit as 'lead' | 'participant'
      }));
    } catch (error: any) {
      handleError(error, "Impossible de récupérer les auditeurs");
      return [];
    }
  }, []);

  /**
   * Common error handler
   */
  const handleError = (error: any, defaultMessage: string) => {
    console.error('Erreur:', error);
    toast({
      title: "Erreur",
      description: error.message || defaultMessage,
      variant: "destructive",
    });
  };

  return {
    assignAuditors,
    getAuditAuditors
  };
};
