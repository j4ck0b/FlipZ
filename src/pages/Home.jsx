import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const [offers, setOffers] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('trade_offers')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOffers(data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('trade_conversations')
          .select('*')
          .or(`owner_id.eq.${user.id},participant_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchOffers();
    fetchConversations();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Witaj, {profile?.full_name || user?.email}!
          </h1>
          <p className="text-gray-600">Zarządzaj swoimi wymianami i kolekcjami</p>
        </div>

        {/* Szybki dostęp do kategorii */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link to="/card-exchange">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Karty Pokémon</CardTitle>
                <CardDescription>Wymieniaj karty kolekcjonerskie</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/brick-exchange">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Klocki</CardTitle>
                <CardDescription>LEGO i inne zestawy</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/figure-exchange">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Figurki</CardTitle>
                <CardDescription>Funko Pop, action figures</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Twoje ogłoszenia */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Twoje ogłoszenia</h2>
            <Button variant="outline">Wystaw nowe</Button>
          </div>
          {offers.length === 0 ? (
            <p className="text-gray-500">Nie masz jeszcze żadnych ogłoszeń.</p>
          ) : (
            <div className="space-y-4">
              {offers.map(offer => (
                <Card key={offer.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <span>ID: {offer.id}</span>
                      <span>Status: {offer.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Wiadomości */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Wiadomości</h2>
          {conversations.length === 0 ? (
            <p className="text-gray-500">Brak wiadomości.</p>
          ) : (
            <div className="space-y-4">
              {conversations.map(conv => (
                <Card key={conv.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <span>Konwersacja: {conv.id}</span>
                      <span>Ostatnia aktywność</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
