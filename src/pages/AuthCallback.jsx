import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/AuthContext';
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set session from tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;
        }

        // Redirect to home after successful auth
        setTimeout(() => {
          navigate(createPageUrl('Home'));
        }, 1000);
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate(createPageUrl('Login'));
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto" />
        <p className="text-lg text-slate-700">Logowanie...</p>
      </div>
    </div>
  );
}
