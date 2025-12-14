import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { 
  ArrowRightLeft, 
  DollarSign, 
  Sparkles, 
  Shield, 
  User,
  MessageSquare,
  Loader2,
  Send,
  X,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

const categoryLabels = {
  pokemon: "Pokémon",
  magic_the_gathering: "Magic: The Gathering",
  yugioh: "Yu-Gi-Oh!",
  sports: "Sports",
  other: "Other"
};

export default function CardDetailSheet({ listing, open, onClose }) {
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [requestType, setRequestType] = useState('purchase');
  const [offerData, setOfferData] = useState({
    offer_amount: '',
    trade_offer: '',
    message: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (listing) {
      setOfferData({
        offer_amount: listing.price || '',
        trade_offer: '',
        message: ''
      });
      setRequestType(listing.trade_only ? 'trade' : 'purchase');
    }
  }, [listing]);

  const handleSendRequest = async () => {
    if (!listing || !currentUser) return;
    
    setSending(true);
    
    await base44.entities.TradeRequest.create({
      listing_id: listing.id,
      listing_title: listing.title,
      seller_email: listing.created_by,
      buyer_email: currentUser.email,
      buyer_name: currentUser.full_name || currentUser.email?.split('@')[0],
      request_type: requestType,
      offer_amount: parseFloat(offerData.offer_amount) || 0,
      trade_offer: offerData.trade_offer,
      message: offerData.message,
      status: 'pending'
    });
    
    toast.success('Request sent successfully!');
    setSending(false);
    onClose();
  };

  if (!listing) return null;

  const isOwnListing = currentUser?.email === listing.created_by;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Card Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50">
          {listing.image_url ? (
            <img 
              src={listing.image_url} 
              alt={listing.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl opacity-50">
              🃏
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          
          {/* Badges */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {listing.trade_only && (
              <Badge className="bg-violet-600 text-white border-0">
                <ArrowRightLeft className="w-3 h-3 mr-1" />
                Trade Only
              </Badge>
            )}
            {listing.rarity && (
              <Badge className={`${rarityColors[listing.rarity]} border-0`}>
                {listing.rarity === 'legendary' && <Sparkles className="w-3 h-3 mr-1" />}
                {listing.rarity?.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{listing.title}</h2>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className={conditionColors[listing.condition]}>
                <Shield className="w-3 h-3 mr-1" />
                {listing.condition?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="bg-slate-50">
                {categoryLabels[listing.category]}
              </Badge>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-sm text-slate-500">Asking Price</p>
              {listing.trade_only ? (
                <p className="text-xl font-bold text-violet-600">Trade Only</p>
              ) : (
                <p className="text-3xl font-bold text-slate-900">${listing.price}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Listed by</p>
              <button
                onClick={() => {
                  const { createPageUrl } = require('../utils');
                  window.location.href = createPageUrl('Profile') + '?userId=' + listing.created_by;
                }}
                className="font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors group"
              >
                <User className="w-4 h-4" />
                {listing.seller_name || 'Anonymous'}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Looking For */}
          {listing.looking_for && (
            <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
              <h3 className="font-semibold text-violet-900 mb-1 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                Looking For
              </h3>
              <p className="text-violet-700">{listing.looking_for}</p>
            </div>
          )}

          {/* Contact / Offer Section */}
          {!isOwnListing && listing.status === 'available' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t pt-6 space-y-4"
            >
              <h3 className="font-semibold text-slate-900">Make an Offer</h3>
              
              {!listing.trade_only && (
                <Tabs value={requestType} onValueChange={setRequestType}>
                  <TabsList className="w-full">
                    <TabsTrigger value="purchase" className="flex-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Purchase
                    </TabsTrigger>
                    <TabsTrigger value="trade" className="flex-1">
                      <ArrowRightLeft className="w-4 h-4 mr-1" />
                      Trade
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {requestType === 'purchase' && !listing.trade_only ? (
                <div className="space-y-2">
                  <Label>Your Offer (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`Asking: $${listing.price}`}
                    value={offerData.offer_amount}
                    onChange={(e) => setOfferData(prev => ({ ...prev, offer_amount: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>What cards are you offering?</Label>
                  <Textarea
                    placeholder="Describe the cards you want to trade..."
                    value={offerData.trade_offer}
                    onChange={(e) => setOfferData(prev => ({ ...prev, trade_offer: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  Message to Seller
                </Label>
                <Textarea
                  placeholder="Add a message..."
                  value={offerData.message}
                  onChange={(e) => setOfferData(prev => ({ ...prev, message: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleSendRequest}
                disabled={sending}
                className="w-full bg-slate-900 hover:bg-slate-800 h-12"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {isOwnListing && (
            <div className="p-4 bg-amber-50 rounded-xl text-center">
              <p className="text-amber-800">This is your listing</p>
            </div>
          )}

          {listing.status !== 'available' && (
            <div className="p-4 bg-slate-100 rounded-xl text-center">
              <p className="text-slate-600 capitalize">This card is {listing.status}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}