import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ✅ BEZPIECZNE: Tworzymy dedykowany klient Supabase TYLKO dla tego komponentu
// Unikamy problemów z exportem z AuthContext
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brak zmiennych środowiskowych Supabase! Sprawdź VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = React.useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get('error');
        if (error) {
          console.error('Auth error from provider:', error);
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Supabase session error:', error.message);
            setStatus('error');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          setStatus('success');
          setTimeout(() => navigate('/home'), 2000);
        } else {
          console.warn('No auth code in URL');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Critical auth callback error:', error);
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
                <h2 className="text-2xl font-bold text-slate-900">Logowanie...</h2>
                <p className="text-slate-600">Przetwarzamy Twoje uwierzytelnienie</p>
              </div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Zalogowano pomyślnie!</h2>
                <p className="text-slate-600">Przekierowujemy do aplikacji...</p>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Błąd logowania</h2>
                <p className="text-slate-600">Spróbuj ponownie za chwilę</p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90"
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
