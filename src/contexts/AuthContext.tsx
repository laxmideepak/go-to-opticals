'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthSession, MOCK_USERS } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('auth-session');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (error) {
        console.error('Error parsing saved session:', error);
        localStorage.removeItem('auth-session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in mock data
      const mockUser = MOCK_USERS[email];
      
      if (!mockUser) {
        throw new Error('Invalid credentials');
      }
      
      // In a real app, you would validate the password here
      if (password !== 'password') {
        throw new Error('Invalid credentials');
      }
      
      // Create session
      const newSession: AuthSession = {
        user: mockUser,
        accessToken: `mock-token-${Date.now()}`,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      
      setUser(mockUser);
      setSession(newSession);
      
      // Save to localStorage
      localStorage.setItem('auth-session', JSON.stringify(newSession));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('auth-session');
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 