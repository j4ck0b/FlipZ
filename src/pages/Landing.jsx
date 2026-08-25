import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. Nawigacja */}
      <nav className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-[#0A0B0E]/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-base">
              FZ
            </div>
            <span className="font-bold text-lg tracking-tight text-white">FlipZ<span className="text-emerald-400 text-xs ml-1 uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">Vault</span></span>
          </div>

          <div className="flex items-center gap-4">
            <Link className="text-sm font-medium text-slate-300 hover:text-white transition" to="/login">
              Zaloguj się
            </Link>
            <Link className="text-sm font-semibold bg-white hover:bg-slate-200 text-slate-950 px-4 py-2 rounded-lg transition" to="/login">
              Rozpocznij wymianę
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5"/> 100% Gwarancja Autentyczności Escrow
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Wymieniaj rzadkie karty.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Bez ryzyka oszustwa.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pierwsza giełda kolekcjonerska z fizyczną weryfikacją w Hubie. Obie karty trafiają do naszych ekspertów przed ostateczną dostawą do Waszych rąk.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20" to="/login">
              <span>Wystaw swoje karty</span>
              <ArrowRight className="w-4 h-4"/>
            </Link>
            <Link className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl transition" to="/card-exchange">
              Przeglądaj giełdę
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Wizualizacja: Jak działa Hub Escrow */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                1
              </div>
              <h3 className="font-bold text-white text-base">Dopasowanie (A ↔ B)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Wybierasz kartę ze swojej kolekcji i wskazujesz, czego szukasz. System automatycznie znajduje drugą stronę.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-sm">
                2
              </div>
              <h3 className="font-bold text-white text-base">Weryfikacja w Hubie</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Obaj wysyłacie paczki do naszego Hubu. Badamy autentyczność, stan powierzchni, wagę i krawędzie.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                3
              </div>
              <h3 className="font-bold text-white text-base">Zapieczętowana Dostawa</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Po pomyślnej weryfikacji przesyłamy sprawdzone karty do adresatów w zabezpieczonych boxach z plombą.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Cennik Weryfikacji */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Transparentne standardy wymiany</h2>
          <p className="text-sm text-slate-400">Stała opłata za weryfikację fizyczną i komplet etykiet kurierskich.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <h4 className="font-bold text-white">Standard Escrow</h4>
              <p className="text-xs text-slate-400 mt-1">Dla kart do 1 000 zł</p>
            </div>
            <div className="text-3xl font-extrabold text-white">45 zł <span className="text-xs font-normal text-slate-400">/ stronę</span></div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Etykiety InPost w cenie</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Test optyczny UV 365 nm</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Weryfikacja wagi i stanu</li>
            </ul>
          </div>

          <div className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-xl p-6 space-y-5 relative shadow-xl shadow-emerald-950/20">
            <span className="absolute -top-3 right-4 bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Polecane
            </span>
            <div>
              <h4 className="font-bold text-white">Swiss Safe</h4>
              <p className="text-xs text-slate-400 mt-1">Dla rzadkich okazów</p>
            </div>
            <div className="text-3xl font-extrabold text-white">69 zł <span className="text-xs font-normal text-slate-400">/ stronę</span></div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Wszystko ze Standard</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Pomiar grubości mikrometrem</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Plomba VOID + Certyfikat</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Realizacja w Hubie do 24h</li>
            </ul>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <h4 className="font-bold text-white">Vault Black</h4>
              <p className="text-xs text-slate-400 mt-1">Dla kart High-End & Grails</p>
            </div>
            <div className="text-3xl font-extrabold text-white">99 zł <span className="text-xs font-normal text-slate-400">/ stronę</span></div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Ciągłe wideo 4K z inspekcji</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Smart-Box z chipem NFC</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Pełne ubezpieczenie transakcji</li>
            </ul>
          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 FlipZ Vault. Bezpieczny escrow dla kolekcjonerów.</p>
      </footer>

    </div>
  );
}
