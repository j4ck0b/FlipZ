import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowRightLeft, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from 'canvas-confetti';

export default function FinalizeTradeModal({ open, onClose, tradeOffer, onSuccess }) {
  const [finalizing, setFinalizing] = useState(false);

  const handleFinalize = async () => {
    setFinalizing(true);

    try {
      // Update trade offer to completed
      await base44.entities.TradeOffer.update(tradeOffer.id, {
        status: 'completed'
      });

      // Update all involved cards to traded status
      await base44.entities.CardListing.update(tradeOffer.requested_card_id, {
        status: 'traded',
        trade_count: (tradeOffer.trade_count || 0) + 1
      });

      for (const cardId of tradeOffer.offered_card_ids) {
        await base44.entities.CardListing.update(cardId, {
          status: 'traded'
        });
      }

      // Update conversation status
      const convs = await base44.entities.TradeConversation.filter({
        trade_offer_id: tradeOffer.id
      });
      if (convs[0]) {
        await base44.entities.TradeConversation.update(convs[0].id, {
          status: 'completed'
        });

        // Add completion message
        await base44.entities.Message.create({
          conversation_id: convs[0].id,
          sender_email: 'system',
          sender_name: 'System',
          message_type: 'system',
          content: '✨ Trade completed successfully!',
          read: false
        });
      }

      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Trade completed! 🎉');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to finalize trade');
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Finalize Trade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Ready to Complete?
            </h3>
            <p className="text-sm text-slate-600">
              This will mark the trade as completed and update all card statuses.
            </p>
          </div>

          <Separator />

          {/* Trade Summary */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">
                Trading for:
              </p>
              <Badge variant="outline" className="text-sm">
                {tradeOffer?.requested_card_title}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">
                Offering:
              </p>
              <div className="flex flex-wrap gap-2">
                {tradeOffer?.offered_cards_info?.map((card) => (
                  <Badge key={card.id} variant="outline" className="text-sm">
                    {card.title}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Next Steps:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Exchange shipping information</li>
                  <li>• Package items securely</li>
                  <li>• Send with tracking</li>
                  <li>• Confirm receipt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={finalizing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFinalize}
            disabled={finalizing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {finalizing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Complete Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}