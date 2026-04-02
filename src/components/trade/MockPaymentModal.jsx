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

export default function MockPaymentModal({ open, onClose, tradeOffer, onSuccess }) {
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

  const completeFallbackPayment = () => {
    setPaid(true);
    toast.success('Płatność potwierdzona (tryb testowy — Edge Function niedostępna).');
    setTimeout(() => {
      setProcessing(false);
      onSuccess?.();
      onClose();
    }, 900);
  };

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
      completeFallbackPayment();
    } catch (error) {
      console.error('Błąd płatności:', error);
      const message = String(error?.message || error?.name || error?.context?.status || '');

      if (message.includes('not deployed') || message.includes('404') || message.includes('FunctionsFetchError') || message.includes('Failed to send')) {
        // Edge Function niedostępna — fallback dla środowiska deweloperskiego
        completeFallbackPayment();
        return;
      }

      toast.error('Błąd podczas tworzenia sesji płatności. Spróbuj ponownie.');
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">Zapłać za ochronę Escrow</DialogTitle>
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
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-violet-600" />
                    <span className="font-semibold text-slate-700">{getLabel()}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-slate-600">Kwota do zapłaty</span>
                    <span className="text-2xl font-bold text-slate-900">{getAmount()} PLN</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Opłata escrow za weryfikację i ochronę wymiany. Zwrotna w przypadku anulowania przed wysyłką.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <p className="text-sm text-violet-800">
                  💳 Płatność przez Stripe — karta płatnicza lub BLIK
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={processing}
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handlePay}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Płatność zakończona!</h3>
              <p className="text-slate-600">Przechodzę do następnego kroku...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}