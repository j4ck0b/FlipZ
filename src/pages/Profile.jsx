import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
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
  Shield,
  CheckCircle,
  X,
  Save,
  Terminal,
  Activity,
  Award,
  Layers
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

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    fetchProfile();
  }, [user, userId, currentUserProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setProfileError('');

      if (isOwnProfile) {
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        setViewingProfile(null);
        setProfileError('Nie udało się załadować profilu.');
      } else {
        setViewingProfile(data);
        await fetchStats(userId, data.email);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (uid, email) => {
    try {
      const { data: listings } = await supabase
        .from('card_listings')
        .select('*')
        .or(`created_by.eq.${uid},created_by_id.eq.${uid},user_email.eq.${email}`);

      const validListings = listings || [];
      setUserListings(validListings);

      const { count: completedCount } = await supabase
        .from('trade_offers')
        .select('id', { count: 'exact', head: true })
        .or(`sender_email.eq.${email},owner_email.eq.${email}`)
        .eq('status', 'completed');

      const totalVal = validListings.reduce((sum, item) => sum + (parseFloat(item.price || item.estimated_value) || 0), 0);

      setStats({
        activeListings: validListings.length,
        completedTrades: completedCount || 0,
        totalValue: totalVal
      });
    } catch (e) {
      console.error('Stats error:', e);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(editForm);
      setEditMode(false);
      await fetchProfile();
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center font-mono-code text-xs text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#10B981]" />
        SYNCHRONIZING_PROFILE_DATA...
      </div>
    );
  }

  const profileTier = (viewingProfile?.subscription_tier || 'free').toLowerCase();

  return (
    <div className="space-y-6 font-mono-code text-xs text-[#94A3B8]">
      {/* Profile Header Card */}
      <div className="p-6 rounded border border-[#1F242D] bg-[#111318] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 rounded border border-[#1F242D]">
              <AvatarImage src={viewingProfile?.avatar_url} />
              <AvatarFallback className="bg-[#0D0F14] text-white font-bold text-base">
                {viewingProfile?.username?.substring(0, 2).toUpperCase() || 'FZ'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {viewingProfile?.username || viewingProfile?.full_name || 'Kolekcjoner'}
                </h1>
                <Badge variant="outline" className="border-[#10B981]/40 text-[#10B981] text-[10px] bg-[#10B981]/10">
                  ● {profileTier.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">{viewingProfile?.email}</p>
              {viewingProfile?.location && (
                <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-1">
                  <MapPin className="w-3 h-3 text-[#10B981]" />
                  <span>{viewingProfile.location}</span>
                </div>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <div>
              {editMode ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    className="border-[#1F242D] bg-[#161922] text-[#94A3B8] hover:text-white rounded h-9 text-xs"
                  >
                    Anuluj
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    className="bg-white hover:bg-slate-200 text-black font-bold rounded h-9 text-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Zapisz
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditMode(true)}
                  className="border-[#1F242D] bg-[#161922] text-white hover:border-[#2E3644] rounded h-9 text-xs"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edytuj Profil
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Bio / Edit form */}
        {editMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#1F242D]">
            <div>
              <label className="text-[11px] text-[#64748B] block mb-1">Nazwa użytkownika</label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="bg-[#0D0F14] border-[#1F242D] text-white text-xs h-9 rounded"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64748B] block mb-1">Lokalizacja</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="bg-[#0D0F14] border-[#1F242D] text-white text-xs h-9 rounded"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-[#64748B] block mb-1">Bio / Specjalizacja TCG</label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="bg-[#0D0F14] border-[#1F242D] text-white text-xs h-16 rounded resize-none"
              />
            </div>
          </div>
        ) : (
          viewingProfile?.bio && (
            <p className="text-xs text-[#CBD5E1] pt-3 border-t border-[#1F242D]">
              {viewingProfile.bio}
            </p>
          )
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded bg-[#0D0F14] border border-[#1F242D] space-y-1">
            <span className="text-[10px] text-[#64748B]">INVENTORY_COUNT</span>
            <div className="text-xl font-bold text-white">{stats.activeListings}</div>
          </div>
          <div className="p-3.5 rounded bg-[#0D0F14] border border-[#1F242D] space-y-1">
            <span className="text-[10px] text-[#64748B]">VERIFIED_ESCROW_TRADES</span>
            <div className="text-xl font-bold text-[#10B981]">{stats.completedTrades}</div>
          </div>
          <div className="p-3.5 rounded bg-[#0D0F14] border border-[#1F242D] space-y-1">
            <span className="text-[10px] text-[#64748B]">PORTFOLIO_ESTIMATED_VALUE</span>
            <div className="text-xl font-bold text-white">{stats.totalValue.toFixed(2)} PLN</div>
          </div>
        </div>
      </div>

      {/* User Listings Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F242D]">
          <span className="font-bold text-white text-sm">Aktywne Przedmioty w Portfolio ({userListings.length})</span>
          <span className="text-[#64748B] text-[11px]">VERIFIED_SPECIMENS</span>
        </div>

        {userListings.length === 0 ? (
          <div className="p-12 text-center border border-[#1F242D] rounded bg-[#111318] text-[#64748B]">
            Brak wystawionych kart w profilu
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userListings.map(card => (
              <div 
                key={card.id} 
                onClick={() => { setSelectedCard(card); setIsDetailOpen(true); }}
                className="p-4 rounded border border-[#1F242D] bg-[#111318] hover:border-[#2E3644] transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>#{card.id?.substring(0, 8)}</span>
                  <Badge variant="outline" className="border-[#1F242D] text-[#10B981] text-[9px]">
                    {card.condition || 'NEAR_MINT'}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate">{card.card_name || card.title}</h4>
                  <p className="text-[11px] text-[#64748B] truncate">{card.set_name || card.category}</p>
                </div>
                <div className="pt-2 border-t border-[#1F242D] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Wycena:</span>
                  <span className="font-bold text-white">{card.price || card.estimated_value || 'Wymiana'} PLN</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CardDetailSheet
        card={selectedCard}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
