
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Récupération des utilisateurs depuis Supabase...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'auditor']);
      
      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        throw new Error(`Erreur: ${error.message}`);
      }

      console.log('Utilisateurs récupérés avec succès:', data);
      
      const fetchedUsers: User[] = data || [];
      setUsers(fetchedUsers);
      return fetchedUsers;
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les utilisateurs",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Get user by ID
  const getUserById = useCallback((id: string): User | undefined => {
    return users.find((user) => user.id === id);
  }, [users]);

  // Filter users by role
  const getUsersByRole = useCallback((roles: ('admin' | 'auditor' | 'viewer')[]) => {
    return users.filter(user => roles.includes(user.role));
  }, [users]);

  return {
    users,
    loading,
    fetchUsers,
    getUserById,
    getUsersByRole,
  };
};
