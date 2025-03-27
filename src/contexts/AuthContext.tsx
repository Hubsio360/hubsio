import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth as useAuthHook } from '@/contexts/data/hooks/useAuth';

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
  const { toast } = useToast();
  const { logout: logoutHook, isAuthenticated, getUsers: getUsersHook } = useAuthHook();

  useEffect(() => {
    const setupAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state changed:', _event, !!session);
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(mapSupabaseUser(data.session.user));
      }
      setIsLoading(false);

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

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
      
      await logoutHook();
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
      });
      
      window.location.href = '/login';
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      return await getUsersHook();
    } catch (error) {
      console.error("Failed to get users:", error);
      return [];
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
