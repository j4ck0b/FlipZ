import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const AUTH_TIMEOUT_MS = 12000;

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAbortError = (error) => error?.name === 'AbortError' || String(error?.message || '').toLowerCase().includes('signal is aborted');

  useEffect(() => {
    let isActive = true;

    const safeNavigate = (path) => {
      if (isActive) {
        navigate(path, { replace: true });
      }
    };

    const withTimeout = (promise, timeoutMs = AUTH_TIMEOUT_MS) => Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AUTH_TIMEOUT')), timeoutMs);
      })
    ]);

    const handleCallback = async () => {
      try {
        const error = searchParams.get('error');
        if (error) {
          console.error('Google auth error:', error);
          safeNavigate('/login?error=google_auth_failed');
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await withTimeout(
            supabase.auth.exchangeCodeForSession(code)
          );

          if (exchangeError) {
            const isPkceMissing = String(exchangeError?.message || '').includes('PKCE code verifier not found');
            if (isPkceMissing) {
              console.warn('Supabase session warning:', exchangeError.message);
              safeNavigate('/login?error=session_expired');
              return;
            }

            console.error('Supabase session error:', exchangeError.message);
            safeNavigate('/login?error=session_failed');
            return;
          }
        } else {
          const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: setSessionError } = await withTimeout(
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              })
            );

            if (setSessionError) {
              const isPkceMissing = String(setSessionError?.message || '').includes('PKCE code verifier not found');
              if (isPkceMissing) {
                console.warn('Supabase session warning:', setSessionError.message);
                safeNavigate('/login?error=session_expired');
                return;
              }

              console.error('Supabase session error:', setSessionError.message);
              safeNavigate('/login?error=session_failed');
              return;
            }
          } else {
            const tokenHash = searchParams.get('token_hash');
            const type = searchParams.get('type');

            if (tokenHash && type) {
              const { error: verifyError } = await withTimeout(
                supabase.auth.verifyOtp({
                  token_hash: tokenHash,
                  type
                })
              );

              if (verifyError) {
                console.error('Supabase verify OTP error:', verifyError.message);
                safeNavigate('/login?error=session_failed');
                return;
              }
            }
          }
        }

        const { data: { session } } = await withTimeout(supabase.auth.getSession());
        safeNavigate(session?.user ? '/home' : '/login');
      } catch (error) {
        if (String(error?.message) === 'AUTH_TIMEOUT') {
          console.error('Auth callback timeout');
          safeNavigate('/login?error=callback_timeout');
          return;
        }

        if (isAbortError(error)) {
          const { data: { session } } = await supabase.auth.getSession();
          safeNavigate(session?.user ? '/home' : '/login');
          return;
        }

        console.error('Critical auth callback error:', error);
        safeNavigate('/login?error=critical_error');
      }
    };

    handleCallback();

    return () => {
      isActive = false;
    };
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
