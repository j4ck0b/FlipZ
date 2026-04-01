import React, { useState } from 'react';
import { flipzApi } from '@/api/apiClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Star, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TradeFinalizationModal({ open, onClose, tradeOffer, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [fairnessRating, setFairnessRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await flipzApi.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setSubmitting(true);

    const isSender = tradeOffer.sender_email === currentUser?.email;
    const reviewedEmail = isSender ? tradeOffer.owner_email : tradeOffer.sender_email;

    // Create review
    await flipzApi.entities.TradeReview.create({
      trade_offer_id: tradeOffer.id,
      reviewer_email: currentUser.email,
      reviewed_email: reviewedEmail,
      rating: rating,
      fairness_rating: fairnessRating || rating,
      communication_rating: communicationRating || rating,
      comment: comment
    });

    // Mark trade as completed
    await flipzApi.entities.TradeOffer.update(tradeOffer.id, {
      status: 'completed'
    });

    // Update the traded items status
    await flipzApi.entities.CardListing.update(tradeOffer.requested_card_id, {
      status: 'traded',
      trade_count: (tradeOffer.trade_count || 0) + 1
    });

    for (const cardId of tradeOffer.offered_card_ids) {
      const listings = await flipzApi.entities.CardListing.filter({ id: cardId });
      if (listings[0]) {
        await flipzApi.entities.CardListing.update(cardId, {
          status: 'traded',
          trade_count: (listings[0].trade_count || 0) + 1
        });
      }
    }

    setSubmitting(false);
    toast.success('Trade completed! Thank you for your review.');
    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setRating(0);
    setFairnessRating(0);
    setCommunicationRating(0);
    setComment('');
  };

  const StarRating = ({ value, onChange, label }) => (
    <div>
      <Label className="mb-2 block text-sm">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );

  const isSender = tradeOffer?.sender_email === currentUser?.email;
  const otherParty = isSender ? tradeOffer?.owner_name : tradeOffer?.sender_name;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Complete Trade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Trade Summary */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Trade Summary</h4>
            </div>
            <p className="text-sm text-slate-600">
              Trading with <span className="font-medium">{otherParty}</span>
            </p>
            <p className="text-sm text-slate-600">
              Item: <span className="font-medium">{tradeOffer?.requested_card_title}</span>
            </p>
            {tradeOffer?.offered_card_ids && (
              <p className="text-xs text-slate-500 mt-1">
                {tradeOffer.offered_card_ids.length} item(s) exchanged
              </p>
            )}
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <StarRating
              value={rating}
              onChange={setRating}
              label="Overall Experience"
            />

            <StarRating
              value={fairnessRating}
              onChange={setFairnessRating}
              label="Trade Fairness"
            />

            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
              label="Communication"
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="mb-2 block">
              Review (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this trade..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-900">
              By completing this trade, you confirm that you've received your items and are satisfied with the exchange.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Trade
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}