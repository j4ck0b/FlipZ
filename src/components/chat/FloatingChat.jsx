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

  const { data: conversation } = useQuery({
    queryKey: ['tradeConversation', tradeOfferId],
    queryFn: async () => {
      const convs = await flipzApi.entities.TradeConversation.filter({ trade_offer_id: tradeOfferId });
      return convs[0];
    },
    enabled: !!tradeOfferId && open
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

  const { data: tradeOffer } = useQuery({
    queryKey: ['tradeOffer', tradeOfferId],
    queryFn: async () => {
      const offers = await flipzApi.entities.TradeOffer.filter({ id: tradeOfferId });
      return offers[0];
    },
    enabled: !!tradeOfferId && open
  });

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
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-md shadow-2xl rounded-2xl bg-white border border-slate-200 z-50 flex flex-col overflow-hidden"
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
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Trade Info */}
            {tradeOffer && (
              <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-violet-600" />
                  <span className="text-sm text-slate-600">Trade Status:</span>
                </div>
                <Badge className={
                  tradeOffer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  tradeOffer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  tradeOffer.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
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
                        <Badge variant="outline" className="bg-slate-50 text-xs">
                          {msg.content}
                        </Badge>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`rounded-2xl px-3 py-2 ${
                          isMe 
                            ? 'bg-violet-600 text-white' 
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {format(new Date(msg.created_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
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
                  size="icon"
                  className="bg-violet-600 hover:bg-violet-700"
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