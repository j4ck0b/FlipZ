import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get('error');
  
  const { signInWithGoogle, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Błąd podczas logowania przez Google');
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Wprowadź poprawny adres email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Wprowadź poprawny adres email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signInWithMagicLink(email);
      if (result.error) {
        setError(result.error.message || 'Błąd podczas wysyłania linku');
      } else {
        setMagicLinkSent(true);
        setSuccess('Link logowania został wysłany na Twój email.');
      }
    } catch (err) {
      setError(err.message || 'Błąd podczas wysyłania linku');
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="bg-surface font-sans text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Background Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-fixed/20 rounded-full blur-[120px] mix-blend-multiply opacity-50"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-fixed/20 rounded-full blur-[150px] mix-blend-multiply opacity-40"></div>
        </div>

        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mx-auto text-secondary shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
              Link Wysłany
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Sprawdź swoją skrzynkę</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Wysłaliśmy bezpieczny, bezhasłowy link logowania na adres:
            </p>
            <p className="text-sm font-bold text-on-surface bg-surface-container p-3 rounded-xl border border-outline-variant/30 select-all font-mono">
              {email}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant text-left space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
              <span>Link jest ważny przez 60 minut.</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
              <span>Kryptograficzne uwierzytelnianie konta.</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => { setMagicLinkSent(false); setEmail(''); }}
            className="w-full border-outline-variant/60 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-xl h-11 text-sm shadow-sm"
          >
            Wróć do formularza
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient Background Effect */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-fixed/20 rounded-full blur-[120px] mix-blend-multiply opacity-50"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-fixed/20 rounded-full blur-[150px] mix-blend-multiply opacity-40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center mb-1 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
              FZ
            </div>
            <span className="font-extrabold text-2xl text-on-surface tracking-tight">FlipCardZ</span>
          </Link>

          <div>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Logowanie do Konta</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Bezpieczny dostęp do portfela kolekcjonera i wymian Escrow.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {(error || urlError) && (
          <div className="p-3.5 rounded-xl bg-error-container/60 border border-error/30 text-error text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{error || 'Wystąpił błąd autoryzacji. Spróbuj ponownie.'}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-surface hover:bg-surface-container border border-outline-variant/60 text-on-surface font-semibold h-12 rounded-xl text-sm flex items-center justify-center gap-3 transition-colors shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-secondary" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Kontynuuj przez Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <div className="flex-1 h-px bg-outline-variant/40" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">lub email magic link</span>
          <div className="flex-1 h-px bg-outline-variant/40" />
        </div>

        {/* Email Magic Link Form */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Adres Email
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="twoj-email@domena.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface border-outline-variant/60 text-on-surface text-sm h-11 rounded-xl focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-on-secondary-fixed-variant text-on-secondary font-bold h-11 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-secondary/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Wyślij Magic Link</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-on-surface-variant flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
          <span>Chronione przez Protokół FlipCardZ Escrow</span>
        </div>
      </div>
    </div>
  );
}
