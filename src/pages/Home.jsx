import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Package,
  Boxes,
  Trophy,
  Car,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2
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
        const email = user?.email;
        const userId = user?.id;

        // --- SAFE COUNTING LOGIC ---
        // Browser console won't show 400s if we handle errors and avoid problematic schemas

        const getOffersCount = async () => {
          if (!email && !userId) return 0;
          const queries = [
            email ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('sender_email', email).eq('status', 'pending') : null,
            email ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('owner_email', email).eq('status', 'pending') : null,
            userId ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('sender_id', userId).eq('status', 'pending') : null,
            userId ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('owner_id', userId).eq('status', 'pending') : null
          ].filter(Boolean);

          const results = await Promise.all(queries.map(q => q.catch(() => ({ count: 0 }))));
          return results.reduce((acc, curr) => acc + (curr?.count || 0), 0);
        };

        const getConvsCount = async () => {
          if (!email && !userId) return 0;
          const queries = [
            email ? supabase.from('trade_conversations').select('id', { count: 'exact', head: true }).eq('participant_1_email', email) : null,
            email ? supabase.from('trade_conversations').select('id', { count: 'exact', head: true }).eq('participant_2_email', email) : null,
            userId ? supabase.from('trade_conversations').select('id', { count: 'exact', head: true }).eq('participant_1_id', userId) : null,
            userId ? supabase.from('trade_conversations').select('id', { count: 'exact', head: true }).eq('participant_2_id', userId) : null
          ].filter(Boolean);

          const results = await Promise.all(queries.map(q => q.catch(() => ({ count: 0 }))));
          return results.reduce((acc, curr) => acc + (curr?.count || 0), 0);
        };

        const getCompletedCount = async () => {
          if (!email && !userId) return 0;
          const queries = [
            email ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('sender_email', email).eq('status', 'completed') : null,
            email ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('owner_email', email).eq('status', 'completed') : null,
            userId ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('sender_id', userId).eq('status', 'completed') : null,
            userId ? supabase.from('trade_offers').select('id', { count: 'exact', head: true }).eq('owner_id', userId).eq('status', 'completed') : null
          ].filter(Boolean);

          const results = await Promise.all(queries.map(q => q.catch(() => ({ count: 0 }))));
          return results.reduce((acc, curr) => acc + (curr?.count || 0), 0);
        };

        const [totalOffers, activeConversations, completedTrades] = await Promise.all([
          getOffersCount(),
          getConvsCount(),
          getCompletedCount()
        ]);

        setStats({
          totalOffers,
          activeConversations,
          completedTrades
        });
      } catch (error) {
        console.warn('Silent stats fetch error:', error);
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
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
    {
      name: 'Klocki LEGO',
      path: '/brick-exchange',
      icon: Boxes,
      description: 'LEGO i inne zestawy',
      color: 'from-red-500/20 to-orange-500/20',
      iconColor: 'text-orange-400'
    },
    {
      name: 'Figurki',
      path: '/figure-exchange',
      icon: Trophy,
      description: 'Funko Pop, action figures',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-pink-400'
    },
    {
      name: 'Modele Aut',
      path: '/diecast-exchange',
      icon: Car,
      description: 'Hot Wheels, modele kolekcjonerskie',
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      name: 'Kolekcje',
      path: '/collectible-exchange',
      icon: Sparkles,
      description: 'Inne przedmioty kolekcjonerskie',
      color: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-400'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold section-heading mb-4">
            Witaj, {profile?.username || user?.email?.split('@')[0] || 'Kolekcjonerze'}! 👋
          </h1>
          <p className="text-lg text-slate-300">
            Zarządzaj swoimi wymianami i poszerzaj swoją kolekcję
          </p>
        </motion.div>
        
        {/* Stats Cards */}
        {!loading && (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <motion.div variants={item}>
              <Card className="panel-elevated relative overflow-hidden group border-0 ring-1 ring-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-12 h-12" />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Twoje ogłoszenia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalOffers}</div>
                  <div className="flex items-center text-xs text-violet-400">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Aktywnych ofert
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="panel-elevated relative overflow-hidden group border-0 ring-1 ring-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MessageSquare className="w-12 h-12" />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Konwersacje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{stats.activeConversations}</div>
                  <div className="flex items-center text-xs text-blue-400">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Czeka na odpowiedź
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="panel-elevated relative overflow-hidden group border-0 ring-1 ring-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">Zrealizowane</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{stats.completedTrades}</div>
                  <div className="flex items-center text-xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Udanych wymian
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
        
        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-2xl font-bold section-heading">Kategorie</h2>
            <Button variant="ghost" className="gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              Zobacz wszystkie <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.div key={category.path} variants={item}>
                  <Link to={category.path}>
                    <Card className="panel-muted hover:panel-elevated transition-all duration-300 cursor-pointer group border-0 ring-1 ring-white/10 hover:ring-violet-500/50">
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${category.iconColor}`} />
                        </div>
                        <CardTitle className="text-white group-hover:text-violet-400 transition-colors">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 group-hover:text-slate-300 transition-colors">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full gap-2 group-hover:bg-violet-500/10 text-slate-300 group-hover:text-white border-white/5">
                          Przeglądaj <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        {/* Quick Actions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl shadow-violet-900/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-bold mb-2">Gotowy na wymianę?</h3>
              <p className="text-violet-100">
                Wystaw swoje przedmioty i znajdź coś dla siebie w sekundy.
              </p>
            </div>
            <Link to="/my-listings">
              <Button size="lg" variant="secondary" className="gap-2 px-8 py-6 rounded-xl bg-white text-violet-700 hover:bg-violet-50 shadow-xl shadow-black/20 hover:scale-105 transition-all">
                <TrendingUp className="w-5 h-5" />
                Wystaw ogłoszenie
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <Card className="panel-muted ring-1 ring-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Wskazówka
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dodaj więcej zdjęć do swoich ogłoszeń - przedmioty ze zdjęciami są wymieniane <span className="text-blue-300 font-bold">3x częściej</span>!
              </p>
            </CardContent>
          </Card>
          <Card className="panel-muted ring-1 ring-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-emerald-300 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Subskrypcja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                Masz tylko <strong className="text-emerald-300">{profile?.trade_count_current_month || 0}</strong> z <strong className="text-emerald-300">3</strong> darmowych wymian w tym miesiącu.
              </p>
              <Link to="/subscription">
                <Button variant="ghost" className="w-full border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                  Zdobądź nielimitowane wymiany
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
