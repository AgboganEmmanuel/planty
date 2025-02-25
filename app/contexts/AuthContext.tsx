// app/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

export type UserProfile = {
  full_name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  session: Session | null;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }
        
        // Redirect logic based on authentication state
        router.replace('/screens/my-plants');
      } else {
        setUserProfile(null);
        router.replace('/screens/auth/SignInScreen');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, userProfile, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { ...context, userProfile: context.userProfile };
};