import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
            console.error('Supabase session error:', error.message);
            navigate('/login?error=session_failed', { replace: true });
            return;
          }

          navigate('/home', { replace: true });
        } else {
          navigate('/login?error=no_code', { replace: true });
        }
      } catch (error) {
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
