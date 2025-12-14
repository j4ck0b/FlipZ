import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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

export default function ProfileListings({ listings, onCardClick }) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No active listings</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {listings.map((listing, index) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={() => onCardClick(listing)}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
              {listing.image_url ? (
                <img 
                  src={listing.image_url} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  🃏
                </div>
              )}
              
              {listing.rarity && (
                <div className="absolute top-2 right-2">
                  <Badge className={`${rarityColors[listing.rarity]} border-0 shadow-lg text-xs`}>
                    {listing.rarity === 'legendary' && <Sparkles className="w-2.5 h-2.5 mr-1" />}
                    {listing.rarity?.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm mb-2">
                {listing.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-xs ${conditionColors[listing.condition]}`}>
                  {listing.condition?.replace('_', ' ')}
                </Badge>
                {listing.trade_only ? (
                  <span className="text-xs font-medium text-violet-600">Trade</span>
                ) : (
                  <span className="text-sm font-bold text-slate-900">${listing.price}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}