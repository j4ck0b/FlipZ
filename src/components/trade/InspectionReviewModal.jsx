import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { flipzApi } from '@/api/apiClient';
import { CheckCircle2, Eye, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function InspectionReviewModal({ open, onClose, tradeOffer, userRole, onSuccess }) {
  const [accepting, setAccepting] = useState(false);

  const isSender = userRole === 'sender';
  // User sees what they will RECEIVE (the other person's package)
  const packageIReceive = isSender ? 'owner' : 'sender';
  const packageISend = isSender ? 'sender' : 'owner';

  const photosIReceive = tradeOffer[`hub_photos_${packageIReceive}_package`] || [];
  const photosISend = tradeOffer[`hub_photos_${packageISend}_package`] || [];
  const notesIReceive = tradeOffer[`hub_notes_${packageIReceive}`];
  const notesISend = tradeOffer[`hub_notes_${packageISend}`];
  const verificationIReceive = tradeOffer[`hub_verification_${packageIReceive}`];
  const verificationISend = tradeOffer[`hub_verification_${packageISend}`];

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const field = isSender ? 'sender_inspection_accepted' : 'owner_inspection_accepted';
      const otherAccepted = isSender 
        ? tradeOffer.owner_inspection_accepted 
        : tradeOffer.sender_inspection_accepted;

      const updates = { [field]: true };
      
      // If both accepted, move to shipping
      if (otherAccepted) {
        updates.progress_step = 'shipping_to_users';
      }

      await flipzApi.entities.TradeOffer.update(tradeOffer.id, updates);
      toast.success('Inspection accepted');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to accept inspection');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Hub Inspection Results
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            Review the inspection photos and notes from the Flipz hub verification team
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Package You'll Receive */}
          <Card className="border-2 border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  Co otrzymasz - Inspekcja paczki
                </h3>
                <Badge className={
                  verificationIReceive === 'passed' ? 'bg-green-100 text-green-700' :
                  verificationIReceive === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }>
                  {verificationIReceive === 'passed' ? '✓ Zatwierdzona' : 
                   verificationIReceive === 'failed' ? '✗ Odrzucona' : 
                   '⏳ Oczekuje'}
                </Badge>
              </div>

              {notesIReceive && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-slate-700 mb-1">📝 Notatki moderatora:</p>
                  <p className="text-sm text-slate-600">{notesIReceive}</p>
                </div>
              )}

              {photosIReceive.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {photosIReceive.map((photo, idx) => (
                    <motion.img
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      src={photo}
                      alt={`Otrzymasz ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition border-2 border-emerald-300"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Brak zdjęć inspekcji</p>
              )}
            </CardContent>
          </Card>

          {/* Your Package */}
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">📤</span>
                  Twoja paczka - Inspekcja
                </h3>
                <Badge className={
                  verificationISend === 'passed' ? 'bg-green-100 text-green-700' :
                  verificationISend === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }>
                  {verificationISend === 'passed' ? '✓ Zatwierdzona' : 
                   verificationISend === 'failed' ? '✗ Odrzucona' : 
                   '⏳ Oczekuje'}
                </Badge>
              </div>

              {notesISend && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-slate-700 mb-1">📝 Notatki moderatora:</p>
                  <p className="text-sm text-slate-600">{notesISend}</p>
                </div>
              )}

              {photosISend.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {photosISend.map((photo, idx) => (
                    <motion.img
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      src={photo}
                      alt={`Twoja paczka ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition border-2 border-blue-300"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Brak zdjęć inspekcji</p>
              )}
            </CardContent>
          </Card>

          {/* Warning if failed */}
          {(verificationIReceive === 'failed' || verificationISend === 'failed') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Weryfikacja nie powiodła się</p>
                  <p className="text-sm text-red-700">
                    Jedna lub obie paczki nie przeszły weryfikacji. Obie paczki zostaną zwrócone do pierwotnych nadawców.
                    {tradeOffer.escrow_mode === 'full' && ' Wszystkie środki zostaną zwrócone.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success message */}
          {verificationIReceive === 'passed' && verificationISend === 'passed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">Weryfikacja zakończona sukcesem</p>
                  <p className="text-sm text-green-700">
                    Obie paczki przeszły weryfikację. Po zaakceptowaniu przez obie strony, paczki zostaną wysłane do ostatecznych odbiorców.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Przejrzyj później
          </Button>
          {verificationIReceive === 'passed' && verificationISend === 'passed' && (
            <Button 
              onClick={handleAccept}
              disabled={accepting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept & Continue
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}