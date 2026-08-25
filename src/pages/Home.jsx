import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Boxes,
  Trophy,
  Car,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Shield,
  Clock,
  ArrowRightLeft,
  ChevronRight,
  Search
} from 'lucide-react';

export default function Home() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeConversations: 0,
    completedTrades: 0,
    activeListings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const email = user?.email;
        const userId = user?.id;

        // Liczba aktywnych ogłoszeń użytkownika
        const { count: listingsCount } = await supabase
          .from('card_listings')
          .select('id', { count: 'exact', head: true })
          .or(`created_by.eq.${userId},created_by_id.eq.${userId},user_email.eq.${email}`);

        // Liczba ofert oczekujących
        const { count: offersCount } = await supabase
          .from('trade_offers')
          .select('id', { count: 'exact', head: true })
          .or(`sender_email.eq.${email},owner_email.eq.${email}`)
          .eq('status', 'pending');

        // Liczba konwersacji
        const { count: convsCount } = await supabase
          .from('trade_conversations')
          .select('id', { count: 'exact', head: true })
          .or(`participant_1_email.eq.${email},participant_2_email.eq.${email}`);

        // Liczba zrealizowanych
        const { count: completedCount } = await supabase
          .from('trade_offers')
          .select('id', { count: 'exact', head: true })
          .or(`sender_email.eq.${email},owner_email.eq.${email}`)
          .eq('status', 'completed');

        setStats({
          totalOffers: offersCount || 0,
          activeConversations: convsCount || 0,
          completedTrades: completedCount || 0,
          activeListings: listingsCount || 0
        });
      } catch (error) {
        console.error('Home stats error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const currentTier = (profile?.subscription_tier || user?.subscription_tier || 'free').toLowerCase();
  const slotLimit = currentTier === 'vault_master' || currentTier === 'premium' ? 999999 : currentTier === 'pro' || currentTier === 'basic' ? 30 : 5;
  const isUnlimited = slotLimit > 1000;

  const categories = [
    {
      name: 'Karty Pokémon TCG',
      code: 'POKEMON_TCG',
      path: '/card-exchange',
      icon: Package,
      description: 'Vintage Base Set, Ultra Rare, Graded PSA/CGC',
      activeCount: '4,500+'
    },
    {
      name: 'Magic: The Gathering',
      code: 'MTG_COLLECTIBLE',
      path: '/card-exchange',
      icon: Sparkles,
      description: 'Alpha, Reserved List, Commander Staples',
      activeCount: '2,800+'
    },
    {
      name: 'Sports Cards',
      code: 'SPORTS_MEMORABILIA',
      path: '/card-exchange',
      icon: Trophy,
      description: 'NBA, Panini Prizm, Topps Chrome RC',
      activeCount: '1,900+'
    },
    {
      name: 'Klocki & Zestawy LEGO',
      code: 'LEGO_SETS',
      path: '/brick-exchange',
      icon: Boxes,
      description: 'Unikaty, Star Wars UCS, Modular Buildings',
      activeCount: '1,400+'
    },
    {
      name: 'Figurki & Statuy',
      code: 'FIGURES_COLLECTIBLE',
      path: '/figure-exchange',
      icon: Trophy,
      description: 'Hot Toys, Prime 1, Funko Grail Series',
      activeCount: '1,100+'
    },
    {
      name: 'Diecast & Modele',
      code: 'DIECAST_MODELS',
      path: '/diecast-exchange',
      icon: Car,
      description: 'Hot Wheels RLC, 1:18 AutoArt, BBR Models',
      activeCount: '850+'
    }
  ];

  return (
    <div className="space-y-8 font-mono-code text-xs text-[#94A3B8]">
      {/* Top Welcome & Capacity Status Banner */}
      <div className="p-6 rounded border border-[#1F242D] bg-[#111318] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono-code">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#10B981] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>ACCOUNT_AUTHENTICATED: {user?.email}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Terminal Kolekcjonera: {profile?.username || user?.email?.split('@')[0]}
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Zarządzaj ofertami wymiany, śledź przesyłki w Hubie i monitoruj łańcuch dowodowy SHA-256.
          </p>
        </div>

        {/* Slot capacity meter */}
        <div className="p-3.5 rounded bg-[#0D0F14] border border-[#1F242D] space-y-1.5 w-full md:w-64">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64748B]">PORTFOLIO_CAPACITY:</span>
            <span className="text-white font-bold">
              {isUnlimited ? `${stats.activeListings} / ∞` : `${stats.activeListings} / ${slotLimit}`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1F242D] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#10B981] rounded-full" 
              style={{ width: isUnlimited ? '15%' : `${Math.min(100, (stats.activeListings / slotLimit) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
            <span>TIER: {currentTier.toUpperCase()}</span>
            <Link to="/subscription" className="text-[#10B981] hover:underline font-bold">
              UPGRADE →
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded border border-[#1F242D] bg-[#111318] space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-[11px]">
            <span>PENDING_OFFERS</span>
            <ArrowRightLeft className="w-4 h-4 text-white opacity-40" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-code pt-1">
            {stats.totalOffers}
          </div>
          <p className="text-[10px] text-[#64748B]">Oczekujące propozycje wymiany</p>
        </div>

        <div className="p-4 rounded border border-[#1F242D] bg-[#111318] space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-[11px]">
            <span>ACTIVE_CONVERSATIONS</span>
            <MessageSquare className="w-4 h-4 text-white opacity-40" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-code pt-1">
            {stats.activeConversations}
          </div>
          <p className="text-[10px] text-[#64748B]">Otwarte wątki negocjacji</p>
        </div>

        <div className="p-4 rounded border border-[#1F242D] bg-[#111318] space-y-1">
          <div className="flex items-center justify-between text-[#64748B] text-[11px]">
            <span>VERIFIED_TRADES</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-3xl font-extrabold text-[#10B981] font-mono-code pt-1">
            {stats.completedTrades}
          </div>
          <p className="text-[10px] text-[#64748B]">Pomyślnie zrealizowane w Hubie</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => navigate('/my-listings')}
          className="p-5 rounded border border-[#1F242D] bg-[#111318] hover:border-white transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-[#10B981] font-bold uppercase">ACTION_01</span>
            <h3 className="text-sm font-bold text-white">Wystaw przedmioty do wymiany</h3>
            <p className="text-xs text-[#64748B]">Dodaj karty do swojego inventory lub stwórz listę poszukiwanych.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#64748B] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <div 
          onClick={() => navigate('/card-exchange')}
          className="p-5 rounded border border-[#1F242D] bg-[#111318] hover:border-white transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-[#10B981] font-bold uppercase">ACTION_02</span>
            <h3 className="text-sm font-bold text-white">Przeglądaj giełdę i oferty matchingu</h3>
            <p className="text-xs text-[#64748B]">Automatyczny silnik 2-cykli łączy Twoje ogłoszenia z innymi.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#64748B] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Category Directory (Raycast-Style Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F242D]">
          <span className="font-bold text-white text-sm uppercase tracking-wider">Katalog Giełdy Escrow</span>
          <span className="text-[#64748B] text-[11px]">6 KATEGORII AKTYWNYCH</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.path}
                className="p-4 rounded border border-[#1F242D] bg-[#111318] hover:border-[#2E3644] hover:bg-[#161922] transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>{cat.code}</span>
                    <span className="text-[#10B981] font-bold">{cat.activeCount}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#10B981] transition-colors flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#94A3B8]" />
                    {cat.name}
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1F242D] flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>OPEN_DIRECTORY</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
