import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Eye, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function InspectionReviewModal({ open, onClose, tradeOffer, userRole, onSuccess }) {
  const [accepting, setAccepting] = useState(false);

  const isSender = userRole === 'sender';
  const myPackage = isSender ? 'owner' : 'sender';
  const theirPackage = isSender ? 'sender' : 'owner';

  const myPhotos = tradeOffer[`hub_photos_${myPackage}_package`] || [];
  const theirPhotos = tradeOffer[`hub_photos_${theirPackage}_package`] || [];
  const myNotes = tradeOffer[`hub_notes_${myPackage}`];
  const theirNotes = tradeOffer[`hub_notes_${theirPackage}`];
  const myVerification = tradeOffer[`hub_verification_${myPackage}`];
  const theirVerification = tradeOffer[`hub_verification_${theirPackage}`];

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

      await base44.entities.TradeOffer.update(tradeOffer.id, updates);
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Package You'll Receive</h3>
                <Badge className={
                  myVerification === 'passed' ? 'bg-green-100 text-green-700' :
                  myVerification === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }>
                  {myVerification}
                </Badge>
              </div>

              {myNotes && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-1">Moderator Notes:</p>
                  <p className="text-sm text-slate-600">{myNotes}</p>
                </div>
              )}

              {myPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {myPhotos.map((photo, idx) => (
                    <motion.img
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      src={photo}
                      alt={`Inspection ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No photos available</p>
              )}
            </CardContent>
          </Card>

          {/* Your Package */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Your Package (Being Sent)</h3>
                <Badge className={
                  theirVerification === 'passed' ? 'bg-green-100 text-green-700' :
                  theirVerification === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }>
                  {theirVerification}
                </Badge>
              </div>

              {theirNotes && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-1">Moderator Notes:</p>
                  <p className="text-sm text-slate-600">{theirNotes}</p>
                </div>
              )}

              {theirPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {theirPhotos.map((photo, idx) => (
                    <motion.img
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      src={photo}
                      alt={`Your package ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No photos available</p>
              )}
            </CardContent>
          </Card>

          {/* Warning if failed */}
          {(myVerification === 'failed' || theirVerification === 'failed') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Verification Failed</p>
                  <p className="text-sm text-red-700">
                    One or both packages failed verification. Both packages will be returned to their original senders.
                    {tradeOffer.escrow_mode === 'full' && ' All escrowed funds will be refunded.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success message */}
          {myVerification === 'passed' && theirVerification === 'passed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">Verification Passed</p>
                  <p className="text-sm text-green-700">
                    Both packages passed verification. After both parties accept, packages will be cross-shipped to final destinations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Review Later
          </Button>
          {myVerification === 'passed' && theirVerification === 'passed' && (
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