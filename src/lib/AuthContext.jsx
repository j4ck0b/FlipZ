import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Pobierz aktualną sesję
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Pobierz profil
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.warn('No profile found, creating empty one:', error);
            setProfile({ id: session.user.id, email: session.user.email });
          } else {
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }

      // Nasłuchuj zmian stanu logowania
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user);
            
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              setProfile({ id: session.user.id, email: session.user.email });
            } else {
              setProfile(profileData);
              setIsAdmin(profileData.role === 'admin');
            }
          } else {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    };

    initAuth();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) console.error('Google sign in error:', error);
  };

  const signInWithMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) console.error('Magic link error:', error);
    return { error };
  };

  const signOut = () => supabase.auth.signOut();

  const redirectToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin,
      signInWithGoogle, signInWithMagicLink, signOut, redirectToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
