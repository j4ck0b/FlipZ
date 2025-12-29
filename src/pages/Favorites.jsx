import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CardItem from '../components/cards/CardItem';
import CardDetailSheet from '../components/cards/CardDetailSheet';

export default function Favorites() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: likedListings = [], isLoading } = useQuery({
    queryKey: ['likedListings', currentUser?.email],
    queryFn: async () => {
      const likes = await base44.entities.LikedListing.filter({ user_email: currentUser.email });
      const listingIds = likes.map(l => l.listing_id);
      
      if (listingIds.length === 0) return [];
      
      const listings = await base44.entities.CardListing.filter({ 
        id: { $in: listingIds },
        status: 'available'
      }, '-created_date');
      
      return listings;
    },
    enabled: !!currentUser,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">❤️</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Your Favorites
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Items you've liked and want to remember for trading
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && likedListings.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No favorites yet</h3>
            <p className="text-slate-500 mb-6">Start liking items you're interested in trading for!</p>
          </motion.div>
        )}

        {!isLoading && likedListings.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {likedListings.length} {likedListings.length === 1 ? 'item' : 'items'} in your favorites
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {likedListings.map((listing, index) => (
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
          </>
        )}
      </div>

      <CardDetailSheet
        listing={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}