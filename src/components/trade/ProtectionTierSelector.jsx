import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Shield, Zap, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";

const protectionTiers = [
  {
    id: 'basic',
    name: 'Basic Protection',
    price: 0,
    icon: Shield,
    color: 'from-slate-500 to-slate-600',
    features: [
      'Trade confirmation',
      'Basic support'
    ]
  },
  {
    id: 'secure',
    name: 'Secure Trade',
    price: 15,
    icon: Zap,
    color: 'from-violet-500 to-purple-600',
    badge: 'Popular',
    features: [
      'Everything in Basic',
      'Trade verification',
      'Shipping deadlines',
      'Strike protection',
      'Priority support'
    ]
  },
  {
    id: 'collector',
    name: 'Collector Protection',
    price: 29,
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    badge: 'Best Value',
    features: [
      'Everything in Secure',
      'Delivery confirmation',
      'Trade mediation',
      'Reputation boost',
      'Premium support'
    ]
  }
];

export default function ProtectionTierSelector({ open, onClose, tradeOffer, userEmail, onSuccess }) {
  const [selectedTier, setSelectedTier] = useState('secure');
  const [processing, setProcessing] = useState(false);

  const LABELS_FEE = 29;

  // Check if Basic Protection should be disabled (2+ items)
  const itemCount = tradeOffer?.offered_card_ids?.length || 0;
  const isBasicDisabled = itemCount >= 2;

  const handleActivateTrade = async () => {
    setProcessing(true);

    const tier = protectionTiers.find(t => t.id === selectedTier);
    const totalAmount = LABELS_FEE + tier.price;

    await base44.entities.TradePayment.create({
      trade_offer_id: tradeOffer.id,
      user_email: userEmail,
      labels_fee: LABELS_FEE,
      protection_tier: selectedTier,
      protection_fee: tier.price,
      total_amount: totalAmount,
      payment_status: 'completed',
      payment_date: new Date().toISOString()
    });

    // Check if both users paid
    const allPayments = await base44.entities.TradePayment.filter({
      trade_offer_id: tradeOffer.id,
      payment_status: 'completed'
    });

    if (allPayments.length === 2) {
      // Both paid - activate trade
      await base44.entities.TradeOffer.update(tradeOffer.id, {
        status: 'active',
        both_paid: true,
        addresses_unlocked: true
      });

      // Create shipping labels
      const users = await base44.entities.User.filter({
        email: { $in: [tradeOffer.owner_email, tradeOffer.sender_email] }
      });

      const owner = users.find(u => u.email === tradeOffer.owner_email);
      const sender = users.find(u => u.email === tradeOffer.sender_email);

      // Label for owner to send to sender
      await base44.entities.ShippingLabel.create({
        trade_offer_id: tradeOffer.id,
        sender_email: tradeOffer.owner_email,
        recipient_email: tradeOffer.sender_email,
        sender_address: owner?.shipping_address || 'Not provided',
        recipient_address: sender?.shipping_address || 'Not provided',
        shipping_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      });

      // Label for sender to send to owner
      await base44.entities.ShippingLabel.create({
        trade_offer_id: tradeOffer.id,
        sender_email: tradeOffer.sender_email,
        recipient_email: tradeOffer.owner_email,
        sender_address: sender?.shipping_address || 'Not provided',
        recipient_address: owner?.shipping_address || 'Not provided',
        shipping_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      });

      // System message
      const conversations = await base44.entities.TradeConversation.filter({
        trade_offer_id: tradeOffer.id
      });

      if (conversations.length > 0) {
        await base44.entities.Message.create({
          conversation_id: conversations[0].id,
          sender_email: 'system',
          sender_name: 'System',
          message_type: 'system',
          content: 'Trade activated! Shipping addresses unlocked.',
          read: false
        });
      }

      toast.success('Trade activated! Addresses unlocked.');
    } else {
      await base44.entities.TradeOffer.update(tradeOffer.id, {
        status: 'payment_required'
      });

      toast.success('Payment complete! Waiting for other party.');
    }

    setProcessing(false);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Activate Trade & Select Protection</DialogTitle>
          <p className="text-slate-600 mt-2">
            Choose your protection level and secure shipping labels
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Labels Fee */}
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-violet-900">Shipping Labels Fee</h3>
                <p className="text-sm text-violet-700 mt-1">Required for both parties</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-violet-900">{LABELS_FEE} zł</p>
              </div>
            </div>
          </div>

          {/* Protection Tiers */}
          {itemCount >= 2 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-amber-900">
                ⚠️ <span className="font-semibold">Więcej niż 1 przedmiot</span> - Basic Protection jest niedostępne. Wybierz wyższą ochronę.
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            {protectionTiers.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;
              const isDisabled = isBasicDisabled && tier.id === 'basic';

              return (
                <motion.div
                  key={tier.id}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                >
                  <Card
                    onClick={() => !isDisabled && setSelectedTier(tier.id)}
                    className={`transition-all ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                        : `cursor-pointer ${
                          isSelected
                            ? 'border-violet-500 border-2 shadow-lg'
                            : 'border-slate-200 hover:border-violet-300'
                          }`
                    }`}
                  >
                    <CardContent className="p-6">
                      {isDisabled && (
                        <Badge className="mb-3 bg-red-100 text-red-700">
                          Niedostępne
                        </Badge>
                      )}
                      {tier.badge && !isDisabled && (
                        <Badge className="mb-3 bg-violet-100 text-violet-700">
                          {tier.badge}
                        </Badge>
                      )}

                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
                      <p className="text-3xl font-bold text-slate-900 mb-4">
                        {tier.price === 0 ? 'FREE' : `+${tier.price} zł`}
                      </p>

                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isSelected && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-center gap-2 text-violet-600 font-medium">
                            <Check className="w-5 h-5" />
                            Selected
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Total */}
          <div className="bg-slate-900 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Shipping Labels</span>
              <span className="font-semibold">{LABELS_FEE} zł</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">Protection Tier</span>
              <span className="font-semibold">
                {protectionTiers.find(t => t.id === selectedTier)?.price === 0
                  ? 'FREE'
                  : `+${protectionTiers.find(t => t.id === selectedTier)?.price} zł`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-xl font-bold">Total Amount</span>
              <span className="text-3xl font-bold">
                {LABELS_FEE + protectionTiers.find(t => t.id === selectedTier)?.price} zł
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleActivateTrade}
            disabled={processing || (isBasicDisabled && selectedTier === 'basic')}
            className="w-full h-14 text-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Activate Trade & Secure Exchange
              </>
            )}
          </Button>

          <p className="text-center text-sm text-slate-500">
            By activating, you agree to ship within 5 days of activation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}