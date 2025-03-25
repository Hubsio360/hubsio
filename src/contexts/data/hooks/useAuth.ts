
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  
  // Get users function - must return objects with role property
  const getUsers = useCallback(async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
        
      if (error) throw error;
      
      // Make sure to map the users to include the role property
      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }, []);

  return {
    loading,
    getUsers,
  };
};
