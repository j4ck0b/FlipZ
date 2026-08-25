import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Layers, 
  Lock, 
  Activity, 
  Terminal, 
  FileCode, 
  Cpu, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Scale,
  Microscope,
  Sparkles,
  QrCode
} from "lucide-react";

// Przykładowe próbki do interaktywnego symulatora laboratoryjnego
const LAB_SPECIMENS = [
  {
    id: 'specimen-01',
    name: '1999 Charizard #4 1st Edition Shadowless',
    category: 'Pokémon TCG',
    nominalWeight: 1.740,
    measuredWeight: 1.742,
    nominalThickness: 0.305,
    measuredThickness: 0.306,
    uvStatus: 'AUTHENTIC_PAPER_STOCK',
    sha256: '9f83b2a5c102e8d77a836241b1291b7d512a884fbc603c9d12301824a719c81f',
    status: 'VERIFIED_GENUINE',
    timestamp: '2026-08-25 15:42:19 UTC'
  },
  {
    id: 'specimen-02',
    name: '1993 Black Lotus Alpha Edition',
    category: 'Magic: The Gathering',
    nominalWeight: 1.720,
    measuredWeight: 1.721,
    nominalThickness: 0.310,
    measuredThickness: 0.310,
    uvStatus: 'BLUE_CORE_STOCK_PASS',
    sha256: '4a6b29f0c5112e482201991d3780aef017c6631bba92019f2a991823abf1092a',
    status: 'VERIFIED_GENUINE',
    timestamp: '2026-08-25 15:10:04 UTC'
  },
  {
    id: 'specimen-03',
    name: '2003 Topps Chrome LeBron James RC #111',
    category: 'Basketball Memorabilia',
    nominalWeight: 1.890,
    measuredWeight: 1.893,
    nominalThickness: 0.380,
    measuredThickness: 0.381,
    uvStatus: 'REFRACTOR_METALLIC_PASS',
    sha256: 'c8172901b09281a8f90217e901183aa66291b10a9018e27161829011a629b101',
    status: 'VERIFIED_GENUINE',
    timestamp: '2026-08-25 14:28:51 UTC'
  }
];

const RECENT_LEDGER_ENTRIES = [
  {
    tradeId: 'FLX-8921-PL',
    itemA: 'Pikachu Illustrator Promo',
    itemB: 'Charizard Gold Star + 1st Ed Gengar',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    tier: 'VAULT_BLACK',
    massDelta: '+0.002g',
    uvResult: 'PASS',
    date: '14:28:02'
  },
  {
    tradeId: 'FLX-8920-PL',
    itemA: 'Mox Sapphire Unlimited',
    itemB: 'Time Walk Unlimited',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    tier: 'SWISS_SAFE',
    massDelta: '0.000g',
    uvResult: 'PASS',
    date: '13:55:18'
  },
  {
    tradeId: 'FLX-8919-PL',
    itemA: 'Luka Doncic Prizm Silver RC',
    itemB: 'Kobe Bryant Topps Chrome RC',
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    tier: 'STANDARD_ESCROW',
    massDelta: '+0.001g',
    uvResult: 'PASS',
    date: '13:12:40'
  },
  {
    tradeId: 'FLX-8918-PL',
    itemA: 'Neo Genesis Lugia 1st Ed #9',
    itemB: 'Skyridge Charizard Holo',
    hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    tier: 'SWISS_SAFE',
    massDelta: '-0.001g',
    uvResult: 'PASS',
    date: '12:40:11'
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSpecimen, setSelectedSpecimen] = useState(LAB_SPECIMENS[0]);
  const [isMeasuring, setIsMeasuring] = useState(false);

  if (user) {
    navigate('/home');
    return null;
  }

  const handleSelectSpecimen = (specimen) => {
    setIsMeasuring(true);
    setSelectedSpecimen(specimen);
    setTimeout(() => setIsMeasuring(false), 350);
  };

  return (
    <div className="app-shell vault-grid-bg min-h-screen selection:bg-slate-800 selection:text-white">
      {/* Top Protocol Status Bar */}
      <div className="border-b border-[#1F242D] bg-[#0D0F14]/90 px-4 py-2 font-mono-code text-xs text-[#94A3B8] backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#F8FAFC]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              CENTRAL_HUB_STATUS: OPERATIONAL
            </span>
            <span className="hidden sm:inline text-[#64748B]">|</span>
            <span className="hidden sm:inline text-[#64748B]">METTLER_TOLEDO_CALIBRATION: ±0.001g OK</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[#64748B]">PROTOCOL: SWISS_SAFE_V3</span>
            <button 
              onClick={() => navigate('/login')}
              className="text-white hover:text-[#10B981] transition-colors font-semibold"
            >
              ACCESS_VAULT →
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-[#1F242D] bg-[#090A0C]/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#111318] border border-[#1F242D] flex items-center justify-center font-mono-code font-bold text-white text-sm">
              FZ
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base">FLIPZ</span>
              <span className="ml-2 font-mono-code text-[11px] text-[#94A3B8] uppercase">Custody & Escrow</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-[#1F242D] bg-[#111318] text-[#F8FAFC] hover:bg-[#161922] hover:border-[#2E3644] rounded font-mono-code text-xs h-9 px-4"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-white text-black hover:bg-slate-200 font-semibold rounded text-xs h-9 px-4"
            >
              Initialize Account
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section: Technical Custody Statement */}
      <section className="py-20 md:py-28 border-b border-[#1F242D]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#111318] border border-[#1F242D] font-mono-code text-xs text-[#94A3B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              NON-DESTRUCTIVE TESTING (NDT) PHYSICAL ESCROW
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              Zero Counterfeits.<br />
              <span className="text-[#94A3B8]">100% Physical Custody.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-2xl font-normal">
              Bezgotówkowa giełda kart kolekcjonerskich TCG i memorabilia o wysokiej wartości. Każda wymiana przechodzi przez sterylny Hub z badaniami wagi analitycznej (±0.001 g), mikrometrycznym pomiarem grubości oraz niezmiennym łańcuchem dowodowym SHA-256.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => navigate('/login')}
                className="bg-white text-black hover:bg-slate-200 font-semibold h-11 px-6 rounded text-sm flex items-center gap-2"
              >
                Start Verification Trade
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const el = document.getElementById('pipeline');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-[#1F242D] bg-[#111318] text-[#94A3B8] hover:text-white hover:bg-[#161922] h-11 px-5 rounded font-mono-code text-xs"
              >
                Inspect Protocol Specification
              </Button>
            </div>
          </div>

          {/* Interactive Laboratory Instrument Simulator */}
          <div className="mt-16 border border-[#1F242D] rounded-lg bg-[#111318] overflow-hidden shadow-2xl">
            <div className="border-b border-[#1F242D] bg-[#0D0F14] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono-code text-xs">
                <Terminal className="w-4 h-4 text-[#10B981]" />
                <span className="text-white font-semibold">LIVE_MEASUREMENT_TERMINAL:</span>
                <span className="text-[#94A3B8]">METTLER-TOLEDO-XPR205</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-code text-[#64748B]">SPECIMEN SELECTOR:</span>
                <div className="flex gap-1.5">
                  {LAB_SPECIMENS.map((specimen, idx) => (
                    <button
                      key={specimen.id}
                      onClick={() => handleSelectSpecimen(specimen)}
                      className={`px-2 py-1 rounded text-[11px] font-mono-code transition-all ${
                        selectedSpecimen.id === specimen.id
                          ? 'bg-white text-black font-bold'
                          : 'bg-[#161922] text-[#94A3B8] hover:text-white border border-[#1F242D]'
                      }`}
                    >
                      #0{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Lewy panel danych próbki */}
              <div className="md:col-span-5 space-y-4 border-r border-[#1F242D]/50 pr-0 md:pr-6">
                <div>
                  <span className="font-mono-code text-[11px] text-[#64748B] uppercase">Current Specimen in Chamber</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedSpecimen.name}</h3>
                  <p className="text-xs font-mono-code text-[#94A3B8]">{selectedSpecimen.category}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1F242D]">
                  <div className="flex justify-between text-xs font-mono-code">
                    <span className="text-[#64748B]">CALIBRATED_NOMINAL_MASS:</span>
                    <span className="text-white font-semibold">{selectedSpecimen.nominalWeight.toFixed(3)} g</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono-code">
                    <span className="text-[#64748B]">CALIBRATED_NOMINAL_THICKNESS:</span>
                    <span className="text-white font-semibold">{selectedSpecimen.nominalThickness.toFixed(3)} mm</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono-code">
                    <span className="text-[#64748B]">INSPECTION_TIMESTAMP:</span>
                    <span className="text-[#94A3B8]">{selectedSpecimen.timestamp}</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#0D0F14] border border-[#1F242D] font-mono-code text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>CHAIN_OF_CUSTODY_HASH:</span>
                    <span className="text-[#10B981]">SHA-256</span>
                  </div>
                  <div className="text-[#94A3B8] truncate select-all">
                    {selectedSpecimen.sha256}
                  </div>
                </div>
              </div>

              {/* Prawy panel odczytu aparatury pomiarowej */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Waga analityczna */}
                <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#10B981]" />
                      ANALYTICAL_MASS
                    </span>
                    <span className="text-[10px] text-[#64748B]">±0.001g</span>
                  </div>
                  <div className="py-2 text-right font-mono-code">
                    <span className={`text-3xl font-extrabold tracking-tight ${isMeasuring ? 'text-[#94A3B8] animate-pulse' : 'text-white'}`}>
                      {isMeasuring ? '---.---' : selectedSpecimen.measuredWeight.toFixed(3)}
                    </span>
                    <span className="text-sm font-bold text-[#64748B] ml-1.5">g</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono-code pt-2 border-t border-[#1F242D]">
                    <span className="text-[#64748B]">TOLERANCE_DELTA:</span>
                    <span className="text-[#10B981] font-bold">
                      +{(selectedSpecimen.measuredWeight - selectedSpecimen.nominalWeight).toFixed(3)} g [PASS]
                    </span>
                  </div>
                </div>

                {/* Mikrometr cyfrowy */}
                <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <Microscope className="w-3.5 h-3.5 text-[#06B6D4]" />
                      CALIPER_THICKNESS
                    </span>
                    <span className="text-[10px] text-[#64748B]">±0.001mm</span>
                  </div>
                  <div className="py-2 text-right font-mono-code">
                    <span className={`text-3xl font-extrabold tracking-tight ${isMeasuring ? 'text-[#94A3B8] animate-pulse' : 'text-white'}`}>
                      {isMeasuring ? '-.---' : selectedSpecimen.measuredThickness.toFixed(3)}
                    </span>
                    <span className="text-sm font-bold text-[#64748B] ml-1.5">mm</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono-code pt-2 border-t border-[#1F242D]">
                    <span className="text-[#64748B]">SUBSTRATE_MATCH:</span>
                    <span className="text-[#10B981] font-bold">100% NOMINAL</span>
                  </div>
                </div>

                {/* Status UV */}
                <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="text-[#94A3B8]">UV_365NM_SPECTRAL_SCAN</span>
                    <span className="text-[#10B981] font-bold">CLEAR</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] font-mono-code">
                    Brak syntetycznych klejów retuszerskich. Reakcja fluorescencyjna zgodna z kartoteką rocznika.
                  </p>
                  <div className="pt-2 border-t border-[#1F242D] text-[11px] font-mono-code text-[#10B981]">
                    ● NO_INKING_DETECTED
                  </div>
                </div>

                {/* Ostateczny werdykt */}
                <div className="p-4 rounded bg-[#10B981]/5 border border-[#10B981]/30 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="text-[#10B981] font-bold">SWISS_SAFE_CERTIFICATION</span>
                    <Badge className="bg-[#10B981] text-black font-mono-code text-[10px] font-bold">VERIFIED</Badge>
                  </div>
                  <div className="font-mono-code text-xs text-white">
                    Protokół weryfikacji zakończony sukcesem. Próbka dopuszczona do dyspozycji i plombowania NFC.
                  </div>
                  <div className="pt-2 border-t border-[#10B981]/20 text-[11px] font-mono-code text-[#94A3B8]">
                    SEAL_ID: NFC-SWISS-08921-X
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: The Verification Pipeline */}
      <section id="pipeline" className="py-20 border-b border-[#1F242D] bg-[#090A0C]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <span className="font-mono-code text-xs text-[#10B981] uppercase tracking-wider">Verification Pipeline</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              4-Etapowy Fizyczny Protokół Bezpieczeństwa
            </h2>
            <p className="text-[#94A3B8] text-sm mt-2 max-w-2xl">
              Każda transakcja podlega ścisłemu reżimowi Dual-Blind: laborant oceniający stan fizyczny nie zna tożsamości stron, wykluczając stronniczość.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Intake & Anonymization',
                subtitle: 'Dual-Blind Receiving',
                desc: 'Przesyłki z Paczkomatów trafiają do śluzy Hubu. Kod kreskowy jest mapowany na anonimowy ID zlecenia bez danych osobowych.'
              },
              {
                step: '02',
                title: 'NDT Optical & UV Scan',
                subtitle: 'Badania Laboratoryjne',
                desc: 'Pomiar masy na wadze Mettler Toledo (±0.001 g), badanie mikrometrem oraz inspekcja krawędzi pod lampą Wooda 365 nm.'
              },
              {
                step: '03',
                title: 'Cryptographic Hash',
                subtitle: 'Niezmienny Łańcuch SHA-256',
                desc: 'Zdjęcia makro 4K i parametry fizyczne są hashowane algorytmem SHA-256 i zapisywane w niezmiennym logu audytowym.'
              },
              {
                step: '04',
                title: 'Tamper-Evident Seal',
                subtitle: 'Hermetyczny Smart-Box',
                desc: 'Karty pakowane w bezkwasowe sleeve’y, zabezpieczane niszczącą plombą VOID lub tagiem NFC i wysyłane do odbiorcy.'
              }
            ].map((stage) => (
              <div 
                key={stage.step}
                className="p-5 rounded border border-[#1F242D] bg-[#111318] flex flex-col justify-between h-full space-y-4 hover:border-[#2E3644] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between font-mono-code mb-3">
                    <span className="text-xs font-bold text-[#10B981]">{stage.step} / PHASE</span>
                    <span className="text-[10px] text-[#64748B]">PROTOCOL_CHECK</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{stage.title}</h3>
                  <p className="text-xs font-mono-code text-[#94A3B8] mb-2">{stage.subtitle}</p>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Real-Time Vault Ledger */}
      <section className="py-20 border-b border-[#1F242D] bg-[#0D0F14]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="font-mono-code text-xs text-[#10B981] uppercase tracking-wider">Public Verification Ledger</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Rejestr Ostatnich Weryfikacji
              </h2>
              <p className="text-[#94A3B8] text-xs sm:text-sm mt-1">
                Niezmienne sumy kontrolne SHA-256 zrealizowanych inspekcji w centralnym Hubie.
              </p>
            </div>
            <Badge variant="outline" className="border-[#1F242D] bg-[#111318] text-[#94A3B8] font-mono-code text-xs py-1 px-3 w-fit">
              LIVE_DATA_STREAM
            </Badge>
          </div>

          <div className="border border-[#1F242D] rounded bg-[#111318] overflow-x-auto">
            <table className="w-full text-left font-mono-code text-xs">
              <thead className="border-b border-[#1F242D] bg-[#090A0C] text-[#64748B]">
                <tr>
                  <th className="py-3 px-4">DISPATCH_ID</th>
                  <th className="py-3 px-4">TRADED_SPECIMENS</th>
                  <th className="py-3 px-4">TIER</th>
                  <th className="py-3 px-4">MASS_DELTA</th>
                  <th className="py-3 px-4">UV_TEST</th>
                  <th className="py-3 px-4">SHA-256_FINGERPRINT</th>
                  <th className="py-3 px-4">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F242D]">
                {RECENT_LEDGER_ENTRIES.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-[#161922] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{entry.tradeId}</td>
                    <td className="py-3.5 px-4 text-[#F8FAFC]">
                      <span>{entry.itemA}</span>
                      <span className="text-[#64748B] mx-1.5">↔</span>
                      <span>{entry.itemB}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-[#1F242D] bg-[#0D0F14] text-[#CBD5E1]">
                        {entry.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#10B981] font-semibold">{entry.massDelta}</td>
                    <td className="py-3.5 px-4 text-[#10B981]">{entry.uvResult}</td>
                    <td className="py-3.5 px-4 text-[#94A3B8] truncate max-w-[140px] select-all">
                      {entry.hash.substring(0, 16)}...
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section: Escrow Verification Protocols Pricing */}
      <section className="py-20 border-b border-[#1F242D] bg-[#090A0C]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono-code text-xs text-[#10B981] uppercase tracking-wider">Protocol Specifications</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Cennik Protokołów Escrow
            </h2>
            <p className="text-[#94A3B8] text-sm mt-2">
              Opłata serwisowa za stronę wymiany, obejmująca komplet etykiet InPost oraz procedurę laboratoryjną NDT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Escrow */}
            <div className="p-6 rounded border border-[#1F242D] bg-[#111318] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono-code">
                  <span className="text-xs font-bold text-[#94A3B8]">TIER_01</span>
                  <Badge variant="outline" className="border-[#1F242D] text-[#94A3B8] text-[10px]">24-48H HUB</Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Standard Escrow</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono-code">45 zł</span>
                    <span className="text-xs text-[#94A3B8] font-mono-code">/ stronę</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-[#94A3B8] font-mono-code pt-2 border-t border-[#1F242D]">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Komplet etykiet InPost (obie strony)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Test fluorescencji UV 365 nm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Waga analityczna NDT (±0.001 g)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Dokumentacja fotograficzna 4K</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#161922] hover:bg-[#1F242D] text-white border border-[#1F242D] rounded font-mono-code text-xs h-10"
              >
                Select Standard Protocol
              </Button>
            </div>

            {/* Swiss Safe */}
            <div className="p-6 rounded border-2 border-white bg-[#161922] flex flex-col justify-between space-y-6 relative shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono-code">
                  <span className="text-xs font-bold text-[#10B981]">TIER_02 / RECOMMENDED</span>
                  <Badge className="bg-white text-black font-mono-code text-[10px] font-bold">&lt;24H PRIORITY</Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Swiss Safe</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono-code">69 zł</span>
                    <span className="text-xs text-[#94A3B8] font-mono-code">/ stronę</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-[#CBD5E1] font-mono-code pt-2 border-t border-[#1F242D]">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Wszystko ze Standard Escrow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Cyfrowy mikrometr (±0.001 mm)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Semi-rigid sleeve + plomba VOID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Cyfrowy certyfikat SHA-256 PDF</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-white hover:bg-slate-200 text-black font-bold rounded text-xs h-10 font-mono-code"
              >
                Select Swiss Safe Protocol
              </Button>
            </div>

            {/* Vault Black */}
            <div className="p-6 rounded border border-[#1F242D] bg-[#111318] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono-code">
                  <span className="text-xs font-bold text-[#E53935]">TIER_03 / HIGH-END</span>
                  <Badge variant="outline" className="border-[#1F242D] text-[#94A3B8] text-[10px]">&lt;12H EXPRESS</Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Vault Black</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono-code">99 zł</span>
                    <span className="text-xs text-[#94A3B8] font-mono-code">/ stronę (lub 3% &gt;3000zł)</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-[#94A3B8] font-mono-code pt-2 border-t border-[#1F242D]">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Wszystko ze Swiss Safe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Ciągłe nagranie wideo 4K z unboxingu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Smart-Box z tagiem NFC smartfona</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>Ubezpieczenie All-Risks do 100%</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#161922] hover:bg-[#1F242D] text-white border border-[#1F242D] rounded font-mono-code text-xs h-10"
              >
                Select Vault Black Protocol
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Subscription Plans */}
      <section className="py-20 border-b border-[#1F242D] bg-[#0D0F14]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono-code text-xs text-[#10B981] uppercase tracking-wider">Account Membership</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Plany Subskrypcji Portfela
            </h2>
            <p className="text-[#94A3B8] text-sm mt-2">
              Zwiększ pojemność aktywnego inventory i korzystaj ze stałych zniżek na badania laboratoryjne Escrow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Collector Free */}
            <div className="p-6 rounded border border-[#1F242D] bg-[#111318] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="font-mono-code text-xs text-[#64748B]">PLAN_FREE</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Collector Free</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-extrabold text-white font-mono-code">0 zł</span>
                    <span className="text-xs text-[#94A3B8] font-mono-code"> / miesiąc</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[#0D0F14] border border-[#1F242D] font-mono-code text-xs text-[#CBD5E1]">
                  CAPACITY_LIMIT: 5 ACTIVE LISTINGS
                </div>
                <ul className="space-y-2 text-xs text-[#94A3B8] font-mono-code">
                  <li className="flex items-center gap-2">● Podstawowy silnik matchingu 2-cykli</li>
                  <li className="flex items-center gap-2">● Standardowa kolejka w Hubie</li>
                  <li className="flex items-center gap-2">● Pełny dostęp do badań Escrow</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#161922] hover:bg-[#1F242D] text-white border border-[#1F242D] rounded font-mono-code text-xs h-10"
              >
                Create Free Account
              </Button>
            </div>

            {/* Pro Trader */}
            <div className="p-6 rounded border border-[#10B981] bg-[#111318] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono-code text-xs">
                  <span className="text-[#10B981] font-bold">PLAN_PRO</span>
                  <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30 font-mono-code text-[10px]">
                    -10% ESCROW DISCOUNT
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Pro Trader</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-extrabold text-white font-mono-code">29 zł</span>
                    <span className="text-xs text-[#94A3B8] font-mono-code"> / miesiąc</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[#0D0F14] border border-[#1F242D] font-mono-code text-xs text-[#10B981] font-bold">
                  CAPACITY_LIMIT: 30 ACTIVE LISTINGS
                </div>
                <ul className="space-y-2 text-xs text-[#CBD5E1] font-mono-code">
                  <li className="flex items-center gap-2 text-[#10B981]">● -10% na wszystkie opłaty Escrow</li>
                  <li className="flex items-center gap-2">● Natychmiastowe alerty matchingu A ↔ B</li>
                  <li className="flex items-center gap-2">● Odznaka PRO TRADER na profilu</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded font-mono-code text-xs h-10"
              >
                Activate Pro Trader
              </Button>
            </div>

            {/* Vault Master */}
            <div className="p-6 rounded border border-[#1F242D] bg-[#111318] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono-code text-xs">
                  <span className="text-[#94A3B8]">PLAN_VAULT_MASTER</span>
                  <Badge variant="outline" className="border-[#1F242D] text-[#CBD5E1] font-mono-code text-[10px]">
                    -20% ESCROW DISCOUNT
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Vault Master</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-extrabold text-white font-mono-code">69 zł</span>
                    <span className="text-xs text-[#94A3B8] font-mono-code"> / miesiąc</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-[#0D0F14] border border-[#1F242D] font-mono-code text-xs text-[#F8FAFC] font-bold">
                  CAPACITY_LIMIT: UNLIMITED (∞)
                </div>
                <ul className="space-y-2 text-xs text-[#94A3B8] font-mono-code">
                  <li className="flex items-center gap-2 text-[#F8FAFC]">● -20% na wszystkie opłaty Escrow</li>
                  <li className="flex items-center gap-2">● Dedykowany priorytet na stacjach Hubu</li>
                  <li className="flex items-center gap-2">● Historia wycen rynkowych i analityka</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#161922] hover:bg-[#1F242D] text-white border border-[#1F242D] rounded font-mono-code text-xs h-10"
              >
                Activate Vault Master
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F242D] bg-[#090A0C] py-12 text-[#94A3B8] font-mono-code text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white">FLIPZ PROTOCOL</span>
            <span className="ml-2 text-[#64748B]">© 2026. All rights reserved. Physical Escrow Standard.</span>
          </div>
          <div className="flex items-center gap-4 text-[#64748B]">
            <span>METTLER_TOLEDO_COMPLIANT</span>
            <span>•</span>
            <span>SHA-256_AUDITED</span>
            <span>•</span>
            <span>SWISS_SAFE_SPEC_V3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
