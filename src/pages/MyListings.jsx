import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
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
import MockPaymentModal from '../components/trade/MockPaymentModal';
import MockShippingLabel from '../components/trade/MockShippingLabel';
import FinalAcceptanceModal from '../components/trade/FinalAcceptanceModal';
import HubInspectionSimulator from '../components/trade/HubInspectionSimulator';
import { useNotificationSound } from '../components/notifications/NotificationSound';

const statusConfig = {
  available: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: Eye },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  sold: { label: 'Sold', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  traded: { label: 'Traded', color: 'bg-violet-100 text-violet-700', icon: ArrowRightLeft }
};

export default function MyListings() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
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
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: myListings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['myListings', currentUser?.email],
    queryFn: () => base44.entities.CardListing.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser
  });

  const { data: myOffers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['myOffers', currentUser?.email],
    queryFn: () => base44.entities.TradeOffer.filter({ sender_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  const { data: incomingOffers = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ['incomingOffers', currentUser?.email],
    queryFn: () => base44.entities.TradeOffer.filter({ owner_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
    refetchInterval: 5000,
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    if (incomingOffers.length > prevOffersCount.current && prevOffersCount.current > 0) {
      playNotification();
      toast.success('New trade offer received!', {
        duration: 5000,
      });
    }
    prevOffersCount.current = incomingOffers.length;
  }, [incomingOffers.length]);

  const handleDelete = async (listing) => {
    await base44.entities.CardListing.delete(listing.id);
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    toast.success('Listing deleted');
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (listing, newStatus) => {
    await base44.entities.CardListing.update(listing.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    toast.success(`Card marked as ${newStatus}`);
  };

  const handleOfferAction = async (offer, action) => {
    if (action === 'accepted') {
      setEscrowModalOffer(offer);
      return;
    }
    
    await base44.entities.TradeOffer.update(offer.id, { status: action });
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    toast.success(`Offer ${action}`);
  };

  const handleEscrowSelect = async (escrowMode) => {
    try {
      await base44.entities.TradeOffer.update(escrowModalOffer.id, { 
        status: 'accepted',
        escrow_mode: escrowMode,
        progress_step: 'payment'
      });
      await base44.entities.CardListing.update(escrowModalOffer.requested_card_id, { 
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
      toast.error('Failed to accept trade');
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
    
    await base44.entities.TradeOffer.update(paymentOffer.id, updates);
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    toast.success(updates.progress_step ? 'Payment successful! Both parties paid.' : 'Payment successful! Waiting for other party.');
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
    
    await base44.entities.TradeOffer.update(offer.id, updates);
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    toast.success('Package marked as sent!');
  };

  const handleFinalAccept = async () => {
    await base44.entities.TradeOffer.update(finalAcceptOffer.id, { 
      status: 'completed',
      progress_step: 'completed'
    });
    
    // Update card statuses
    await base44.entities.CardListing.update(finalAcceptOffer.requested_card_id, { 
      status: 'traded',
      trade_count: (finalAcceptOffer.requested_card_trade_count || 0) + 1
    });
    
    for (const cardId of finalAcceptOffer.offered_card_ids || []) {
      await base44.entities.CardListing.update(cardId, { 
        status: 'traded'
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myOffers'] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    toast.success('Trade completed! 🎉');
    setFinalAcceptOffer(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
  };

  const pendingIncoming = incomingOffers.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('myDashboard')}</h1>
              <p className="text-slate-500 mt-1">{t('manageListing')}</p>
            </div>
            <Button 
              onClick={() => {
                setEditingListing(null);
                setShowListingModal(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('newListing')}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t('myListings')}</span>
              <span className="sm:hidden">{t('listings')}</span>
              <Badge variant="secondary" className="ml-1">{myListings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('incomingOffers')}</span>
              <span className="sm:hidden">{t('incomingOffers')}</span>
              {pendingIncoming > 0 && (
                <Badge className="ml-1 bg-rose-500">{pendingIncoming}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('myOffers')}</span>
              <span className="sm:hidden">{t('myOffers')}</span>
              <Badge variant="secondary" className="ml-1">{myOffers.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* My Listings Tab */}
          <TabsContent value="listings">
            {loadingListings ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : myListings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">{t('noListingsYet')}</h3>
                  <p className="text-slate-500 mb-4">{t('startByListing')}</p>
                  <Button onClick={() => setShowListingModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('createListing')}
                  </Button>
                </CardContent>
              </Card>
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
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                              {/* Image */}
                              <div 
                                className="w-20 h-28 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 cursor-pointer"
                                onClick={() => setSelectedCard(listing)}
                              >
                                {listing.image_url ? (
                                  <img 
                                    src={listing.image_url} 
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
                                <h3 className="font-semibold text-slate-900 truncate">{listing.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`${status.color} border-0`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                  <span className="text-sm text-slate-500">
                                    {listing.category?.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-lg font-bold text-slate-900 mt-2">
                                  {listing.trade_only ? t('tradeOnly') : `$${listing.price}`}
                                </p>
                              </div>

                              {/* Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="sm:ml-auto">
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
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
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
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : incomingOffers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <ArrowRightLeft className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">{t('noOffersYet')}</h3>
                  <p className="text-slate-500">{t('tradeOffersAppear')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {incomingOffers.map((offer) => (
                  <Card key={offer.id} className="overflow-hidden border-l-4 border-l-violet-500">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-violet-50 to-white p-4 border-b">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {offer.sender_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-lg">{offer.sender_name}</p>
                              <p className="text-sm text-slate-600">
                                {t('wants')}: <span className="font-semibold text-violet-700">{offer.requested_card_title}</span>
                              </p>
                            </div>
                          </div>
                          
                          <Badge className={`text-xs font-semibold ${
                            offer.status === 'pending' ? 'bg-amber-500 text-white' :
                            offer.status === 'accepted' ? 'bg-emerald-500 text-white' :
                            offer.status === 'rejected' ? 'bg-red-500 text-white' :
                            'bg-slate-500 text-white'
                          }`}>
                            {offer.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Offered Cards */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 bg-violet-500 rounded-full"></div>
                            <p className="text-sm font-semibold text-slate-700">{t('theirOffer')}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {offer.offered_cards_info?.map((card) => (
                              <div key={card.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                                {card.image_url && (
                                  <img src={card.image_url} alt={card.title} className="w-14 h-20 object-cover rounded-lg shadow-sm" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 text-sm truncate">{card.title}</p>
                                  <Badge variant="outline" className="text-xs mt-1">{card.condition}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {offer.message && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                            <p className="text-sm text-blue-900 italic">💬 "{offer.message}"</p>
                          </div>
                        )}

                        {offer.progress_step && offer.progress_step !== 'offer_sent' && (
                         <div>
                           <TradeProgressTracker tradeOffer={offer} />
                         </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
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
                       {offer.status === 'accepted' && offer.progress_step === 'preparing_shipment' && (
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
                       {offer.status === 'accepted' && (offer.progress_step === 'preparing_shipment' || offer.progress_step === 'payment') && !offer.hub_photos_owner_package && (
                         <Button
                           onClick={() => setHubInspectionOffer(offer)}
                           className="flex-1 bg-blue-600 hover:bg-blue-700"
                         >
                           <Camera className="w-4 h-4 mr-2" />
                           {t('skipToHubInspection')}
                         </Button>
                       )}
                       {offer.status === 'accepted' && offer.progress_step === 'hub_verification' && (
                         !offer.owner_inspection_accepted ? (
                           <>
                             <Button
                               onClick={async () => {
...
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
                       {offer.status === 'accepted' && offer.progress_step === 'shipping_to_users' && offer.owner_inspection_accepted && offer.sender_inspection_accepted && (
                         <Button
                           onClick={() => setFinalAcceptOffer(offer)}
                           className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                         >
                           <CheckCircle2 className="w-4 h-4 mr-2" />
                           {t('completeTrade')}
                           </Button>
                           )}
                           </div>
                           </div>
                           </CardContent>
                           </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Offers Tab */}
          <TabsContent value="sent">
            {loadingOffers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : myOffers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <ArrowRightLeft className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">{t('noOffersMade')}</h3>
                  <p className="text-slate-500">{t('yourOffersAppear')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {myOffers.map((offer) => (
                  <Card key={offer.id} className="overflow-hidden border-l-4 border-l-indigo-500">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {offer.owner_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-lg">{t('to')} {offer.owner_name}</p>
                              <p className="text-sm text-slate-600">
                                {t('for')}: <span className="font-semibold text-indigo-700">{offer.requested_card_title}</span>
                              </p>
                            </div>
                          </div>
                          
                          <Badge className={`text-xs font-semibold ${
                            offer.status === 'pending' ? 'bg-amber-500 text-white' :
                            offer.status === 'accepted' ? 'bg-emerald-500 text-white' :
                            offer.status === 'rejected' ? 'bg-red-500 text-white' :
                            'bg-slate-500 text-white'
                          }`}>
                            {offer.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Offered Cards */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                            <p className="text-sm font-semibold text-slate-700">{t('yourOffer')}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {offer.offered_cards_info?.map((card) => (
                              <div key={card.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                                {card.image_url && (
                                  <img src={card.image_url} alt={card.title} className="w-14 h-20 object-cover rounded-lg shadow-sm" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 text-sm truncate">{card.title}</p>
                                  <Badge variant="outline" className="text-xs mt-1">{card.condition}</Badge>
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

                      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
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
                          Chat
                        </Button>
                        {offer.status === 'accepted' && offer.progress_step === 'payment' && (
                          !offer.sender_paid ? (
                            <Button
                              onClick={() => setPaymentOffer({ ...offer, userRole: 'sender' })}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Complete Payment
                            </Button>
                          ) : offer.owner_paid ? (
                            <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Both Paid - Ready!
                            </Badge>
                          ) : (
                            <Badge className="flex-1 h-10 flex items-center justify-center bg-amber-100 text-amber-700">
                              <Clock className="w-4 h-4 mr-2" />
                              Waiting for {offer.owner_name}
                            </Badge>
                          )
                        )}
                        {offer.status === 'accepted' && offer.progress_step === 'preparing_shipment' && (
                          <>
                            <Button
                              onClick={() => setShippingLabelOffer({ offer, role: 'sender' })}
                              variant="outline"
                              className="flex-1"
                            >
                              View Shipping Label
                            </Button>
                            {!offer.sender_package_sent ? (
                              <Button
                                onClick={() => handlePackageSent(offer, 'sender')}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                I Have Sent Package
                              </Button>
                            ) : (
                              <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Package Sent
                              </Badge>
                            )}
                          </>
                        )}
                        {offer.status === 'accepted' && (offer.progress_step === 'preparing_shipment' || offer.progress_step === 'payment') && !offer.hub_photos_sender_package && (
                          <Button
                            onClick={() => setHubInspectionOffer(offer)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Skip to Hub Inspection
                          </Button>
                        )}
                        {offer.status === 'accepted' && offer.progress_step === 'hub_verification' && (
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
                                  await base44.entities.TradeOffer.update(offer.id, updates);
                                  queryClient.invalidateQueries({ queryKey: ['incomingOffers'] });
                                  queryClient.invalidateQueries({ queryKey: ['myOffers'] });
                                  toast.success('Inspection accepted!');
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Everything OK
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setInspectionReviewOffer({ offer, role: 'sender' })}
                                className="flex-1"
                              >
                                View Details
                              </Button>
                            </>
                          ) : (
                            <Badge className="flex-1 h-10 flex items-center justify-center bg-green-100 text-green-700">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Inspection Accepted
                            </Badge>
                          )
                        )}
                        {offer.status === 'accepted' && offer.progress_step === 'shipping_to_users' && offer.owner_inspection_accepted && offer.sender_inspection_accepted && (
                          <Button
                            onClick={() => setFinalAcceptOffer(offer)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete Trade
                            </Button>
                            )}
                            </div>
                            </div>
                            </CardContent>
                            </Card>
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
        open={!!hubInspectionOffer}
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
            setFinalAcceptOffer(inspectionReviewOffer.offer);
          }}
        />
      )}

      {/* Mock Payment Modal */}
      <MockPaymentModal
        open={!!paymentOffer}
        onClose={() => setPaymentOffer(null)}
        tradeOffer={paymentOffer}
        onSuccess={() => handlePaymentSuccess(paymentOffer?.userRole)}
      />

      {/* Mock Shipping Label */}
      {shippingLabelOffer && (
        <MockShippingLabel
          open={!!shippingLabelOffer}
          onClose={() => setShippingLabelOffer(null)}
          tradeOffer={shippingLabelOffer.offer}
          userRole={shippingLabelOffer.role}
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