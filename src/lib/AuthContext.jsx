import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  || import.meta.env.SUPABASE_URL
  || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.SUPABASE_ANON_KEY
  || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak zmiennych środowiskowych Supabase! Ustaw VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY (lub SUPABASE_URL/SUPABASE_ANON_KEY).');
}

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
  const [role, setRole] = useState('user');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setRole('user');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            setRole('user');
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

  const loadUserProfile = async (userId) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email,
            username: user?.email?.split('@')[0],
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
            role: 'user',
            subscription_tier: 'free',
            trade_count_current_month: 0,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        setIsAdmin(newProfile.role === 'admin');
        setRole(newProfile.role || 'user');
      } else if (error) {
        throw error;
      } else {
        setProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
        setRole(profileData.role || 'user');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
        }
      });
      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithMagicLink = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true
        }
      });
      if (error) {
        console.error('Magic link error:', error);
        return { error };
      }
      return { success: true };
    } catch (error) {
      console.error('Magic link error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const changeUserRole = async (userId, newRole) => {
    if (!isAdmin) return { error: 'Unauthorized' };
    const validRoles = ['user', 'moderator', 'admin', 'employee'];
    if (!validRoles.includes(newRole)) {
      return { error: 'Invalid role' };
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      if (userId === user.id) {
        setProfile({ ...profile, role: newRole });
        setRole(newRole);
        setIsAdmin(newRole === 'admin');
      }
      return { data };
    } catch (error) {
      console.error('Change role error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      role,
      signInWithGoogle,
      signInWithMagicLink,
      signOut,
      updateProfile,
      changeUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
