import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, 
  Loader2, 
  Search, 
  ArrowRightLeft,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  Camera,
  Truck,
  FileText,
  Clock
} from "lucide-react";
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [inspectionModal, setInspectionModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inspectionData, setInspectionData] = useState({
    hub_photos_sender_package: [],
    hub_photos_owner_package: [],
    hub_notes_sender: '',
    hub_notes_owner: '',
    hub_verification_sender: 'pending',
    hub_verification_owner: 'pending'
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
      
      // Redirect if not admin
      if (u?.role !== 'admin') {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  const { data: tradeOffers = [], isLoading, error } = useQuery({
    queryKey: ['allTradeOffers'],
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('getAdminTrades');
        console.log('Admin panel loaded offers:', data?.trades?.length || 0);
        return data?.trades || [];
      } catch (err) {
        console.error('Error loading trade offers:', err);
        return [];
      }
    },
    enabled: !!user && user.role === 'admin',
    refetchInterval: 10000
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['allListings'],
    queryFn: () => base44.entities.CardListing.list('-created_date', 1000),
    enabled: !!user && user.role === 'admin'
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TradeOffer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTradeOffers'] });
      toast.success('Status wymiany zaktualizowany');
    }
  });

  const filteredOffers = tradeOffers.filter(offer => {
    const matchesSearch = 
      offer.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.requested_card_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (offer, newStatus) => {
    // If cancelling, restore card statuses to available
    if (newStatus === 'cancelled') {
      await base44.entities.CardListing.update(offer.requested_card_id, { status: 'available' });
      for (const cardId of offer.offered_card_ids || []) {
        await base44.entities.CardListing.update(cardId, { status: 'available' });
      }
    }
    updateOfferMutation.mutate({ id: offer.id, data: { status: newStatus } });
  };

  const handleProgressChange = (offerId, newProgress) => {
    updateOfferMutation.mutate({ id: offerId, data: { progress_step: newProgress } });
  };

  const handlePackageReceived = async (offerId, packageType, offer) => {
    const updateData = packageType === 'sender' 
      ? { sender_package_sent: true }
      : { owner_package_sent: true };
    
    // Check if both packages will be received after this update
    const bothReceived = packageType === 'sender' 
      ? updateData.sender_package_sent && offer.owner_package_sent
      : offer.sender_package_sent && updateData.owner_package_sent;
    
    // If both packages received, update status
    if (bothReceived) {
      updateData.status = 'in_transit_to_hub';
      updateData.progress_step = 'hub_verification';
    }
    
    await base44.entities.TradeOffer.update(offerId, updateData);
    queryClient.invalidateQueries({ queryKey: ['allTradeOffers'] });
    toast.success(`Paczka ${packageType === 'sender' ? 'nadawcy' : 'właściciela'} odebrana w Hub`);
  };

  const openInspectionModal = (offer) => {
    setSelectedOffer(offer);
    setInspectionData({
      hub_photos_sender_package: offer.hub_photos_sender_package || [],
      hub_photos_owner_package: offer.hub_photos_owner_package || [],
      hub_notes_sender: offer.hub_notes_sender || '',
      hub_notes_owner: offer.hub_notes_owner || '',
      hub_verification_sender: offer.hub_verification_sender || 'pending',
      hub_verification_owner: offer.hub_verification_owner || 'pending'
    });
    setInspectionModal(true);
  };

  const handleImageUpload = async (e, packageType) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(result.file_url);
    }
    
    const field = packageType === 'sender' ? 'hub_photos_sender_package' : 'hub_photos_owner_package';
    setInspectionData(prev => ({
      ...prev,
      [field]: [...prev[field], ...uploadedUrls]
    }));
    setUploading(false);
  };

  const removeImage = (packageType, index) => {
    const field = packageType === 'sender' ? 'hub_photos_sender_package' : 'hub_photos_owner_package';
    setInspectionData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const saveInspection = async () => {
    if (!selectedOffer) return;
    
    await base44.entities.TradeOffer.update(selectedOffer.id, {
      ...inspectionData,
      status: 'hub_verification',
      progress_step: 'hub_verification'
    });
    
    queryClient.invalidateQueries({ queryKey: ['allTradeOffers'] });
    toast.success('Inspekcja zapisana');
    setInspectionModal(false);
    setSelectedOffer(null);
  };

  const generateShippingLabels = async (offer) => {
    try {
      // Wywołanie funkcji backendowej do generowania prawdziwych etykiet InPost
      const { data } = await base44.functions.invoke('generateShippingLabelsFromHub', {
        tradeOfferId: offer.id
      });

      if (data.success) {
        await base44.entities.TradeOffer.update(offer.id, {
          status: 'shipping_to_users',
          progress_step: 'shipping_to_users'
        });

        queryClient.invalidateQueries({ queryKey: ['allTradeOffers'] });
        toast.success('Etykiety InPost wygenerowane! 🎉');
      } else {
        toast.error(data.error || 'Błąd generowania etykiet');
      }
    } catch (error) {
      console.error('Error generating labels:', error);
      toast.error(error.response?.data?.error || 'Błąd generowania etykiet');
    }
  };

  const getStatusBadge = (offer) => {
    // Use progress_step for more accurate status display
    const step = offer.progress_step || 'offer_sent';
    
    const configs = {
      offer_sent: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle, label: 'Oferta wysłana' },
      accepted: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2, label: 'Zaakceptowana' },
      payment: { color: 'bg-violet-100 text-violet-700', icon: Package, label: 'Płatność' },
      preparing_shipment: { color: 'bg-cyan-100 text-cyan-700', icon: Package, label: 'Przygotowanie' },
      shipping_to_hub: { color: 'bg-indigo-100 text-indigo-700', icon: Truck, label: 'Do Hub' },
      hub_verification: { color: 'bg-purple-100 text-purple-700', icon: Shield, label: 'Inspekcja' },
      shipping_to_users: { color: 'bg-blue-100 text-blue-700', icon: Truck, label: 'Dostawa' },
      packages_delivered: { color: 'bg-teal-100 text-teal-700', icon: CheckCircle2, label: 'Paczki dostarczone' },
      completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Ukończone' },
      failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Nieudane' }
    };
    
    // Override for rejected/cancelled
    if (offer.status === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Odrzucone
        </Badge>
      );
    }
    if (offer.status === 'cancelled') {
      return (
        <Badge className="bg-slate-100 text-slate-700">
          <XCircle className="w-3 h-3 mr-1" />
          Anulowane
        </Badge>
      );
    }
    
    const config = configs[step] || configs.offer_sent;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 md:w-8 h-6 md:h-8 text-violet-600" />
              <span className="hidden md:inline">Panel Administratora</span>
              <span className="md:hidden">Panel Admin</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1">Zarządzanie FlipCardZ</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Wszystkie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-slate-900">{tradeOffers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Oczekujące</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-amber-600">
                {tradeOffers.filter(o => o.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Aktywne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {tradeOffers.filter(o => ['accepted', 'payment_required', 'awaiting_shipment', 'in_transit_to_hub', 'hub_verification', 'shipping_to_users'].includes(o.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-slate-600">Ukończone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {tradeOffers.filter(o => o.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Wymiany</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Szukaj..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 text-sm">
                  <SelectValue placeholder="Filtruj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value="pending">Oczekujące</SelectItem>
                  <SelectItem value="accepted">Zaakceptowane</SelectItem>
                  <SelectItem value="payment_required">Wymaga płatności</SelectItem>
                  <SelectItem value="awaiting_shipment">Oczekuje wysyłki</SelectItem>
                  <SelectItem value="in_transit_to_hub">W drodze do hub</SelectItem>
                  <SelectItem value="hub_verification">Weryfikacja hub</SelectItem>
                  <SelectItem value="shipping_to_users">Wysyłka do użytkowników</SelectItem>
                  <SelectItem value="completed">Ukończone</SelectItem>
                  <SelectItem value="rejected">Odrzucone</SelectItem>
                  <SelectItem value="cancelled">Anulowane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trade Offers List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                <p>Błąd ładowania: {error.message}</p>
              </div>
            ) : tradeOffers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Brak wymian w systemie</p>
                <p className="text-xs mt-2">Żadne wymiany nie zostały jeszcze utworzone</p>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Brak wymian pasujących do filtra</p>
                <p className="text-xs mt-2">Zmień kryteria wyszukiwania</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOffers.map((offer) => (
                  <Card key={offer.id} className="border-l-4 border-l-violet-600">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {/* Header */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-slate-900 text-white font-mono text-xs px-2 py-0.5">
                              #{offer.trade_id || offer.trade_number || offer.id.slice(0, 12)}
                            </Badge>
                            {getStatusBadge(offer)}
                          </div>
                          <h3 className="font-semibold text-sm text-slate-900">
                            {offer.sender_name.substring(0, 15)} ↔ {offer.owner_name.substring(0, 15)}
                          </h3>
                          <p className="text-xs text-slate-600 truncate">
                            {offer.requested_card_title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(offer.created_date), 'dd.MM.yyyy HH:mm')}
                          </p>
                        </div>

                        {/* Details */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 bg-slate-50 rounded text-xs border border-slate-200">
                           <div>
                             <div className="text-slate-600 font-medium">Karty</div>
                             <div className="font-semibold text-slate-900">{offer.offered_card_ids?.length || 0}</div>
                           </div>
                           <div>
                             <div className="text-slate-600 font-medium">Postęp</div>
                             <div className="font-semibold text-slate-900 truncate">{(offer.progress_step || 'offer_sent').replace(/_/g, ' ')}</div>
                           </div>
                           <div>
                             <div className="text-slate-600 font-medium">Escrow</div>
                             <div className="font-semibold text-slate-900">{offer.escrow_mode || '-'}</div>
                           </div>
                           <div>
                             <div className="text-slate-600 font-medium">Płatność</div>
                             <div className={`font-semibold ${offer.both_paid ? 'text-green-700' : 'text-amber-700'}`}>
                               {offer.both_paid ? '✓ Tak' : '✗ Nie'}
                             </div>
                           </div>
                         </div>

                        {/* Payment Status */}
                        {offer.status === 'payment_required' && (
                          <div className="space-y-2 pt-2 border-t bg-amber-50 p-2 md:p-3 rounded text-sm">
                            <h4 className="text-xs md:text-sm font-semibold text-amber-900 flex items-center gap-1 md:gap-2">
                              <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                              Oczekiwanie na płatności
                            </h4>
                            <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                              <div className="flex items-center gap-2">
                                {offer.sender_paid ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <span className={offer.sender_paid ? 'text-green-700 font-medium' : 'text-slate-600'}>
                                  Nadawca: {offer.sender_paid ? 'Zapłacił' : 'Nie zapłacił'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {offer.owner_paid ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <span className={offer.owner_paid ? 'text-green-700 font-medium' : 'text-slate-600'}>
                                  Właściciel: {offer.owner_paid ? 'Zapłacił' : 'Nie zapłacił'}
                                </span>
                              </div>
                            </div>
                            {offer.both_paid && (
                              <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700 mt-2 text-xs md:text-sm"
                                onClick={() => handleStatusChange(offer, 'awaiting_shipment')}
                              >
                                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                Aktywuj wysyłkę
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Shipping to Hub Status - Admin Control */}
                        {(offer.status === 'awaiting_shipment' || offer.status === 'in_transit_to_hub' || offer.status === 'preparing_shipment') && (
                          <div className="space-y-2 pt-3 border-t bg-blue-50 p-3 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Kontrola wysyłki do Hub
                            </h4>
                            <p className="text-xs text-blue-700 mb-2">
                              Zaznacz paczki, które fizycznie dotarły do centrum Hub
                            </p>
                            <div className="space-y-2">
                              <div className={`flex items-center justify-between p-3 rounded border-2 transition-all ${
                                offer.sender_package_sent 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-white border-blue-200'
                              }`}>
                                <div>
                                  <span className="text-sm font-medium block">Paczka od: {offer.sender_name}</span>
                                  <span className="text-xs text-slate-600">{offer.sender_email}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant={offer.sender_package_sent ? "default" : "outline"}
                                  onClick={() => handlePackageReceived(offer.id, 'sender', offer)}
                                  disabled={offer.sender_package_sent}
                                  className={offer.sender_package_sent ? "bg-green-600 hover:bg-green-700" : "border-blue-600 text-blue-600 hover:bg-blue-50"}
                                >
                                  {offer.sender_package_sent ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      W Hub ✓
                                    </>
                                  ) : (
                                    <>
                                      <Package className="w-4 h-4 mr-1" />
                                      Oznacz jako dostarczoną
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className={`flex items-center justify-between p-3 rounded border-2 transition-all ${
                                offer.owner_package_sent 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-white border-blue-200'
                              }`}>
                                <div>
                                  <span className="text-sm font-medium block">Paczka od: {offer.owner_name}</span>
                                  <span className="text-xs text-slate-600">{offer.owner_email}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant={offer.owner_package_sent ? "default" : "outline"}
                                  onClick={() => handlePackageReceived(offer.id, 'owner', offer)}
                                  disabled={offer.owner_package_sent}
                                  className={offer.owner_package_sent ? "bg-green-600 hover:bg-green-700" : "border-blue-600 text-blue-600 hover:bg-blue-50"}
                                >
                                  {offer.owner_package_sent ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      W Hub ✓
                                    </>
                                  ) : (
                                    <>
                                      <Package className="w-4 h-4 mr-1" />
                                      Oznacz jako dostarczoną
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            {offer.sender_package_sent && offer.owner_package_sent ? (
                              <div className="mt-3 p-3 bg-green-100 border-2 border-green-400 rounded-lg">
                                <p className="text-sm text-green-900 font-medium flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5" />
                                  Obie paczki w Hub - możesz rozpocząć inspekcję ✓
                                </p>
                              </div>
                            ) : (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs text-amber-800 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Oczekiwanie na dostarczenie {
                                    !offer.sender_package_sent && !offer.owner_package_sent ? 'obu paczek' :
                                    !offer.sender_package_sent ? 'paczki nadawcy' :
                                    'paczki właściciela'
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Hub Inspection */}
                        {(offer.sender_package_sent && offer.owner_package_sent) && (
                          <div className="space-y-2 pt-3 border-t bg-violet-50 p-3 rounded-lg">
                            <h4 className="text-sm font-semibold text-violet-900 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Weryfikacja w Hub
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                              <div className={`p-2 rounded ${
                                offer.hub_verification_sender === 'passed' ? 'bg-green-100' :
                                offer.hub_verification_sender === 'failed' ? 'bg-red-100' :
                                'bg-slate-100'
                              }`}>
                                <div className="font-medium mb-1">Paczka nadawcy</div>
                                <div className="flex items-center gap-1">
                                  {offer.hub_verification_sender === 'passed' && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                                  {offer.hub_verification_sender === 'failed' && <XCircle className="w-3 h-3 text-red-600" />}
                                  {offer.hub_verification_sender === 'pending' && <AlertCircle className="w-3 h-3 text-slate-400" />}
                                  <span>{offer.hub_verification_sender || 'Oczekuje'}</span>
                                </div>
                              </div>
                              <div className={`p-2 rounded ${
                                offer.hub_verification_owner === 'passed' ? 'bg-green-100' :
                                offer.hub_verification_owner === 'failed' ? 'bg-red-100' :
                                'bg-slate-100'
                              }`}>
                                <div className="font-medium mb-1">Paczka właściciela</div>
                                <div className="flex items-center gap-1">
                                  {offer.hub_verification_owner === 'passed' && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                                  {offer.hub_verification_owner === 'failed' && <XCircle className="w-3 h-3 text-red-600" />}
                                  {offer.hub_verification_owner === 'pending' && <AlertCircle className="w-3 h-3 text-slate-400" />}
                                  <span>{offer.hub_verification_owner || 'Oczekuje'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openInspectionModal(offer)}
                                className="flex-1"
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                {offer.hub_verification_sender === 'pending' || offer.hub_verification_owner === 'pending' 
                                  ? 'Rozpocznij inspekcję' 
                                  : 'Edytuj inspekcję'}
                              </Button>
                              {offer.hub_verification_sender === 'passed' && offer.hub_verification_owner === 'passed' && (
                                <Button
                                  size="sm"
                                  onClick={() => generateShippingLabels(offer)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Truck className="w-4 h-4 mr-1" />
                                  Wyślij do użytkowników
                                </Button>
                              )}
                            </div>
                            {offer.hub_verification_sender === 'failed' || offer.hub_verification_owner === 'failed' && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-xs text-red-800 flex items-center gap-2">
                                  <AlertCircle className="w-3 h-3" />
                                  Inspekcja wykryła problem - skontaktuj się z użytkownikami
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Packages Delivered - Final Confirmation */}
                        {offer.progress_step === 'packages_delivered' && (
                          <div className="space-y-2 pt-3 border-t bg-teal-50 p-3 rounded-lg">
                            <h4 className="text-sm font-semibold text-teal-900 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Obie paczki dostarczone
                            </h4>
                            <p className="text-xs text-teal-700 mb-2">
                              Obie strony potwierdziły odbiór swoich paczek
                            </p>
                            <div className="space-y-2">
                              <div className="p-3 rounded bg-green-50 border-2 border-green-300">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium block">{offer.sender_name}</span>
                                    <span className="text-xs text-slate-600">Otrzymał paczkę ✓</span>
                                  </div>
                                  <Badge className="bg-green-600 text-white">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Potwierdzone
                                  </Badge>
                                </div>
                              </div>
                              <div className="p-3 rounded bg-green-50 border-2 border-green-300">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium block">{offer.owner_name}</span>
                                    <span className="text-xs text-slate-600">Otrzymał paczkę ✓</span>
                                  </div>
                                  <Badge className="bg-green-600 text-white">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Potwierdzone
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={async () => {
                                await base44.entities.TradeOffer.update(offer.id, {
                                  status: 'completed',
                                  progress_step: 'completed'
                                });
                                queryClient.invalidateQueries({ queryKey: ['allTradeOffers'] });
                                toast.success('Wymiana oznaczona jako ukończona! 🎉');
                              }}
                              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Zakończ wymianę
                            </Button>
                          </div>
                        )}

                        {/* Final Delivery Status - User Controlled */}
                        {offer.status === 'shipping_to_users' && offer.progress_step !== 'packages_delivered' && (
                          <div className="space-y-2 pt-3 border-t bg-emerald-50 p-3 rounded-lg">
                            <h4 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Status dostawy końcowej
                            </h4>
                            <p className="text-xs text-emerald-700 mb-2">
                              Użytkownicy potwierdzają odbiór swoich paczek
                            </p>
                            <div className="space-y-2">
                              <div className={`p-3 rounded border-2 ${
                                offer.sender_delivered 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-white border-emerald-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium block">{offer.sender_name}</span>
                                    <span className="text-xs text-slate-600">Otrzymuje od: {offer.owner_name}</span>
                                  </div>
                                  {offer.sender_delivered ? (
                                    <Badge className="bg-green-600 text-white">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Potwierdzone ✓
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Oczekuje
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className={`p-3 rounded border-2 ${
                                offer.owner_delivered 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-white border-emerald-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-sm font-medium block">{offer.owner_name}</span>
                                    <span className="text-xs text-slate-600">Otrzymuje od: {offer.sender_name}</span>
                                  </div>
                                  {offer.owner_delivered ? (
                                    <Badge className="bg-green-600 text-white">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Potwierdzone ✓
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-700">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Oczekuje
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {offer.sender_delivered && offer.owner_delivered ? (
                              <div className="mt-3 p-3 bg-green-100 border-2 border-green-400 rounded-lg">
                                <p className="text-sm text-green-900 font-medium flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5" />
                                  Obie strony potwierdziły odbiór - wymiana ukończona! ✓
                                </p>
                              </div>
                            ) : (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-800 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Oczekiwanie na potwierdzenie odbioru przez użytkowników
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Admin Controls */}
                        <div className="flex flex-col gap-2 md:flex-row md:gap-3 pt-2 md:pt-3 border-t">
                          <div className="flex-1">
                            <label className="text-xs text-slate-600 mb-1 block">Status</label>
                            <Select 
                              value={offer.status} 
                              onValueChange={(value) => handleStatusChange(offer, value)}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Oczekujące</SelectItem>
                                <SelectItem value="accepted">Zaakceptowane</SelectItem>
                                <SelectItem value="rejected">Odrzucone</SelectItem>
                                <SelectItem value="payment_required">Wymaga płatności</SelectItem>
                                <SelectItem value="awaiting_shipment">Oczekuje wysyłki</SelectItem>
                                <SelectItem value="in_transit_to_hub">W drodze do hub</SelectItem>
                                <SelectItem value="hub_verification">Weryfikacja hub</SelectItem>
                                <SelectItem value="shipping_to_users">Wysyłka do użytkowników</SelectItem>
                                <SelectItem value="completed">Ukończone</SelectItem>
                                <SelectItem value="cancelled">Anulowane</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex-1">
                            <label className="text-xs text-slate-600 mb-1 block">Krok</label>
                            <Select 
                              value={offer.progress_step || 'offer_sent'} 
                              onValueChange={(value) => handleProgressChange(offer.id, value)}
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="offer_sent">Oferta wysłana</SelectItem>
                                <SelectItem value="accepted">Zaakceptowana</SelectItem>
                                <SelectItem value="payment">Płatność</SelectItem>
                                <SelectItem value="preparing_shipment">Przygotowanie wysyłki</SelectItem>
                                <SelectItem value="shipping_to_hub">Wysyłka do hub</SelectItem>
                                <SelectItem value="hub_verification">Weryfikacja hub</SelectItem>
                                <SelectItem value="shipping_to_users">Wysyłka do użytkowników</SelectItem>
                                <SelectItem value="packages_delivered">Paczki dostarczone</SelectItem>
                                <SelectItem value="completed">Ukończone</SelectItem>
                                <SelectItem value="failed">Nieudane</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inspection Modal */}
      <Dialog open={inspectionModal} onOpenChange={setInspectionModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inspekcja paczek - Hub</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Sender Package */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Paczka nadawcy ({selectedOffer?.sender_name})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Photos */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Zdjęcia inspekcji</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {inspectionData.hub_photos_sender_package.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img src={url} alt={`Sender ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage('sender', idx)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-slate-400">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'sender')}
                      className="hidden"
                    />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <span className="text-sm text-slate-500">Dodaj zdjęcia</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Verification */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status weryfikacji</label>
                  <Select 
                    value={inspectionData.hub_verification_sender}
                    onValueChange={(v) => setInspectionData(prev => ({ ...prev, hub_verification_sender: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Oczekuje</SelectItem>
                      <SelectItem value="passed">Zatwierdzona ✓</SelectItem>
                      <SelectItem value="failed">Odrzucona ✗</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Notatki</label>
                  <Textarea
                    value={inspectionData.hub_notes_sender}
                    onChange={(e) => setInspectionData(prev => ({ ...prev, hub_notes_sender: e.target.value }))}
                    placeholder="Notatki z inspekcji..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Owner Package */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Paczka właściciela ({selectedOffer?.owner_name})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Photos */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Zdjęcia inspekcji</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {inspectionData.hub_photos_owner_package.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img src={url} alt={`Owner ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage('owner', idx)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-slate-400">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'owner')}
                      className="hidden"
                    />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <span className="text-sm text-slate-500">Dodaj zdjęcia</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Verification */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status weryfikacji</label>
                  <Select 
                    value={inspectionData.hub_verification_owner}
                    onValueChange={(v) => setInspectionData(prev => ({ ...prev, hub_verification_owner: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Oczekuje</SelectItem>
                      <SelectItem value="passed">Zatwierdzona ✓</SelectItem>
                      <SelectItem value="failed">Odrzucona ✗</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Notatki</label>
                  <Textarea
                    value={inspectionData.hub_notes_owner}
                    onChange={(e) => setInspectionData(prev => ({ ...prev, hub_notes_owner: e.target.value }))}
                    placeholder="Notatki z inspekcji..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setInspectionModal(false)} className="flex-1">
                Anuluj
              </Button>
              <Button onClick={saveInspection} className="flex-1 bg-violet-600 hover:bg-violet-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Zapisz inspekcję
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}