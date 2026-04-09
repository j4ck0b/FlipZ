import React, { useState, useEffect, useRef } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Search, 
  Send,
  Loader2,
  ArrowLeft
} from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      try {
        const { data: convData, error: convError } = await supabase
          .from('trade_conversations')
          .select('*')
          .or(`participant_1_email.eq.${user.email},participant_2_email.eq.${user.email}`)
          .order('last_message_at', { ascending: false });

        if (convError && convError.code !== 'PGRST116') throw convError;

        const validConvs = convData || [];
        const partnerEmails = validConvs.map(c =>
          c.participant_1_email === user.email ? c.participant_2_email : c.participant_1_email
        );

        let allProfiles = [];
        if (partnerEmails.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('email, username, avatar_url')
            .in('email', partnerEmails);
          allProfiles = profiles || [];
        }

        const enrichedConversations = validConvs.map(conv => {
          const pEmail = conv.participant_1_email === user.email ? conv.participant_2_email : conv.participant_1_email;
          const pProfile = allProfiles.find(p => p.email === pEmail) || { username: pEmail, email: pEmail };
          return { ...conv, partner: pProfile };
        });
        setConversations(enrichedConversations);
      } catch (dbError) {
        console.log('Brak tabel lub błąd rls - używam mock data', dbError);
        setConversations(generateMockConversations());
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_date', { ascending: true });
      if (!error) setMessages(data || []);
    } catch {
      setMessages(generateMockMessages(conversationId));
    }
  };

  const generateMockConversations = () => [
    {
      id: '1',
      partner: { username: 'Jan Kowalski', avatar_url: null, email: 'jan@example.com' },
      last_message: 'Czy karta jest w dobrym stanie?',
      last_message_at: new Date().toISOString(),
      unread_count: 2
    },
    {
      id: '2',
      partner: { username: 'Anna Nowak', avatar_url: null, email: 'anna@example.com' },
      last_message: 'Dziękuję za wymianę!',
      last_message_at: new Date(Date.now() - 86400000).toISOString(),
      unread_count: 0
    }
  ];

  const generateMockMessages = (conversationId) => [
    {
      id: '1',
      conversation_id: conversationId,
      sender_email: user.email,
      content: 'Cześć! Interesuje mnie ta karta.',
      created_date: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      conversation_id: conversationId,
      sender_email: 'anna@example.com',
      content: 'Czy karta jest w dobrym stanie?',
      created_date: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_email: user.email,
          sender_name: user.user_metadata?.full_name || user.email.split('@')[0],
          content: newMessage
        })
        .select()
        .single();

      if (!error) {
        setMessages([...messages, data]);
        setNewMessage('');
        await supabase.from('trade_conversations').update({
          last_message_preview: newMessage,
          last_message_at: new Date().toISOString()
        }).eq('id', selectedConversation.id);
      }
    } catch {
      const mockMessage = {
        id: Date.now().toString(),
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        content: newMessage,
        created_date: new Date().toISOString()
      };
      setMessages([...messages, mockMessage]);
      setNewMessage('');
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'teraz';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} godz`;
    return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold section-heading mb-6">Wiadomości</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[75vh]">
          
          {/* Sidebar – conversations list */}
          <div className={`messages-sidebar flex flex-col overflow-hidden ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj konwersacji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full dark-input rounded-lg pl-9 pr-4 py-2 text-sm"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7 text-violet-400" />
                  </div>
                  <p className="text-slate-400 text-sm">Brak konwersacji</p>
                  <p className="text-slate-500 text-xs mt-1">Zaproponuj wymianę aby zacząć czat</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 text-left border-b border-white/5 conv-item ${
                      selectedConversation?.id === conv.id ? 'conv-item-active' : ''
                    }`}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={conv.partner?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
                        {conv.partner?.username?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-200 text-sm truncate">
                          {conv.partner?.username || 'Użytkownik'}
                        </span>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {formatTimeAgo(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 truncate">
                          {conv.last_message || 'Brak wiadomości'}
                        </p>
                        {conv.unread_count > 0 && (
                          <Badge className="bg-violet-600 text-white text-xs ml-2 flex-shrink-0 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Panel */}
          <div className={`messages-panel lg:col-span-2 flex flex-col overflow-hidden ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Wybierz konwersację</h3>
                  <p className="text-slate-500 text-sm">Kliknij rozmowę po lewej aby zobaczyć wiadomości</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-slate-400 hover:text-slate-200"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={selectedConversation.partner?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
                      {selectedConversation.partner?.username?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm leading-tight">
                      {selectedConversation.partner?.username || 'Użytkownik'}
                    </h3>
                    <p className="text-xs text-emerald-400">Aktywny</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_email === user.email;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 ${isOwn ? 'message-bubble-own' : 'message-bubble-other'}`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-slate-500'}`}>
                            {new Date(msg.created_date || msg.created_at || Date.now()).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Napisz wiadomość..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 dark-input rounded-xl px-4 py-2.5 text-sm"
                    />
                    <Button
                      onClick={sendMessage}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl px-4 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
