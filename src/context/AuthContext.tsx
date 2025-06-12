import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';

interface User {
  id: string;
  name: string;
  programme: string;
  group: string | number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  initialLoading: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  register: (name: string, programme: string, group: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // 🆕

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, programme, group_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Fetch profile error:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      programme: data.programme,
      group: data.group_id,
    } as User;
  };

  // ✅ Wait for session restore on first load
  useEffect(() => {
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        }
      }
      setInitialLoading(false); // Done loading
    };

    restoreSession();
  }, []);

  const login = async (name: string, password: string): Promise<boolean> => {
    const safeName = name.trim().toLowerCase().replace(/\s+/g, '');
    const fakeEmail = `${safeName}@myapp.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    });

    if (error || !data.user) {
      console.error('Login error:', error);
      return false;
    }

    const profile = await fetchUserProfile(data.user.id);
    if (!profile) return false;

    setUser(profile);
    setIsAuthenticated(true);
    return true;
  };

  const register = async (name: string, programme: string, group: string, password: string): Promise<boolean> => {
    const safeName = name.trim().toLowerCase().replace(/\s+/g, '');
    const fakeEmail = `${safeName}@myapp.local`;

    const { data, error } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    });

    if (error || !data.user) {
      console.error('Signup error:', error);
      return false;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session?.user) return false;

    const { error: insertError } = await supabase.from('users').insert({
      id: session.user.id,
      name,
      programme,
      group_id: parseInt(group),
    });

    if (insertError) {
      console.error('Insert profile error:', insertError);
      return false;
    }

    const profile = await fetchUserProfile(session.user.id);
    if (!profile) return false;

    setUser(profile);
    setIsAuthenticated(true);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, initialLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
