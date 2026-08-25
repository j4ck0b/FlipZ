import React, { useState, useEffect } from 'react';
import { flipzApi } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Loader2, 
  ShieldCheck, 
  Terminal, 
  ArrowRight,
  CreditCard,
  Layers,
  Infinity as InfinityIcon,
  Percent,
  Clock,
  Shield
} from "lucide-react";
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

const DEFAULT_PLANS = [
  {
    id: 'plan_free',
    tier: 'free',
    name: 'Collector Free',
    price_monthly: 0,
    listing_limit: 5,
    tag: 'TIER_FREE',
    features: [
      'Limit: do 5 aktywnych ogłoszeń (Kolekcja / Szukam)',
      'Podstawowy silnik matchingu 2-cykli (A ↔ B)',
      'Standardowa kolejka weryfikacji w Hubie',
      'Dostęp do protokołów weryfikacji Escrow'
    ]
  },
  {
    id: 'plan_pro',
    tier: 'pro',
    name: 'Pro Trader',
    price_monthly: 29,
    listing_limit: 30,
    tag: 'TIER_PRO',
    popular: true,
    features: [
      'Limit: do 30 aktywnych ogłoszeń',
      '● -10% stałej zniżki na opłaty serwisowe Escrow',
      '• Standard Escrow: 40,50 zł (zamiast 45 zł)',
      '• Swiss Safe: 62,10 zł (zamiast 69 zł)',
      '• Vault Black: 89,10 zł (zamiast 99 zł)',
      'Natychmiastowe alerty o dopasowaniach matchingu',
      'Odznaka PRO TRADER na profilu i w ofertach'
    ]
  },
  {
    id: 'plan_vault_master',
    tier: 'vault_master',
    name: 'Vault Master',
    price_monthly: 69,
    listing_limit: 0, // unlimited
    tag: 'TIER_VAULT_MASTER',
    features: [
      'Limit: Bez limitu (∞) ogłoszeń w inventory & wishlist',
      '● -20% stałej zniżki na opłaty serwisowe Escrow',
      '• Standard Escrow: 36,00 zł (zamiast 45 zł)',
      '• Swiss Safe: 55,20 zł (zamiast 69 zł)',
      '• Vault Black: 79,20 zł (zamiast 99 zł)',
      'Dedykowany priorytet w kolejce weryfikatorów Hubu',
      'Historia wycen rynkowych i analiza trendów'
    ]
  }
];

export default function SubscriptionPage() {
  useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const u = await flipzApi.auth.me();
      if (u?.id) {
        const { data: profile } = await flipzApi.entities.User.get(u.id).catch(() => ({ data: null }));
        setUser({ ...u, ...profile });
      } else {
        setUser(u);
      }
    };
    loadUser();

    // Check for payment status
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast.success('Subskrypcja aktywowana pomyślnie.');
      window.history.replaceState({}, '', '/subscription');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Płatność anulowana');
      window.history.replaceState({}, '', '/subscription');
    }
  }, []);

  const { data: fetchedPlans = [] } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      try {
        const list = await flipzApi.entities.SubscriptionPlan.list();
        if (list && list.length > 0) return list;
      } catch (e) {
        console.warn('Fallback to local default plans');
      }
      return DEFAULT_PLANS;
    },
  });

  const plans = fetchedPlans.length > 0 ? fetchedPlans : DEFAULT_PLANS;

  const handleSubscribe = async (plan) => {
    if (plan.tier === 'free') {
      toast.info('Jesteś na darmowym planie Collector Free.');
      return;
    }

    setLoading(plan.tier);
    try {
      const response = await flipzApi.functions.invoke('createCheckoutSession', {
        tier: plan.tier,
        amount: plan.price_monthly,
        planName: plan.name
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Brak URL przekierowania');
        setLoading(null);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.error || error.message || 'Błąd tworzenia sesji');
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await flipzApi.functions.invoke('createPortalSession');
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Błąd podczas przekierowywania do portalu');
        setPortalLoading(false);
      }
    } catch (error) {
      console.error('Portal session error:', error);
      toast.error('Błąd ładowania portalu płatności');
      setPortalLoading(false);
    }
  };

  const isCurrentPlan = (tier) => {
    if (!user) return false;
    const currentTier = (user.subscription_tier || 'free').toLowerCase();
    if (currentTier === 'basic' && tier === 'pro') return true;
    if (currentTier === 'premium' && tier === 'vault_master') return true;
    return currentTier === tier;
  };

  return (
    <div className="min-h-screen app-shell vault-grid-bg text-[#F8FAFC] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#1F242D] pb-6 space-y-2">
          <div className="flex items-center gap-2 font-mono-code text-xs text-[#10B981]">
            <Terminal className="w-4 h-4" />
            <span>ACCOUNT_MEMBERSHIP_&_PORTFOLIO_CAPACITY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plany Członkowskie Portfela
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-2xl font-mono-code text-xs">
            Zarządzaj limitami ogłoszeń w kolekcji/wishliście oraz korzystaj ze stałych rabatów na opłaty serwisowe Escrow.
          </p>
        </div>

        {/* Current Active Plan Card */}
        {user && user.subscription_tier && user.subscription_tier !== 'free' && (
          <div className="p-6 rounded border border-[#10B981]/30 bg-[#111318] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono-code text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#10B981] font-bold">CURRENT_ACTIVE_TIER:</span>
                <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40 text-[10px]">
                  {user.subscription_tier.toUpperCase()}
                </Badge>
              </div>
              <p className="text-white text-base font-bold">
                {user.subscription_tier === 'vault_master' || user.subscription_tier === 'premium'
                  ? 'Vault Master (∞ ogłoszeń, -20% Escrow)'
                  : 'Pro Trader (30 ogłoszeń, -10% Escrow)'}
              </p>
              {user.subscription_expiry_date && (
                <p className="text-[#64748B] text-[11px] mt-1">
                  Ważność: {new Date(user.subscription_expiry_date).toLocaleDateString('pl-PL')}
                </p>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="border-[#1F242D] bg-[#161922] text-[#94A3B8] hover:text-white rounded h-9 px-4 text-xs font-mono-code"
            >
              {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <CreditCard className="w-3.5 h-3.5 mr-2 text-[#10B981]" />}
              MANAGE_STRIPE_SUBSCRIPTION
            </Button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.tier);
            const isPro = plan.tier === 'pro' || plan.tier === 'basic';
            const isVault = plan.tier === 'vault_master' || plan.tier === 'premium';
            
            return (
              <div 
                key={plan.id || plan.tier}
                className={`p-6 rounded border flex flex-col justify-between space-y-6 ${
                  isCurrent 
                    ? 'border-[#10B981] bg-[#161922]' 
                    : isPro 
                    ? 'border-white bg-[#161922]' 
                    : 'border-[#1F242D] bg-[#111318]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="text-[#64748B]">{plan.tag || `TIER_${plan.tier.toUpperCase()}`}</span>
                    {isCurrent && (
                      <span className="text-[#10B981] font-bold">● ACTIVE</span>
                    )}
                    {plan.popular && !isCurrent && (
                      <span className="text-white font-bold">● RECOMMENDED</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1 font-mono-code">
                      <span className="text-3xl font-extrabold text-white">{plan.price_monthly} zł</span>
                      <span className="text-xs text-[#94A3B8]"> / miesiąc</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0D0F14] border border-[#1F242D] font-mono-code text-xs">
                    <span className="text-[#64748B]">CAPACITY: </span>
                    <span className="text-white font-bold">
                      {plan.listing_limit === 0 || plan.trade_limit === 0
                        ? 'UNLIMITED (∞)'
                        : `${plan.listing_limit || plan.trade_limit} ACTIVE LISTINGS`}
                    </span>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-[#1F242D] text-xs font-mono-code text-[#CBD5E1]">
                    {(plan.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.tier || isCurrent || plan.tier === 'free'}
                  className={`w-full h-10 rounded font-mono-code text-xs font-bold ${
                    isCurrent
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 cursor-default'
                      : plan.tier === 'free'
                      ? 'bg-[#111318] text-[#64748B] border border-[#1F242D] cursor-default'
                      : isPro
                      ? 'bg-white hover:bg-slate-200 text-black'
                      : 'bg-[#161922] hover:bg-[#1F242D] text-white border border-[#1F242D]'
                  }`}
                >
                  {loading === plan.tier ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      INITIALIZING...
                    </>
                  ) : isCurrent ? (
                    'CURRENT_ACTIVE_PLAN'
                  ) : plan.tier === 'free' ? (
                    'DEFAULT_FREE_TIER'
                  ) : (
                    `ACTIVATE ${plan.name.toUpperCase()}`
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}