import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/AuthContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get('error');
        if (error) {
          setStatus('error');
          console.error('Auth error:', error);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code:', error);
            setStatus('error');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          setStatus('success');
          setTimeout(() => navigate('/home'), 2000);
        } else {
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-violet-200 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          {status === 'processing' && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-violet-600 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  Logowanie...
                </h2>
                <p className="text-slate-600">
                  Proszę czekać, przetwarzamy Twoje logowanie
                </p>
              </div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  Zalogowano pomyślnie!
                </h2>
                <p className="text-slate-600">
                  Przekierowujemy do strony głównej...
                </p>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  Błąd logowania
                </h2>
                <p className="text-slate-600">
                  Wystąpił błąd podczas logowania. Spróbuj ponownie.
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
              >
                Powrót do logowania
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
