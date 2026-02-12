import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const SESSION_CHECK_ATTEMPTS = 8;
const SESSION_CHECK_DELAY_MS = 400;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const waitForSession = async () => {
      for (let attempt = 0; attempt < SESSION_CHECK_ATTEMPTS; attempt += 1) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          return session;
        }
        await sleep(SESSION_CHECK_DELAY_MS);
      }

      const { data: { session } } = await supabase.auth.getSession();
      return session;
    };

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
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

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
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

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
              const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type
              });

              if (verifyError) {
                console.error('Supabase verify OTP error:', verifyError.message);
                safeNavigate('/login?error=session_failed');
                return;
              }
            }
          }
        }

        const session = await waitForSession();
        safeNavigate(session?.user ? '/home' : '/login');
      } catch (callbackError) {
        if (isAbortError(callbackError)) {
          const { data: { session } } = await supabase.auth.getSession();
          safeNavigate(session?.user ? '/home' : '/login');
          return;
        }

        console.error('Critical auth callback error:', callbackError);
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
