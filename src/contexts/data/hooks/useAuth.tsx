
import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Export the hook as a named export
export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Configurer l'écouteur des changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Changement d\'état d\'authentification:', event, !!session);
      setIsAuthenticated(!!session);
      setLoading(false);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Get users function - must return objects with role property
  const getUsers = useCallback(async (): Promise<User[]> => {
    try {
      // Vérifier d'abord l'authentification
      if (!isAuthenticated) {
        console.log('Tentative de récupération des utilisateurs sans authentification');
        return [];
      }
      
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
  }, [isAuthenticated]);

  // Force logout function with aggressive session clearing
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // First, try the standard signOut method
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Standard logout error:', error.message);
        // Continue with the rest of the function even if this fails
      }
      
      // Clear any localStorage session data
      localStorage.removeItem('supabase-auth');
      localStorage.removeItem('supabase.auth.token');
      
      // Clear any cookies related to auth
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      console.log('Completed forceful logout actions');
      // Browser reload as last resort to clear all state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Error during aggressive logout:', error);
      // Still redirect to login even if there's an error
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    isAuthenticated,
    getUsers,
    logout,
  };
};

// Add a default export that re-exports the named export
export default useAuth;
