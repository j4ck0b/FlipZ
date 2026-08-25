import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Search, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck,
  Package,
  TrendingUp,
  Clock,
  ArrowRightLeft
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
    <div className="space-y-10 font-sans text-on-surface">
      
      {/* Top Bar: Profile & Plan Status */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/40 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-sm font-extrabold text-on-primary shadow-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface tracking-tight">{username}</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                {currentTier}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {planLabel} • {statsData.activeListingsCount} z {maxSlots} aktywnych ogłoszeń
            </p>
          </div>
        </div>

        <Link 
          to="/subscription" 
          className="text-xs font-semibold text-on-surface bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 px-4 py-2 rounded-xl transition shadow-sm self-start sm:self-center"
        >
          Zarządzaj planem
        </Link>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className={`text-3xl font-extrabold tracking-tight ${stat.highlight ? 'text-secondary' : 'text-on-surface'}`}>
                  {stat.value}
                </span>
                <p className="text-xs text-on-surface-variant mt-1 font-medium">{stat.label}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <Icon className="w-5 h-5"/>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link 
          to="/my-listings" 
          className="group bg-primary hover:bg-inverse-surface text-on-primary font-bold text-base p-6 rounded-2xl flex items-center justify-between transition shadow-md transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Plus className="w-5 h-5"/>
            </div>
            <div>
              <div className="text-base font-bold">Wystaw przedmiot</div>
              <div className="text-xs text-white/70 font-normal">Dodaj kartę do swojego inventory</div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-white/70 group-hover:text-white transition"/>
        </Link>

        <Link 
          to="/card-exchange" 
          className="group bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/50 text-on-surface font-bold text-base p-6 rounded-2xl flex items-center justify-between transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Search className="w-5 h-5"/>
            </div>
            <div>
              <div className="text-base font-bold">Przeglądaj giełdę</div>
              <div className="text-xs text-on-surface-variant font-normal">Wyszukuj dopasowania i oferty wymiany</div>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-on-surface-variant group-hover:text-on-surface transition"/>
        </Link>
      </section>

      {/* Category Directory */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Kategorie Giełdy</h2>
          <Link className="text-xs font-semibold text-secondary hover:text-on-secondary-fixed-variant transition" to="/card-exchange">
            Wszystkie →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={cat.path || "/card-exchange"}
              className="bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 hover:border-secondary/40 p-5 rounded-2xl flex items-center justify-between transition group shadow-sm"
            >
              <span className="text-sm font-bold text-on-surface group-hover:text-secondary transition">
                {cat.name}
              </span>
              <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg font-mono font-semibold">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Institutional Guarantee Banner */}
      <footer className="border-t border-outline-variant/30 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-secondary"/>
          <span>Instytucjonalna weryfikacja laboratoryjna w centralnym Hubie Escrow</span>
        </div>
        <span className="font-semibold text-secondary">Protokół FlipCardZ Guaranteed</span>
      </footer>

    </div>
  );
}
