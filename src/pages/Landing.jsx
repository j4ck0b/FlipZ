import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  ArrowRight, 
  Package,
  ArrowRightLeft,
  CheckCircle,
  Users,
  Eye,
  Truck,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { name: "Collectible Cards", emoji: "🎴", items: "Pokémon, MTG, Yu-Gi-Oh!, Sports" },
  { name: "LEGO Sets", emoji: "🧱", items: "Minifigures & Sets" },
  { name: "Funko Figures", emoji: "🎭", items: "Pop! & Collectibles" },
  { name: "Hot Wheels & Matchbox", emoji: "🏎️", items: "Diecast Cars" },
  { name: "Sneakers", emoji: "👟", items: "Limited Editions" },
  { name: "Vinyl Records", emoji: "💿", items: "Classic & Modern" },
  { name: "Retro Games", emoji: "🎮", items: "Consoles & Cartridges" }
];

const howItWorks = [
  {
    step: "1",
    title: "Create Agreement",
    description: "Create a trade or sale agreement with another collector",
    icon: ArrowRightLeft
  },
  {
    step: "2",
    title: "Send to Escrow",
    description: "Both parties send items to FlipCardZ secure escrow",
    icon: Package
  },
  {
    step: "3",
    title: "Verification",
    description: "Items are verified for condition and authenticity",
    icon: Eye
  },
  {
    step: "4",
    title: "Safe Delivery",
    description: "Items are safely delivered to their new owners",
    icon: Truck
  }
];

const features = [
  {
    icon: ShieldCheck,
    title: "Escrow Protection",
    description: "Items are secured before exchange, ensuring both parties are protected"
  },
  {
    icon: Eye,
    title: "Verification Process",
    description: "Designed to reduce fraud and disputes with professional verification"
  },
  {
    icon: Sparkles,
    title: "Built for Collectors",
    description: "Tools created specifically for high-value collectibles trading"
  },
  {
    icon: Users,
    title: "Growing Community",
    description: "Connect with passionate collectors worldwide"
  }
];

const pricingTiers = [
  {
    name: "Basic",
    price: "24 PLN",
    description: "Per exchange",
    features: ["Standard escrow protection", "Basic verification", "Standard delivery"]
  },
  {
    name: "Standard",
    price: "35 PLN",
    description: "Per exchange",
    features: ["Enhanced escrow protection", "Detailed verification", "Priority support"],
    popular: true
  },
  {
    name: "Premium",
    price: "59.99 PLN",
    description: "Per exchange",
    features: ["Maximum protection", "Professional authentication", "Premium support", "Insurance included"]
  }
];

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          window.location.replace(createPageUrl('Home'));
          return;
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleGetStarted = () => {
    base44.auth.redirectToLogin(createPageUrl('Home'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693ecc5599cec84236ae4d99/147165ce2_FLIPCARDZ2.png" 
              alt="FlipCardZ" 
              className="w-9 h-9 rounded-xl"
            />
            <span>FlipCardZ</span>
          </div>
          <Button onClick={handleGetStarted} variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-violet-600/20 text-violet-300 border-violet-500/30 px-4 py-1">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Secure Escrow Trading
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Secure Trading for Collectors
              <span className="block bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Who Care About Their Items
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              FlipCardZ.store is a secure escrow-based platform that lets collectors safely buy, sell, 
              and trade valuable items online — without fear of scams or disputes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 h-14 text-lg shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all"
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What You Can Trade on FlipCardZ
            </h2>
            <p className="text-slate-400 text-lg">
              Different collectibles, one secure trading system.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">{category.emoji}</div>
                    <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-slate-400">{category.items}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
              Escrow Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How Secure Trading Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Safety, transparency, and reduced risk at every step
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-slate-800 border-slate-700 h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                        {item.step}
                      </div>
                      <Icon className="w-8 h-8 text-violet-400 mb-3" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why FlipCardZ */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Collectors Choose FlipCardZ
            </h2>
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
                  <Card className="bg-slate-800 border-slate-700 hover:border-violet-500/50 transition-all h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
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

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 text-lg mb-2">
              Free account with limited exchanges
            </p>
            <p className="text-violet-400 text-lg font-semibold">
              Subscription: 20 PLN/month for increased exchange limits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`bg-slate-800 border-slate-700 h-full ${tier.popular ? 'ring-2 ring-violet-500' : ''}`}>
                  <CardContent className="p-8">
                    {tier.popular && (
                      <Badge className="mb-4 bg-violet-600 text-white">Most Popular</Badge>
                    )}
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-slate-400 ml-2">{tier.description}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-slate-400 mt-8">
            No hidden fees. Pay only when you trade.
          </p>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-violet-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built on Trust, Powered by Community
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Trust is essential in collectibles trading. FlipCardZ is designed to protect both sides 
              of every trade with community moderation and verified processes, ensuring a safe marketplace 
              for passionate collectors.
            </p>
          </motion.div>
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
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Start Trading With Confidence
                </h2>
                <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
                  Join our community and experience secure, verified trading for your valuable collectibles.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-white text-black hover:bg-slate-100 px-8 h-14 text-lg font-semibold shadow-xl transition-all"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    onClick={handleGetStarted}
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white hover:text-violet-600 transition-all font-semibold"
                  >
                    Explore the Marketplace
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693ecc5599cec84236ae4d99/147165ce2_FLIPCARDZ2.png" 
                alt="FlipCardZ" 
                className="w-9 h-9 rounded-xl"
              />
              <span>FlipCardZ</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center text-slate-500 text-sm">
            <p className="mb-1">© 2024 FlipCardZ.store. All rights reserved.</p>
            <p>FlipZ sp. z o.o. (in organization)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}