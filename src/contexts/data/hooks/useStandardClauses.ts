
import { useState, useCallback } from 'react';
import { StandardClause } from '@/types';
import { mockStandardClauses } from '../mocks/mockData';

export const useStandardClauses = () => {
  const [standardClauses] = useState<StandardClause[]>(mockStandardClauses);

  const fetchStandardClauses = useCallback(async (): Promise<StandardClause[]> => {
    return standardClauses;
  }, [standardClauses]);

  return {
    standardClauses,
    fetchStandardClauses
  };
};
