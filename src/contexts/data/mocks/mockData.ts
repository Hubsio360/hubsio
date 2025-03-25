
// Cet fichier ne sera plus utilisé pour servir des données à l'application
// Les données viendront uniquement de la base de données Supabase

import { AuditTheme, StandardClause } from '@/types';

// Note: Ces données servent uniquement comme référence pour le développement
// et ne sont pas utilisées dans l'application
export const mockThemes: AuditTheme[] = [
  { id: 'theme-1', name: 'ADMIN', description: 'Gestion administrative de l\'audit' },
  { id: 'theme-2', name: 'Exploitation & réseaux', description: 'Sécurité des infrastructures réseau et exploitation' },
  { id: 'theme-3', name: 'Gestion des identité accès logiques', description: 'Contrôle des accès et authentification' },
  { id: 'theme-4', name: 'Gestion des actifs', description: 'Inventaire et classification des actifs' },
  { id: 'theme-5', name: 'Sécurité des ressources humaines', description: 'Processus RH liés à la sécurité' },
  { id: 'theme-6', name: 'Sécurité physique', description: 'Protection physique des installations' },
  { id: 'theme-7', name: 'Conformité aux lois', description: 'Respect des exigences légales et réglementaires' },
  { id: 'theme-8', name: 'Gestion des fournisseurs', description: 'Relations avec les prestataires et fournisseurs' },
  { id: 'theme-9', name: 'Développement', description: 'Sécurité du cycle de développement logiciel' },
  { id: 'theme-10', name: 'Gestion des incidents de sécurité', description: 'Réponse et gestion des incidents' },
  { id: 'theme-11', name: 'Continuité d\'activité', description: 'Plan de continuité et reprise d\'activité' },
  { id: 'theme-12', name: 'Cloture', description: 'Clôture de l\'audit' }
];

export const mockStandardClauses: StandardClause[] = [
  { id: 'clause-1', referenceCode: 'A.8.15', title: 'Sécurité des communications', standardId: 'ISO27001:2022' },
  { id: 'clause-2', referenceCode: 'A.8.16', title: 'Transfert d\'informations', standardId: 'ISO27001:2022' },
  { id: 'clause-3', referenceCode: 'A.8.17', title: 'Séparation des réseaux', standardId: 'ISO27001:2022' },
];
