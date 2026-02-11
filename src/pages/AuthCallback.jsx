import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAbortError = (error) => error?.name === 'AbortError' || String(error?.message || '').toLowerCase().includes('signal is aborted');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get('error');
        if (error) {
          console.error('Google auth error:', error);
          navigate('/login?error=google_auth_failed', { replace: true });
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            const isPkceMissing = String(error?.message || '').includes('PKCE code verifier not found');
            if (isPkceMissing) {
              console.warn('Supabase session warning:', error.message);
              navigate('/login?error=session_expired', { replace: true });
              return;
            }

            console.error('Supabase session error:', error.message);
            navigate('/login?error=session_failed', { replace: true });
            return;
          }

          navigate('/home', { replace: true });
          return;
        }

        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            const isPkceMissing = String(error?.message || '').includes('PKCE code verifier not found');
            if (isPkceMissing) {
              console.warn('Supabase session warning:', error.message);
              navigate('/login?error=session_expired', { replace: true });
              return;
            }

            console.error('Supabase session error:', error.message);
            navigate('/login?error=session_failed', { replace: true });
            return;
          }

          navigate('/home', { replace: true });
          return;
        }

        navigate('/login', { replace: true });
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        console.error('Critical auth callback error:', error);
        navigate('/login?error=critical_error', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 text-center">
        <CardContent>
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-slate-600">Finalizowanie logowania...</p>
        </CardContent>
      </Card>
    </div>
  );
}
