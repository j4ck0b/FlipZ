import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Search, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth, supabase } from '../lib/AuthContext';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [statsData, setStatsData] = useState({
    offersCount: 0,
    convsCount: 0,
    verifiedCount: 0,
    activeListingsCount: 0
  });

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      try {
        const email = user?.email;
        const userId = user?.id;

        const { count: listingsCount } = await supabase
          .from('card_listings')
          .select('id', { count: 'exact', head: true })
          .or(`created_by.eq.${userId},created_by_id.eq.${userId},user_email.eq.${email}`);

        const { count: offersCount } = await supabase
          .from('trade_offers')
          .select('id', { count: 'exact', head: true })
          .or(`sender_email.eq.${email},owner_email.eq.${email}`)
          .eq('status', 'pending');

        const { count: convsCount } = await supabase
          .from('trade_conversations')
          .select('id', { count: 'exact', head: true })
          .or(`participant_1_email.eq.${email},participant_2_email.eq.${email}`);

        const { count: completedCount } = await supabase
          .from('trade_offers')
          .select('id', { count: 'exact', head: true })
          .or(`sender_email.eq.${email},owner_email.eq.${email}`)
          .eq('status', 'completed');

        setStatsData({
          offersCount: offersCount || 0,
          convsCount: convsCount || 0,
          verifiedCount: completedCount || 0,
          activeListingsCount: listingsCount || 0
        });
      } catch (e) {
        console.error('Error fetching dashboard counts:', e);
      }
    };
    fetchCounts();
  }, [user]);

  const currentTier = (profile?.subscription_tier || user?.subscription_tier || 'free').toLowerCase();
  const planLabel = currentTier === 'vault_master' || currentTier === 'premium' 
    ? 'Plan Vault Master' 
    : currentTier === 'pro' || currentTier === 'basic' 
    ? 'Plan Pro Trader' 
    : 'Plan Free';

  const maxSlots = currentTier === 'vault_master' || currentTier === 'premium' 
    ? '∞' 
    : currentTier === 'pro' || currentTier === 'basic' 
    ? '30' 
    : '5';

  const username = profile?.username || user?.email?.split('@')[0] || 'kolekcjoner';
  const initials = username.substring(0, 2).toUpperCase();

  const stats = [
    { label: 'Oczekujące oferty', value: String(statsData.offersCount), icon: Layers },
    { label: 'Wiadomości', value: String(statsData.convsCount), icon: MessageSquare },
    { label: 'Weryfikacje Hub', value: String(statsData.verifiedCount), icon: CheckCircle2, highlight: true },
  ];

  const categories = [
    { name: 'Pokémon TCG', count: '4 520', path: '/card-exchange' },
    { name: 'Magic: The Gathering', count: '2 840', path: '/card-exchange' },
    { name: 'Sports Cards', count: '1 910', path: '/card-exchange' },
    { name: 'Klocki LEGO', count: '1 430', path: '/brick-exchange' },
    { name: 'Figurki & Statuy', count: '1 120', path: '/figure-exchange' },
    { name: 'Modele & Diecast', count: '850', path: '/diecast-exchange' },
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 antialiased font-sans">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Top Bar: Profil i Plan */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-semibold text-white">
              {initials}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">{username}</h1>
              <p className="text-xs text-zinc-500">{planLabel} • {statsData.activeListingsCount} z {maxSlots} ogłoszeń</p>
            </div>
          </div>

          <Link className="text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3.5 py-1.5 rounded-lg transition" to="/subscription">
            Zarządzaj planem
          </Link>
        </header>

        {/* Metryki */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <span className={`text-2xl font-bold tracking-tight ${stat.highlight ? 'text-emerald-400' : 'text-white'}`}>
                    {stat.value}
                  </span>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">{stat.label}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-zinc-800/50 border border-zinc-700/40 flex items-center justify-center text-zinc-400">
                  <Icon className="w-4 h-4"/>
                </div>
              </div>
            );
          })}
        </section>

        {/* Główne Akcje */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link className="group bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm p-5 rounded-xl flex items-center justify-between transition" to="/my-listings">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Plus className="w-4 h-4"/>
              </div>
              <span>Wystaw przedmiot</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-950 transition"/>
          </Link>

          <Link className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-semibold text-sm p-5 rounded-xl flex items-center justify-between transition" to="/card-exchange">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <Search className="w-4 h-4"/>
              </div>
              <span>Przeglądaj giełdę</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-100 transition"/>
          </Link>
        </section>

        {/* Katalog Giełdy */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Kategorie giełdy</h2>
            <Link className="text-xs text-zinc-400 hover:text-zinc-200 transition" to="/card-exchange">
              Wszystkie →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link 
                className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-xl flex items-center justify-between transition group" 
                key={cat.name} 
                to={cat.path || "/card-exchange"}
              >
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition">
                  {cat.name}
                </span>
                <span className="text-xs text-zinc-400 bg-zinc-800/60 border border-zinc-800 px-2 py-0.5 rounded-md font-mono">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Dyskretny banner gwarancji Swiss Safe */}
        <footer className="border-t border-zinc-800/80 pt-6 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400"/>
            <span>Fizyczna weryfikacja laboratoryjna w Hubie Escrow</span>
          </div>
          <span>Standard Swiss Safe</span>
        </footer>

      </div>
    </div>
  );
}
