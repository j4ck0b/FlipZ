import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Heart, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      // Try to fetch from database
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            *,
            listing:listings(*)
          `)
          .eq('user_id', user.id);

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setFavorites(data || []);
      } catch (dbError) {
        console.log('Brak tabel - używam mock data');
        // Mock favorites
        setFavorites(generateMockFavorites());
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockFavorites = () => {
    return [
      {
        id: '1',
        listing: {
          id: '1',
          title: 'Charizard Holo 1st Edition',
          price: '500 zł',
          category: 'pokemon',
          emoji: '🔥'
        }
      },
      {
        id: '2',
        listing: {
          id: '2',
          title: 'Pikachu VMAX Rainbow',
          price: '350 zł',
          category: 'pokemon',
          emoji: '⚡'
        }
      },
      {
        id: '3',
        listing: {
          id: '3',
          title: 'Mewtwo GX Secret',
          price: '280 zł',
          category: 'pokemon',
          emoji: '💜'
        }
      }
    ];
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
      console.log('Mock mode - cannot delete');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-3xl shadow-lg">
              ❤️
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Ulubione</h1>
              <p className="text-lg text-slate-600">Przedmioty które Cię interesują</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-rose-600 mx-auto mb-4" />
              <p className="text-slate-600">Ładowanie...</p>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">💖</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Brak ulubionych
            </h3>
            <p className="text-slate-600 mb-6">
              Polub przedmioty które Cię interesują aby je tu znaleźć!
            </p>
            <Button className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600">
              <Sparkles className="w-4 h-4" />
              Przeglądaj oferty
            </Button>
          </Card>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-6">
              {favorites.length} {favorites.length === 1 ? 'przedmiot' : 'przedmiotów'} w ulubionych
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => {
                const listing = favorite.listing;
                return (
                  <Card key={favorite.id} className="group hover:shadow-xl transition-all">
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="w-full h-48 bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center rounded-t-lg relative">
                        <span className="text-6xl">{listing?.emoji || '📦'}</span>
                        <button
                          onClick={() => removeFavorite(favorite.id)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all"
                        >
                          <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                          {listing?.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-slate-900">
                            {listing?.price}
                          </span>
                          <Badge variant="secondary">
                            {listing?.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
