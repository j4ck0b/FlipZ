import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ListingModal from '../cards/ListingModal';
import {
Search,
Filter,
Plus,
Package,
TrendingUp,
ArrowRight,
Sparkles,
Loader2
} from 'lucide-react';

export default function ExchangeView({
  title = "Exchange",
  description = "Trade items",
  icon = "📦",
  allowedCategories = [],
  subcategories = [],
  gradient = "from-violet-600 to-purple-600"
}) {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [showListingModal, setShowListingModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchListings();
  }, [user, selectedSubcategory]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Try to fetch from database (może nie być tabel jeszcze)
      try {
        let query = supabase
          .from('card_listings')
          .select('*')
          .eq('status', 'available')
          .order('created_date', { ascending: false });
        
        // Filter by category if specified
        if (selectedSubcategory !== 'all' && allowedCategories.length > 0) {
          query = query.eq('category', selectedSubcategory);
        } else if (allowedCategories.length > 0) {
          query = query.in('category', allowedCategories);
        }
        
        const { data, error } = await query;
        if (error && error.code !== 'PGRST116') {
          // PGRST116 = table doesn't exist, ignore
          throw error;
        }
        setListings(data || []);
      } catch (dbError) {
        console.log('Brak tabel - używam mock data');
        // Mock data dla testów
        setListings(generateMockListings(allowedCategories));
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockListings = (categories) => {
    // Mock data na początku
    const mockItems = [
      { name: 'Charizard Holo', price: '500 zł', rarity: 'Ultra Rare', image: '🔥' },
      { name: 'Pikachu VMAX', price: '200 zł', rarity: 'Rare', image: '⚡' },
      { name: 'Mewtwo EX', price: '350 zł', rarity: 'Rare', image: '💜' },
      { name: 'Blastoise Base Set', price: '180 zł', rarity: 'Uncommon', image: '💧' },
      { name: 'Venusaur Rainbow', price: '420 zł', rarity: 'Secret Rare', image: '🌿' },
    ];
    return mockItems.map((item, i) => ({
      id: `mock-${i}`,
      title: item.name,
      price: item.price,
      category: categories[0] || 'pokemon',
      condition: 'Near Mint',
      description: `${item.rarity} - kolekcjonerska`,
      image_url: null,
      emoji: item.image,
      created_date: new Date(Date.now() - i * 86400000).toISOString(),
      created_by: user?.id
    }));
  };

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultListingCategory = selectedSubcategory !== 'all'
    ? selectedSubcategory
    : (allowedCategories[0] || 'pokemon');

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl shadow-lg`}>
              {icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
              <p className="text-lg text-slate-600">{description}</p>
            </div>
          </div>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Dostępne</p>
                    <p className="text-2xl font-bold text-slate-900">{filteredListings.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Aktywnych</p>
                    <p className="text-2xl font-bold text-slate-900">12</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Twój plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-slate-900">
                        {profile?.subscription_tier === 'premium' ? 'Premium' :
                         profile?.subscription_tier === 'basic' ? 'Basic' : 'Free'}
                      </p>
                      {profile?.subscription_tier !== 'free' && (
                        <Badge className={`bg-gradient-to-r ${gradient}`}>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Szukaj przedmiotów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedSubcategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSubcategory('all')}
                size="sm"
              >
                Wszystkie
              </Button>
              {subcategories.map((sub) => (
                <Button
                  key={sub.value}
                  variant={selectedSubcategory === sub.value ? 'default' : 'outline'}
                  onClick={() => setSelectedSubcategory(sub.value)}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {sub.label}
                </Button>
              ))}
            </div>
          )}
          <Button
            className={`gap-2 bg-gradient-to-r ${gradient}`}
            onClick={() => setShowListingModal(true)}
            disabled={!user}
          >
            <Plus className="w-4 h-4" />
            Wystaw
          </Button>
        </div>
        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-slate-600">Ładowanie...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Brak ogłoszeń
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery ? 'Nie znaleziono pasujących przedmiotów' : 'Bądź pierwszy który wystawi przedmiot!'}
            </p>
            <Button
            className={`gap-2 bg-gradient-to-r ${gradient}`}
            onClick={() => setShowListingModal(true)}
            disabled={!user}
          >
              <Plus className="w-4 h-4" />
              Wystaw pierwszy przedmiot
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-violet-200">
                <CardHeader className="pb-3">
                  {/* Image or Emoji */}
                  <div className={`w-full h-48 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-6xl">{listing.emoji || icon}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-violet-600 transition-colors">
                    {listing.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {listing.description || listing.condition}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-slate-900">
                      {listing.price}
                    </span>
                    <Badge variant="secondary">
                      {listing.condition || 'Stan dobry'}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full gap-2 group-hover:bg-violet-50">
                    Zobacz więcej
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Bottom CTA */}
        <ListingModal
          open={showListingModal}
          onClose={() => setShowListingModal(false)}
          onSuccess={fetchListings}
          defaultCategory={defaultListingCategory}
        />

        {!loading && filteredListings.length > 0 && (
          <div className={`mt-12 bg-gradient-to-r ${gradient} rounded-2xl p-8 text-white text-center`}>
            <h3 className="text-2xl font-bold mb-2">Nie znalazłeś czego szukasz?</h3>
            <p className="text-white/90 mb-4">Wystaw swoją ofertę i pozwól innym się z Tobą skontaktować</p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => setShowListingModal(true)}
              disabled={!user}
            >
              <Plus className="w-5 h-5" />
              Wystaw ogłoszenie
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
