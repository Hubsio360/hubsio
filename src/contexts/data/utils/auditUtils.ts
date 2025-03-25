
import { Audit } from '@/types';
import type { Database } from '@/integrations/supabase/types';

// Type alias for the Supabase audits table row
type AuditInsert = Database['public']['Tables']['audits']['Insert'];

/**
 * Formats raw Supabase audit data into the application's Audit type
 */
export const formatSupabaseAudit = (rawAudit: any): Audit => ({
  id: rawAudit.id,
  companyId: rawAudit.company_id,
  frameworkId: rawAudit.framework_id,
  startDate: rawAudit.start_date,
  endDate: rawAudit.end_date,
  scope: rawAudit.scope || undefined,
  createdById: rawAudit.created_by_id,
  status: rawAudit.status,
});

/**
 * Formats application Audit data for Supabase insertion
 */
export const formatAuditForSupabase = (audit: Omit<Audit, 'id'>): AuditInsert => ({
  company_id: audit.companyId,
  framework_id: audit.frameworkId,
  start_date: audit.startDate,
  end_date: audit.endDate,
  scope: audit.scope || null,
  created_by_id: audit.createdById,
  status: audit.status as Database['public']['Enums']['audit_status'],
});

/**
 * Prepares partial audit data for Supabase update
 */
export const formatAuditUpdatesForSupabase = (updates: Partial<Audit>): Partial<AuditInsert> => {
  const auditData: Partial<AuditInsert> = {};
  
  if (updates.startDate) auditData.start_date = updates.startDate;
  if (updates.endDate) auditData.end_date = updates.endDate;
  if (updates.scope !== undefined) auditData.scope = updates.scope || null;
  if (updates.status) auditData.status = updates.status as Database['public']['Enums']['audit_status'];
  if (updates.frameworkId) auditData.framework_id = updates.frameworkId;
  if (updates.companyId) auditData.company_id = updates.companyId;
  
  return auditData;
};
