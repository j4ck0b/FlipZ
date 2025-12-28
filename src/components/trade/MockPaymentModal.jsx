import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MockPaymentModal({ open, onClose, tradeOffer, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPaid(true);
    setProcessing(false);
    
    // Wait a bit to show success
    setTimeout(() => {
      onSuccess();
      onClose();
      setPaid(false);
    }, 1500);
  };

  const getAmount = () => {
    const prices = { eco: 24, light: 39, full: 59 };
    return prices[tradeOffer?.escrow_mode] || 24;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Payment</DialogTitle>
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600">Escrow Protection</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {tradeOffer?.escrow_mode} Mode
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Amount</span>
                    <span className="text-2xl font-bold text-slate-900">{getAmount()} PLN</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Secure escrow fee for trade verification
                  </p>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💳 This is a simulated payment. In production, this would connect to a real payment gateway.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePay}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay {getAmount()} PLN
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
              <p className="text-slate-600">Moving to next step...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}