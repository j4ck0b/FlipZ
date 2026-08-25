import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  Plus,
  Loader2,
  Filter,
  ShieldCheck,
  ArrowUpDown,
  Tag,
  ArrowRightLeft
} from "lucide-react";
import CardItem from '../components/cards/CardItem';
import CardDetailSheet from '../components/cards/CardDetailSheet';
import ListingModal from '../components/cards/ListingModal';

export default function CardExchange() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Wszystkie' },
    { id: 'pokemon_cards', label: 'Pokémon TCG' },
    { id: 'magic_the_gathering', label: 'Magic: The Gathering' },
    { id: 'sports_cards', label: 'Sports Cards' },
    { id: 'lego', label: 'LEGO' },
    { id: 'collectibles', label: 'Kolekcje' }
  ];

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, user?.id]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('card_listings')
        .select('*')
        .eq('status', 'available')
        .order('created_date', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = listings.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.card_name?.toLowerCase().includes(q) ||
      item.set_name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 font-sans -m-6 p-6 sm:p-10 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>GIEŁDA Z FIZYCZNĄ WERYFIKACJĄ HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Giełda Kart & Przedmiotów Kolekcjonerskich
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Przeglądaj autentyczne okazy wystawione przez kolekcjonerów i inicjuj wymiany Escrow.
            </p>
          </div>

          <Button
            onClick={() => setShowListingModal(true)}
            className="bg-white hover:bg-slate-200 text-slate-950 font-bold h-10 px-5 rounded-xl text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Wystaw przedmiot
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Szukaj karty, numeru, setu lub wydania..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/60 border-slate-800 text-white text-xs h-10 rounded-xl focus:border-slate-700"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-slate-100 text-slate-950 font-semibold'
                      : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <p className="text-xs">Ładowanie giełdy...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-slate-800/80 rounded-2xl bg-slate-900/30 p-8 space-y-4">
            <Package className="w-10 h-10 mx-auto text-slate-600" />
            <div>
              <h3 className="text-base font-bold text-white">Brak przedmiotów spełniających kryteria</h3>
              <p className="text-xs text-slate-400 mt-1">Bądź pierwszym, który wystawi kartę w tej kategorii.</p>
            </div>
            <Button
              onClick={() => setShowListingModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs h-9 px-4"
            >
              Dodaj ogłoszenie
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedCard(item);
                  setShowDetailSheet(true);
                }}
                className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between space-y-4 group"
              >
                {/* Obrazek lub ikona */}
                <div className="aspect-[4/3] rounded-lg bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center relative">
                  {item.image_url || item.photos?.[0] ? (
                    <img 
                      src={item.image_url || item.photos?.[0]} 
                      alt={item.title || item.card_name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="text-center text-slate-600 p-4">
                      <Package className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px]">VERIFIED_SPECIMEN</span>
                    </div>
                  )}

                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-[10px] font-semibold text-emerald-400 backdrop-blur-sm">
                    {item.condition || 'NM'}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[140px]">{item.set_name || item.category || 'TCG'}</span>
                    <span>#{item.id?.substring(0, 6)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">
                    {item.title || item.card_name}
                  </h3>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-slate-400 font-medium">Wycena:</span>
                    <span className="text-sm font-bold text-white">
                      {item.price || item.estimated_value || 'Wymiana'} PLN
                    </span>
                  </div>
                </div>

                {/* Akcja */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white">
                  <span>Szczegóły & Wymiana</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <CardDetailSheet
        card={selectedCard}
        isOpen={showDetailSheet}
        onClose={() => setShowDetailSheet(false)}
      />

      <ListingModal
        isOpen={showListingModal}
        onClose={() => setShowListingModal(false)}
        onSuccess={fetchListings}
      />
    </div>
  );
}
