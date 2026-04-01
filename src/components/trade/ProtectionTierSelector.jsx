import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Shield, Zap, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from '@/lib/AuthContext';
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
    // Validate: 2+ items require higher protection
    if (itemCount >= 2 && selectedTier === 'basic') {
      toast.error('2 lub więcej przedmiotów wymaga wyższej ochrony');
      return;
    }

    setProcessing(true);

    try {
      const tier = protectionTiers.find(t => t.id === selectedTier);
      const totalAmount = LABELS_FEE + tier.price;

      // Wywołaj Edge Function Supabase — Stripe tworzy sesję płatności
      const { data, error } = await supabase.functions.invoke('createTradePayment', {
        body: {
          tradeOfferId: tradeOffer.id,
          escrowMode: selectedTier,
          amount: totalAmount
        }
      });

      if (error) {
        throw new Error(error.message || 'Błąd podczas tworzenia płatności');
      }

      if (data?.url) {
        // Przekieruj na stronę płatności Stripe
        window.location.href = data.url;
      } else {
        throw new Error('Brak URL płatności — sprawdź czy funkcja jest wdrożona w Supabase');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Błąd płatności: ' + (err.message || 'Nieznany błąd'));
      setProcessing(false);
    }
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