import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Boxes,
  Trophy,
  Car,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
export default function Home() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeConversations: 0,
    completedTrades: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Spróbuj pobrać statystyki (może nie będzie tabel, wtedy skip)
        try {
          const { data: offersData } = await supabase
            .from('trade_offers')
            .select('id', { count: 'exact' })
            .or(`sender_email.eq.${user.email},owner_email.eq.${user.email}`);
          
          const { data: conversationsData } = await supabase
            .from('trade_conversations')
            .select('id', { count: 'exact' })
            .or(`participant_1_email.eq.${user.email},participant_2_email.eq.${user.email}`);
          
          const { data: completedOffersData } = await supabase
            .from('trade_offers')
            .select('id', { count: 'exact' })
            .or(`sender_email.eq.${user.email},owner_email.eq.${user.email}`)
            .eq('status', 'completed');
          
          setStats({
            totalOffers: offersData?.length || 0,
            activeConversations: conversationsData?.length || 0,
            completedTrades: completedOffersData?.length || 0
          });
        } catch (dbError) {
          // Tabele mogą nie istnieć jeszcze - to OK
          console.log('Brak tabel w bazie (to normalne na początku)');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const categories = [
    {
      name: 'Karty Pokémon',
      path: '/card-exchange',
      icon: Package,
      description: 'Wymieniaj karty kolekcjonerskie',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Klocki LEGO',
      path: '/brick-exchange',
      icon: Boxes,
      description: 'LEGO i inne zestawy',
      color: 'from-red-500 to-orange-500'
    },
    {
      name: 'Figurki',
      path: '/figure-exchange',
      icon: Trophy,
      description: 'Funko Pop, action figures',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Modele Aut',
      path: '/diecast-exchange',
      icon: Car,
      description: 'Hot Wheels, modele kolekcjonerskie',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Kolekcje',
      path: '/collectible-exchange',
      icon: Sparkles,
      description: 'Inne przedmioty kolekcjonerskie',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold section-heading mb-4">
            Witaj, {profile?.username || user?.email?.split('@')[0] || 'Kolekcjonerze'}! 👋
          </h1>
          <p className="text-lg text-slate-200">
            Zarządzaj swoimi wymianami i poszerzaj swoją kolekcję
          </p>
        </div>
        
        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="panel-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-200">Twoje ogłoszenia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-50">{stats.totalOffers}</div>
                <p className="text-xs text-slate-300 mt-1">Aktywnych ofert</p>
              </CardContent>
            </Card>
            <Card className="panel-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-200">Konwersacje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-50">{stats.activeConversations}</div>
                <p className="text-xs text-slate-300 mt-1">Aktywnych czatów</p>
              </CardContent>
            </Card>
            <Card className="panel-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-200">Zrealizowane</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-50">{stats.completedTrades}</div>
                <p className="text-xs text-slate-300 mt-1">Udanych wymian</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold section-heading">Kategorie</h2>
            <Button variant="ghost" className="gap-2 text-slate-200 hover:text-white">
              Zobacz wszystkie <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.path} to={category.path}>
                  <Card className="panel-muted hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-violet-200">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-slate-50 group-hover:text-violet-300 transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-slate-300">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full gap-2 group-hover:bg-violet-500/20 text-slate-200">
                        Przeglądaj <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-violet-600/90 to-purple-600/90 rounded-2xl p-8 text-white shadow-[0_20px_60px_rgba(124,58,237,0.35)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Gotowy na wymianę?</h3>
              <p className="text-violet-100/90">
                Wystaw swoje przedmioty i znajdź coś dla siebie
              </p>
            </div>
            <Link to="/my-listings">
              <Button size="lg" variant="secondary" className="gap-2 whitespace-nowrap bg-slate-900/80 text-white hover:bg-slate-900">
                <TrendingUp className="w-5 h-5" />
                Wystaw ogłoszenie
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="panel-muted border-blue-400/30">
            <CardHeader>
              <CardTitle className="text-blue-200">💡 Wskazówka</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100">
                Dodaj więcej zdjęć do swoich ogłoszeń - przedmioty ze zdjęciami są wymieniane 3x częściej!
              </p>
            </CardContent>
          </Card>
          <Card className="panel-muted border-emerald-400/30">
            <CardHeader>
              <CardTitle className="text-emerald-200">🎯 Subskrypcja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-emerald-100">
                Masz tylko <strong>{profile?.trade_count_current_month || 0}</strong> z <strong>3</strong> darmowych wymian w tym miesiącu.
              </p>
              <Link to="/subscription">
                <Button variant="outline" className="w-full border-emerald-300/40 text-emerald-200 hover:bg-emerald-500/20">
                  Przeglądaj plany Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
