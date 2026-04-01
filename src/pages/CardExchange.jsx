import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Search,
  Plus,
  Loader2,
  Filter,
  Sparkles
} from "lucide-react";
import CardItem from '../components/cards/CardItem';
import CardDetailSheet from '../components/cards/CardDetailSheet';
import ListingModal from '../components/cards/ListingModal';
import CardFilters from '../components/cards/CardFilters';

export default function CardExchange() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    condition: 'all',
    rarity: 'all',
    tradeOnly: false,
    priceRange: [0, 10000]
  });

  useEffect(() => {
    fetchListings();
  }, [filters, user?.id]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('card_listings')
        .select('*')
        .eq('status', 'available')
        .order('created_date', { ascending: false });

      // Apply filters
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      if (filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }
      
      if (filters.rarity !== 'all') {
        query = query.eq('rarity', filters.rarity);
      }
      
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowDetailSheet(true);
  };

  const handleListingSuccess = () => {
    fetchListings();
  };

  const filteredListings = listings.filter(listing => {
    if (filters.tradeOnly && !listing.trade_only) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
              🃏
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Card Exchange</h1>
              <p className="text-lg text-slate-600">Trade Pokémon, MTG, Yu-Gi-Oh! and sports cards</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Available</p>
                    <p className="text-2xl font-bold text-slate-900">{filteredListings.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active</p>
                    <p className="text-2xl font-bold text-slate-900">12</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-violet-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Your Plan</p>
                    <p className="text-xl font-bold text-slate-900">
                      {profile?.subscription_tier === 'premium' ? 'Premium' :
                       profile?.subscription_tier === 'basic' ? 'Basic' : 'Free'}
                    </p>
                  </div>
                  {profile?.subscription_tier !== 'free' && (
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Trades Used</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {profile?.trade_count_current_month || 0}/
                      {profile?.subscription_tier === 'premium' ? '∞' :
                       profile?.subscription_tier === 'basic' ? '10' : '3'}
                    </p>
                  </div>
                  <Filter className="w-8 h-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <CardFilters filters={filters} setFilters={setFilters} />

        {/* Create Listing Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowListingModal(true)}
            disabled={!user}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {user ? 'List a Card' : 'Sign in to list a card'}
          </Button>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading cards...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No cards available
            </h3>
            <p className="text-slate-600 mb-6">
              {filters.search ? 'No cards match your search' : 'Be the first to list a card!'}
            </p>
            <Button
              onClick={() => setShowListingModal(true)}
              disabled={!user}
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {user ? 'List Your First Card' : 'Sign in to list a card'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <CardItem
                key={listing.id}
                listing={listing}
                onClick={() => handleCardClick(listing)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <CardDetailSheet
          listing={selectedCard}
          open={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
        />

        <ListingModal
          open={showListingModal}
          onClose={() => setShowListingModal(false)}
          onSuccess={handleListingSuccess}
        />
      </div>
    </div>
  );
}
