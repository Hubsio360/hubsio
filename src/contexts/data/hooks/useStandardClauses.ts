
import { useState, useCallback } from 'react';
import { StandardClause } from '@/types';
import { mockStandardClauses } from '../mocks/mockData';

// Données de clauses standard ISO 27001:2022
const iso27001Clauses: StandardClause[] = [
  {
    id: 'clause-1',
    referenceCode: 'A.5',
    title: 'Politiques de sécurité de l\'information',
    description: 'Orientation et soutien de la direction pour la sécurité de l\'information, conformément aux exigences métier et aux lois et règlements applicables.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-2',
    referenceCode: 'A.6',
    title: 'Organisation de la sécurité de l\'information',
    description: 'Cadre de gestion pour initier et contrôler la mise en œuvre et le fonctionnement de la sécurité de l\'information au sein de l\'organisation.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-3',
    referenceCode: 'A.7',
    title: 'Sécurité des ressources humaines',
    description: 'Assurer que les employés comprennent leurs responsabilités et sont qualifiés pour les rôles pour lesquels ils sont envisagés.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-4',
    referenceCode: 'A.8',
    title: 'Gestion des actifs',
    description: 'Identifier les actifs de l\'organisation et définir les responsabilités appropriées en matière de protection.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-5',
    referenceCode: 'A.9',
    title: 'Contrôle d\'accès',
    description: 'Limiter l\'accès aux informations et aux installations de traitement de l\'information.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-6',
    referenceCode: 'A.8.15',
    title: 'Sécurité des communications',
    description: 'Assurer la protection des informations dans les réseaux et les moyens de traitement de l\'information.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-7',
    referenceCode: 'A.8.16',
    title: 'Transfert d\'informations',
    description: 'Maintenir la sécurité des informations transférées au sein d\'une organisation et avec toute entité externe.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-8',
    referenceCode: 'A.10',
    title: 'Cryptographie',
    description: 'Assurer l\'utilisation correcte et efficace de la cryptographie pour protéger la confidentialité, l\'authenticité et/ou l\'intégrité des informations.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-9',
    referenceCode: 'A.11',
    title: 'Sécurité physique et environnementale',
    description: 'Empêcher l\'accès physique non autorisé, les dommages et les interférences avec les informations et les installations de traitement de l\'information de l\'organisation.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-10',
    referenceCode: 'A.12',
    title: 'Sécurité des opérations',
    description: 'Assurer des opérations correctes et sécurisées des installations de traitement de l\'information.',
    standardId: 'ISO27001:2022'
  },
  {
    id: 'clause-11',
    referenceCode: 'A.13',
    title: 'Sécurité des communications',
    description: 'Assurer la protection des informations dans les réseaux et ses moyens de traitement de l\'information.',
    standardId: 'ISO27001:2022'
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
