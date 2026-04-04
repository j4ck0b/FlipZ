import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
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
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Fetch from database using explicit email schema
      try {
        const { data: convData, error: convError } = await supabase
          .from('trade_conversations')
          .select('*')
          .or(`participant_1_email.eq.${user.email},participant_2_email.eq.${user.email}`)
          .order('last_message_at', { ascending: false });

        if (convError && convError.code !== 'PGRST116') {
          throw convError;
        }

        const validConvs = convData || [];

        // Fetch partner profiles
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
          return {
            ...conv,
            partner: pProfile
          };
        });

        setConversations(enrichedConversations);
      } catch (dbError) {
        console.log('Brak tabel lub błąd rls - używam mock data', dbError);
        setConversations(generateMockConversations());
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
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

      if (!error) {
        setMessages(data || []);
      }
    } catch (error) {
      console.log('Mock messages');
      setMessages(generateMockMessages(conversationId));
    }
  };

  const generateMockConversations = () => {
    return [
      {
        id: '1',
        partner: {
          username: 'Jan Kowalski',
          avatar_url: null,
          email: 'jan@example.com'
        },
        last_message: 'Czy karta jest w dobrym stanie?',
        last_message_at: new Date().toISOString(),
        unread_count: 2
      },
      {
        id: '2',
        partner: {
          username: 'Anna Nowak',
          avatar_url: null,
          email: 'anna@example.com'
        },
        last_message: 'Dziękuję za wymianę!',
        last_message_at: new Date(Date.now() - 86400000).toISOString(),
        unread_count: 0
      }
    ];
  };

  const generateMockMessages = (conversationId) => {
    return [
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
  };

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
        
        // Aktualizuj last_message_at w konwersacji
        await supabase.from('trade_conversations').update({
          last_message_preview: newMessage,
          last_message_at: new Date().toISOString()
        }).eq('id', selectedConversation.id);
      }
    } catch (error) {
      console.log('Mock send - adding locally');
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

  const filteredConversations = conversations.filter(conv =>
    conv.partner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Wiadomości</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Szukaj konwersacji..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="overflow-y-auto max-h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Brak wiadomości</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b ${
                        selectedConversation?.id === conv.id ? 'bg-violet-50 border-l-4 border-l-violet-600' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={conv.partner?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                          {conv.partner?.username?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">
                            {conv.partner?.username || 'User'}
                          </span>
                          {conv.unread_count > 0 && (
                            <Badge className="bg-violet-600">{conv.unread_count}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {conv.last_message}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:flex' : ''}`}>
            <CardContent className="p-0 flex flex-col h-[700px]">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Wybierz konwersację
                    </h3>
                    <p className="text-slate-600">
                      Kliknij na konwersację aby zobaczyć wiadomości
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Avatar>
                      <AvatarImage src={selectedConversation.partner?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                        {selectedConversation.partner?.username?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {selectedConversation.partner?.username || 'User'}
                      </h3>
                      <p className="text-sm text-slate-600">Aktywny</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_email === user.email;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>
                              {new Date(msg.created_date || msg.created_at || Date.now()).toLocaleTimeString('pl-PL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Napisz wiadomość..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
