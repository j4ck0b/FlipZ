import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRightLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from '../../utils';
import { flipzApi } from '@/api/apiClient';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageProvider';

const conditionColors = {
  mint: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  near_mint: "bg-green-500/10 text-green-600 border-green-200",
  excellent: "bg-blue-500/10 text-blue-600 border-blue-200",
  good: "bg-amber-500/10 text-amber-600 border-amber-200",
  fair: "bg-orange-500/10 text-orange-600 border-orange-200",
  poor: "bg-red-500/10 text-red-600 border-red-200"
};

const rarityColors = {
  common: "bg-slate-100 text-slate-600",
  uncommon: "bg-sky-100 text-sky-700",
  rare: "bg-violet-100 text-violet-700",
  ultra_rare: "bg-fuchsia-100 text-fuchsia-700",
  legendary: "bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-800"
};

const categoryIcons = {
  pokemon: "🎴",
  magic_the_gathering: "🧙",
  yugioh: "👁️",
  sports: "⚽",
  other: "🃏"
};

export default function CardItem({ listing, onClick }) {
  const { t } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await flipzApi.auth.me();
      setCurrentUser(user);
      
      const likes = await flipzApi.entities.LikedListing.filter({ 
        user_email: user.email, 
        listing_id: listing.id 
      });
      setIsLiked(likes.length > 0);
    };
    loadUser();
  }, [listing.id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    
    if (!currentUser) return;
    
    if (isLiked) {
      const likes = await flipzApi.entities.LikedListing.filter({ 
        user_email: currentUser.email, 
        listing_id: listing.id 
      });
      if (likes.length > 0) {
        await flipzApi.entities.LikedListing.delete(likes[0].id);
        setIsLiked(false);
        toast.success('Removed from favorites');
        queryClient.invalidateQueries({ queryKey: ['likedListings', currentUser.email] });
        }
        } else {
        await flipzApi.entities.LikedListing.create({ 
        user_email: currentUser.email, 
        listing_id: listing.id 
        });
        setIsLiked(true);
        toast.success('Added to favorites!');
        queryClient.invalidateQueries({ queryKey: ['likedListings', currentUser.email] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="card-3d group cursor-pointer overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300"
        onClick={onClick}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          {(listing.image_urls && listing.image_urls.length > 0) || listing.image_url ? (
            <img 
              src={listing.image_urls?.[0] || listing.image_url} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {categoryIcons[listing.category] || "🃏"}
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Trade only badge */}
          {listing.trade_only && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-violet-600 text-white border-0 shadow-lg">
                <ArrowRightLeft className="w-3 h-3 mr-1" />
                Trade Only
              </Badge>
            </div>
          )}
          
          {/* Rarity badge */}
          {listing.rarity && (
            <div className="absolute top-3 right-3">
              <Badge className={`${rarityColors[listing.rarity]} border-0 shadow-lg`}>
                {listing.rarity === 'legendary' && <Sparkles className="w-3 h-3 mr-1" />}
                {t('rar_' + listing.rarity)}
              </Badge>
            </div>
          )}
          

        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm">
              {listing.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${conditionColors[listing.condition]}`}>
              {t('cond_' + listing.condition)}
            </Badge>
            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
              {t('cat_' + listing.category)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {listing.trade_only || !listing.price ? (
              <span className="text-sm font-medium text-violet-600">Open to offers</span>
            ) : (
              <span className="text-lg font-bold text-slate-900">{listing.price} zł</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/profile/${listing.created_by_id}`;
              }}
              className="text-xs text-slate-400 hover:text-slate-600 hover:underline transition-colors"
            >
              by {listing.collector_name || 'Anonymous'}
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
