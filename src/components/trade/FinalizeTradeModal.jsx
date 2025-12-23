import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Truck, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function FinalizeTradeModal({ open, onClose, tradeOffer, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const handleFinalize = async () => {
    setProcessing(true);

    try {
      // Update trade offer status
      await base44.entities.TradeOffer.update(tradeOffer.id, {
        status: 'active'
      });

      // Update all involved card listings
      await base44.entities.CardListing.update(tradeOffer.requested_card_id, {
        status: 'pending'
      });

      for (const cardId of tradeOffer.offered_card_ids) {
        await base44.entities.CardListing.update(cardId, {
          status: 'pending'
        });
      }

      // Send system message to conversation
      const conversations = await base44.entities.TradeConversation.filter({
        trade_offer_id: tradeOffer.id
      });

      if (conversations.length > 0) {
        await base44.entities.Message.create({
          conversation_id: conversations[0].id,
          sender_email: 'system',
          sender_name: 'System',
          message_type: 'system',
          content: 'Trade accepted! Exchange your shipping details to complete the trade.',
          read: false
        });
      }

      toast.success('Trade activated! Coordinate shipping in the chat.');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to finalize trade');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Finalize Trade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Trade Summary */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Trade Summary</h3>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">You're getting:</p>
                <p className="font-medium text-slate-900">{tradeOffer?.requested_card_title}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500">You're giving:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tradeOffer?.offered_cards_info?.map((card) => (
                    <Badge key={card.id} variant="outline" className="text-xs">
                      {card.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Next Steps</h3>
            <div className="space-y-3">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">Exchange Addresses</p>
                  <p className="text-xs text-slate-600">Share shipping addresses in the chat</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">Package Items</p>
                  <p className="text-xs text-slate-600">Securely pack your collectibles</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">Ship & Track</p>
                  <p className="text-xs text-slate-600">Send items and share tracking numbers</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800">
              <strong>Important:</strong> Both parties are responsible for shipping their items. 
              Use the chat to coordinate and share tracking information.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleFinalize}
            disabled={processing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Activate Trade
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}