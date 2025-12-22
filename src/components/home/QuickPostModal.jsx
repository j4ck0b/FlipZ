import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ListingModal from '../cards/ListingModal';

const categories = [
  {
    value: 'pokemon',
    label: 'Pokémon',
    emoji: '🃏',
    gradient: 'from-violet-600 to-indigo-600',
    type: 'card'
  },
  {
    value: 'magic_the_gathering',
    label: 'Magic: The Gathering',
    emoji: '🃏',
    gradient: 'from-violet-600 to-indigo-600',
    type: 'card'
  },
  {
    value: 'yugioh',
    label: 'Yu-Gi-Oh!',
    emoji: '🃏',
    gradient: 'from-violet-600 to-indigo-600',
    type: 'card'
  },
  {
    value: 'sports',
    label: 'Sports Cards',
    emoji: '🃏',
    gradient: 'from-violet-600 to-indigo-600',
    type: 'card'
  },
  {
    value: 'lego_minifigures',
    label: 'LEGO',
    emoji: '🧱',
    gradient: 'from-red-600 to-orange-600',
    type: 'brick'
  },
  {
    value: 'funko_pop',
    label: 'Funko Pop',
    emoji: '🧸',
    gradient: 'from-pink-600 to-purple-600',
    type: 'figure'
  },
  {
    value: 'anime_figures',
    label: 'Anime Figures',
    emoji: '🧸',
    gradient: 'from-pink-600 to-purple-600',
    type: 'figure'
  },
  {
    value: 'designer_toys',
    label: 'Designer Toys',
    emoji: '🧸',
    gradient: 'from-pink-600 to-purple-600',
    type: 'figure'
  },
  {
    value: 'hot_wheels',
    label: 'Hot Wheels',
    emoji: '🚗',
    gradient: 'from-blue-600 to-cyan-600',
    type: 'diecast'
  },
  {
    value: 'retro_games',
    label: 'Retro Games',
    emoji: '🎮',
    gradient: 'from-green-600 to-emerald-600',
    type: 'collectible'
  },
  {
    value: 'vinyl_records',
    label: 'Vinyl Records',
    emoji: '🎮',
    gradient: 'from-green-600 to-emerald-600',
    type: 'collectible'
  },
  {
    value: 'sneakers',
    label: 'Sneakers',
    emoji: '🎮',
    gradient: 'from-green-600 to-emerald-600',
    type: 'collectible'
  }
];

export default function QuickPostModal({ open, onClose, onSuccess }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showListingModal, setShowListingModal] = useState(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowListingModal(true);
    onClose();
  };

  const handleListingSuccess = () => {
    setShowListingModal(false);
    setSelectedCategory(null);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">What are you trading?</DialogTitle>
            <p className="text-slate-600 mt-2">Select a category to list your item</p>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  onClick={() => handleCategorySelect(category.value)}
                  className="cursor-pointer hover:border-violet-500 hover:shadow-lg transition-all group"
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} mb-3 flex items-center justify-center text-2xl`}>
                      {category.emoji}
                    </div>
                    <h3 className="font-semibold text-slate-900 flex items-center justify-between">
                      {category.label}
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ListingModal
        open={showListingModal}
        onClose={() => {
          setShowListingModal(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleListingSuccess}
        defaultCategory={selectedCategory}
      />
    </>
  );
}