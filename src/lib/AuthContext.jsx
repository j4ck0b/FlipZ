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
const isMissingColumnError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('column') && message.includes('does not exist');
};

const resolveUserRole = (profileData) => {
  if (!profileData) return 'user';
  if (typeof profileData.role === 'string' && profileData.role.length > 0) return profileData.role;
  if (typeof profileData.user_role === 'string' && profileData.user_role.length > 0) return profileData.user_role;
  if (profileData.is_admin === true) return 'admin';
  return 'user';
};

const AUTH_BOOTSTRAP_TIMEOUT_MS = 10000;
const AUTH_LOADING_FALLBACK_MS = 15000;

const withTimeout = (promise, timeoutMs, timeoutMessage) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  promise
    .then((result) => {
      clearTimeout(timer);
      resolve(result);
    })
    .catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
});

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

    const updateProfileState = async (authUser) => {
      if (!authUser || !isMounted) return;
      await loadUserProfile(authUser);
    };

    const handleSession = (session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        updateProfileState(session.user);
      } else {
        applySignedOutState();
      }

      setLoading(false);
    };

    const initAuth = async () => {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          'AUTH_BOOTSTRAP_TIMEOUT'
        );
        handleSession(data?.session);
      } catch (error) {
        if (String(error?.message) === 'AUTH_BOOTSTRAP_TIMEOUT') {
          console.warn('Auth bootstrap timeout - continuing without blocking UI');

          supabase.auth.getSession()
            .then(({ data }) => {
              if (!isMounted) return;
              if (data?.session?.user) {
                handleSession(data.session);
              }
            })
            .catch((lateSessionError) => {
              if (!isAbortError(lateSessionError)) {
                console.error('Late auth session fetch error:', lateSessionError);
              }
            });
        } else if (!isAbortError(error)) {
          console.error('Auth error:', error);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      isMounted = false;
      isMountedRef.current = false;
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
        const baseProfilePayload = {
          id: userId,
          email: authUser?.email,
          username: authUser?.email?.split('@')[0],
          full_name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0],
          created_at: new Date().toISOString()
        };

        let createResult = await supabase
          .from('profiles')
          .insert({
            ...baseProfilePayload,
            role: 'user',
            subscription_tier: 'free',
            trade_count_current_month: 0
          })
          .select()
          .single();

        if (createResult.error && isMissingColumnError(createResult.error)) {
          createResult = await supabase
            .from('profiles')
            .insert(baseProfilePayload)
            .select()
            .single();
        }

        if (createResult.error) throw createResult.error;
        if (!isMountedRef.current) return;

        const nextRole = resolveUserRole(createResult.data);

        setProfile(createResult.data);
        setIsAdmin(nextRole === 'admin');
        setRole(nextRole);
      } else if (error) {
        throw error;
      } else {
        if (!isMountedRef.current) return;

        const nextRole = resolveUserRole(profileData);

        setProfile(profileData);
        setIsAdmin(nextRole === 'admin');
        setRole(nextRole);
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
