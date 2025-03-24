
import { useState, useCallback } from 'react';
import { StandardClause } from '@/types';
import { mockStandardClauses } from '../mocks/mockData';

// Données de clauses standard ISO 27001:2022
const iso27001Clauses: StandardClause[] = [
  {
    id: 'clause-1',
    code: 'A.5',
    title: 'Politiques de sécurité de l'information',
    description: 'Orientation et soutien de la direction pour la sécurité de l\'information, conformément aux exigences métier et aux lois et règlements applicables.',
    category: 'Gouvernance'
  },
  {
    id: 'clause-2',
    code: 'A.6',
    title: 'Organisation de la sécurité de l'information',
    description: 'Cadre de gestion pour initier et contrôler la mise en œuvre et le fonctionnement de la sécurité de l\'information au sein de l\'organisation.',
    category: 'Gouvernance'
  },
  {
    id: 'clause-3',
    code: 'A.7',
    title: 'Sécurité des ressources humaines',
    description: 'Assurer que les employés comprennent leurs responsabilités et sont qualifiés pour les rôles pour lesquels ils sont envisagés.',
    category: 'Ressources humaines'
  },
  {
    id: 'clause-4',
    code: 'A.8',
    title: 'Gestion des actifs',
    description: 'Identifier les actifs de l\'organisation et définir les responsabilités appropriées en matière de protection.',
    category: 'Actifs'
  },
  {
    id: 'clause-5',
    code: 'A.9',
    title: 'Contrôle d'accès',
    description: 'Limiter l\'accès aux informations et aux installations de traitement de l\'information.',
    category: 'Accès'
  },
  {
    id: 'clause-6',
    code: 'A.8.15',
    title: 'Sécurité des communications',
    description: 'Assurer la protection des informations dans les réseaux et les moyens de traitement de l\'information.',
    category: 'Communications'
  },
  {
    id: 'clause-7',
    code: 'A.8.16',
    title: 'Transfert d'informations',
    description: 'Maintenir la sécurité des informations transférées au sein d\'une organisation et avec toute entité externe.',
    category: 'Communications'
  },
  {
    id: 'clause-8',
    code: 'A.10',
    title: 'Cryptographie',
    description: 'Assurer l\'utilisation correcte et efficace de la cryptographie pour protéger la confidentialité, l\'authenticité et/ou l\'intégrité des informations.',
    category: 'Sécurité technique'
  },
  {
    id: 'clause-9',
    code: 'A.11',
    title: 'Sécurité physique et environnementale',
    description: 'Empêcher l\'accès physique non autorisé, les dommages et les interférences avec les informations et les installations de traitement de l\'information de l\'organisation.',
    category: 'Sécurité physique'
  },
  {
    id: 'clause-10',
    code: 'A.12',
    title: 'Sécurité des opérations',
    description: 'Assurer des opérations correctes et sécurisées des installations de traitement de l\'information.',
    category: 'Exploitation'
  },
  {
    id: 'clause-11',
    code: 'A.13',
    title: 'Sécurité des communications',
    description: 'Assurer la protection des informations dans les réseaux et ses moyens de traitement de l\'information.',
    category: 'Exploitation & réseaux'
  }
];

export const useStandardClauses = () => {
  // Utiliser à la fois les données mockées et les clauses définies ici
  const [standardClauses] = useState<StandardClause[]>([...mockStandardClauses, ...iso27001Clauses]);

  const fetchStandardClauses = useCallback(async (): Promise<StandardClause[]> => {
    return standardClauses;
  }, [standardClauses]);

  return {
    standardClauses,
    fetchStandardClauses
  };
};
