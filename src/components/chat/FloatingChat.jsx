import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, X, Minimize2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChat({ conversationId, tradeOffer, onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversationId }, 'created_date'),
    enabled: !!conversationId,
    refetchInterval: 3000
  });

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const convs = await base44.entities.TradeConversation.filter({ id: conversationId });
      return convs[0];
    },
    enabled: !!conversationId
  });

  useEffect(() => {
    if (scrollRef.current && !minimized) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    setSending(true);

    await base44.entities.Message.create({
      conversation_id: conversationId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email.split('@')[0],
      message_type: 'text',
      content: newMessage.trim(),
      read: false
    });

    await base44.entities.TradeConversation.update(conversationId, {
      last_message_at: new Date().toISOString(),
      last_message_preview: newMessage.trim().substring(0, 50)
    });

    setNewMessage('');
    setSending(false);
  };

  const otherParty = conversation?.participant_1_email === currentUser?.email 
    ? conversation?.participant_2_name 
    : conversation?.participant_1_name;

  return (
    <AnimatePresence>
      {!minimized && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50"
          style={{ height: '600px', maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{otherParty}</h3>
              <p className="text-xs text-white/80 truncate">{tradeOffer?.requested_card_title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setMinimized(true)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((msg) => {
                const isSystem = msg.message_type === 'system';
                const isMe = msg.sender_email === currentUser?.email;

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
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`rounded-2xl px-3 py-2 ${
                        isMe 
                          ? 'bg-violet-600 text-white' 
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-xs text-slate-400 px-2">
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
                    handleSendMessage();
                  }
                }}
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                size="icon"
                className="bg-violet-600 hover:bg-violet-700 flex-shrink-0"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {minimized && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setMinimized(false)}
          className="fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-xl transition-shadow z-50"
        >
          <MessageCircle className="w-7 h-7" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}