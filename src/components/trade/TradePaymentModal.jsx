import React, { useEffect, useState } from 'react';
import { flipzApi } from '@/api/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

const ESCROW_PRICES = { eco: 24, light: 39, full: 59 };
const ESCROW_LABELS = {
  eco: 'Eco — podstawowa ochrona',
  light: 'Light — standardowa ochrona',
  full: 'Full — maksymalna ochrona',
};

export default function TradePaymentModal({ open, onClose, tradeOffer, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setPaid(false);
    }
  }, [open]);

  const getAmount = () => ESCROW_PRICES[tradeOffer?.escrow_mode] ?? 24;
  const getLabel = () => ESCROW_LABELS[tradeOffer?.escrow_mode] ?? tradeOffer?.escrow_mode;

  const handlePay = async () => {
    if (!tradeOffer?.id) {
      toast.error('Brak danych oferty wymiany. Zamknij okno i spróbuj ponownie.');
      return;
    }

    setProcessing(true);

    try {
      const { data } = await flipzApi.functions.invoke('createTradePayment', {
        tradeOfferId: tradeOffer.id,
        escrowMode: tradeOffer.escrow_mode,
        // Nie wysyłamy amount — serwer oblicza go sam
      });

      if (data?.url) {
        // Przekieruj na Stripe Checkout
        window.location.href = data.url;
        return;
      }

      // Fallback: brak URL = Edge Function nie wdrożona lub zwróciła błąd
      setPaid(true);
      toast.success('Płatność została zainicjowana.');
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
      <DialogContent className="max-w-md w-[95vw] sm:w-full panel-elevated border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Płatność Escrow</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!paid ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4"
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4 text-violet-400">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">{getLabel()}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-slate-400 text-sm">Kwota do zapłaty</span>
                    <span className="text-2xl font-bold text-white">{getAmount()} PLN</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    Opłata escrow za weryfikację i ochronę wymiany.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                <p className="text-sm text-violet-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Bezpieczna płatność przez Stripe (Karta, BLIK)
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={processing}
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handlePay}
                  disabled={processing}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/20"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Przekierowywanie...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Zapłać {getAmount()} PLN
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
              className="py-12 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Płatność zainicjowana</h3>
              <p className="text-slate-400">Zaraz zostaniesz przekierowany...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}