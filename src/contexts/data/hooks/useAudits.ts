
import { useState, useEffect, useCallback } from 'react';
import { Audit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  formatSupabaseAudit, 
  formatAuditForSupabase, 
  formatAuditUpdatesForSupabase 
} from '../utils/auditUtils';

export const useAudits = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch audits on component mount
  useEffect(() => {
    fetchAudits();
  }, []);

  /**
   * Fetches all audits from Supabase
   */
  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Récupération des audits depuis Supabase...');
      
      const { data, error } = await supabase
        .from('audits')
        .select('*');
      
      if (error) {
        console.error('Erreur lors de la récupération des audits:', error);
        throw new Error(`Erreur lors de la récupération des audits: ${error.message}`);
      }

      console.log('Audits récupérés avec succès:', data);
      
      // Format the returned data to Audit type
      const fetchedAudits = Array.isArray(data) 
        ? data.map(formatSupabaseAudit) 
        : [];

      setAudits(fetchedAudits);
    } catch (error: any) {
      handleError(error, "Impossible de récupérer les audits");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Adds a new audit to Supabase
   */
  const addAudit = useCallback(async (audit: Omit<Audit, 'id'>): Promise<Audit> => {
    try {
      console.log('Création d\'un nouvel audit dans Supabase:', audit);
      
      // Format audit data for Supabase
      const auditData = formatAuditForSupabase(audit);
      
      // Insert the audit in the database
      const { data, error } = await supabase
        .from('audits')
        .insert(auditData)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la création de l\'audit:', error);
        throw new Error(`Erreur lors de la création de l'audit: ${error.message}`);
      }

      console.log('Audit créé avec succès:', data);
      
      // Format the returned data to Audit type
      const newAudit = formatSupabaseAudit(data);

      // Update local state
      setAudits(prev => [...prev, newAudit]);
      
      return newAudit;
    } catch (error: any) {
      handleError(error, "Impossible de créer l'audit");
      throw error;
    }
  }, []);

  /**
   * Updates an existing audit in Supabase
   */
  const updateAudit = useCallback(async (id: string, updates: Partial<Audit>): Promise<Audit> => {
    try {
      console.log('Mise à jour de l\'audit dans Supabase:', id, updates);
      
      // Format updates for Supabase
      const auditData = formatAuditUpdatesForSupabase(updates);
      
      // If no data to update, return existing audit
      if (Object.keys(auditData).length === 0) {
        return findAuditById(id);
      }
      
      // Update the audit in the database
      const { data, error } = await supabase
        .from('audits')
        .update(auditData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la mise à jour de l\'audit:', error);
        throw new Error(`Erreur lors de la mise à jour de l'audit: ${error.message}`);
      }

      console.log('Audit mis à jour avec succès:', data);
      
      // Format the returned data to Audit type
      const updatedAudit = formatSupabaseAudit(data);

      // Update local state
      setAudits(prev => prev.map(audit => audit.id === id ? updatedAudit : audit));
      
      return updatedAudit;
    } catch (error: any) {
      handleError(error, "Impossible de mettre à jour l'audit");
      throw error;
    }
  }, [audits]);

  /**
   * Deletes an audit from Supabase
   */
  const deleteAudit = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('Suppression de l\'audit:', id);
      
      // Delete the audit from the database
      const { error } = await supabase
        .from('audits')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la suppression de l\'audit:', error);
        throw new Error(`Erreur lors de la suppression de l'audit: ${error.message}`);
      }
      
      // Update local state
      setAudits(prev => prev.filter(audit => audit.id !== id));
      return true;
    } catch (error: any) {
      handleError(error, "Impossible de supprimer l'audit");
      throw error;
    }
  }, []);

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

  // Utility functions
  const findAuditById = (id: string): Audit => {
    const existingAudit = audits.find(audit => audit.id === id);
    if (!existingAudit) {
      throw new Error(`Audit avec ID ${id} non trouvé`);
    }
    return existingAudit;
  };

  const getAuditsByCompanyId = useCallback((companyId: string): Audit[] => {
    return audits.filter((audit) => audit.companyId === companyId);
  }, [audits]);

  const getAuditById = useCallback((id: string): Audit | undefined => {
    return audits.find((audit) => audit.id === id);
  }, [audits]);

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
    audits,
    loading,
    fetchAudits,
    addAudit,
    updateAudit,
    getAuditsByCompanyId,
    getAuditById,
    deleteAudit,
    assignAuditors,
    getAuditAuditors
  };
};
