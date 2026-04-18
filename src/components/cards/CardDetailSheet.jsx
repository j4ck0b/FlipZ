import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { flipzApi } from '@/api/apiClient';
import { 
  ArrowRightLeft, 
  Sparkles, 
  Shield, 
  User,
  X,
  ExternalLink,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import TradeOfferModal from '../trade/TradeOfferModal';
import { createPageUrl } from '../../utils';
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

// (Removed static categoryLabels)

export default function CardDetailSheet({ listing, open, onClose }) {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const user = await flipzApi.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const checkLiked = async () => {
      if (!currentUser || !listing) return;
      const likes = await flipzApi.entities.LikedListing.filter({ 
        user_email: currentUser.email, 
        listing_id: listing.id 
      });
      setIsLiked(likes.length > 0);
    };
    checkLiked();
  }, [currentUser, listing]);

  const handleLike = async () => {
    if (!currentUser || !listing) return;
    
    if (isLiked) {
      const likes = await flipzApi.entities.LikedListing.filter({ 
        user_email: currentUser.email, 
        listing_id: listing.id 
      });
      if (likes.length > 0) {
        await flipzApi.entities.LikedListing.delete(likes[0].id);
        setIsLiked(false);
        toast.success('Usunięto z ulubionych');
        queryClient.invalidateQueries({ queryKey: ['likedListings', currentUser.email] });
      }
    } else {
      await flipzApi.entities.LikedListing.create({ 
        user_email: currentUser.email, 
        listing_id: listing.id 
      });
      setIsLiked(true);
      toast.success('Dodano do ulubionych!');
      queryClient.invalidateQueries({ queryKey: ['likedListings', currentUser.email] });
    }
  };

  if (!listing) return null;

  const isOwnListing = currentUser?.id === listing.created_by;
  const images = listing.image_urls || (listing.image_url ? [listing.image_url] : []);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          {/* Card Image */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 group">
            {images.length > 0 ? (
              <>
                <img 
                  src={images[selectedImageIndex]} 
                  alt={listing.title}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setFullScreenImage(images[selectedImageIndex])}
                />
                {images.length > 1 && (
                  <>
                    {/* Navigation Arrows */}
                    {selectedImageIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                    )}
                    {selectedImageIndex < images.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    )}
                    
                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === selectedImageIndex 
                              ? 'bg-white w-6' 
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl opacity-50">
                🃏
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/80 backdrop-blur-sm"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {listing.rarity && (
                <Badge className={`${rarityColors[listing.rarity]} border-0`}>
                  {listing.rarity === 'legendary' && <Sparkles className="w-3 h-3 mr-1" />}
                  {t('rar_' + listing.rarity)}
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
                  {t('cond_' + listing.condition)}
                </Badge>
                <Badge variant="outline" className="bg-slate-50">
                  {t('cat_' + listing.category)}
                </Badge>
              </div>
            </div>

            {/* Estimated Value */}
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-sm text-slate-500 mb-1">Szacowana wartość</p>
              <p className="text-lg font-semibold text-slate-700">{listing.estimated_value || 'Nie podano'}</p>
              <p className="text-xs text-slate-500 mt-1">Tylko orientacyjnie — ten przedmiot jest do wymiany</p>
            </div>

            {/* Collector Info */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm text-slate-500">Kolekcjoner</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${listing.created_by_id}`);
                  }}
                  className="font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors group mt-1"
                >
                  <User className="w-4 h-4" />
                  {listing.collector_name || 'Anonim'}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              {listing.trade_count > 0 && (
                <div className="text-right">
                  <p className="text-sm text-slate-500">Wymiany</p>
                  <p className="text-xl font-bold text-violet-600">{listing.trade_count}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Opis</h3>
                <p className="text-slate-600 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Looking For */}
            {listing.looking_for && (
              <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
                <h3 className="font-semibold text-violet-900 mb-1 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Szukam w zamian
                </h3>
                <p className="text-violet-700">{listing.looking_for}</p>
              </div>
            )}

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Tagi</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="bg-slate-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Trade Button */}
            {!isOwnListing && listing.status === 'available' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t pt-6"
              >
                <Button 
                  onClick={() => setShowTradeModal(true)}
                  className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg"
                >
                  <ArrowRightLeft className="w-5 h-5 mr-2" />
                  Zaproponuj wymianę
                </Button>
              </motion.div>
            )}

            {isOwnListing && (
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <p className="text-amber-800">To jest Twoje ogłoszenie</p>
              </div>
            )}

            {listing.status !== 'available' && (
              <div className="p-4 bg-slate-100 rounded-xl text-center">
                <p className="text-slate-600">
                  {listing.status === 'traded' ? 'Ten przedmiot został wymieniony' :
                   listing.status === 'sold' ? 'Ten przedmiot został sprzedany' :
                   listing.status === 'pending' ? 'Ten przedmiot oczekuje na wymianę' :
                   `Ten przedmiot jest niedostępny`}
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <TradeOfferModal
        open={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        targetCard={listing}
        onSuccess={() => {
          setShowTradeModal(false);
          onClose();
        }}
      />

      <Dialog open={!!fullScreenImage} onOpenChange={() => setFullScreenImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Full screen image preview</DialogTitle>
          <DialogDescription className="sr-only">Preview of the selected listing image in full screen.</DialogDescription>
          <img 
            src={fullScreenImage} 
            alt="Full screen view"
            className="w-full h-full object-contain max-h-[95vh]"
          />
        </DialogContent>
      </Dialog>
      </>
      );
      }
