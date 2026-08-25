import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Search, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck,
  ArrowLeftRight
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
    <div className="min-h-screen bg-[#0D1117] text-slate-100 antialiased font-sans -m-6 p-6 sm:p-10 space-y-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Top Bar: Profil i Plan */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-600 border border-rose-500/40 flex items-center justify-center text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">{username}</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-600/10 text-rose-400 border border-rose-600/20 font-bold uppercase">
                  {currentTier}
                </span>
              </div>
              <p className="text-xs text-slate-400">{planLabel} • {statsData.activeListingsCount} z {maxSlots} ogłoszeń</p>
            </div>
          </div>

          <Link className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 rounded-lg transition" to="/subscription">
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
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <span className={`text-2xl font-extrabold tracking-tight ${stat.highlight ? 'text-rose-500' : 'text-white'}`}>
                    {stat.value}
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Icon className="w-4 h-4"/>
                </div>
              </div>
            );
          })}
        </section>

        {/* Główne Akcje */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link className="group bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm p-5 rounded-xl flex items-center justify-between transition shadow-lg shadow-rose-950/30" to="/my-listings">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white text-slate-950 flex items-center justify-center">
                <Plus className="w-4 h-4"/>
              </div>
              <span>Wystaw przedmiot do Trade-in</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition"/>
          </Link>

          <Link className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 font-semibold text-sm p-5 rounded-xl flex items-center justify-between transition" to="/card-exchange">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Search className="w-4 h-4"/>
              </div>
              <span>Przeglądaj giełdę</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-100 transition"/>
          </Link>
        </section>

        {/* Katalog Giełdy */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kategorie trade-in</h2>
            <Link className="text-xs text-slate-400 hover:text-slate-200 transition" to="/card-exchange">
              Wszystkie →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link 
                className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center justify-between transition group" 
                key={cat.name} 
                to={cat.path || "/card-exchange"}
              >
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition">
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-md font-mono">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Dyskretny banner gwarancji Swiss Safe */}
        <footer className="border-t border-slate-800 pt-6 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-500"/>
            <span>Certyfikowana weryfikacja fizyczna w Hubie Escrow</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">STANDARD PSA & MPB TRADE-IN</span>
        </footer>

      </div>
    </div>
  );
}
