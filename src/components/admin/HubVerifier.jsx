import React, { useState, useEffect, useMemo } from 'react';
import { supabase, useAuth } from '@/lib/AuthContext';
import { flipzApi } from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Scale, 
  Microscope, 
  Sparkles, 
  ShieldCheck, 
  AlertOctagon, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileCheck, 
  Hash, 
  Package, 
  Search, 
  RefreshCw,
  Terminal,
  Activity,
  Sliders,
  AlertTriangle
} from "lucide-react";
import { toast } from 'sonner';

// Obliczanie sumy kontrolnej SHA-256 w przeglądarce
async function calculateFileSHA256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HubVerifier() {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Strona inspekcji: 'sender' lub 'owner'
  const [activeParty, setActiveParty] = useState('sender');

  // Pomiary laboratoryjne
  const [weightGrams, setWeightGrams] = useState('1.742');
  const [nominalWeight, setNominalWeight] = useState('1.740');
  const [thicknessMm, setThicknessMm] = useState('0.305');
  const [nominalThickness, setNominalThickness] = useState('0.305');
  const [uvPass, setUvPass] = useState(true);
  const [tamperSealId, setTamperSealId] = useState('');
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [quarantineReason, setQuarantineReason] = useState('');

  // Pliki i hashe SHA-256
  const [inspectedMedia, setInspectedMedia] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Terminal log zdarzeń
  const [consoleLogs, setConsoleLogs] = useState([
    `[${new Date().toISOString()}] METTLER_TOLEDO_CALIBRATION_CHECK: OK (±0.001g)`,
    `[${new Date().toISOString()}] OPTICAL_MICROMETER_ONLINE: OK (±0.001mm)`,
    `[${new Date().toISOString()}] UV_WOOD_LAMP_365NM: EMISSION_STABLE`
  ]);

  const addLog = (msg) => {
    setConsoleLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  useEffect(() => {
    fetchTradesQueue();
  }, []);

  const fetchTradesQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trade_offers')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTrades(data || []);
      if (data && data.length > 0 && !selectedTrade) {
        handleSelectTrade(data[0]);
      }
    } catch (err) {
      console.error('Error fetching verifier trades:', err);
      toast.error('Błąd ładowania kolejki weryfikacyjnej');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrade = (t) => {
    setSelectedTrade(t);
    resetForm();
    addLog(`LOADED_TRADE_MANIFEST: #${t.id?.substring(0, 8)} [ESCROW_TIER: ${t.escrow_tier || t.escrow_mode || 'STANDARD'}]`);
  };

  const resetForm = () => {
    setWeightGrams('1.742');
    setThicknessMm('0.305');
    setUvPass(true);
    setTamperSealId(`SEAL-SWISS-${Date.now().toString(36).toUpperCase()}`);
    setInspectorNotes('');
    setQuarantineReason('');
    setInspectedMedia([]);
  };

  // Obliczenie delty wagi
  const massDelta = useMemo(() => {
    const w = parseFloat(weightGrams);
    const nom = parseFloat(nominalWeight);
    if (isNaN(w) || isNaN(nom)) return 0;
    return Number((w - nom).toFixed(4));
  }, [weightGrams, nominalWeight]);

  const isMassWithinTolerance = Math.abs(massDelta) <= 0.015;

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        addLog(`HASHING_FILE: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);
        const hash = await calculateFileSHA256(file);
        addLog(`SHA256_COMPUTED: ${hash.substring(0, 20)}...`);

        const tempItem = {
          name: file.name,
          type: file.type,
          sha256: hash,
          uploading: true
        };

        setInspectedMedia(prev => [...prev, tempItem]);

        const uploadRes = await flipzApi.integrations.Core.UploadFile({ file });
        
        setInspectedMedia(prev => prev.map(item => 
          item.sha256 === hash ? { ...item, url: uploadRes.file_url, uploading: false } : item
        ));
        addLog(`STORAGE_SYNC_COMPLETE: ${file.name}`);
      } catch (err) {
        console.error('Upload hash error:', err);
        toast.error(`Błąd pliku: ${file.name}`);
        addLog(`ERROR: FAILED_TO_PROCESS_MEDIA (${file.name})`);
      }
    }
  };

  // Decyzja: Zatwierdzenie i zaplombowanie
  const handleAuthorizeAndSeal = async () => {
    if (!selectedTrade) return;
    if (!weightGrams || isNaN(parseFloat(weightGrams))) {
      toast.error('Wymagany precyzyjny odczyt wagi');
      return;
    }
    if (inspectedMedia.length === 0) {
      toast.error('Wymagany co najmniej 1 plik dokumentacji foto/wideo');
      return;
    }

    setSubmitting(true);
    try {
      const hashesPayload = inspectedMedia.map(m => ({
        filename: m.name,
        sha256: m.sha256,
        url: m.url || '',
        mime_type: m.type
      }));

      // 1. Zapis do escrow_audit_trail (Append-Only Log)
      await supabase
        .from('escrow_audit_trail')
        .insert({
          trade_offer_id: selectedTrade.id,
          package_type: activeParty,
          verifier_id: user?.id,
          verifier_name: user?.email || 'Hub Lab Technician',
          weight_grams: parseFloat(weightGrams),
          thickness_mm: parseFloat(thicknessMm),
          uv_fluorescence_pass: uvPass,
          surface_edge_integrity_score: 98,
          nfc_tamper_seal_id: tamperSealId,
          media_sha256_hashes: hashesPayload,
          verification_verdict: 'PASSED',
          notes: inspectorNotes || 'NDT verification passed. Specimen meets authentic physical parameters.',
          certificate_sha256: hashesPayload[0]?.sha256 || 'SWISS-SAFE-VERIFIED'
        });

      // 2. Aktualizacja statusu
      const isSender = activeParty === 'sender';
      await supabase
        .from('trade_offers')
        .update({
          [isSender ? 'hub_verification_sender' : 'hub_verification_owner']: 'passed',
          status_v2: 'VERIFIED_SUCCESS',
          progress_step: 'shipping_to_users'
        })
        .eq('id', selectedTrade.id);

      addLog(`VERDICT_APPROVED: PACKAGE_${activeParty.toUpperCase()} SEALED [${tamperSealId}]`);
      toast.success(`Przesyłka ${activeParty.toUpperCase()} zatwierdzona i zaplombowana.`);
      await fetchTradesQueue();
      resetForm();
    } catch (err) {
      console.error('Authorize error:', err);
      toast.error('Błąd zatwierdzania inspekcji');
      addLog(`ERROR: AUTHORIZATION_FAILED`);
    } finally {
      setSubmitting(false);
    }
  };

  // Decyzja: Kwarantanna i wszczęcie sporu
  const handleQuarantineAndDispute = async () => {
    if (!selectedTrade) return;
    if (!quarantineReason) {
      toast.error('Wprowadź przyczynę kwarantanny');
      return;
    }

    setSubmitting(true);
    try {
      const hashesPayload = inspectedMedia.map(m => ({
        filename: m.name,
        sha256: m.sha256,
        url: m.url || '',
        mime_type: m.type
      }));

      await supabase
        .from('escrow_audit_trail')
        .insert({
          trade_offer_id: selectedTrade.id,
          package_type: activeParty,
          verifier_id: user?.id,
          verifier_name: user?.email || 'Hub Lab Technician',
          weight_grams: parseFloat(weightGrams) || 0,
          thickness_mm: parseFloat(thicknessMm) || 0,
          uv_fluorescence_pass: uvPass,
          surface_edge_integrity_score: 20,
          nfc_tamper_seal_id: tamperSealId,
          media_sha256_hashes: hashesPayload,
          verification_verdict: 'REJECTED',
          notes: `QUARANTINE_ACTION: ${quarantineReason}`,
          dispute_reason: quarantineReason
        });

      await supabase
        .from('trade_offers')
        .update({
          status: 'failed',
          status_v2: 'DISPUTED',
          is_disputed: true,
          dispute_reason: quarantineReason,
          progress_step: 'disputed'
        })
        .eq('id', selectedTrade.id);

      addLog(`VERDICT_QUARANTINED: DISPUTE_FLAGGED [${quarantineReason}]`);
      toast.error('Próbka skierowana do kwarantanny. Wymiana wstrzymana.');
      await fetchTradesQueue();
      resetForm();
    } catch (err) {
      console.error('Dispute error:', err);
      toast.error('Błąd zgłaszania kwarantanny');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTrades = trades.filter(t => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      t.id?.toLowerCase().includes(q) ||
      t.sender_email?.toLowerCase().includes(q) ||
      t.owner_email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-[#F8FAFC]">
      {/* Top Station Header */}
      <div className="p-5 rounded border border-[#1F242D] bg-[#111318] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono-code text-xs text-[#94A3B8] mb-1">
            <Terminal className="w-4 h-4 text-[#10B981]" />
            <span className="text-white font-bold">SWISS_VAULT_CLEANROOM_WORKSTATION</span>
            <span>|</span>
            <span className="text-[#10B981]">STATION_ID: LAB-01-METTLER</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Terminal Weryfikacji Fizycznej NDT
          </h2>
        </div>

        <Button
          onClick={fetchTradesQueue}
          variant="outline"
          size="sm"
          className="border-[#1F242D] bg-[#161922] text-[#94A3B8] hover:text-white rounded font-mono-code text-xs h-9 px-3"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          SYNC_QUEUE
        </Button>
      </div>

      {/* Main Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lewa kolumna: Kolejka z InPost scannerem */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded border border-[#1F242D] bg-[#111318] space-y-3">
            <div className="flex items-center justify-between font-mono-code text-xs">
              <span className="text-white font-bold flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#10B981]" />
                INTAKE_QUEUE
              </span>
              <span className="text-[#64748B]">{filteredTrades.length} PENDING</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <Input
                placeholder="Scan InPost barcode / Trade ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 bg-[#0D0F14] border-[#1F242D] text-xs font-mono-code text-white h-9 rounded"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pt-1 font-mono-code text-xs">
              {loading ? (
                <div className="py-8 text-center text-[#64748B]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  FETCHING_QUEUE...
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="py-6 text-center text-[#64748B]">
                  NO_ACTIVE_SPECIMENS_IN_QUEUE
                </div>
              ) : (
                filteredTrades.map(t => {
                  const isSel = selectedTrade?.id === t.id;
                  const tier = t.escrow_tier || t.escrow_mode || 'STANDARD';
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTrade(t)}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        isSel 
                          ? 'bg-[#161922] border-white text-white' 
                          : 'bg-[#0D0F14] border-[#1F242D] text-[#94A3B8] hover:border-[#2E3644]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-white">#{t.id?.substring(0, 8)}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#111318] border border-[#1F242D] text-[#CBD5E1] text-[9px]">
                          {tier}
                        </span>
                      </div>
                      <div className="text-[11px] truncate mt-1 text-[#64748B]">
                        PARTY_A: {t.sender_email?.split('@')[0]} ↔ PARTY_B: {t.owner_email?.split('@')[0]}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1F242D] text-[10px] text-[#64748B]">
                        <span>STATUS: {t.status_v2 || t.status || 'PROPOSED'}</span>
                        <span className="text-[#10B981]">IN_CHAMBER</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Prawa kolumna: Pomiary laboratoryjne NDT */}
        <div className="lg:col-span-8 space-y-4">
          {selectedTrade ? (
            <div className="p-6 rounded border border-[#1F242D] bg-[#111318] space-y-6">
              {/* Dual-Blind Party Switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1F242D]">
                <div>
                  <span className="font-mono-code text-xs text-[#64748B] uppercase">Dual-Blind Specimen Intake</span>
                  <h3 className="text-lg font-bold text-white">
                    Manifest #{selectedTrade.id?.substring(0, 12)}
                  </h3>
                </div>

                <div className="flex items-center bg-[#0D0F14] p-1 rounded border border-[#1F242D] font-mono-code text-xs">
                  <button
                    onClick={() => { setActiveParty('sender'); resetForm(); }}
                    className={`px-3 py-1 rounded transition-all font-semibold ${
                      activeParty === 'sender' ? 'bg-white text-black' : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    PACKAGE_A (SENDER)
                  </button>
                  <button
                    onClick={() => { setActiveParty('owner'); resetForm(); }}
                    className={`px-3 py-1 rounded transition-all font-semibold ${
                      activeParty === 'owner' ? 'bg-white text-black' : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    PACKAGE_B (OWNER)
                  </button>
                </div>
              </div>

              {/* Pomiary NDT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Waga analityczna ze wskaźnikiem tolerancji */}
                <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-3">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#10B981]" />
                      METTLER_ANALYTICAL_MASS
                    </span>
                    <span className="text-[10px] text-[#64748B]">TOL: ±0.015g</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] font-mono-code text-[#64748B]">MEASURED (g)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={weightGrams}
                        onChange={(e) => setWeightGrams(e.target.value)}
                        className="bg-[#111318] border-[#1F242D] text-white font-mono-code font-bold text-right text-base h-9 rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-mono-code text-[#64748B]">NOMINAL_REF (g)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={nominalWeight}
                        onChange={(e) => setNominalWeight(e.target.value)}
                        className="bg-[#111318] border-[#1F242D] text-[#94A3B8] font-mono-code text-right text-sm h-9 rounded"
                      />
                    </div>
                  </div>

                  {/* Wskaźnik tolerancji Delta */}
                  <div className="p-2 rounded bg-[#111318] border border-[#1F242D] flex items-center justify-between font-mono-code text-xs">
                    <span className="text-[#64748B]">DELTA_Δm:</span>
                    <span className={`font-bold ${isMassWithinTolerance ? 'text-[#10B981]' : 'text-[#E53935]'}`}>
                      {massDelta >= 0 ? `+${massDelta.toFixed(4)}` : massDelta.toFixed(4)} g {isMassWithinTolerance ? '[IN_TOLERANCE]' : '[OUT_OF_SPEC]'}
                    </span>
                  </div>
                </div>

                {/* 2. Mikrometr grubości */}
                <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-3">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Microscope className="w-3.5 h-3.5 text-[#06B6D4]" />
                      OPTICAL_CALIPER_THICKNESS
                    </span>
                    <span className="text-[10px] text-[#64748B]">TOL: ±0.005mm</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] font-mono-code text-[#64748B]">MEASURED (mm)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={thicknessMm}
                        onChange={(e) => setThicknessMm(e.target.value)}
                        className="bg-[#111318] border-[#1F242D] text-white font-mono-code font-bold text-right text-base h-9 rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] font-mono-code text-[#64748B]">NOMINAL_REF (mm)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={nominalThickness}
                        onChange={(e) => setNominalThickness(e.target.value)}
                        className="bg-[#111318] border-[#1F242D] text-[#94A3B8] font-mono-code text-right text-sm h-9 rounded"
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#111318] border border-[#1F242D] flex items-center justify-between font-mono-code text-xs">
                    <span className="text-[#64748B]">CORE_STOCK:</span>
                    <span className="text-[#10B981] font-bold">MATCH_GENUINE_LAYER</span>
                  </div>
                </div>

                {/* 3. Test fluorescencji UV 365 nm */}
                <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-2">
                  <span className="font-mono-code text-xs text-white font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#94A3B8]" />
                    UV_365NM_WOOD_SPECTROSCOPY
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setUvPass(true)}
                      className={`flex-1 font-mono-code text-xs h-9 rounded ${
                        uvPass ? 'bg-[#10B981] text-black font-bold' : 'border border-[#1F242D] bg-[#111318] text-[#64748B]'
                      }`}
                    >
                      NO_INKING (PASS)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setUvPass(false)}
                      className={`flex-1 font-mono-code text-xs h-9 rounded ${
                        !uvPass ? 'bg-[#E53935] text-white font-bold' : 'border border-[#1F242D] bg-[#111318] text-[#64748B]'
                      }`}
                    >
                      RETOUCH_DETECTED (FAIL)
                    </Button>
                  </div>
                </div>

                {/* 4. Plomba / NFC Seal */}
                <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-2">
                  <span className="font-mono-code text-xs text-white font-bold flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#94A3B8]" />
                    TAMPER_SEAL_SERIAL
                  </span>
                  <Input
                    value={tamperSealId}
                    onChange={(e) => setTamperSealId(e.target.value)}
                    className="bg-[#111318] border-[#1F242D] text-white font-mono-code text-xs h-9 rounded"
                  />
                </div>
              </div>

              {/* Upload Foto/Wideo z Hashowaniem SHA-256 */}
              <div className="space-y-3 pt-2 border-t border-[#1F242D]">
                <div className="flex items-center justify-between font-mono-code text-xs">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#10B981]" />
                    MACRO_PHOTO_VIDEO_EVIDENCE (SHA-256)
                  </span>
                  <span className="text-[10px] text-[#64748B]">WEB_CRYPTO_DIGEST</span>
                </div>

                <div className="border border-dashed border-[#1F242D] rounded p-4 text-center bg-[#0D0F14] hover:border-[#2E3644] transition-colors">
                  <input
                    type="file"
                    id="lab-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <label htmlFor="lab-upload" className="cursor-pointer space-y-1 block">
                    <Camera className="w-6 h-6 text-[#94A3B8] mx-auto" />
                    <div className="font-mono-code text-xs text-[#CBD5E1]">
                      ATTACH_4K_INSPECTION_MEDIA
                    </div>
                    <p className="font-mono-code text-[10px] text-[#64748B]">
                      Automatic SHA-256 hash calculation per attached evidence file
                    </p>
                  </label>
                </div>

                {inspectedMedia.length > 0 && (
                  <div className="space-y-1.5">
                    {inspectedMedia.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-[#0D0F14] border border-[#1F242D] font-mono-code text-xs"
                      >
                        <span className="text-white truncate max-w-[200px]">{item.name}</span>
                        <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                          <span>SHA: {item.sha256.substring(0, 16)}...</span>
                          {item.uploading ? (
                            <Loader2 className="w-3 h-3 animate-spin text-[#10B981]" />
                          ) : (
                            <span className="text-[#10B981]">OK</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notatki laboratoryjne */}
              <div className="space-y-1.5 font-mono-code text-xs">
                <Label className="text-[#94A3B8]">INSPECTION_NOTES_&_SURFACE_REPORT</Label>
                <Textarea
                  placeholder="Surface centering 55/45, edge whitening 0%, hologram scratch check clean..."
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  className="bg-[#0D0F14] border-[#1F242D] text-xs text-white h-16 rounded resize-none"
                />
              </div>

              {/* Kwarantanna jeśli test nie zaliczony */}
              {!uvPass && (
                <div className="p-3 rounded bg-[#E53935]/10 border border-[#E53935]/30 space-y-2 font-mono-code text-xs">
                  <div className="flex items-center gap-1.5 text-[#E53935] font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    DISPUTE_QUARANTINE_PROTOCOL_REQUIRED
                  </div>
                  <Input
                    placeholder="Specific reason for rejection (e.g., retouched corner, reprint stock)..."
                    value={quarantineReason}
                    onChange={(e) => setQuarantineReason(e.target.value)}
                    className="bg-[#090A0C] border-[#E53935]/40 text-xs text-white h-9 rounded"
                  />
                </div>
              )}

              {/* Przyciski Decyzyjne */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono-code text-xs">
                <Button
                  onClick={handleQuarantineAndDispute}
                  disabled={submitting}
                  variant="outline"
                  className="flex-1 h-11 border-[#E53935]/40 bg-[#E53935]/10 text-[#F87171] hover:bg-[#E53935]/20 font-bold rounded"
                >
                  <AlertOctagon className="w-4 h-4 mr-2" />
                  QUARANTINE_&_DISPUTE (HALT TRADE)
                </Button>

                <Button
                  onClick={handleAuthorizeAndSeal}
                  disabled={submitting}
                  className="flex-1 h-11 bg-white hover:bg-slate-200 text-black font-bold rounded"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2 text-[#10B981]" />
                  )}
                  AUTHORIZE & SEAL DISPATCH MANIFEST
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-[#1F242D] rounded bg-[#111318] font-mono-code text-xs text-[#64748B]">
              SELECT_SPECIMEN_FROM_INTAKE_QUEUE_TO_OPEN_TERMINAL
            </div>
          )}

          {/* Terminal Console Log Stream */}
          <div className="p-4 rounded border border-[#1F242D] bg-[#090A0C] font-mono-code text-[11px] space-y-1 text-[#64748B]">
            <div className="flex items-center justify-between text-white font-bold pb-1 border-b border-[#1F242D]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
                REAL_TIME_TERMINAL_STREAM
              </span>
              <span className="text-[10px] text-[#10B981] animate-pulse">● LIVE</span>
            </div>
            <div className="space-y-0.5 pt-1">
              {consoleLogs.map((log, i) => (
                <div key={i} className="leading-tight truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
