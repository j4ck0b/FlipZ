import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pencil, 
  MapPin, 
  Calendar,
  Package,
  Search,
  Loader2,
  Mail,
  Heart,
  ArrowRightLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import EditProfileModal from '../components/profile/EditProfileModal';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileListings from '../components/profile/ProfileListings';
import CardDetailSheet from '../components/cards/CardDetailSheet';
import { useLanguage } from '../components/LanguageProvider';

const categoryLabels = {
  pokemon: "Pokémon",
  magic_the_gathering: "Magic: The Gathering",
  yugioh: "Yu-Gi-Oh!",
  sports: "Sports",
  other: "Other"
};

export default function Profile() {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Get userId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get('userId');

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      if (profileUserId) {
        // Load the user being viewed
        const users = await base44.entities.User.filter({ id: profileUserId });
        if (users.length > 0) {
          setViewingUser(users[0]);
        }
      } else {
        // Viewing own profile
        setViewingUser(user);
      }
    };
    loadUser();
  }, [profileUserId]);

  const isOwnProfile = !profileUserId || currentUser?.id === viewingUser?.id;

  const { data: listings = [], isLoading: loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ['userListings', viewingUser?.email],
    queryFn: () => base44.entities.CardListing.filter({ 
      created_by: viewingUser.email,
      status: 'available'
    }),
    enabled: !!viewingUser
  });

  const { data: allListings = [] } = useQuery({
    queryKey: ['allUserListings', viewingUser?.email],
    queryFn: () => base44.entities.CardListing.filter({ created_by: viewingUser.email }),
    enabled: !!viewingUser
  });

  const { data: tradeOffers = [] } = useQuery({
    queryKey: ['userTrades', viewingUser?.email],
    queryFn: async () => {
      const sent = await base44.entities.TradeOffer.filter({ sender_email: viewingUser.email }, '-created_date');
      const received = await base44.entities.TradeOffer.filter({ owner_email: viewingUser.email }, '-created_date');
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!viewingUser
  });

  const stats = {
    activeListings: listings.length,
    completedSales: allListings.filter(l => l.status === 'sold').length,
    tradesMade: allListings.filter(l => l.status === 'traded').length,
    totalValue: listings.reduce((sum, l) => sum + (l.price || 0), 0)
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleEditSuccess = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    setViewingUser(user);
    refetchListings();
  };

  if (!viewingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            {/* Avatar */}
            <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
              <AvatarImage src={viewingUser.profile_picture} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-4xl">
                {getInitials(viewingUser.full_name)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {viewingUser.full_name || viewingUser.email?.split('@')[0] || 'User'}
                  </h1>
                  {!viewingUser.full_name && isOwnProfile && (
                    <p className="text-amber-300 text-sm mb-2">
                      ⚠️ Please set your display name to start trading
                    </p>
                  )}
                  <p className="text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {viewingUser.email}
                  </p>
                </div>
                {isOwnProfile && (
                  <Button 
                    onClick={() => setShowEditModal(true)}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    {t('editProfile')}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                {viewingUser.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {viewingUser.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {t('joined')} {format(new Date(viewingUser.created_date), 'MMMM yyyy')}
                </span>
              </div>

              {viewingUser.bio && (
                <p className="mt-4 text-slate-200 leading-relaxed max-w-2xl">
                  {viewingUser.bio}
                </p>
              )}

              {viewingUser.interested_in && viewingUser.interested_in.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {viewingUser.interested_in.map((category) => (
                    <Badge key={category} variant="outline" className="bg-white/10 border-white/20 text-white">
                      <Heart className="w-3 h-3 mr-1" />
                      {categoryLabels[category]}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8">
          <ProfileStats stats={stats} />
        </div>

        {/* Looking For Section */}
        {viewingUser.looking_for && (
          <Card className="mb-8 border-l-4 border-l-violet-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="w-5 h-5 text-violet-600" />
                {t('lookingFor')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{viewingUser.looking_for}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">{t('activeListings')} ({listings.length})</span>
              <span className="sm:hidden">{t('listings')} ({listings.length})</span>
            </TabsTrigger>
            <TabsTrigger value="trades" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tradeOffers')} ({tradeOffers.length})</span>
              <span className="sm:hidden">{t('trades')} ({tradeOffers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="sold">
              <span className="hidden sm:inline">{t('pastTransactions')} ({stats.completedSales + stats.tradesMade})</span>
              <span className="sm:hidden">{t('past')} ({stats.completedSales + stats.tradesMade})</span>
            </TabsTrigger>
          </TabsList>

          {/* Active Listings */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>{t('activeListings')}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingListings ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <ProfileListings 
                    listings={listings} 
                    onCardClick={setSelectedCard}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trade Offers */}
          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>{t('tradeOffers')}</CardTitle>
              </CardHeader>
              <CardContent>
                {tradeOffers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No trade offers yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tradeOffers.map((offer) => {
                      const isSender = offer.sender_email === viewingUser.email;
                      const otherParty = isSender ? offer.owner_name : offer.sender_name;

                      return (
                        <div 
                          key={offer.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-900">
                                {isSender ? 'Sent to' : 'Received from'} {otherParty}
                              </h4>
                              <Badge className={
                                offer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                offer.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                offer.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              }>
                                {offer.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {isSender ? 'Trading for' : 'They want'}: {offer.requested_card_title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {offer.offered_card_ids?.length || 0} card(s) offered
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Past Transactions */}
          <TabsContent value="sold">
            <Card>
              <CardHeader>
                <CardTitle>{t('pastTransactions')}</CardTitle>
              </CardHeader>
              <CardContent>
                {allListings.filter(l => l.status === 'sold' || l.status === 'traded').length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p>{t('noCompletedTransactions')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allListings
                      .filter(l => l.status === 'sold' || l.status === 'traded')
                      .map((listing) => (
                        <div 
                          key={listing.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-lg"
                        >
                          <div className="w-16 h-20 rounded-lg bg-white overflow-hidden flex-shrink-0">
                            {(listing.image_urls && listing.image_urls.length > 0) || listing.image_url ? (
                              <img 
                                src={listing.image_urls?.[0] || listing.image_url} 
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🃏
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{listing.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">
                              {listing.status === 'sold' ? t('sold') : t('traded')} • 
                              {listing.trade_only ? ` ${t('tradeOnly')}` : ` $${listing.price}`}
                            </p>
                          </div>
                          <Badge className={
                            listing.status === 'sold' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-violet-100 text-violet-700'
                          }>
                            {listing.status === 'sold' ? t('sold') : t('traded')}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {isOwnProfile && (
        <EditProfileModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={currentUser}
          onSuccess={handleEditSuccess}
        />
      )}

      <CardDetailSheet
        listing={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}