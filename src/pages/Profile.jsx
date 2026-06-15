import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Pencil,
  MapPin,
  Calendar,
  Package,
  Loader2,
  Mail,
  Heart,
  TrendingUp,
  Crown,
  Shield,
  CheckCircle,
  X,
  Save
} from "lucide-react";
import CardItem from '../components/cards/CardItem';
import CardDetailSheet from '../components/cards/CardDetailSheet';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile, updateProfile } = useAuth();
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: ''
  });
  const [userListings, setUserListings] = useState([]);
  const [stats, setStats] = useState({
    activeListings: 0,
    completedTrades: 0,
    totalValue: 0
  });
  const [profileError, setProfileError] = useState('');

  // Sprawdź czy to własny profil
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    fetchProfile();
  }, [user, userId, currentUserProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      setProfileError('');

      if (isOwnProfile) {
        // Własny profil wymaga aktywnej sesji i załadowanego currentUserProfile
        if (!user) {
          navigate('/login');
          return;
        }

        if (!currentUserProfile) {
          setViewingProfile(null);
          return;
        }

        setViewingProfile(currentUserProfile);
        setEditForm({
          username: currentUserProfile.username || '',
          full_name: currentUserProfile.full_name || '',
          bio: currentUserProfile.bio || '',
          location: currentUserProfile.location || ''
        });

        await fetchStats(user.id, currentUserProfile.email);
        return;
      }

      // Profil innego użytkownika - dostępny również bez aktywnej sesji
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setViewingProfile(null);
        setProfileError('Nie udało się otworzyć tego profilu. Sprawdź polityki RLS w Supabase (odczyt publicznych profili).');
        return;
      }

      setViewingProfile(data);
      await fetchStats(userId, data?.email);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (profileUserId, profileEmail = null) => {
    try {
      console.log('Fetching stats for:', { profileUserId, profileEmail });
      
      // 1. Fetch active listings
      // Use .or to cover both old (email/created_by as string) and new (created_by_id as UUID) columns
      let query = supabase
        .from('card_listings')
        .select('*')
        .eq('status', 'available');
      
      if (profileEmail) {
        query = query.or(`created_by_id.eq.${profileUserId},created_by.eq.${profileUserId},owner_email.eq.${profileEmail}`);
      } else {
        query = query.or(`created_by_id.eq.${profileUserId},created_by.eq.${profileUserId}`);
      }

      // Try ordering by created_date first (observed in CardExchange.jsx)
      const { data: listingsData, error: listingsError } = await query
        .order('created_date', { ascending: false });

      if (listingsError) {
        console.error('Error fetching user listings, trying without order:', listingsError);
        // Fallback: try without order if created_date fails
        const { data: retryData } = await query;
        setUserListings(retryData || []);
      } else {
        setUserListings(listingsData || []);
      }

      // 2. Fetch completed trades count
      const { count: tradesCount, error: tradesError } = await supabase
        .from('trade_offers')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${profileUserId},owner_id.eq.${profileUserId}${profileEmail ? `,sender_email.eq.${profileEmail},owner_email.eq.${profileEmail}` : ''}`)
        .eq('status', 'completed');

      setStats({
        activeListings: listingsData?.length || 0,
        completedTrades: tradesCount || 0,
        totalValue: listingsData?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const { error } = await updateProfile(editForm);
      if (error) {
        console.error('Error updating profile:', error);
        return;
      }
      setViewingProfile({ ...viewingProfile, ...editForm });
      setEditMode(false);
    } catch (error) {
      console.error('Error in handleEditSubmit:', error);
    }
  };

  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-slate-600">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!viewingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profil nie znaleziony</h2>
          <p className="text-slate-600 mb-6">Nie można znaleźć tego profilu</p>
          <Button onClick={() => navigate('/home')}>
            Wróć do strony głównej
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="panel-elevated text-white rounded-2xl p-8 mb-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Avatar */}
          <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
            <AvatarImage src={viewingProfile.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-4xl font-bold">
              {getInitials(viewingProfile.full_name || viewingProfile.username, viewingProfile.email)}
            </AvatarFallback>
          </Avatar>
          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {viewingProfile.full_name || viewingProfile.username || 'Użytkownik'}
                  </h1>
                  {viewingProfile.role === 'admin' && (
                    <Badge className="bg-violet-600/80 hover:bg-violet-600 text-white border-0">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {viewingProfile.subscription_tier !== 'free' && (
                    <Badge className="bg-yellow-500/80 hover:bg-yellow-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      {viewingProfile.subscription_tier === 'basic' ? 'Basic' :
                       viewingProfile.subscription_tier === 'premium' ? 'Premium' :
                       viewingProfile.subscription_tier === 'pro' ? 'Pro' :
                       viewingProfile.subscription_tier}
                    </Badge>
                  )}
                </div>
                {isOwnProfile && (
                  <p className="text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-violet-400" />
                    {viewingProfile.email}
                  </p>
                )}
              </div>
              {isOwnProfile && (
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  {editMode ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Anuluj
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edytuj profil
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-4">
              {viewingProfile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  {viewingProfile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-violet-400" />
                Dołączył {new Date(viewingProfile.created_at).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            {viewingProfile.bio && !editMode && (
              <p className="text-slate-200 leading-relaxed max-w-2xl bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                {viewingProfile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <Card className="mb-8 panel-elevated border-0 ring-1 ring-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-slate-100">Edytuj profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nazwa użytkownika
              </label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                placeholder="Twoja nazwa użytkownika"
                className="dark-input rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Pełna nazwa
              </label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Jan Kowalski"
                className="dark-input rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lokalizacja
              </label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Warszawa, Polska"
                className="dark-input rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bio
              </label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Opowiedz coś o sobie..."
                rows={4}
                className="dark-input rounded-xl resize-none"
              />
            </div>
            <Button onClick={handleEditSubmit} className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20 rounded-xl py-5">
              <Save className="w-4 h-4" />
              Zapisz zmiany
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="panel-elevated border-0 ring-1 ring-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Aktywne ogłoszenia</p>
                <p className="text-3xl font-bold text-white">{stats.activeListings}</p>
              </div>
              <Package className="w-12 h-12 text-cyan-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card className="panel-elevated border-0 ring-1 ring-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Ukończone wymiany</p>
                <p className="text-3xl font-bold text-white">{stats.completedTrades}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-emerald-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card className="panel-elevated border-0 ring-1 ring-white/10 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Wartość kolekcji</p>
                <p className="text-3xl font-bold text-white">{stats.totalValue} zł</p>
              </div>
              <TrendingUp className="w-12 h-12 text-violet-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="space-y-6 dark-tabs">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="listings" className="rounded-lg text-slate-300 data-[state=active]:text-white">Ogłoszenia</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg text-slate-300 data-[state=active]:text-white">Opinie</TabsTrigger>
          <TabsTrigger value="favorites" className="rounded-lg text-slate-300 data-[state=active]:text-white">Ulubione</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="space-y-6">
          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing) => (
                <CardItem 
                  key={listing.id} 
                  listing={listing} 
                  onClick={() => {
                    setSelectedCard(listing);
                    setIsDetailOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-white/10 bg-white/5 text-slate-300 rounded-2xl">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">
                {isOwnProfile ? 'Nie masz jeszcze ogłoszeń' : 'Brak ogłoszeń'}
              </h3>
              <p className="text-slate-400 mb-6">
                {isOwnProfile ? 'Wystaw swój pierwszy przedmiot!' : 'Ten użytkownik nie ma jeszcze ogłoszeń'}
              </p>
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/home')} // Or where you list new cards
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20 rounded-xl"
                >
                  <Package className="w-4 h-4" />
                  Wystaw ogłoszenie
                </Button>
              )}
            </Card>
          )}
        </TabsContent>
        <TabsContent value="reviews">
          <Card className="p-12 text-center border border-white/10 bg-white/5 text-slate-300 rounded-2xl">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Brak opinii</h3>
            <p className="text-slate-400">
              {isOwnProfile ? 'Dokończ pierwszą wymianę aby otrzymać opinię' : 'Ten użytkownik nie ma jeszcze opinii'}
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="favorites">
          <Card className="p-12 text-center border border-white/10 bg-white/5 text-slate-300 rounded-2xl">
            <div className="text-6xl mb-4">💖</div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Brak ulubionych</h3>
            <p className="text-slate-400">
              {isOwnProfile ? 'Polub przedmioty które Cię interesują' : 'Ten użytkownik nie ma publicznych ulubionych'}
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <CardDetailSheet 
        card={selectedCard}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCard(null);
        }}
      />
    </div>
  );
}
