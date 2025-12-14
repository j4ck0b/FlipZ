import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Sparkles, TrendingUp, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CardItem from '../components/cards/CardItem';
import CardFilters from '../components/cards/CardFilters';
import ListingModal from '../components/cards/ListingModal';
import CardDetailSheet from '../components/cards/CardDetailSheet';

export default function Marketplace() {
  const queryClient = useQueryClient();
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    condition: 'all',
    rarity: 'all',
    tradeOnly: false,
    priceRange: [0, 10000]
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['cardListings'],
    queryFn: () => base44.entities.CardListing.filter({ status: 'available' }, '-created_date'),
    refetchInterval: 30000 // Refresh every 30 seconds for "live" feel
  });

  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(l => 
        l.title?.toLowerCase().includes(searchLower) ||
        l.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(l => l.category === filters.category);
    }

    // Condition filter
    if (filters.condition !== 'all') {
      result = result.filter(l => l.condition === filters.condition);
    }

    // Rarity filter
    if (filters.rarity !== 'all') {
      result = result.filter(l => l.rarity === filters.rarity);
    }

    // Trade only filter
    if (filters.tradeOnly) {
      result = result.filter(l => l.trade_only);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
    }

    return result;
  }, [listings, filters, sortBy]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['cardListings'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Card Exchange
              <span className="inline-block ml-3">
                <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-amber-400" />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Buy, sell, and trade your favorite collectible cards with collectors worldwide
            </p>
            <Button 
              onClick={() => setShowListingModal(true)}
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-8 text-lg font-medium shadow-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              List Your Card
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Filters & Sort */}
        <div className="mb-8 space-y-4">
          <CardFilters filters={filters} setFilters={setFilters} />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {filteredListings.length} cards available
            </p>
            
            <Tabs value={sortBy} onValueChange={setSortBy}>
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="newest" className="text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Newest
                </TabsTrigger>
                <TabsTrigger value="price_low" className="text-sm">
                  <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                  Price Low
                </TabsTrigger>
                <TabsTrigger value="price_high" className="text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Price High
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredListings.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No cards found</h3>
            <p className="text-slate-500 mb-6">Be the first to list a card in this category!</p>
            <Button onClick={() => setShowListingModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              List a Card
            </Button>
          </motion.div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <CardItem 
                  listing={listing} 
                  onClick={() => setSelectedCard(listing)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <ListingModal 
        open={showListingModal}
        onClose={() => setShowListingModal(false)}
        onSuccess={handleRefresh}
      />

      <CardDetailSheet
        listing={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}