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
  const { logout: logoutHook } = useAuthHook();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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
      
      // S'assurer que le nom n'est pas vide
      if (!userData.name) {
        throw new Error("Le nom est requis");
      }

      // Vérifier d'abord si l'email existe déjà
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
      
      // Redirection automatique si aucune confirmation par email n'est requise
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
      
      // Use the force logout function from the hook
      await logoutHook();
      
      // We don't need to set user to null manually anymore since we're forcing a page reload
      // and the auth state will be properly cleared
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
      });
      
      // Force redirect to login anyway
      window.location.href = '/login';
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      
      return data.users.map(mapSupabaseUser);
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
      isAuthenticated: !!user,
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
