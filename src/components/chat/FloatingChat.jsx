import React, { useState, useEffect, useRef } from 'react';
import { flipzApi } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, X, Minus, MessageCircle, ArrowRightLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useNotificationSound } from '../notifications/NotificationSound';

export default function FloatingChat({ tradeOfferId, otherUserEmail, otherUserName, open, onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef(null);
  const playNotification = useNotificationSound();
  const prevMessageCount = useRef(0);

  useEffect(() => {
    const loadUser = async () => {
      const user = await flipzApi.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: tradeOffer } = useQuery({
    queryKey: ['tradeOffer', tradeOfferId],
    queryFn: async () => {
      const offers = await flipzApi.entities.TradeOffer.filter({ id: tradeOfferId });
      return offers[0];
    },
    enabled: !!tradeOfferId && open
  });

  const { data: conversation, refetch: refetchConversation } = useQuery({
    queryKey: ['tradeConversation', tradeOfferId],
    queryFn: async () => {
      const convs = await flipzApi.entities.TradeConversation.filter({ trade_offer_id: tradeOfferId });
      
      if (!convs || convs.length === 0) {
        if (!currentUser || !tradeOffer) return null;
        
        const newConv = await flipzApi.entities.TradeConversation.create({
          trade_offer_id: tradeOfferId,
          participant_1_email: tradeOffer.owner_email,
          participant_2_email: tradeOffer.sender_email
        });
        return newConv;
      }
      return convs[0];
    },
    enabled: !!tradeOfferId && open && !!currentUser && !!tradeOffer
  });

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['chatMessages', conversation?.id],
    queryFn: () => flipzApi.entities.Message.filter({ conversation_id: conversation.id }, 'created_date'),
    enabled: !!conversation?.id && open,
    refetchInterval: 2000,
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    if (messages.length > prevMessageCount.current && prevMessageCount.current > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.sender_email !== currentUser?.email) {
        playNotification();
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages.length, currentUser?.email]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !conversation) return;

    setSending(true);
    await flipzApi.entities.Message.create({
      conversation_id: conversation.id,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email.split('@')[0],
      message_type: 'text',
      content: newMessage.trim()
    });

    await flipzApi.entities.TradeConversation.update(conversation.id, {
      last_message_at: new Date().toISOString(),
      last_message_preview: newMessage.trim().substring(0, 50)
    });

    setNewMessage('');
    setSending(false);
    refetch();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          height: minimized ? 'auto' : '500px'
        }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-md shadow-2xl rounded-2xl panel-elevated border border-white/10 z-50 flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm md:text-base truncate">{otherUserName}</p>
              {tradeOffer && (
                <p className="text-xs text-white/80 truncate">
                  {tradeOffer.requested_card_title}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMinimized(!minimized)}
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Trade Info */}
            {tradeOffer && (
              <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-slate-300">Status wymiany:</span>
                </div>
                <Badge className={
                  tradeOffer.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  tradeOffer.status === 'accepted' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                  tradeOffer.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }>
                  {tradeOffer.status}
                </Badge>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-3 md:p-4 h-[280px] md:h-[320px]">
              <div className="space-y-2 md:space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.sender_email === currentUser?.email;
                  const isSystem = msg.message_type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 text-xs">
                          {msg.content}
                        </Badge>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`rounded-2xl px-3.5 py-2 shadow-md ${
                          isMe 
                            ? 'message-bubble-own' 
                            : 'message-bubble-other'
                        }`}>
                          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/20 backdrop-blur-md">
              <div className="flex gap-2">
                <Input
                  placeholder="Napisz wiadomość..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={sending}
                  className="flex-1 dark-input rounded-xl"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-600/35 rounded-xl px-4"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}