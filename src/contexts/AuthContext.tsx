
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Mock user data pour le développement
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@secureport.fr',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
  },
  {
    id: '2',
    name: 'Jean Auditeur',
    email: 'auditeur@secureport.fr',
    role: 'auditor',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Auditeur&background=27AE60&color=fff',
  },
  {
    id: '3',
    name: 'Marie Relectrice',
    email: 'reviewer@secureport.fr',
    role: 'reviewer',
    avatar: 'https://ui-avatars.com/api/?name=Marie+Relectrice&background=8E44AD&color=fff',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const storedUser = localStorage.getItem('secureport_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulation d'une requête API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(u => u.email === email);
        
        // Pour le développement, acceptons n'importe quel mot de passe
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('secureport_user', JSON.stringify(foundUser));
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('secureport_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      isAuthenticated: !!user
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
