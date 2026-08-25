import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ShieldCheck, 
  Loader2, 
  Terminal, 
  Scale, 
  Microscope, 
  Sparkles, 
  Crown, 
  ArrowRight,
  Clock,
  QrCode,
  FileCheck
} from "lucide-react";
import { supabase, useAuth } from '@/lib/AuthContext';
import { toast } from "sonner";

export const protectionProtocols = [
  {
    id: 'standard_escrow',
    name: 'Standard Escrow',
    tag: 'PROTOCOL_STD_01',
    basePrice: 45,
    turnaround: '24–48h Hub Time',
    features: [
      'Komplet etykiet InPost (Paczkomat → Hub → Paczkomat)',
      'Spektroskopia fluorescencyjna UV 365 nm (retusz/inking)',
      'Pomiar masy na wadze analitycznej (tolerancja ±0.001 g)',
      'Dokumentacja fotograficzna makro 4K'
    ]
  },
  {
    id: 'swiss_safe',
    name: 'Swiss Safe',
    tag: 'PROTOCOL_SWISS_02',
    basePrice: 69,
    turnaround: '<24h Priority Hub Time',
    recommended: true,
    features: [
      'Wszystko z pakietu Standard Escrow',
      'Cyfrowy pomiar grubości mikrometrem (±0.001 mm)',
      'Kapsułkowanie w semi-rigid sleeve + plomba VOID',
      'Cyfrowy Certyfikat Weryfikacji PDF z hashem SHA-256'
    ]
  },
  {
    id: 'vault_black',
    name: 'Vault Black',
    tag: 'PROTOCOL_HIGH_END_03',
    basePrice: 99,
    turnaround: '<12h Express Hub Time',
    features: [
      'Wszystko z pakietu Swiss Safe',
      'Ciągłe nagranie wideo 4K z unboxingu i inspekcji',
      'Hermetyczny Smart-Box z tagiem NFC smartfona',
      'Ubezpieczenie All-Risks do 100% wartości rynkowej'
    ]
  }
];

export default function ProtectionTierSelector({ 
  open, 
  onClose, 
  tradeOffer, 
  userEmail, 
  onSuccess 
}) {
  const { user, profile } = useAuth();
  const [selectedProtocol, setSelectedProtocol] = useState('swiss_safe');
  const [processing, setProcessing] = useState(false);

  // Ustal poziom subskrypcji i rabat
  const userTier = (profile?.subscription_tier || user?.subscription_tier || 'free').toLowerCase();
  
  const discountInfo = useMemo(() => {
    if (userTier === 'vault_master' || userTier === 'premium') {
      return { percent: 20, tag: 'VAULT_MASTER_TIER (-20%)', label: '-20% Vault Master Discount' };
    }
    if (userTier === 'pro' || userTier === 'basic') {
      return { percent: 10, tag: 'PRO_TRADER_TIER (-10%)', label: '-10% Pro Trader Discount' };
    }
    return { percent: 0, tag: 'COLLECTOR_FREE_TIER (0%)', label: 'Brak rabatu (Collector Free)' };
  }, [userTier]);

  const activeProtoObj = useMemo(() => {
    return protectionProtocols.find(p => p.id === selectedProtocol) || protectionProtocols[1];
  }, [selectedProtocol]);

  // Obliczenie ceny po rabacie (BEZ KAUCJI — tylko czysta opłata serwisowa)
  const finalServiceFee = useMemo(() => {
    const discounted = activeProtoObj.basePrice * (1 - discountInfo.percent / 100);
    return Number(discounted.toFixed(2));
  }, [activeProtoObj.basePrice, discountInfo.percent]);

  const handleAuthorizeProtocol = async () => {
    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('createTradePayment', {
        body: {
          tradeOfferId: tradeOffer?.id,
          escrowMode: selectedProtocol,
          amount: finalServiceFee
        }
      });

      if (error) {
        throw new Error(error.message || 'Błąd podczas tworzenia płatności');
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.success('Protokół weryfikacji Swiss Safe został zainicjowany.');
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Błąd autoryzacji płatności: ' + (err.message || 'Nieznany błąd'));
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#090A0C] text-[#F8FAFC] border border-[#1F242D] p-6 sm:p-8 rounded-lg shadow-2xl">
        <DialogHeader className="space-y-1.5 text-left border-b border-[#1F242D] pb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-xs text-[#10B981] uppercase font-bold tracking-wider">
              SWISS_SAFE_PROTOCOL_CONFIGURATOR
            </span>
            {discountInfo.percent > 0 && (
              <span className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                APPLIED_DISCOUNT: {discountInfo.tag}
              </span>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Wybór Protokołu Weryfikacji Escrow
          </DialogTitle>
          <DialogDescription className="text-xs text-[#94A3B8] font-mono-code">
            Fizyczna inspekcja laboratoryjna w Hubie. Opłata serwisowa per strona wymiany z logistyką InPost.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Siatka 3 Protokołów */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {protectionProtocols.map((proto) => {
              const isSelected = selectedProtocol === proto.id;
              const protoPrice = discountInfo.percent > 0 
                ? (proto.basePrice * (1 - discountInfo.percent / 100)).toFixed(2)
                : proto.basePrice;

              return (
                <div
                  key={proto.id}
                  onClick={() => setSelectedProtocol(proto.id)}
                  className={`p-4 rounded border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                    isSelected 
                      ? 'bg-[#161922] border-white ring-1 ring-white' 
                      : 'bg-[#111318] border-[#1F242D] hover:border-[#2E3644]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono-code text-[10px]">
                      <span className="text-[#64748B]">{proto.tag}</span>
                      {proto.recommended && (
                        <span className="text-[#10B981] font-bold">● RECOMMENDED</span>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-sm text-white">{proto.name}</h4>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-white font-mono-code">{protoPrice} zł</span>
                        <span className="text-[11px] text-[#64748B] font-mono-code">/ stronę</span>
                      </div>
                      {discountInfo.percent > 0 && (
                        <span className="text-[10px] text-[#10B981] font-mono-code">
                          (Regularnie {proto.basePrice} zł)
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono-code text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#10B981]" />
                      {proto.turnaround}
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-[#1F242D] text-[11px] text-[#94A3B8] font-mono-code">
                      {proto.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#10B981] font-bold">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <div className={`w-full py-1.5 text-center text-xs font-mono-code rounded ${
                      isSelected ? 'bg-white text-black font-bold' : 'bg-[#0D0F14] text-[#64748B] border border-[#1F242D]'
                    }`}>
                      {isSelected ? 'SELECTED_PROTOCOL' : 'SELECT'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Podsumowanie audytowe zlecenia */}
          <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-3 font-mono-code text-xs">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span>SERVICE_PROTOCOL:</span>
              <span className="text-white font-bold">{activeProtoObj.name} ({activeProtoObj.turnaround})</span>
            </div>

            <div className="flex items-center justify-between text-[#94A3B8]">
              <span>BASE_LABORATORY_FEE:</span>
              <span className="text-white">{activeProtoObj.basePrice}.00 PLN</span>
            </div>

            {discountInfo.percent > 0 && (
              <div className="flex items-center justify-between text-[#10B981]">
                <span>MEMBERSHIP_DISCOUNT:</span>
                <span>-{discountInfo.percent}% ({discountInfo.tag})</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#1F242D] flex items-center justify-between text-sm">
              <span className="text-white font-bold">TOTAL_DUE_PER_PARTY:</span>
              <span className="text-xl font-extrabold text-[#10B981]">{finalServiceFee} PLN</span>
            </div>
          </div>

          {/* Przyciski Akcji */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="border-[#1F242D] bg-[#111318] text-[#94A3B8] hover:text-white rounded font-mono-code text-xs h-11 px-5"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleAuthorizeProtocol}
              disabled={processing}
              className="flex-1 bg-white hover:bg-slate-200 text-black font-bold rounded font-mono-code text-xs h-11"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  INITIALIZING_CHECKOUT...
                </>
              ) : (
                <>
                  AUTHORIZE ESCROW PROTOCOL ({finalServiceFee} PLN)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}