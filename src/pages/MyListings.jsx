import React, { useState, useEffect } from 'react';
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
  MoreVertical
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

const statusConfig = {
  available: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: Eye },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  sold: { label: 'Sold', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  traded: { label: 'Traded', color: 'bg-violet-100 text-violet-700', icon: ArrowRightLeft }
};

export default function MyListings() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');

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

  const { data: myRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['myRequests', currentUser?.email],
    queryFn: () => base44.entities.TradeRequest.filter({ buyer_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser
  });

  const { data: incomingRequests = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ['incomingRequests', currentUser?.email],
    queryFn: () => base44.entities.TradeRequest.filter({ seller_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser
  });

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

  const handleRequestAction = async (request, action) => {
    await base44.entities.TradeRequest.update(request.id, { status: action });
    
    if (action === 'accepted') {
      await base44.entities.CardListing.update(request.listing_id, { 
        status: request.request_type === 'trade' ? 'traded' : 'sold' 
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    toast.success(`Request ${action}`);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
  };

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your listings and trade requests</p>
            </div>
            <Button 
              onClick={() => {
                setEditingListing(null);
                setShowListingModal(true);
              }}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Listing
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 mb-6">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              My Listings
              <Badge variant="secondary" className="ml-1">{myListings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Incoming Requests
              {pendingIncoming > 0 && (
                <Badge className="ml-1 bg-rose-500">{pendingIncoming}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <DollarSign className="w-4 h-4" />
              My Offers
              <Badge variant="secondary" className="ml-1">{myRequests.length}</Badge>
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
                  <h3 className="font-semibold text-slate-900 mb-2">No listings yet</h3>
                  <p className="text-slate-500 mb-4">Start by listing your first card</p>
                  <Button onClick={() => setShowListingModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
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
                            <div className="flex items-center gap-4 p-4">
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
                                  {listing.trade_only ? 'Trade Only' : `$${listing.price}`}
                                </p>
                              </div>

                              {/* Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-5 h-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setEditingListing(listing);
                                    setShowListingModal(true);
                                  }}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  {listing.status === 'available' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleStatusChange(listing, 'sold')}>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Mark as Sold
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusChange(listing, 'traded')}>
                                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                                        Mark as Traded
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => setDeleteConfirm(listing)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
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

          {/* Incoming Requests Tab */}
          <TabsContent value="incoming">
            {loadingIncoming ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : incomingRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <ArrowRightLeft className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No requests yet</h3>
                  <p className="text-slate-500">Requests from buyers will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {incomingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <button
                            onClick={() => {
                              const { createPageUrl } = require('../utils');
                              window.location.href = createPageUrl('Profile') + '?userId=' + request.buyer_email;
                            }}
                            className="font-semibold text-slate-900 hover:text-slate-700 hover:underline transition-colors"
                          >
                            {request.buyer_name}
                          </button>
                          <p className="text-sm text-slate-500">
                            wants to {request.request_type} <span className="font-medium">{request.listing_title}</span>
                          </p>
                          {request.request_type === 'purchase' && request.offer_amount && (
                            <p className="text-lg font-bold text-slate-900 mt-2">
                              Offer: ${request.offer_amount}
                            </p>
                          )}
                          {request.request_type === 'trade' && request.trade_offer && (
                            <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                              {request.trade_offer}
                            </p>
                          )}
                          {request.message && (
                            <p className="text-sm text-slate-600 mt-2 italic">"{request.message}"</p>
                          )}
                        </div>
                        
                        <Badge className={
                          request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {request.status}
                        </Badge>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button 
                            onClick={() => handleRequestAction(request, 'accepted')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleRequestAction(request, 'declined')}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Offers Tab */}
          <TabsContent value="sent">
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : myRequests.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <DollarSign className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No offers made</h3>
                  <p className="text-slate-500">Your purchase/trade offers will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{request.listing_title}</p>
                          <p className="text-sm text-slate-500">
                            {request.request_type === 'purchase' ? 'Purchase request' : 'Trade request'}
                          </p>
                          {request.offer_amount && (
                            <p className="text-sm text-slate-600 mt-1">
                              Your offer: <span className="font-medium">${request.offer_amount}</span>
                            </p>
                          )}
                          {request.trade_offer && (
                            <p className="text-sm text-slate-600 mt-1">
                              Offered: {request.trade_offer}
                            </p>
                          )}
                        </div>
                        <Badge className={
                          request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {request.status}
                        </Badge>
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

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}