
// Types for the users
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'admin' | 'auditor' | 'viewer';

// Types for the companies
export interface Company {
  id: string;
  name: string;
  activity?: string;
  creationYear?: number;
  parentCompany?: string;
  marketScope?: string;
  lastAuditDate?: string;
}

// Financial types related to companies and audits
export interface Invoice {
  auditId: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
  status: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}
