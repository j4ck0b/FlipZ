import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Heart, Loader2, Package, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          listing:card_listings(*)
        `)
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setFavorites(data || []);
    } catch (error) {
      console.warn('Favorites fetch fallback');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (!error) {
        setFavorites(favorites.filter(f => f.id !== favoriteId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="space-y-6 font-mono-code text-xs text-[#94A3B8]">
      {/* Header */}
      <div className="p-6 rounded border border-[#1F242D] bg-[#111318] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#10B981] mb-1">
            <Heart className="w-4 h-4 text-[#E53935]" />
            <span>SAVED_WATCHLIST_ITEMS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Obserwowane Przedmioty i Karty
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Śledź status dostępności i inicjuj propozycje wymiany jednym kliknięciem.
          </p>
        </div>

        <Button
          onClick={() => navigate('/card-exchange')}
          variant="outline"
          className="border-[#1F242D] bg-[#161922] text-[#94A3B8] hover:text-white rounded h-9 text-xs font-mono-code"
        >
          Przeglądaj Giełdę
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center border border-[#1F242D] rounded bg-[#111318] text-[#64748B]">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#10B981]" />
          FETCHING_FAVORITES...
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-12 text-center border border-[#1F242D] rounded bg-[#111318] text-[#64748B] space-y-3">
          <Package className="w-8 h-8 mx-auto text-[#64748B] opacity-50" />
          <div>
            <h3 className="text-sm font-bold text-white">Brak obserwowanych przedmiotów</h3>
            <p className="text-xs text-[#64748B] mt-1">Dodaj karty do obserwowanych, przeglądając giełdę.</p>
          </div>
          <Button
            onClick={() => navigate('/card-exchange')}
            className="bg-white hover:bg-slate-200 text-black font-bold h-9 px-4 rounded text-xs"
          >
            Przejdź do giełdy
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            const item = fav.listing || fav;
            return (
              <div
                key={fav.id}
                className="p-4 rounded border border-[#1F242D] bg-[#111318] hover:border-[#2E3644] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <span>ID: #{item.id?.substring(0, 8) || fav.id}</span>
                    <Badge variant="outline" className="border-[#1F242D] text-[#10B981] text-[9px]">
                      {item.category || 'COLLECTIBLE'}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate">
                    {item.title || item.card_name || 'Specimen Card'}
                  </h3>

                  <div className="flex items-baseline gap-1 text-sm font-bold text-[#10B981]">
                    <span>{item.estimated_value || item.price || 'Wymiana'} PLN</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1F242D] flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFavorite(fav.id)}
                    className="h-8 px-2 text-[#F87171] hover:bg-[#E53935]/15 rounded text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Usuń
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => navigate('/card-exchange')}
                    className="h-8 px-3 bg-white hover:bg-slate-200 text-black font-bold rounded text-xs"
                  >
                    Zaproponuj wymianę
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
