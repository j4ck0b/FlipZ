import React from 'react';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const tradeCategories = [
  {
    id: 'card-exchange',
    title: '🃏 Card Exchange',
    description: 'Pokémon, MTG, Yu-Gi-Oh!, Sports Cards',
    page: 'CardExchange',
    gradient: 'from-violet-600 to-indigo-600'
  },
  {
    id: 'brick-exchange',
    title: '🧱 Brick Exchange',
    description: 'LEGO Minifigures & Sets',
    page: 'BrickExchange',
    gradient: 'from-red-600 to-orange-600'
  },
  {
    id: 'figure-exchange',
    title: '🧸 Figure Exchange',
    description: 'Funko Pop, Anime, Designer Toys',
    page: 'FigureExchange',
    gradient: 'from-pink-600 to-purple-600'
  },
  {
    id: 'diecast-exchange',
    title: '🚗 Diecast Exchange',
    description: 'Hot Wheels & Matchbox',
    page: 'DiecastExchange',
    gradient: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'collectible-exchange',
    title: '🎮 Collectible Exchange',
    description: 'Retro Games, Vinyl, Sneakers',
    page: 'CollectibleExchange',
    gradient: 'from-green-600 to-emerald-600'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-white">Trade-First Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Trade What You Collect
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
              Safe exchanges. Real collectors. No selling.
            </p>
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Cards, figures, bricks, and more — safely exchanged with collectors worldwide
            </p>
          </motion.div>

          {/* Category Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tradeCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => window.location.href = createPageUrl(category.page)}
                  className="group cursor-pointer bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} mb-4 flex items-center justify-center text-4xl shadow-lg`}>
                      {category.title.split(' ')[0]}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                      {category.title.substring(3)}
                      <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-slate-400 text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative py-20 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How FlipCardZ Works
            </h2>
            <p className="text-slate-400 text-lg">
              Safe, secure trades with built-in protection
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Propose Trade',
                description: 'Select items from your collection to trade'
              },
              {
                step: '2',
                title: 'Activate Exchange',
                description: 'Both parties secure the trade with shipping labels (24 zł)'
              },
              {
                step: '3',
                title: 'Ship & Complete',
                description: 'Exchange items safely with tracking and protection'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}