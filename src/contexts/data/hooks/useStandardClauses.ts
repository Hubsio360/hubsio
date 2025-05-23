
import { useState } from 'react';
import { StandardClause } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useStandardClauses = () => {
  const [standardClauses, setStandardClauses] = useState<StandardClause[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStandardClauses = async (): Promise<StandardClause[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('standard_clauses')
        .select('*')
        .order('reference_code');
      
      if (error) {
        console.error('Error fetching standard clauses:', error);
        return [];
      }
      
      const fetchedClauses = (data || []).map(clause => ({
        id: clause.id,
        referenceCode: clause.reference_code,
        title: clause.title,
        standardId: clause.standard_id
      }));
      
      setStandardClauses(fetchedClauses);
      return fetchedClauses;
    } catch (error) {
      console.error('Error fetching standard clauses:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addStandardClause = async (clause: Omit<StandardClause, 'id'>): Promise<StandardClause | null> => {
    try {
      const { data, error } = await supabase
        .from('standard_clauses')
        .insert([{
          reference_code: clause.referenceCode,
          title: clause.title,
          standard_id: clause.standardId
        }])
        .select();
      
      if (error) {
        console.error('Error adding standard clause:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from insert operation');
        return null;
      }
      
      const newClause: StandardClause = {
        id: data[0].id,
        referenceCode: data[0].reference_code,
        title: data[0].title,
        standardId: data[0].standard_id
      };
      
      setStandardClauses(prev => [...prev, newClause]);
      return newClause;
    } catch (error) {
      console.error('Error adding standard clause:', error);
      return null;
    }
  };

  return {
    standardClauses,
    loading,
    fetchStandardClauses,
    addStandardClause
  };
};
