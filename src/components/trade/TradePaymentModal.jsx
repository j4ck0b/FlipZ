import React, { useEffect, useState, useMemo } from 'react';
import { flipzApi } from '@/api/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, CheckCircle2, Shield, ArrowRight, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const ESCROW_PRICES = {
  standard_escrow: 45,
  swiss_safe: 69,
  vault_black: 99,
  eco: 45,
  light: 69,
  full: 99,
  basic: 45,
  secure: 69,
  collector: 99
};

const ESCROW_LABELS = {
  standard_escrow: 'Standard Escrow (Test UV 365nm + Waga ±0.001g)',
  swiss_safe: 'Swiss Safe (Mikrometr + Certyfikat SHA-256)',
  vault_black: 'Vault Black (Wideo 4K + Smart-Box NFC)',
  eco: 'Standard Escrow',
  light: 'Swiss Safe',
  full: 'Vault Black'
};

export default function TradePaymentModal({ open, onClose, tradeOffer, onSuccess }) {
  const { user, profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setPaid(false);
    }
  }, [open]);

  const rawTier = tradeOffer?.escrow_tier || tradeOffer?.escrow_mode || 'swiss_safe';
  const baseAmount = ESCROW_PRICES[rawTier] ?? 69;
  const tierLabel = ESCROW_LABELS[rawTier] ?? 'Swiss Safe Escrow';

  // Rabat subskrypcyjny
  const userTier = (profile?.subscription_tier || user?.subscription_tier || 'free').toLowerCase();
  const discountInfo = useMemo(() => {
    if (userTier === 'vault_master' || userTier === 'premium') {
      return { percent: 20, tag: 'VAULT_MASTER (-20%)' };
    }
    if (userTier === 'pro' || userTier === 'basic') {
      return { percent: 10, tag: 'PRO_TRADER (-10%)' };
    }
    return { percent: 0, tag: 'COLLECTOR_FREE (0%)' };
  }, [userTier]);

  const finalFee = Number((baseAmount * (1 - discountInfo.percent / 100)).toFixed(2));

  const handlePay = async () => {
    if (!tradeOffer?.id) {
      toast.error('Brak identyfikatora zlecenia.');
      return;
    }

    setProcessing(true);

    try {
      const { data } = await flipzApi.functions.invoke('createTradePayment', {
        tradeOfferId: tradeOffer.id,
        escrowMode: rawTier,
        amount: finalFee
      });

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      setPaid(true);
      toast.success('Płatność została zarejestrowana pomyślnie.');
      setTimeout(() => {
        setProcessing(false);
        onSuccess?.();
        onClose();
      }, 900);
    } catch (error) {
      console.error('Błąd płatności:', error);
      toast.error('Błąd podczas tworzenia sesji płatności. Spróbuj ponownie.');
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full bg-[#090A0C] text-[#F8FAFC] border border-[#1F242D] p-6 rounded-lg shadow-2xl">
        <DialogHeader className="border-b border-[#1F242D] pb-3 text-left">
          <div className="flex items-center justify-between font-mono-code text-[11px] text-[#10B981] mb-1">
            <span>SWISS_SAFE_CHECKOUT</span>
            <span>STRIPE_GATEWAY_V3</span>
          </div>
          <DialogTitle className="text-xl font-bold text-white">Opłata Serwisowa Escrow Hub</DialogTitle>
          <DialogDescription className="text-xs text-[#94A3B8] font-mono-code">
            Fizyczna inspekcja laboratoryjna NDT i etykiety logistyczne InPost.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!paid ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-2 font-mono-code text-xs"
            >
              <div className="p-4 rounded bg-[#0D0F14] border border-[#1F242D] space-y-2.5">
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>PROTOCOL:</span>
                  <span className="text-white font-semibold truncate max-w-[200px]">{tierLabel}</span>
                </div>

                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>BASE_FEE:</span>
                  <span className="text-white">{baseAmount}.00 PLN</span>
                </div>

                {discountInfo.percent > 0 && (
                  <div className="flex items-center justify-between text-[#10B981]">
                    <span>MEMBERSHIP_DISCOUNT:</span>
                    <span>-{discountInfo.percent}% ({discountInfo.tag})</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2.5 border-t border-[#1F242D] text-sm">
                  <span className="text-white font-bold">TOTAL_DUE:</span>
                  <span className="text-xl font-extrabold text-[#10B981]">{finalFee} PLN</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#111318] border border-[#1F242D] text-[11px] text-[#94A3B8] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white flex-shrink-0" />
                <span>Płatność kartą, BLIK lub Apple Pay przez szyfrowany kanał Stripe.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={processing}
                  className="flex-1 border-[#1F242D] bg-[#111318] text-[#94A3B8] hover:text-white rounded h-10"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handlePay}
                  disabled={processing}
                  className="flex-1 bg-white hover:bg-slate-200 text-black font-bold rounded h-10"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      PAY {finalFee} PLN
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 text-center font-mono-code"
            >
              <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white mb-1">PAYMENT_SESSION_INITIALIZED</h3>
              <p className="text-xs text-[#64748B]">Redirecting to gateway...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}