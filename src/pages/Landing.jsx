import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  Zap,
  Package,
  ArrowRightLeft,
  CheckCircle,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Package,
    title: "Easy Listings",
    description: "List your cards in seconds with our simple upload process"
  },
  {
    icon: ArrowRightLeft,
    title: "Trade or Sell",
    description: "Choose to sell for cash or trade with other collectors"
  },
  {
    icon: ShieldCheck,
    title: "Secure Trading",
    description: "Safe and transparent transactions with verified users"
  },
  {
    icon: Users,
    title: "Active Community",
    description: "Connect with collectors worldwide who share your passion"
  }
];

const stats = [
  { label: "Active Cards", value: "10,000+", icon: Package },
  { label: "Happy Traders", value: "5,000+", icon: Users },
  { label: "Successful Trades", value: "25,000+", icon: CheckCircle },
  { label: "Average Rating", value: "4.9★", icon: Star }
];

const cardCategories = [
  { name: "Pokémon", emoji: "🎴", color: "from-yellow-400 to-red-500" },
  { name: "Magic: The Gathering", emoji: "🧙", color: "from-purple-500 to-pink-500" },
  { name: "Yu-Gi-Oh!", emoji: "👁️", color: "from-blue-500 to-cyan-500" },
  { name: "Sports Cards", emoji: "⚽", color: "from-green-500 to-emerald-500" }
];

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
      
      // Redirect to marketplace if already logged in
      if (authenticated) {
        window.location.href = createPageUrl('Marketplace');
      }
    };
    checkAuth();
  }, []);

  const handleGetStarted = () => {
    base44.auth.redirectToLogin(createPageUrl('Marketplace'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span>CardExchange</span>
          </div>
          <Button onClick={handleGetStarted} variant="outline">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-violet-100 text-violet-700 border-violet-200 px-4 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Live Marketplace
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Buy, Sell & Trade
              <span className="block bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Collectible Cards
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of collectors worldwide. List your cards, discover rare finds, 
              and connect with passionate traders in our vibrant community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 h-14 text-lg shadow-xl shadow-violet-200"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-8 text-lg"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 flex flex-wrap justify-center gap-4"
          >
            {cardCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl mb-2`}>
                      {category.emoji}
                    </div>
                    <p className="font-medium text-slate-900 text-sm">{category.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Icon className="w-8 h-8 mx-auto mb-3 text-violet-600" />
                      <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful tools designed for collectors, by collectors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Start trading in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign Up", description: "Create your free account in seconds" },
              { step: "2", title: "List Your Cards", description: "Upload photos and set your price or trade preferences" },
              { step: "3", title: "Start Trading", description: "Connect with buyers and complete secure transactions" }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="border-2 border-violet-200 shadow-lg h-full">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-violet-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-white" />
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to Start Trading?
                </h2>
                <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
                  Join our community of collectors and find the perfect cards for your collection today.
                </p>
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-white text-violet-600 hover:bg-violet-50 px-8 h-14 text-lg font-semibold shadow-xl"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span>CardExchange</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 CardExchange. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}