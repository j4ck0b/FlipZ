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
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

          const { data: conversationsData } = await supabase
            .from('trade_conversations')
            .select('id', { count: 'exact' })
            .or(`owner_id.eq.${user.id},participant_id.eq.${user.id}`);

          const { data: tradesData } = await supabase
            .from('trades')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('status', 'completed');

          setStats({
            totalOffers: offersData?.length || 0,
            activeConversations: conversationsData?.length || 0,
            completedTrades: tradesData?.length || 0
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Witaj, {profile?.username || user?.email?.split('@')[0] || 'Kolekcjonerze'}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Zarządzaj swoimi wymianami i poszerzaj swoją kolekcję
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Twoje ogłoszenia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.totalOffers}</div>
                <p className="text-xs text-slate-500 mt-1">Aktywnych ofert</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Konwersacje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.activeConversations}</div>
                <p className="text-xs text-slate-500 mt-1">Aktywnych czatów</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Zrealizowane</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.completedTrades}</div>
                <p className="text-xs text-slate-500 mt-1">Udanych wymian</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Kategorie</h2>
            <Button variant="ghost" className="gap-2">
              Zobacz wszystkie <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.path} to={category.path}>
                  <Card className="hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-violet-200">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="group-hover:text-violet-600 transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full gap-2 group-hover:bg-violet-50">
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
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Gotowy na wymianę?</h3>
              <p className="text-violet-100">
                Wystaw swoje przedmioty i znajdź coś dla siebie
              </p>
            </div>
            <Button size="lg" variant="secondary" className="gap-2 whitespace-nowrap">
              <TrendingUp className="w-5 h-5" />
              Wystaw ogłoszenie
            </Button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Wskazówka</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">
                Dodaj więcej zdjęć do swoich ogłoszeń - przedmioty ze zdjęciami są wymieniane 3x częściej!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">🎯 Subskrypcja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-green-800">
                Masz tylko <strong>{profile?.trade_count_current_month || 0}</strong> z <strong>3</strong> darmowych wymian w tym miesiącu.
              </p>
              <Link to="/subscription">
                <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-100">
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
