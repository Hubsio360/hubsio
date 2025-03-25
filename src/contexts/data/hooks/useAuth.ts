
import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/types';
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
      
      // Make sure to map the users to include the role property and handle the "reviewer" role mapping
      return (data || []).map(user => {
        // Convert "reviewer" to "viewer" to match UserRole type
        let mappedRole: UserRole = user.role as UserRole;
        if (user.role === 'reviewer') {
          mappedRole = 'viewer';
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: mappedRole,
          avatar: user.avatar,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        };
      });
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
