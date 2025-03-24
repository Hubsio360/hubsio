
import { useState } from 'react';
import { Audit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAudits = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const { toast } = useToast();

  const addAudit = async (audit: Omit<Audit, 'id'>): Promise<Audit> => {
    try {
      console.log('Création d\'un nouvel audit dans Supabase:', audit);
      
      // Préparer les données pour l'insertion dans la base de données
      const auditData = {
        company_id: audit.companyId,
        framework_id: audit.frameworkId,
        start_date: audit.startDate,
        end_date: audit.endDate,
        scope: audit.scope || null,
        created_by_id: audit.createdById,
        status: audit.status,
      };
      
      // Insérer l'audit dans la base de données
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
      
      // Formater les données retournées par Supabase au format Audit
      const newAudit: Audit = {
        id: data.id,
        companyId: data.company_id,
        frameworkId: data.framework_id,
        startDate: data.start_date,
        endDate: data.end_date,
        scope: data.scope || undefined,
        createdById: data.created_by_id,
        status: data.status,
      };

      // Mettre à jour l'état local
      setAudits(prev => [...prev, newAudit]);
      
      return newAudit;
    } catch (error: any) {
      console.error('Erreur dans addAudit:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'audit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAuditsByCompanyId = (companyId: string): Audit[] => {
    return audits.filter((audit) => audit.companyId === companyId);
  };

  const getAuditById = (id: string): Audit | undefined => {
    return audits.find((audit) => audit.id === id);
  };

  const deleteAudit = async (id: string): Promise<boolean> => {
    try {
      console.log('Suppression de l\'audit:', id);
      
      // Supprimer l'audit de la base de données
      const { error } = await supabase
        .from('audits')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la suppression de l\'audit:', error);
        throw new Error(`Erreur lors de la suppression de l'audit: ${error.message}`);
      }
      
      // Mettre à jour l'état local
      setAudits((prev) => prev.filter(audit => audit.id !== id));
      return true;
    } catch (error: any) {
      console.error('Erreur dans deleteAudit:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'audit",
        variant: "destructive",
      });
      throw error;
    }
  };

  const assignAuditors = async (auditId: string, auditorIds: { userId: string, roleInAudit: 'lead' | 'participant' }[]): Promise<boolean> => {
    try {
      console.log(`Assignation des auditeurs à l'audit ${auditId}:`, auditorIds);
      
      // Préparer les données pour l'insertion dans la base de données
      const auditUsersData = auditorIds.map(auditor => ({
        audit_id: auditId,
        user_id: auditor.userId,
        role_in_audit: auditor.roleInAudit
      }));
      
      // Insérer les assignations dans la base de données
      const { error } = await supabase
        .from('audit_users')
        .insert(auditUsersData);
      
      if (error) {
        console.error('Erreur lors de l\'assignation des auditeurs:', error);
        throw new Error(`Erreur lors de l'assignation des auditeurs: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur dans assignAuditors:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner les auditeurs",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAuditAuditors = async (auditId: string): Promise<{ userId: string, roleInAudit: 'lead' | 'participant' }[]> => {
    try {
      console.log(`Récupération des auditeurs pour l'audit ${auditId}`);
      
      // Récupérer les assignations depuis la base de données
      const { data, error } = await supabase
        .from('audit_users')
        .select('*')
        .eq('audit_id', auditId);
      
      if (error) {
        console.error('Erreur lors de la récupération des auditeurs:', error);
        throw new Error(`Erreur lors de la récupération des auditeurs: ${error.message}`);
      }
      
      // Formater les données retournées par Supabase
      return data.map(item => ({
        userId: item.user_id,
        roleInAudit: item.role_in_audit as 'lead' | 'participant'
      }));
    } catch (error: any) {
      console.error('Erreur dans getAuditAuditors:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les auditeurs",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    audits,
    addAudit,
    getAuditsByCompanyId,
    getAuditById,
    deleteAudit,
    assignAuditors,
    getAuditAuditors
  };
};
