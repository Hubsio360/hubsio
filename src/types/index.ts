
// Types pour les clauses standards et thèmes d'audit
export interface StandardClause {
  id: string;
  referenceCode: string;
  title: string;
  standardId: string;
}

export interface AuditTheme {
  id: string;
  name: string;
  description: string;
}
