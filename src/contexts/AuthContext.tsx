
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getUsers: () => Promise<User[]>;
  signup: (email: string, password: string, userData: {name: string, role: string}) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const mapSupabaseUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
  role: supabaseUser.user_metadata?.role || 'auditor',
  avatar: supabaseUser.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.email || 'User')}&background=random`,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check authentication status and set up listener
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('Auth state changed:', _event, !!session);
          if (session?.user) {
            setUser(mapSupabaseUser(session.user));
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
          setIsLoading(false);
        });

        // Get initial session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser(mapSupabaseUser(data.session.user));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setIsLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in auth setup:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    setupAuth();
  }, []);

  // Get users function
  const getUsers = async (): Promise<User[]> => {
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
        let mappedRole = user.role;
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
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur SecurePort",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: {name: string, role: string}) => {
    try {
      setIsLoading(true);
      
      if (!userData.name) {
        throw new Error("Le nom est requis");
      }

      const { data: existingUsers } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUsers) {
        throw new Error("Cet email est déjà utilisé. Veuillez vous connecter ou utiliser une autre adresse email.");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (error) {
        console.error("Erreur d'inscription:", error);
        throw error;
      }

      toast({
        title: "Inscription réussie",
        description: "Vous pouvez maintenant vous connecter",
      });
      
      if (data.session) {
        setUser(mapSupabaseUser(data.user));
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      console.error("Erreur complète d'inscription:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter...",
      });
      
      setIsLoading(true);
      
      // Standard signOut method
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Standard logout error:', error.message);
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
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Browser reload as last resort to clear all state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
      });
      
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      isAuthenticated,
      getUsers,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
