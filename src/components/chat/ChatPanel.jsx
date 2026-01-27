// Znajdź w kodzie istniejący ChatPanel.jsx i ZASTĄP całą zawartość:

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/AuthContext';

export default function ChatPanel() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user) return;

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

    fetchConversations();
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Twoje konwersacje</h3>
      {conversations.length === 0 ? (
        <p className="text-gray-500">Brak wiadomości</p>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <div key={conv.id} className="p-2 border-b border-gray-100">
              Konwersacja {conv.id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
