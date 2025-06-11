import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../supabase';  // make sure this is supabase.ts or JS with types

interface User {
  id: string;
  name: string;
  programme: string;
  group: string | number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (name: string, password: string) => Promise<boolean>;
  register: (name: string, programme: string, group: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Helper to fetch user profile from DB after login/signup
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

    if (data) {
      return {
        id: data.id,
        name: data.name,
        programme: data.programme,
        group: data.group_id,
      } as User;
    }

    return null;
  };

  const register = async (
    name: string,
    programme: string,
    group: string,
    password: string
  ): Promise<boolean> => {
    const safeName = name.trim().toLowerCase().replace(/\s+/g, ''); // remove spaces, lowercase
    const fakeEmail = `${safeName}@myapp.local`;

    const { data, error } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    });

    if (error || !data.user) {
      console.error('Signup error:', error);
      return false;
    }

    // Insert profile into users table
    const { error: insertError } = await supabase.from('users').insert({
      id: data.user.id,
      name,
      programme,
      group_id: parseInt(group),
    });

    if (insertError) {
      console.error('Insert profile error:', insertError);
      return false;
    }

    setIsAuthenticated(true);
    setUser({
      id: data.user.id,
      name,
      programme,
      group,
    });

    return true;
  };

  const login = async (name: string, password: string): Promise<boolean> => {
    const safeName = name.trim().toLowerCase().replace(/\s+/g, ''); // remove spaces, lowercase
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

    if (!profile) {
      console.error('User profile not found');
      return false;
    }

    setIsAuthenticated(true);
    setUser(profile);

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
