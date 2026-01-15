import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Zap, 
  Shield,
  TrendingUp,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function SubscriptionPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
    };
    loadUser();
  }, []);

  const { data: plans = [] } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => base44.entities.SubscriptionPlan.list(),
  });

  const handleSubscribe = async (plan) => {
    if (!plan.stripe_price_id) {
      toast.error('Ten plan nie jest jeszcze dostępny');
      return;
    }

    setLoading(plan.tier);
    try {
      const { data } = await base44.functions.invoke('createCheckoutSession', {
        priceId: plan.stripe_price_id,
        tier: plan.tier
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Błąd podczas tworzenia sesji płatności');
      setLoading(null);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'free': return Shield;
      case 'basic': return Zap;
      case 'premium': return Crown;
      default: return Shield;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'free': return 'from-slate-500 to-slate-600';
      case 'basic': return 'from-blue-500 to-indigo-600';
      case 'premium': return 'from-violet-500 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const isCurrentPlan = (tier) => {
    if (!user) return false;
    const currentTier = user.subscription_tier || 'free';
    return currentTier === tier;
  };

  const isExpired = () => {
    if (!user?.subscription_expiry_date) return false;
    return new Date(user.subscription_expiry_date) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-violet-600 mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">Subskrypcje</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Wybierz plan dla siebie
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Zwiększ limity wymian i uzyskaj dostęp do dodatkowych funkcji premium
          </p>
        </div>

        {/* Current Plan Status */}
        {user && user.subscription_tier !== 'free' && (
          <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    Aktywny plan: {user.subscription_tier === 'basic' ? 'Basic' : 'Premium'}
                  </h3>
                  {user.subscription_expiry_date && (
                    <p className="text-sm text-slate-600">
                      {isExpired() ? 'Wygasł' : 'Ważny do'}: {new Date(user.subscription_expiry_date).toLocaleDateString('pl-PL')}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">
                    Wymiany w tym miesiącu: {user.trade_count_current_month || 0}
                  </p>
                </div>
                <Crown className="w-12 h-12 text-violet-600" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = getTierIcon(plan.tier);
            const isCurrent = isCurrentPlan(plan.tier);
            
            return (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden transition-all hover:shadow-xl ${
                  plan.popular ? 'border-2 border-violet-500 shadow-lg scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    NAJPOPULARNIEJSZY
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-green-600 text-white px-4 py-1 text-xs font-semibold rounded-br-lg">
                    AKTYWNY
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${getTierColor(plan.tier)} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price_monthly} zł</span>
                    <span className="text-slate-600">/miesiąc</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.trade_limit === 0 ? 'Nielimitowane' : `${plan.trade_limit}`} wymiany/miesiąc
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading === plan.tier || isCurrent || plan.tier === 'free'}
                    className={`w-full ${
                      plan.tier === 'free' 
                        ? 'bg-slate-600 hover:bg-slate-700' 
                        : `bg-gradient-to-r ${getTierColor(plan.tier)} hover:opacity-90`
                    }`}
                  >
                    {loading === plan.tier ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Przekierowywanie...
                      </>
                    ) : isCurrent ? (
                      'Aktualny plan'
                    ) : plan.tier === 'free' ? (
                      'Darmowy plan'
                    ) : (
                      'Wybierz plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Dlaczego warto wybrać plan premium?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Więcej wymian</h3>
                <p className="text-sm text-slate-300">
                  Zwiększ swoje możliwości handlowe z wyższymi limitami
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Priorytetowa ochrona</h3>
                <p className="text-sm text-slate-300">
                  Dostęp do zaawansowanych opcji weryfikacji i bezpieczeństwa
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Ekskluzywne funkcje</h3>
                <p className="text-sm text-slate-300">
                  Odznaki premium i dostęp do nowych funkcji jako pierwszy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}