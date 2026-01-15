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
  FileText
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
        const offers = await base44.asServiceRole.entities.TradeOffer.list('-created_date', 1000);
        console.log('Admin panel loaded offers:', offers.length);
        return offers;
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
    queryFn: () => base44.asServiceRole.entities.CardListing.list('-created_date', 1000),
    enabled: !!user && user.role === 'admin'
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, data }) => base44.asServiceRole.entities.TradeOffer.update(id, data),
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
      await base44.asServiceRole.entities.CardListing.update(offer.requested_card_id, { status: 'available' });
      for (const cardId of offer.offered_card_ids || []) {
        await base44.asServiceRole.entities.CardListing.update(cardId, { status: 'available' });
      }
    }
    updateOfferMutation.mutate({ id: offer.id, data: { status: newStatus } });
  };

  const handleProgressChange = (offerId, newProgress) => {
    updateOfferMutation.mutate({ id: offerId, data: { progress_step: newProgress } });
  };

  const handlePackageReceived = async (offerId, packageType) => {
    const updateData = packageType === 'sender' 
      ? { sender_package_sent: true }
      : { owner_package_sent: true };
    
    await base44.asServiceRole.entities.TradeOffer.update(offerId, updateData);
    queryClient.invalidateQueries({ queryKey: ['allTradeOffers'] });
    toast.success(`Paczka ${packageType === 'sender' ? 'nadawcy' : 'właściciela'} potwierdzona`);
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
    
    await base44.asServiceRole.entities.TradeOffer.update(selectedOffer.id, {
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
    // Generowanie etykiet wysyłkowych po inspekcji
    try {
      // Etykieta dla nadawcy (dostanie paczkę właściciela)
      await base44.asServiceRole.entities.ShippingLabel.create({
        trade_offer_id: offer.id,
        sender_email: 'hub@flipcardz.store',
        recipient_email: offer.sender_email,
        sender_address: 'FlipCardZ Hub, ul. Przykładowa 1, 00-001 Warszawa',
        recipient_address: 'Adres nadawcy',
        tracking_number: `TRACK-${Date.now()}-A`,
        status: 'pending'
      });

      // Etykieta dla właściciela (dostanie paczkę nadawcy)
      await base44.asServiceRole.entities.ShippingLabel.create({
        trade_offer_id: offer.id,
        sender_email: 'hub@flipcardz.store',
        recipient_email: offer.owner_email,
        sender_address: 'FlipCardZ Hub, ul. Przykładowa 1, 00-001 Warszawa',
        recipient_address: 'Adres właściciela',
        tracking_number: `TRACK-${Date.now()}-B`,
        status: 'pending'
      });

      await base44.asServiceRole.entities.TradeOffer.update(offer.id, {
        status: 'shipping_to_users',
        progress_step: 'shipping_to_users'
      });

      queryClient.invalidateQueries({ queryKey: ['allTradeOffers'] });
      toast.success('Etykiety wysyłkowe wygenerowane');
    } catch (error) {
      toast.error('Błąd generowania etykiet');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
      accepted: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
      payment_required: { color: 'bg-blue-100 text-blue-700', icon: Package },
      completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
      cancelled: { color: 'bg-slate-100 text-slate-700', icon: XCircle }
    };
    
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-violet-600" />
              Panel Administratora
            </h1>
            <p className="text-slate-600 mt-1">Zarządzanie platformą FlipCardZ</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Wszystkie wymiany</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{tradeOffers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Oczekujące</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {tradeOffers.filter(o => o.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Aktywne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tradeOffers.filter(o => ['accepted', 'payment_required', 'awaiting_shipment', 'in_transit_to_hub', 'hub_verification', 'shipping_to_users'].includes(o.status)).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Ukończone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
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
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Szukaj po nazwie użytkownika lub karcie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtruj status" />
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
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-slate-900 text-white font-mono text-xs">
                                {offer.trade_number || `#${offer.id.slice(0, 8)}`}
                              </Badge>
                              <h3 className="font-semibold text-slate-900">
                                {offer.sender_name} ↔ {offer.owner_name}
                              </h3>
                              {getStatusBadge(offer.status)}
                            </div>
                            <p className="text-sm text-slate-600">
                              Karta: <span className="font-medium">{offer.requested_card_title}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Utworzono: {format(new Date(offer.created_date), 'dd.MM.yyyy HH:mm')}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                          <div>
                            <span className="text-slate-600">Oferowane karty:</span>
                            <span className="ml-2 font-medium">{offer.offered_card_ids?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Krok postępu:</span>
                            <span className="ml-2 font-medium">{offer.progress_step || 'offer_sent'}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Tryb escrow:</span>
                            <span className="ml-2 font-medium">{offer.escrow_mode || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Obaj zapłacili:</span>
                            <span className="ml-2 font-medium">{offer.both_paid ? '✓ Tak' : '✗ Nie'}</span>
                          </div>
                        </div>

                        {/* Package Status */}
                        {(offer.status === 'in_transit_to_hub' || offer.status === 'awaiting_shipment') && (
                          <div className="space-y-2 pt-3 border-t">
                            <h4 className="text-sm font-semibold text-slate-900">Status paczek</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                size="sm"
                                variant={offer.sender_package_sent ? "default" : "outline"}
                                onClick={() => handlePackageReceived(offer.id, 'sender')}
                                disabled={offer.sender_package_sent}
                              >
                                {offer.sender_package_sent ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Package className="w-4 h-4 mr-1" />}
                                Paczka nadawcy
                              </Button>
                              <Button
                                size="sm"
                                variant={offer.owner_package_sent ? "default" : "outline"}
                                onClick={() => handlePackageReceived(offer.id, 'owner')}
                                disabled={offer.owner_package_sent}
                              >
                                {offer.owner_package_sent ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Package className="w-4 h-4 mr-1" />}
                                Paczka właściciela
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Hub Actions */}
                        {(offer.sender_package_sent && offer.owner_package_sent) && (
                          <div className="space-y-2 pt-3 border-t">
                            <h4 className="text-sm font-semibold text-slate-900">Akcje Hub</h4>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openInspectionModal(offer)}
                                className="flex-1"
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Inspekcja paczek
                              </Button>
                              {offer.hub_verification_sender === 'passed' && offer.hub_verification_owner === 'passed' && (
                                <Button
                                  size="sm"
                                  onClick={() => generateShippingLabels(offer)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Truck className="w-4 h-4 mr-1" />
                                  Generuj etykiety
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Admin Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
                          <div className="flex-1">
                            <label className="text-xs text-slate-600 mb-1 block">Zmień status</label>
                            <Select 
                              value={offer.status} 
                              onValueChange={(value) => handleStatusChange(offer, value)}
                            >
                              <SelectTrigger className="h-9">
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
                            <label className="text-xs text-slate-600 mb-1 block">Zmień krok postępu</label>
                            <Select 
                              value={offer.progress_step || 'offer_sent'} 
                              onValueChange={(value) => handleProgressChange(offer.id, value)}
                            >
                              <SelectTrigger className="h-9">
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