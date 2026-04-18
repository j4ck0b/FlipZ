import React, { useState, useEffect, useRef } from 'react';
import { flipzApi, supabase } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Pencil,
  Trash2,
  Loader2,
  ArrowRightLeft,
  DollarSign,
  Eye,
  MoreVertical,
  MessageCircle,
  CreditCard,
  Camera,
  Truck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import ListingModal from '../components/cards/ListingModal';
import CardDetailSheet from '../components/cards/CardDetailSheet';
import FloatingChat from '../components/chat/FloatingChat';
import { useLanguage } from '../components/LanguageProvider';
import FinalizeTradeModal from '../components/trade/FinalizeTradeModal';
import EscrowModeSelector from '../components/trade/EscrowModeSelector';
import TradeProgressTracker from '../components/trade/TradeProgressTracker';
import PackagePhotoUpload from '../components/trade/PackagePhotoUpload';
import InspectionReviewModal from '../components/trade/InspectionReviewModal';
import TradePaymentModal from '../components/trade/TradePaymentModal';
import ShippingLabelModal from '../components/trade/ShippingLabelModal';
import FinalAcceptanceModal from '../components/trade/FinalAcceptanceModal';
import HubInspectionSimulator from '../components/trade/HubInspectionSimulator';
import { useNotificationSound } from '../components/notifications/NotificationSound';
import { useAuth } from '../lib/AuthContext';

const statusConfig = {
  available: { label: 'Aktywne', cssClass: 'status-available', icon: Eye },
  pending: { label: 'Oczekuje', cssClass: 'status-pending', icon: Clock },
  sold: { label: 'Sprzedane', cssClass: 'status-sold', icon: CheckCircle2 },
  traded: { label: 'Wymienione', cssClass: 'status-traded', icon: ArrowRightLeft }
};

const offerStatusLabels = {
  pending: 'Oczekuje',
  accepted: 'Zaakceptowana',
  rejected: 'Odrzucona',
  cancelled: 'Anulowana',
  completed: 'Zakończona',
};

const offerStatusClasses = {
  pending: 'status-pending',
  accepted: 'status-accepted',
  rejected: 'status-rejected',
  cancelled: 'status-cancelled',
  completed: 'status-completed',
};

const categoryLabels = {
  pokemon_cards: 'Karty Pokémon',
  lego: 'LEGO',
  lego_bricks: 'Klocki LEGO',
  hot_wheels: 'Hot Wheels',
  diecast: 'Modele Aut',
  action_figures: 'Figurki',
  funko_pop: 'Funko Pop',
  collectibles: 'Kolekcje',
  retro_games: 'Retro Games',
  trading_cards: 'Karty kolekcjonerskie',
  sports_cards: 'Karty sportowe',
};

export default function MyListings() {
  const { t } = useLanguage();
  const { user: currentUser, canAccessWarehousePanel } = useAuth();
  const queryClient = useQueryClient();
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [chatOpen, setChatOpen] = useState(null);
  const [finalizeOffer, setFinalizeOffer] = useState(null);
  const [escrowModalOffer, setEscrowModalOffer] = useState(null);
  const [photoUploadOffer, setPhotoUploadOffer] = useState(null);
  const [inspectionReviewOffer, setInspectionReviewOffer] = useState(null);
  const [paymentOffer, setPaymentOffer] = useState(null);
  const [shippingLabelOffer, setShippingLabelOffer] = useState(null);
  const [hubInspectionOffer, setHubInspectionOffer] = useState(null);
  const [finalAcceptOffer, setFinalAcceptOffer] = useState(null);
  const playNotification = useNotificationSound();
  const prevOffersCount = useRef(0);

  useEffect(() => {
    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      (async () => {
        try {
          const { data } = await flipzApi.functions.invoke('checkPaymentStatus', { sessionId });
          if (data.success && data.paid) {
            toast.success(data.bothPaid ? 'Płatność zakończona! Obie strony zapłaciły 🎉' : 'Płatność zakończona sukcesem! 🎉');
            queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
            queryClient.invalidateQueries({ queryKey: ['myOffers'] });
          }
        } catch (error) {
          console.error('Payment check error:', error);
        }
        window.history.replaceState({}, '', '/my-listings');
      })();
    } else if (paymentStatus === 'cancelled') {
      toast.error('Płatność anulowana');
      window.history.replaceState({}, '', '/my-listings');
    }
  }, []);

  const userIdentityValues = Array.from(new Set([
    currentUser?.id,
    currentUser?.email
  ].filter(Boolean)));

  const { data: myListings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['myListings', currentUser?.id],
    queryFn: () => flipzApi.entities.CardListing.filter({ created_by: currentUser.id }, '-created_date'),
    enabled: !!currentUser
  });

  const { data: myOffers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['myOffers', userIdentityValues.join('|')],
    queryFn: async () => {
      const email = currentUser?.email;
      const userId = currentUser?.id;
      const filters = [];

      try {
        const results = await Promise.all([
          email ? flipzApi.entities.TradeOffer.filter({ sender_email: email }, '-created_at') : Promise.resolve([]),
          userId ? flipzApi.entities.TradeOffer.filter({ sender_id: userId }, '-created_at') : Promise.resolve([])
        ].map(p => p.catch(e => {
          console.warn('Individual offer query failed (this is expected if columns are missing):', e.message);
          return [];
        })));
        
        const offers = results.flat();
        return Array.from(new Map(offers.map(item => [item.id, item])).values());
      } catch (error) {
        console.warn('My offers query failed, returning empty list:', error);
        return [];
      }
    },
    enabled: !!currentUser,
    retry: false,
    refetchOnWindowFocus: true
  });

  const { data: incomingOffers = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ['incomingOffers', userIdentityValues.join('|')],
    queryFn: async () => {
      const email = currentUser?.email;
      const userId = currentUser?.id;
      const filters = [];

      try {
        const results = await Promise.all([
          email ? flipzApi.entities.TradeOffer.filter({ owner_email: email }, '-created_at') : Promise.resolve([]),
          userId ? flipzApi.entities.TradeOffer.filter({ owner_id: userId }, '-created_at') : Promise.resolve([])
        ].map(p => p.catch(e => {
          console.warn('Individual incoming offer query failed:', e.message);
          return [];
        })));

        const offers = results.flat();
        return Array.from(new Map(offers.map(item => [item.id, item])).values());
      } catch (error) {
        console.warn('Incoming offers query failed, returning empty list:', error);
        return [];
      }
    },
    enabled: !!currentUser,
    retry: false,
    refetchOnWindowFocus: true
  });

  // Supabase Realtime — zamiana pollingu na WebSocket
  useEffect(() => {
    if (!currentUser?.email && !currentUser?.id) return;

    const channel = supabase
      .channel(`trade-offers-${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trade_offers' },
        (payload) => {
          const record = payload.new || payload.old || {};
          const userEmail = currentUser.email;
          const userId = currentUser.id;

          const isSender =
            record.sender_email === userEmail ||
            record.sender_id === userId;
          const isOwner =
            record.owner_email === userEmail ||
            record.owner_id === userId;

          if (isSender) {
            queryClient.invalidateQueries({ queryKey: ['myOffers'] });
          }
          if (isOwner) {
            queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (incomingOffers.length > prevOffersCount.current && prevOffersCount.current > 0) {
      playNotification();
      toast.success('Nowa oferta wymiany! 🎉', {
        duration: 5000,
      });
    }
    prevOffersCount.current = incomingOffers.length;
  }, [incomingOffers.length]);

  const handleDelete = async (listing) => {
    await flipzApi.entities.CardListing.delete(listing.id);
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    toast.success('Ogłoszenie usunięte');
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (listing, newStatus) => {
    await flipzApi.entities.CardListing.update(listing.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    const statusLabel = newStatus === 'sold' ? 'sprzedana' : 'wymieniona';
    toast.success(`Karta oznaczona jako ${statusLabel}`);
  };

  const handleOfferAction = async (offer, action) => {
    if (action === 'accepted') {
      setEscrowModalOffer(offer);
      return;
    }
    
    await flipzApi.entities.TradeOffer.update(offer.id, { status: action });
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    const actionLabel = action === 'rejected' ? 'odrzucona' : 'zaktualizowana';
    toast.success(`Oferta ${actionLabel}`);
  };

  const handleCancelTrade = async (offer, reason) => {
    try {
      const { data } = await flipzApi.functions.invoke('cancelTrade', {
        tradeOfferId: offer.id,
        reason
      });

      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
        queryClient.invalidateQueries({ queryKey: ['myOffers'] });
        queryClient.invalidateQueries({ queryKey: ['myListings'] });
        toast.success('Wymiana anulowana pomylnie');
        return;
      }
    } catch (error) {
      console.error('Błąd anulowania:', error);
      const message = String(error?.message || error?.name || error?.context?.status || '');

      if (!message.includes('not deployed') && !message.includes('404') && !message.includes('FunctionsFetchError') && !message.includes('Failed to send')) {
        toast.error(error.response?.data?.error || 'Failed to cancel trade');
        return;
      }
    }

    try {
      await flipzApi.entities.TradeOffer.update(offer.id, {
        status: 'cancelled',
        progress_step: 'cancelled'
      });

      if (offer?.requested_card_id && !offer?.both_paid) {
        await flipzApi.entities.CardListing.update(offer.requested_card_id, { status: 'available' });
        if (Array.isArray(offer.offered_card_ids)) {
          for (const cid of offer.offered_card_ids) {
            await flipzApi.entities.CardListing.update(cid, { status: 'available' });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      toast.success('Wymiana anulowana (tryb awaryjny)');
    } catch (fallbackError) {
      toast.error('Nie udało się anulować wymiany. Spróbuj ponownie.');
    }
  };

  const handleEscrowSelect = async (escrowMode) => {
    try {
      await flipzApi.entities.TradeOffer.update(escrowModalOffer.id, { 
        status: 'accepted',
        escrow_mode: escrowMode,
        progress_step: 'payment'
      });
      await flipzApi.entities.CardListing.update(escrowModalOffer.requested_card_id, { 
        status: 'pending'
      });
      queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      setEscrowModalOffer(null);
      
      // Open payment modal with updated offer
      const updatedOffer = { ...escrowModalOffer, escrow_mode: escrowMode };
      setPaymentOffer(updatedOffer);
    } catch (error) {
      toast.error('Nie udało się zaakceptować wymiany');
    }
  };

  const handlePaymentSuccess = async (role) => {
    const field = role === 'owner' ? 'owner_paid' : 'sender_paid';
    const otherField = role === 'owner' ? 'sender_paid' : 'owner_paid';
    
    const updates = { [field]: true };
    
    // If both paid, move to preparing shipment
    if (paymentOffer[otherField]) {
      updates.progress_step = 'preparing_shipment';
      updates.both_paid = true;
    }
    
    await flipzApi.entities.TradeOffer.update(paymentOffer.id, updates);
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    toast.success(updates.progress_step ? 'Płatność zakończona! Obie strony zapłaciły.' : 'Płatność zakończona! Oczekiwanie na drugą osobę.');
    setPaymentOffer(null);
  };

  const handlePackageSent = async (offer, role) => {
    const field = role === 'owner' ? 'owner_package_sent' : 'sender_package_sent';
    const otherField = role === 'owner' ? 'sender_package_sent' : 'owner_package_sent';
    
    const updates = { [field]: true };
    
    // If both packages sent, skip directly to hub verification
    if (offer[otherField]) {
      updates.progress_step = 'hub_verification';
    }
    
    await flipzApi.entities.TradeOffer.update(offer.id, updates);
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    toast.success('Paczka oznaczona jako wysłana!');
  };

  const handleFinalAccept = async () => {
    await flipzApi.entities.TradeOffer.update(finalAcceptOffer.id, { 
      status: 'completed',
      progress_step: 'completed'
    });
    
    // Update card statuses
    await flipzApi.entities.CardListing.update(finalAcceptOffer.requested_card_id, { 
      status: 'traded',
      trade_count: (finalAcceptOffer.requested_card_trade_count || 0) + 1
    });
    
    for (const cardId of finalAcceptOffer.offered_card_ids || []) {
      await flipzApi.entities.CardListing.update(cardId, { 
        status: 'traded'
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    toast.success('Wymiana zakończona! 🎉');
    setFinalAcceptOffer(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
  };

  const pendingIncoming = incomingOffers.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold section-heading">{t('myDashboard')}</h1>
              <p className="text-slate-400 mt-1 text-sm">{t('manageListing')}</p>
            </div>
            <Button
              onClick={() => {
                setEditingListing(null);
                setShowListingModal(true);
              }}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 transition-all w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('newListing')}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="panel-elevated mb-6 grid grid-cols-3 p-1 rounded-xl border-0">
            <TabsTrigger value="listings" className="gap-2 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t('myListings')}</span>
              <span className="sm:hidden">Ogłoszenia</span>
              {myListings.length > 0 && <Badge className="ml-1 bg-white/20 text-inherit border-0 text-xs">{myListings.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('incomingOffers')}</span>
              <span className="sm:hidden">Przychodzące</span>
              {pendingIncoming > 0 && (
                <Badge className="ml-1 bg-red-500 text-white border-0 text-xs">{pendingIncoming}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('myOffers')}</span>
              <span className="sm:hidden">Wysłane</span>
              {myOffers.length > 0 && <Badge className="ml-1 bg-white/20 text-inherit border-0 text-xs">{myOffers.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* My Listings Tab */}
          <TabsContent value="listings">
            {loadingListings ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : myListings.length === 0 ? (
              <div className="panel-elevated rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{t('noListingsYet')}</h3>
                <p className="text-slate-400 mb-6 text-sm">{t('startByListing')}</p>
                <Button
                  onClick={() => setShowListingModal(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createListing')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {myListings.map((listing) => {
                    const status = statusConfig[listing.status] || statusConfig.available;
                    const StatusIcon = status.icon;
                    
                    return (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="listing-card overflow-hidden">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                            {/* Image */}
                            <div
                              className="w-20 h-28 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 cursor-pointer border border-white/10"
                              onClick={() => setSelectedCard(listing)}
                            >
                              {(listing.image_urls && listing.image_urls.length > 0) || listing.image_url ? (
                                <img
                                  src={listing.image_urls?.[0] || listing.image_url}
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">
                                  🃏
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-200 truncate">{listing.title}</h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`status-badge ${status.cssClass}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                                  {listing.category && (
                                    <span className="text-xs text-slate-400">
                                      {t('cat_' + listing.category)}
                                    </span>
                                  )}
                              </div>
                              <p className="text-lg font-bold text-slate-100 mt-2">
                                {listing.trade_only || !listing.price ? t('tradeOnly') : `${listing.price} zł`}
                              </p>
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="sm:ml-auto text-slate-400 hover:text-slate-200 hover:bg-white/10">
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingListing(listing);
                                  setShowListingModal(true);
                                }}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  {t('edit')}
                                </DropdownMenuItem>
                                {listing.status === 'available' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(listing, 'sold')}>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      {t('markAsSold')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(listing, 'traded')}>
                                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                                      {t('markAsTraded')}
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setDeleteConfirm(listing)}
                                  className="text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Incoming Offers Tab */}
          <TabsContent value="incoming">
            {loadingIncoming ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : incomingOffers.length === 0 ? (
              <div className="panel-elevated rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowRightLeft className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{t('noOffersYet')}</h3>
                <p className="text-slate-400 text-sm">{t('tradeOffersAppear')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {incomingOffers.map((offer) => (
                  <div key={offer.id} className="offer-card overflow-hidden">
                    <div>
                      {/* Header */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                              {offer.sender_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">{offer.sender_name}</p>
                              <p className="text-sm text-slate-400">
                                Chce: <span className="font-semibold text-violet-300">{offer.requested_card_title}</span>
                              </p>
                            </div>
                          </div>

                          <span className={`status-badge ${offerStatusClasses[offer.status] || 'status-cancelled'}`}>
                            {offerStatusLabels[offer.status] || offer.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Offered Cards */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                            <p className="text-sm font-semibold text-slate-300">{t('theirOffer')}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {offer.offered_cards_info?.map((card) => (
                              <div key={card.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-violet-500/30 transition-colors">
                                {((card.image_urls && card.image_urls.length > 0) || card.image_url) && (
                                  <img src={card.image_urls?.[0] || card.image_url} alt={card.title} className="w-14 h-20 object-cover rounded-lg" />
                                )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-200 text-sm truncate">{card.title}</p>
                                    <span className="text-xs text-slate-400 mt-1 block">{t('cond_' + card.condition)}</span>
                                  </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {offer.message && (
                          <div className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-xl">
                            <p className="text-sm text-violet-200 italic">💬 "{offer.message}"</p>
                          </div>
                        )}

                        {offer.progress_step && offer.progress_step !== 'offer_sent' && (
                         <div>
                           <TradeProgressTracker tradeOffer={offer} />
                         </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-white/10">
                       <Button 
                         variant="outline"
                         onClick={() => setChatOpen({
                           tradeOfferId: offer.id,
                           otherUserEmail: offer.sender_email,
                           otherUserName: offer.sender_name
                         })}
                         className="flex-1"
                       >
                         <MessageCircle className="w-4 h-4 mr-2" />
                         {t('chat')}
                       </Button>
                       {offer.status === 'pending' && (
                         <>
                           <Button 
                             onClick={() => setEscrowModalOffer(offer)}
                             className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                           >
                             <CheckCircle2 className="w-4 h-4 mr-2" />
                             {t('accept')}
                           </Button>
                           <Button 
                             variant="outline"
                             onClick={() => handleOfferAction(offer, 'rejected')}
                             className="flex-1"
                           >
                             <XCircle className="w-4 h-4 mr-2" />
                             {t('decline')}
                           </Button>
                         </>
                       )}
                       {(offer.status === 'pending' || offer.status === 'accepted') && !offer.both_paid && (
                         <Button 
                           variant="outline"
                           onClick={() => handleCancelTrade(offer, 'Cancelled by owner')}
                           className="flex-1 text-red-600 hover:bg-red-50"
                           disabled={offer.both_paid || (offer.sender_paid && offer.owner_paid)}
                         >
                           <XCircle className="w-4 h-4 mr-2" />
                           Anuluj
                         </Button>
                       )}
                       {offer.status === 'accepted' && offer.progress_step === 'payment' && (
                         !offer.owner_paid ? (
                           <Button
                             onClick={() => setPaymentOffer({ ...offer, userRole: 'owner' })}
                             className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                           >
                             <CreditCard className="w-4 h-4 mr-2" />
                             {t('completePayment')}
                           </Button>
                         ) : offer.sender_paid ? (
                           <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700">
                             <CheckCircle2 className="w-4 h-4 mr-2" />
                             {t('bothPaidReady')}
                           </Badge>
                         ) : (
                           <Badge className="flex-1 h-10 flex items-center justify-center bg-amber-100 text-amber-700">
                             <Clock className="w-4 h-4 mr-2" />
                             {t('waitingFor')} {offer.sender_name}
                           </Badge>
                         )
                       )}
                       {offer.progress_step === 'preparing_shipment' && (
                         <>
                           <Button
                             onClick={() => setShippingLabelOffer({ offer, role: 'owner' })}
                             variant="outline"
                             className="flex-1"
                           >
                             {t('viewShippingLabel')}
                           </Button>
                           {!offer.owner_package_sent ? (
                             <Button
                               onClick={() => handlePackageSent(offer, 'owner')}
                               className="flex-1 bg-blue-600 hover:bg-blue-700"
                             >
                               <Truck className="w-4 h-4 mr-2" />
                               {t('iHaveSentPackage')}
                             </Button>
                           ) : (
                             <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700">
                               <CheckCircle2 className="w-4 h-4 mr-2" />
                               {t('packageSent')}
                             </Badge>
                           )}
                         </>
                       )}
                       {canAccessWarehousePanel && (offer.progress_step === 'preparing_shipment' || offer.progress_step === 'payment') && !offer.hub_photos_owner_package && (
                         <Button
                           onClick={() => setHubInspectionOffer(offer)}
                           className="flex-1 bg-blue-600 hover:bg-blue-700"
                         >
                           <Camera className="w-4 h-4 mr-2" />
                           {t('skipToHubInspection')}
                         </Button>
                       )}
                       {offer.progress_step === 'hub_verification' && (
                         !offer.owner_inspection_accepted ? (
                           <>
                             <Button
                               onClick={async () => {
                                 const field = 'owner_inspection_accepted';
                                 const otherField = 'sender_inspection_accepted';
                                 const updates = { [field]: true };
                                 if (offer[otherField]) {
                                   updates.progress_step = 'shipping_to_users';
                                 }
                                 await flipzApi.entities.TradeOffer.update(offer.id, updates);
                                 queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
                                 queryClient.invalidateQueries({ queryKey: ['myOffers'] });
                                 toast.success('Inspection accepted!');
                               }}
                               className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                             >
                               <CheckCircle2 className="w-4 h-4 mr-2" />
                               {t('everythingOK')}
                             </Button>
                             <Button
                               variant="outline"
                               onClick={() => setInspectionReviewOffer({ offer, role: 'owner' })}
                               className="flex-1"
                             >
                               {t('viewDetails')}
                             </Button>
                           </>
                         ) : (
                           <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700">
                             <CheckCircle2 className="w-4 h-4 mr-2" />
                             {t('inspectionAccepted')}
                           </Badge>
                         )
                       )}
                       {offer.progress_step === 'shipping_to_users' && offer.owner_inspection_accepted && offer.sender_inspection_accepted && !offer.owner_delivered && (
                         <Button
                           onClick={async () => {
                             const field = 'owner_delivered';
                             const otherField = 'sender_delivered';
                             const updates = { [field]: true };
                             if (offer[otherField]) {
                               updates.progress_step = 'packages_delivered';
                             }
                             await flipzApi.entities.TradeOffer.update(offer.id, updates);
                             queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
                             queryClient.invalidateQueries({ queryKey: ['myOffers'] });
                             toast.success(updates.progress_step === 'packages_delivered' ? 'Obie paczki dostarczone! 🎉' : 'Potwierdzono odbiór paczki');
                           }}
                           className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                         >
                           <CheckCircle2 className="w-4 h-4 mr-2" />
                           Otrzymałem paczkę
                         </Button>
                       )}
                        {(offer.progress_step === 'shipping_to_users' || offer.progress_step === 'packages_delivered') && offer.owner_inspection_accepted && offer.sender_inspection_accepted && offer.owner_delivered && (
                          <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Paczka odebrana ✓
                          </Badge>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Offers Tab */}
          <TabsContent value="sent">
            {loadingOffers ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : myOffers.length === 0 ? (
              <div className="panel-elevated rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowRightLeft className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{t('noOffersMade')}</h3>
                <p className="text-slate-400 text-sm">{t('yourOffersAppear')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myOffers.map((offer) => (
                  <div key={offer.id} className="offer-card" style={{ borderLeftColor: '#6366f1' }}>
                    <div>
                      {/* Header */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                              {offer.owner_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">{t('to')} {offer.owner_name}</p>
                              <p className="text-sm text-slate-400">
                                Za: <span className="font-semibold text-indigo-300">{offer.requested_card_title}</span>
                              </p>
                            </div>
                          </div>

                          <span className={`status-badge ${offerStatusClasses[offer.status] || 'status-cancelled'}`}>
                            {offerStatusLabels[offer.status] || offer.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Offered Cards */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                            <p className="text-sm font-semibold text-slate-300">{t('yourOffer')}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {offer.offered_cards_info?.map((card) => (
                              <div key={card.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-indigo-500/30 transition-colors">
                                {((card.image_urls && card.image_urls.length > 0) || card.image_url) && (
                                  <img src={card.image_urls?.[0] || card.image_url} alt={card.title} className="w-14 h-20 object-cover rounded-lg" />
                                )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-200 text-sm truncate">{card.title}</p>
                                    <span className="text-xs text-slate-400 mt-1 block">{t('cond_' + card.condition)}</span>
                                  </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {offer.progress_step && offer.progress_step !== 'offer_sent' && (
                          <div>
                            <TradeProgressTracker tradeOffer={offer} />
                          </div>
                        )}

                      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-white/10">
                        <Button 
                          variant="outline"
                          onClick={() => setChatOpen({
                            tradeOfferId: offer.id,
                            otherUserEmail: offer.owner_email,
                            otherUserName: offer.owner_name
                          })}
                          className="flex-1"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {t('chat')}
                        </Button>
                        {(offer.status === 'pending' || offer.status === 'accepted') && !offer.both_paid && (
                          <Button 
                            variant="outline"
                            onClick={() => handleCancelTrade(offer, 'Cancelled by sender')}
                            className="flex-1 text-red-600 hover:bg-red-50"
                            disabled={offer.both_paid || (offer.sender_paid && offer.owner_paid)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Anuluj
                          </Button>
                        )}
                        {offer.status === 'accepted' && offer.progress_step === 'payment' && (
                          !offer.sender_paid ? (
                            <Button
                              onClick={() => setPaymentOffer({ ...offer, userRole: 'sender' })}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              {t('completePayment')}
                            </Button>
                          ) : offer.owner_paid ? (
                            <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700 pointer-events-none">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t('bothPaidReady')}
                            </Badge>
                          ) : (
                            <Badge className="flex-1 h-10 flex items-center justify-center bg-amber-100 text-amber-700 pointer-events-none">
                              <Clock className="w-4 h-4 mr-2" />
                              {t('waitingFor')} {offer.owner_name}
                            </Badge>
                          )
                        )}
                        {offer.progress_step === 'preparing_shipment' && (
                          <>
                            <Button
                              onClick={() => setShippingLabelOffer({ offer, role: 'sender' })}
                              variant="outline"
                              className="flex-1"
                            >
                              {t('viewShippingLabel')}
                            </Button>
                            {!offer.sender_package_sent ? (
                              <Button
                                onClick={() => handlePackageSent(offer, 'sender')}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                {t('iHaveSentPackage')}
                              </Button>
                            ) : (
                              <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700 pointer-events-none">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {t('packageSent')}
                              </Badge>
                            )}
                          </>
                        )}
                        {canAccessWarehousePanel && (offer.progress_step === 'preparing_shipment' || offer.progress_step === 'payment') && !offer.hub_photos_sender_package && (
                          <Button
                            onClick={() => setHubInspectionOffer(offer)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            {t('skipToHubInspection')}
                          </Button>
                        )}
                        {offer.progress_step === 'hub_verification' && (
                          !offer.sender_inspection_accepted ? (
                            <>
                              <Button
                                onClick={async () => {
                                  const field = 'sender_inspection_accepted';
                                  const otherField = 'owner_inspection_accepted';
                                  const updates = { [field]: true };
                                  if (offer[otherField]) {
                                    updates.progress_step = 'shipping_to_users';
                                  }
                                  await flipzApi.entities.TradeOffer.update(offer.id, updates);
                                  queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
                                  queryClient.invalidateQueries({ queryKey: ['myOffers'] });
                                  toast.success('Inspekcja zaakceptowana!');
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {t('everythingOK')}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setInspectionReviewOffer({ offer, role: 'sender' })}
                                className="flex-1"
                              >
                                {t('viewDetails')}
                              </Button>
                            </>
                          ) : (
                            <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700 pointer-events-none">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t('inspectionAccepted')}
                            </Badge>
                          )
                        )}
                        {offer.progress_step === 'shipping_to_users' && offer.owner_inspection_accepted && offer.sender_inspection_accepted && !offer.sender_delivered && (
                          <Button
                            onClick={async () => {
                              const field = 'sender_delivered';
                              const otherField = 'owner_delivered';
                              const updates = { [field]: true };
                              if (offer[otherField]) {
                                updates.progress_step = 'packages_delivered';
                              }
                              await flipzApi.entities.TradeOffer.update(offer.id, updates);
                              queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
                              queryClient.invalidateQueries({ queryKey: ['myOffers'] });
                              toast.success(updates.progress_step === 'packages_delivered' ? 'Obie paczki dostarczone! 🎉' : 'Potwierdzono odbiór paczki');
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Otrzymałem paczkę
                          </Button>
                        )}
                        {(offer.progress_step === 'shipping_to_users' || offer.progress_step === 'packages_delivered') && offer.owner_inspection_accepted && offer.sender_inspection_accepted && offer.sender_delivered && (
                          <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700 pointer-events-none">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Paczka odebrana ✓
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ListingModal 
        open={showListingModal}
        onClose={() => {
          setShowListingModal(false);
          setEditingListing(null);
        }}
        onSuccess={handleRefresh}
        editListing={editingListing}
      />

      <CardDetailSheet
        listing={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      {/* Floating Chat */}
      {chatOpen && (
        <FloatingChat
          open={!!chatOpen}
          onClose={() => setChatOpen(null)}
          tradeOfferId={chatOpen.tradeOfferId}
          otherUserEmail={chatOpen.otherUserEmail}
          otherUserName={chatOpen.otherUserName}
        />
      )}

      {/* Finalize Trade Modal */}
      <FinalizeTradeModal
        open={!!finalizeOffer}
        onClose={() => setFinalizeOffer(null)}
        tradeOffer={finalizeOffer}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['myOffers'] });
          queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
          queryClient.invalidateQueries({ queryKey: ['myListings'] });
        }}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteListing')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('areYouSure')} "{deleteConfirm?.title}"? {t('cannotBeUndone')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Escrow Mode Selector */}
      <EscrowModeSelector
        open={!!escrowModalOffer}
        onClose={() => setEscrowModalOffer(null)}
        tradeOffer={escrowModalOffer}
        onSelect={handleEscrowSelect}
      />

      {/* Package Photo Upload */}
      {photoUploadOffer && (
        <PackagePhotoUpload
          open={!!photoUploadOffer}
          onClose={() => setPhotoUploadOffer(null)}
          tradeOffer={photoUploadOffer.offer}
          userRole={photoUploadOffer.role}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['myOffers'] });
            queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
            setPhotoUploadOffer(null);
          }}
        />
      )}

      {/* Hub Inspection Simulator */}
      <HubInspectionSimulator
        open={canAccessWarehousePanel && !!hubInspectionOffer}
        onClose={() => setHubInspectionOffer(null)}
        tradeOffer={hubInspectionOffer}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['myOffers'] });
          queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
          setHubInspectionOffer(null);
        }}
      />

      {/* Inspection Review */}
      {inspectionReviewOffer && (
        <InspectionReviewModal
          open={!!inspectionReviewOffer}
          onClose={() => setInspectionReviewOffer(null)}
          tradeOffer={inspectionReviewOffer.offer}
          userRole={inspectionReviewOffer.role}
          onSuccess={() => {
            setInspectionReviewOffer(null);
          }}
        />
      )}

      {/* Mock Payment Modal */}
      <TradePaymentModal
        open={!!paymentOffer}
        onClose={() => setPaymentOffer(null)}
        tradeOffer={paymentOffer}
        onSuccess={() => handlePaymentSuccess(paymentOffer?.userRole)}
      />

      {/* Mock Shipping Label */}
      {shippingLabelOffer && (
        <ShippingLabelModal
        open={!!shippingLabelOffer}
        onClose={() => setShippingLabelOffer(null)}
        tradeOffer={shippingLabelOffer}
        userRole={shippingLabelOffer?.userRole}
      />
      )}

      {/* Final Acceptance Modal */}
      <FinalAcceptanceModal
        open={!!finalAcceptOffer}
        onClose={() => setFinalAcceptOffer(null)}
        tradeOffer={finalAcceptOffer}
        onAccept={handleFinalAccept}
      />
    </div>
  );
}
