import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

export default function FinalAcceptanceModal({ open, onClose, tradeOffer, onAccept }) {
  const [accepting, setAccepting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCompleted(true);
    
    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Wait a bit then callback
    setTimeout(() => {
      onAccept();
      onClose();
      setCompleted(false);
      setAccepting(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Trade</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-violet-600" />
                </div>
                <p className="text-slate-600">
                  Are you ready to finalize this trade?
                </p>
                <p className="text-sm text-slate-500">
                  Trading <span className="font-semibold">{tradeOffer?.requested_card_title}</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  ⚠️ Once confirmed, this trade will be marked as complete and cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={accepting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAccept}
                  disabled={accepting}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    'Ultimately Accept Trade'
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Trade Complete! 🎉</h3>
              <p className="text-slate-600">Congratulations on your successful trade!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}