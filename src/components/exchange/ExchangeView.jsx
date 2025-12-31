import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Clock, Loader2, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CardItem from '../cards/CardItem';
import CardFilters from '../cards/CardFilters';
import ListingModal from '../cards/ListingModal';
import CardDetailSheet from '../cards/CardDetailSheet';

export default function ExchangeView({ 
  title, 
  description, 
  allowedCategories, 
  subcategories,
  gradient = 'from-violet-600 to-indigo-600',
  icon 
}) {
  const queryClient = useQueryClient();
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    condition: 'all',
    rarity: 'all'
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['cardListings', allowedCategories],
    queryFn: () => base44.entities.CardListing.filter({ 
      status: 'available',
      category: { $in: allowedCategories }
    }, '-created_date'),
    refetchInterval: 30000
  });

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(l => 
        l.title?.toLowerCase().includes(searchLower) ||
        l.description?.toLowerCase().includes(searchLower) ||
        l.tags?.some(tag => tag?.toLowerCase().includes(searchLower))
      );
    }

    if (filters.category !== 'all') {
      result = result.filter(l => l.category === filters.category);
    }

    if (filters.condition !== 'all') {
      result = result.filter(l => l.condition === filters.condition);
    }

    if (filters.rarity !== 'all') {
      result = result.filter(l => l.rarity === filters.rarity);
    }

    switch (sortBy) {
      case 'trades':
        result.sort((a, b) => (b.trade_count || 0) - (a.trade_count || 0));
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
      <div className={`relative overflow-hidden bg-gradient-to-r ${gradient} text-white`}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-32 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">{icon}</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
            <Button 
              onClick={() => setShowListingModal(true)}
              size="lg"
              className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-8 text-lg font-medium shadow-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              List Item
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Subcategories */}
        {subcategories && subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.category === 'all' ? 'default' : 'outline'}
                onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                className={filters.category === 'all' ? `bg-gradient-to-r ${gradient} text-white` : ''}
              >
                All
              </Button>
              {subcategories.map((sub) => (
                <Button
                  key={sub.value}
                  variant={filters.category === sub.value ? 'default' : 'outline'}
                  onClick={() => setFilters(prev => ({ ...prev, category: sub.value }))}
                  className={filters.category === sub.value ? `bg-gradient-to-r ${gradient} text-white` : ''}
                >
                  {sub.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Sort */}
        <div className="mb-8 space-y-4">
          <CardFilters filters={filters} setFilters={setFilters} hideCategory={!!subcategories} />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {filteredListings.length} items available
            </p>
            
            <Tabs value={sortBy} onValueChange={setSortBy}>
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="newest" className="text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Newest
                </TabsTrigger>
                <TabsTrigger value="trades" className="text-sm">
                  <ArrowRightLeft className="w-4 h-4 mr-1" />
                  Most Traded
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
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No items found</h3>
            <p className="text-slate-500 mb-6">Be the first to list an item in this category!</p>
            <Button onClick={() => setShowListingModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              List Item
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
        defaultCategory={allowedCategories[0]}
      />

      <CardDetailSheet
        listing={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}