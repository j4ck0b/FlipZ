import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  ArrowRightLeft, 
  Loader2,
  Search,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: conversations = [], isLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['myConversations', currentUser?.email],
    queryFn: async () => {
      const convs = await base44.entities.TradeConversation.filter({
        $or: [
          { participant_1_email: currentUser.email },
          { participant_2_email: currentUser.email }
        ]
      }, '-last_message_at');
      return convs;
    },
    enabled: !!currentUser,
    refetchInterval: 5000
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['conversationMessages', selectedConversation?.id],
    queryFn: () => base44.entities.Message.filter({ 
      conversation_id: selectedConversation.id 
    }, 'created_date'),
    enabled: !!selectedConversation,
    refetchInterval: 3000
  });

  const { data: selectedTradeOffer } = useQuery({
    queryKey: ['selectedTradeOffer', selectedConversation?.trade_offer_id],
    queryFn: async () => {
      const offers = await base44.entities.TradeOffer.filter({ 
        id: selectedConversation.trade_offer_id 
      });
      return offers[0];
    },
    enabled: !!selectedConversation?.trade_offer_id
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !selectedConversation) return;

    setSending(true);
    await base44.entities.Message.create({
      conversation_id: selectedConversation.id,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email.split('@')[0],
      message_type: 'text',
      content: newMessage.trim()
    });

    await base44.entities.TradeConversation.update(selectedConversation.id, {
      last_message_at: new Date().toISOString(),
      last_message_preview: newMessage.trim().substring(0, 50)
    });

    setNewMessage('');
    setSending(false);
    refetchMessages();
    refetchConversations();
  };

  const getOtherParticipant = (conv) => {
    if (conv.participant_1_email === currentUser?.email) {
      return {
        email: conv.participant_2_email,
        name: conv.participant_2_name
      };
    }
    return {
      email: conv.participant_1_email,
      name: conv.participant_1_name
    };
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return other.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Sidebar - Conversations List */}
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600">No conversations yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Start a trade to begin chatting
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = selectedConversation?.id === conv.id;

                return (
                  <motion.button
                    key={conv.id}
                    whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left transition-colors ${
                      isSelected ? 'bg-violet-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {other.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-900 truncate">
                            {other.name}
                          </p>
                          {conv.last_message_at && (
                            <span className="text-xs text-slate-500">
                              {format(new Date(conv.last_message_at), 'MMM d')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {conv.last_message_preview || 'No messages yet'}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="mt-1 text-xs"
                        >
                          <ArrowRightLeft className="w-3 h-3 mr-1" />
                          Trade Chat
                        </Badge>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                    {getOtherParticipant(selectedConversation).name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {getOtherParticipant(selectedConversation).name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {getOtherParticipant(selectedConversation).email}
                    </p>
                  </div>
                </div>
                {selectedTradeOffer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const { createPageUrl } = require('../utils');
                      window.location.href = createPageUrl('MyListings');
                    }}
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    View Trade
                  </Button>
                )}
              </div>

              {/* Trade Info Card */}
              {selectedTradeOffer && (
                <Card className="mt-4 p-3 bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Trade for: {selectedTradeOffer.requested_card_title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedTradeOffer.offered_card_ids?.length || 0} card(s) offered
                      </p>
                    </div>
                    <Badge className={
                      selectedTradeOffer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      selectedTradeOffer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      selectedTradeOffer.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {selectedTradeOffer.status}
                    </Badge>
                  </div>
                </Card>
              )}
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 bg-slate-50">
              <div className="max-w-4xl mx-auto space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isMe = msg.sender_email === currentUser?.email;
                    const isSystem = msg.message_type === 'system';

                    if (isSystem) {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex justify-center"
                        >
                          <Badge variant="outline" className="bg-white">
                            <ArrowRightLeft className="w-3 h-3 mr-1" />
                            {msg.content}
                          </Badge>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`rounded-2xl px-4 py-3 ${
                            isMe 
                              ? 'bg-violet-600 text-white' 
                              : 'bg-white text-slate-900 border border-slate-200'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                          <span className="text-xs text-slate-500 px-2">
                            {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="max-w-4xl mx-auto flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={sending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-slate-500">
                Choose a trade chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}