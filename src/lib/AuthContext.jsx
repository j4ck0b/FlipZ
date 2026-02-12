import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce'
  }
});

const AuthContext = createContext({});

const isAbortError = (error) => error?.name === 'AbortError' || String(error?.message || '').toLowerCase().includes('signal is aborted');

const PROFILE_LOAD_TIMEOUT_MS = 10000;
const AUTH_LOADING_FALLBACK_MS = 15000;

const withTimeout = async (promise, timeoutMs, timeoutMessage) => Promise.race([
  promise,
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  })
]);

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
  const isMountedRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    isMountedRef.current = true;

    const loadingFallbackTimer = setTimeout(() => {
      if (!isMounted) return;
      console.warn('Auth loading fallback triggered');
      setLoading(false);
    }, AUTH_LOADING_FALLBACK_MS);

    const applySignedOutState = () => {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setRole('user');
    };

    const handleSession = async (session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        try {
          await withTimeout(loadUserProfile(session.user), PROFILE_LOAD_TIMEOUT_MS, 'PROFILE_LOAD_TIMEOUT');
        } catch (profileError) {
          console.warn('Profile load timeout/error:', profileError?.message || profileError);
        }
      } else {
        applySignedOutState();
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await handleSession(data?.session);
      } catch (error) {
        if (!isAbortError(error)) {
          console.error('Auth error:', error);
        }
        if (isMounted) {
          applySignedOutState();
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        await handleSession(session);
      } catch (error) {
        if (!isAbortError(error)) {
          console.error('Auth state change error:', error);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      clearTimeout(loadingFallbackTimer);
    };
  }, []);

  const loadUserProfile = async (authUser) => {
    const userId = authUser?.id;
    if (!userId) return;

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
            email: authUser?.email,
            username: authUser?.email?.split('@')[0],
            full_name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0],
            role: 'user',
            subscription_tier: 'free',
            trade_count_current_month: 0,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        if (!isMountedRef.current) return;

        setProfile(newProfile);
        setIsAdmin(newProfile.role === 'admin');
        setRole(newProfile.role || 'user');
      } else if (error) {
        throw error;
      } else {
        if (!isMountedRef.current) return;

        setProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
        setRole(profileData.role || 'user');
      }
    } catch (error) {
      if (!isAbortError(error)) {
        console.error('Error loading profile:', error);
      }
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
