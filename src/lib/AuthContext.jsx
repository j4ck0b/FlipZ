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

const normalizeRole = (value) => {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'administrator') return 'admin';
  return normalized;
};

const resolveUserRole = (profileData) => {
  const directRole = normalizeRole(profileData?.role);
  if (directRole) return directRole;

  const legacyRole = normalizeRole(profileData?.user_role);
  if (legacyRole) return legacyRole;

  if (profileData?.is_admin === true) return 'admin';

  // Security: never infer privileged roles from auth metadata on the client.
  // Only DB profile fields are trusted for role elevation.
  return 'user';
};


const EMPTY_PANEL_ACCESS = {
  canManageUsers: false,
  canAccessWarehouse: false,
  loaded: false
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
  const [panelAccess, setPanelAccess] = useState(EMPTY_PANEL_ACCESS);
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
      setPanelAccess(EMPTY_PANEL_ACCESS);
    };

    const updateProfileState = async (authUser) => {
      if (!authUser || !isMounted) return;
      await Promise.all([
        loadUserProfile(authUser),
        loadPanelAccess(authUser)
      ]);
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

        if (createResult.error && createResult.error.code === '23505') {
          createResult = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        }

        if (createResult.error) throw createResult.error;
        if (!isMountedRef.current) return;

        const nextRole = resolveUserRole(createResult.data, authUser);

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

      if (!isMountedRef.current) return;

      const fallbackRole = resolveUserRole(null);
      setProfile({
        id: userId,
        email: authUser?.email || '',
        username: authUser?.user_metadata?.preferred_username
          || authUser?.user_metadata?.name
          || authUser?.email?.split('@')[0]
          || 'Użytkownik',
        full_name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '',
        avatar_url: authUser?.user_metadata?.avatar_url || null,
        role: fallbackRole,
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        _fallbackProfile: true
      });
      setIsAdmin(fallbackRole === 'admin');
      setRole(fallbackRole);
    }
  };


  const loadPanelAccess = async (authUser) => {
    const normalizedEmail = authUser?.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      if (isMountedRef.current) {
        setPanelAccess({ ...EMPTY_PANEL_ACCESS, loaded: true });
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('panel_access')
        .select('can_manage_users, can_access_warehouse')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;
      if (!isMountedRef.current) return;

      const canManageUsersAccess = data?.can_manage_users === true;
      const canAccessWarehouse = canManageUsersAccess || data?.can_access_warehouse === true;

      setPanelAccess({
        canManageUsers: canManageUsersAccess,
        canAccessWarehouse,
        loaded: true
      });
    } catch (error) {
      if (!isAbortError(error)) {
        console.error('Error loading panel access:', error);
      }
      if (!isMountedRef.current) return;

      setPanelAccess({ ...EMPTY_PANEL_ACCESS, loaded: true });
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
    if (!canManageUsers) return { error: 'Unauthorized' };
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

  const isAdminByRole = isAdmin || role === 'admin';
  const isWarehouseByRole = role === 'employee';

  const canManageUsers = isAdminByRole && (panelAccess.canManageUsers || role === 'admin');
  const canAccessWarehousePanel = (isAdminByRole || isWarehouseByRole)
    && (panelAccess.canAccessWarehouse || isAdminByRole);

  const canAccessAdminPanel = canManageUsers || canAccessWarehousePanel;
  const panelAccessLoading = Boolean(user) && !panelAccess.loaded;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      role,
      canAccessAdminPanel,
      canManageUsers,
      canAccessWarehousePanel,
      panelAccessLoading,
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
