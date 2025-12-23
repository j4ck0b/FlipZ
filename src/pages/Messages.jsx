import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageCircle, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import ChatPanel from '../components/chat/ChatPanel';

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedTradeOffer, setSelectedTradeOffer] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', currentUser?.email],
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

  const { data: tradeOffers = [] } = useQuery({
    queryKey: ['allTradeOffers', currentUser?.email],
    queryFn: async () => {
      const offers = await base44.entities.TradeOffer.list('-created_date');
      return offers;
    },
    enabled: !!currentUser
  });

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    
    // Find associated trade offer
    const offer = tradeOffers.find(o => o.id === conv.trade_offer_id);
    setSelectedTradeOffer(offer);
  };

  const getOtherParty = (conv) => {
    if (conv.participant_1_email === currentUser?.email) {
      return {
        name: conv.participant_2_name,
        email: conv.participant_2_email
      };
    }
    return {
      name: conv.participant_1_name,
      email: conv.participant_1_email
    };
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
              <p className="text-slate-500 text-sm">Chat with traders about your offers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold mb-4 text-slate-900">Conversations</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start trading to chat!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => {
                    const otherParty = getOtherParty(conv);
                    const tradeOffer = tradeOffers.find(o => o.id === conv.trade_offer_id);
                    const isSelected = selectedConversation?.id === conv.id;
                    
                    return (
                      <motion.div
                        key={conv.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-3 rounded-xl cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-violet-50 border-2 border-violet-200' 
                            : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm">
                              {getInitials(otherParty.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm truncate">{otherParty.name}</p>
                              {conv.last_message_at && (
                                <span className="text-xs text-slate-500">
                                  {format(new Date(conv.last_message_at), 'MMM d')}
                                </span>
                              )}
                            </div>
                            
                            {tradeOffer && (
                              <div className="flex items-center gap-1 mb-1">
                                <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                                <p className="text-xs text-slate-600 truncate">{tradeOffer.requested_card_title}</p>
                              </div>
                            )}
                            
                            <p className="text-xs text-slate-500 truncate">
                              {conv.last_message_preview || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-[600px]">
                <ChatPanel
                  conversationId={selectedConversation.id}
                  tradeOffer={selectedTradeOffer}
                  open={true}
                  onClose={() => {}}
                />
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-semibold text-slate-900 mb-2">No conversation selected</p>
                  <p className="text-sm">Choose a conversation to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}