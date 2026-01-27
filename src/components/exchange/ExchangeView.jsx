// Zastąp całą zawartość ExchangeView.jsx:

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/AuthContext';

export default function ExchangeView({ category }) {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);

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

    fetchOffers();
  }, [user, category]);

  return (
    <div className="space-y-4">
      {offers.map(offer => (
        <div key={offer.id} className="p-4 border rounded-lg">
          <div className="flex justify-between">
            <span>Oferta: {offer.id}</span>
            <span>Status: {offer.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
