import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Search, Loader2, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

import ChatPanel from '../components/chat/ChatPanel';
import { useNotificationSound } from '../components/notifications/NotificationSound';

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const playNotification = useNotificationSound();
  const prevConversationsCount = useRef(0);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['allConversations', currentUser?.email],
    queryFn: async () => {
      const convs = await base44.entities.TradeConversation.filter({
        $or: [
          { participant_1_email: currentUser.email },
          { participant_2_email: currentUser.email }
        ]
      }, '-last_message_at');
      
      // Get associated trade offers
      const tradeIds = convs.map(c => c.trade_offer_id);
      const trades = await base44.entities.TradeOffer.filter({
        id: { $in: tradeIds }
      });
      
      const tradesMap = {};
      trades.forEach(t => tradesMap[t.id] = t);
      
      return convs.map(c => ({
        ...c,
        tradeOffer: tradesMap[c.trade_offer_id]
      }));
    },
    enabled: !!currentUser,
    refetchInterval: 5000
  });

  useEffect(() => {
    if (conversations.length > prevConversationsCount.current && prevConversationsCount.current > 0) {
      playNotification();
      toast.success('New message received!', {
        duration: 4000,
      });
    }
    prevConversationsCount.current = conversations.length;
  }, [conversations.length]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherParty = conv.participant_1_email === currentUser?.email 
      ? conv.participant_2_name 
      : conv.participant_1_name;
    return otherParty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.tradeOffer?.requested_card_title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOtherParty = (conv) => {
    return conv.participant_1_email === currentUser?.email
      ? { name: conv.participant_2_name, email: conv.participant_2_email }
      : { name: conv.participant_1_name, email: conv.participant_1_email };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-violet-600" />
            Messages
          </h1>
          <p className="text-slate-500 mt-1">Your trade conversations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                {/* Search */}
                <div className="p-4 border-b">
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

                {/* List */}
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredConversations.map((conv) => {
                        const otherParty = getOtherParty(conv);
                        const isSelected = selectedConversation?.id === conv.id;

                        return (
                          <motion.button
                            key={conv.id}
                            whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                            onClick={() => {
                              setSelectedConversation(conv);
                              setSelectedTrade(conv.tradeOffer);
                            }}
                            className={`w-full p-4 text-left transition-colors ${
                              isSelected ? 'bg-violet-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm">
                                  {getInitials(otherParty.name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-slate-900 truncate">
                                    {otherParty.name}
                                  </h4>
                                  {conv.last_message_at && (
                                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                                      {format(new Date(conv.last_message_at), 'MMM d')}
                                    </span>
                                  )}
                                </div>

                                {conv.tradeOffer && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                                    <p className="text-xs text-slate-500 truncate">
                                      {conv.tradeOffer.requested_card_title}
                                    </p>
                                  </div>
                                )}

                                <p className="text-sm text-slate-600 truncate">
                                  {conv.last_message_preview || 'No messages yet'}
                                </p>

                                {conv.tradeOffer && (
                                  <Badge 
                                    className={`mt-2 text-xs ${
                                      conv.tradeOffer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                      conv.tradeOffer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                      conv.tradeOffer.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                      'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {conv.tradeOffer.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-[calc(100vh-180px)]">
                <CardContent className="p-0 h-full">
                  <ChatPanel
                    conversationId={selectedConversation.id}
                    tradeOffer={selectedTrade}
                    embedded={true}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-180px)]">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-slate-500">
                      Choose a conversation to start chatting
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}