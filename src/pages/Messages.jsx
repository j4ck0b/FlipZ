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
  ArrowLeft,
  Terminal,
  Shield,
  Clock,
  ArrowRightLeft
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

      const enriched = validConvs.map(conv => {
        const pEmail = conv.participant_1_email === user.email ? conv.participant_2_email : conv.participant_1_email;
        const pProfile = allProfiles.find(p => p.email === pEmail) || { username: pEmail?.split('@')[0], email: pEmail };
        return { ...conv, partner: pProfile };
      });
      setConversations(enriched);
      if (enriched.length > 0 && !selectedConversation) {
        setSelectedConversation(enriched[0]);
      }
    } catch (err) {
      console.warn('Conversations fetch fallback');
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
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    const newMsgObj = {
      conversation_id: selectedConversation.id,
      sender_email: user.email,
      sender_id: user.id,
      content: messageText,
      created_date: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsgObj]);

    try {
      await supabase.from('messages').insert(newMsgObj);
      await supabase
        .from('trade_conversations')
        .update({
          last_message: messageText,
          last_message_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.partner?.username?.toLowerCase().includes(q) ||
      c.partner?.email?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 font-mono-code text-xs text-[#94A3B8]">
      {/* Top Header */}
      <div className="p-4 rounded border border-[#1F242D] bg-[#111318] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#10B981]" />
          <span className="font-bold text-white text-sm">Szyfrowany Komunikator Wymian</span>
          <span className="text-[#64748B]">|</span>
          <span className="text-[#64748B] text-[11px]">END_TO_END_DISCUSSIONS</span>
        </div>
        <Badge variant="outline" className="border-[#1F242D] text-[#10B981] text-[10px]">
          ● ACTIVE_CHANNELS: {conversations.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[650px]">
        {/* Lewa lista wątków */}
        <div className="md:col-span-4 rounded border border-[#1F242D] bg-[#111318] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#1F242D]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <Input
                placeholder="Szukaj wątku / użytkownika..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-[#0D0F14] border-[#1F242D] text-xs font-mono-code text-white h-8 rounded"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1F242D]">
            {loading ? (
              <div className="p-8 text-center text-[#64748B]">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                Ładowanie wiadomości...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-[#64748B]">
                Brak aktywnych konwersacji
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSel = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 cursor-pointer transition-all ${
                      isSel ? 'bg-[#161922] text-white' : 'hover:bg-[#0D0F14]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs truncate max-w-[140px]">
                        {conv.partner?.username || conv.partner?.email?.split('@')[0]}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {conv.last_message || 'Rozpocznij konwersację...'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Prawa kolumna: Okno aktywnego czatu */}
        <div className="md:col-span-8 rounded border border-[#1F242D] bg-[#111318] flex flex-col justify-between overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Belka partnera */}
              <div className="p-3 border-b border-[#1F242D] bg-[#0D0F14] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#161922] border border-[#1F242D] flex items-center justify-center font-bold text-white text-[10px]">
                    {selectedConversation.partner?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {selectedConversation.partner?.username || selectedConversation.partner?.email}
                    </h3>
                    <span className="text-[10px] text-[#10B981]">Zaufany Partner Wymiany</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 border-[#1F242D] bg-[#111318] text-[#94A3B8] hover:text-white rounded text-[10px]"
                >
                  <ArrowRightLeft className="w-3 h-3 mr-1" />
                  Przejdź do oferty
                </Button>
              </div>

              {/* Wiadomości */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="py-20 text-center text-[#64748B]">
                    Napisz pierwszą wiadomość dotyczącą parametrów wymiany i weryfikacji w Hubie.
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender_email === user?.email || msg.sender_id === user?.id;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`p-3 rounded max-w-[80%] text-xs ${
                            isMe
                              ? 'bg-white text-black font-medium'
                              : 'bg-[#0D0F14] text-white border border-[#1F242D]'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-[#64748B] mt-0.5 px-1">
                          {msg.created_date ? new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formularz wprowadzania wiadomości */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1F242D] bg-[#0D0F14] flex gap-2">
                <Input
                  placeholder="Wpisz treść wiadomości..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-[#111318] border-[#1F242D] text-white text-xs font-mono-code h-10 rounded"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-white hover:bg-slate-200 text-black font-bold h-10 px-4 rounded text-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Wyślij
                </Button>
              </form>
            </>
          ) : (
            <div className="p-16 text-center text-[#64748B] my-auto">
              Wybierz konwersację z listy po lewej stronie.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
