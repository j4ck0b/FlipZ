import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile, updateProfile } = useAuth();
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: ''
  });
  const [stats, setStats] = useState({
    activeListings: 0,
    completedTrades: 0,
    totalValue: 0
  });

  // Sprawdź czy to własny profil
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      if (isOwnProfile) {
        // Własny profil - użyj currentUserProfile
        setViewingProfile(currentUserProfile);
        setEditForm({
          username: currentUserProfile?.username || '',
          full_name: currentUserProfile?.full_name || '',
          bio: currentUserProfile?.bio || '',
          location: currentUserProfile?.location || ''
        });
      } else {
        // Profil innego użytkownika
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          navigate('/home');
          return;
        }

        setViewingProfile(data);
      }

      // Fetch stats
      await fetchStats(userId || user.id);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (profileUserId) => {
    try {
      // Try to get stats from database
      try {
        const { data: listingsData } = await supabase
          .from('listings')
          .select('id', { count: 'exact' })
          .eq('user_id', profileUserId)
          .eq('status', 'available');

        const { data: tradesData } = await supabase
          .from('trades')
          .select('id', { count: 'exact' })
          .eq('user_id', profileUserId)
          .eq('status', 'completed');

        setStats({
          activeListings: listingsData?.length || 0,
          completedTrades: tradesData?.length || 0,
          totalValue: 0
        });
      } catch (dbError) {
        // Tables don't exist yet - use mock data
        setStats({
          activeListings: 5,
          completedTrades: 12,
          totalValue: 2500
        });
      }
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
            <AvatarImage src={viewingProfile.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-4xl">
              {getInitials(viewingProfile.full_name || viewingProfile.username, viewingProfile.email)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {viewingProfile.full_name || viewingProfile.username || 'Użytkownik'}
                  </h1>
                  {viewingProfile.role === 'admin' && (
                    <Badge className="bg-violet-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {viewingProfile.subscription_tier !== 'free' && (
                    <Badge className="bg-yellow-500">
                      <Crown className="w-3 h-3 mr-1" />
                      {viewingProfile.subscription_tier}
                    </Badge>
                  )}
                </div>
                
                <p className="text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {viewingProfile.email}
                </p>
              </div>

              {isOwnProfile && (
                <Button 
                  onClick={() => setEditMode(!editMode)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                  <MapPin className="w-4 h-4" />
                  {viewingProfile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Dołączył {new Date(viewingProfile.created_at).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {viewingProfile.bio && !editMode && (
              <p className="text-slate-200 leading-relaxed">
                {viewingProfile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <Card className="mb-8 border-2 border-violet-200">
          <CardHeader>
            <CardTitle>Edytuj profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nazwa użytkownika
              </label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                placeholder="Twoja nazwa użytkownika"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pełna nazwa
              </label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Jan Kowalski"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lokalizacja
              </label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Warszawa, Polska"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bio
              </label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Opowiedz coś o sobie..."
                rows={4}
              />
            </div>

            <Button onClick={handleEditSubmit} className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600">
              <Save className="w-4 h-4" />
              Zapisz zmiany
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Aktywne ogłoszenia</p>
                <p className="text-3xl font-bold text-slate-900">{stats.activeListings}</p>
              </div>
              <Package className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ukończone wymiany</p>
                <p className="text-3xl font-bold text-slate-900">{stats.completedTrades}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Wartość kolekcji</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalValue} zł</p>
              </div>
              <TrendingUp className="w-12 h-12 text-violet-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings">Ogłoszenia</TabsTrigger>
          <TabsTrigger value="reviews">Opinie</TabsTrigger>
          <TabsTrigger value="favorites">Ulubione</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {isOwnProfile ? 'Nie masz jeszcze ogłoszeń' : 'Brak ogłoszeń'}
            </h3>
            <p className="text-slate-600 mb-6">
              {isOwnProfile ? 'Wystaw swój pierwszy przedmiot!' : 'Ten użytkownik nie ma jeszcze ogłoszeń'}
            </p>
            {isOwnProfile && (
              <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600">
                <Package className="w-4 h-4" />
                Wystaw ogłoszenie
              </Button>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Brak opinii</h3>
            <p className="text-slate-600">
              {isOwnProfile ? 'Dokończ pierwszą wymianę aby otrzymać opinię' : 'Ten użytkownik nie ma jeszcze opinii'}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">💖</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Brak ulubionych</h3>
            <p className="text-slate-600">
              {isOwnProfile ? 'Polub przedmioty które Cię interesują' : 'Ten użytkownik nie ma publicznych ulubionych'}
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
