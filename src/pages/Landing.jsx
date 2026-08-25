import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, QrCode, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-slate-100 antialiased font-sans">
      
      {/* 1. Header PSA/MPB Style */}
      <nav className="border-b border-slate-800 bg-[#0D1117]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-rose-600 text-white font-extrabold text-sm px-2 py-1 rounded tracking-wider">
              PSA/HUB
            </span>
            <span className="font-bold text-lg text-white tracking-tight">FlipZ <span className="text-slate-400 font-normal text-sm">Escrow & Custody</span></span>
          </div>

          <div className="flex items-center gap-4">
            <Link className="text-sm font-medium text-slate-300 hover:text-white transition" to="/login">
              Zaloguj się
            </Link>
            <Link className="text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg transition shadow-sm" to="/register">
              Rozpocznij Trade-in
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section: MPB Trade-in + PSA Auth */}
      <section className="pt-16 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-rose-500"/>
          Standard Autentyczności i Weryfikacji Fizycznej
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Wymieniaj karty kolekcjonerskie.<br />
          <span className="text-rose-500">Certyfikowany Hub Escrow.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Bezgotówkowy Trade-in dla kolekcjonerów. Każdy egzemplarz przechodzi laboratoryjną kontrolę autentyczności przed doręczeniem do odbiorcy.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-rose-950/40" to="/register">
            <span>Wystaw przedmiot do wymiany</span>
            <ArrowRight className="w-4 h-4"/>
          </Link>
          <Link className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition" to="/explore">
            Przeglądaj katalog
          </Link>
        </div>
      </section>

      {/* 3. Prezentacja Slabu & Trade-in Model (MPB / PSA) */}
      <section className="py-10 px-6 max-w-5xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Karta A */}
            <div className="bg-[#0D1117] border border-slate-700/80 rounded-xl p-4 space-y-3">
              <div className="border-b border-rose-600/40 pb-2 flex justify-between items-center text-xs">
                <span className="font-mono text-rose-400 font-bold">PSA AUTHENTIC</span>
                <span className="text-slate-500 font-mono">#FZ-8921</span>
              </div>
              <div className="h-36 bg-slate-800/40 rounded-lg flex items-center justify-center text-slate-500 text-xs font-mono">
                [ Twoja Karta A ]
              </div>
              <div className="text-xs font-semibold text-slate-200">1999 Charizard Base Set</div>
            </div>

            {/* Hub Weryfikacyjny w Środku */}
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 rounded-full bg-rose-600/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
                <ArrowLeftRight className="w-5 h-5"/>
              </div>
              <h4 className="font-bold text-sm text-white">Centralny Hub Inspekcji</h4>
              <p className="text-xs text-slate-400">
                Pomiary grubości, weryfikacja UV 365 nm, waga laboratoryjna &plusmn;0.001 g.
              </p>
            </div>

            {/* Karta B */}
            <div className="bg-[#0D1117] border border-slate-700/80 rounded-xl p-4 space-y-3">
              <div className="border-b border-rose-600/40 pb-2 flex justify-between items-center text-xs">
                <span className="font-mono text-rose-400 font-bold">PSA AUTHENTIC</span>
                <span className="text-slate-500 font-mono">#FZ-4412</span>
              </div>
              <div className="h-36 bg-slate-800/40 rounded-lg flex items-center justify-center text-slate-500 text-xs font-mono">
                [ Karta Partnera B ]
              </div>
              <div className="text-xs font-semibold text-slate-200">2000 Gengar Holo #5</div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Trzy Poziomy Weryfikacji (Cennik w stylu PSA) */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Standardy Usługi Escrow</h2>
          <p className="text-sm text-slate-400">Stały koszt per strona transakcji. Zawiera komplet 4 etykiet InPost.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-white text-base">Standard Escrow</h4>
            <div className="text-3xl font-extrabold text-white">45 zł <span className="text-xs text-slate-400 font-normal">/ stronę</span></div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Etykiety InPost w obie strony</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Test UV 365 nm & waga analityczna</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Dokumentacja foto weryfikacji</li>
            </ul>
          </div>

          <div className="bg-slate-900/80 border-2 border-rose-600 rounded-xl p-6 space-y-4 relative">
            <span className="absolute -top-3 right-4 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Rekomendowany
            </span>
            <h4 className="font-bold text-white text-base">Swiss Safe</h4>
            <div className="text-3xl font-extrabold text-white">69 zł <span className="text-xs text-slate-400 font-normal">/ stronę</span></div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Wszystko ze Standard</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Mikrometryczny pomiar grubości</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Plomba VOID + Cyfrowy Certyfikat SHA-256</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Priorytet w Hubie do 24h</li>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-white text-base">Vault Black</h4>
            <div className="text-3xl font-extrabold text-white">99 zł <span className="text-xs text-slate-400 font-normal">/ stronę</span></div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Ciągłe wideo 4K z unboxingu</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Smart-Box z chipem NFC</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500"/> Ubezpieczenie All-Risks</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 FlipZ Vault. Standardy certyfikacji i bezpiecznego trade-in.</p>
      </footer>

    </div>
  );
}
