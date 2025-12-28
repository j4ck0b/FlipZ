import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ArrowRightLeft, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPanel({ conversationId, tradeOffer, embedded = false, onBack }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: messages = [], refetch } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversationId }, 'created_date'),
    enabled: !!conversationId,
    refetchInterval: 2000,
    refetchOnWindowFocus: true
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
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

    // Update conversation last message
    await base44.entities.TradeConversation.update(conversationId, {
      last_message_at: new Date().toISOString(),
      last_message_preview: newMessage.trim().substring(0, 50)
    });

    setNewMessage('');
    setSending(false);
    refetch();
  };

  const isReadOnly = conversation?.status === 'completed' || conversation?.status === 'archived';

  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-white">
          <div className="flex items-center justify-between gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="lg:hidden flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <span className="font-semibold text-sm md:text-base">Trade Chat</span>
            {tradeOffer && (
              <Badge className={
                tradeOffer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                tradeOffer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-slate-100 text-slate-700'
              }>
                {tradeOffer.status}
              </Badge>
            )}
          </div>
          {tradeOffer && (
            <p className="text-xs md:text-sm text-slate-600 mt-1 truncate">
              Trading for {tradeOffer.requested_card_title}
            </p>
          )}
        </div>

        <ScrollArea className="flex-1 px-3 md:px-6 py-3 md:py-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg) => {
                const isSystem = msg.message_type === 'system';
                const isMe = msg.sender_email === currentUser?.email;

                if (isSystem) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center"
                    >
                      <Badge variant="outline" className="bg-slate-50 text-xs">
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
                    <div className={`max-w-[85%] md:max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`rounded-2xl px-3 md:px-4 py-2 ${
                        isMe 
                          ? 'bg-violet-600 text-white' 
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                      </div>
                      <span className="text-xs text-slate-500 px-2">
                        {format(new Date(msg.created_date), 'h:mm a')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-3 md:p-4 border-t bg-white">
          {isReadOnly ? (
            <div className="text-center py-3 md:py-4">
              <p className="text-xs md:text-sm text-slate-500">This conversation is {conversation?.status}</p>
            </div>
          ) : (
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
              />
              <Button
                onClick={handleSendMessage}
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
          )}
        </div>
      </div>
    );
  }

  return (
    <Sheet open={true} onOpenChange={() => {}}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Trade Chat</span>
            {tradeOffer && (
              <Badge className={
                tradeOffer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                tradeOffer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-slate-100 text-slate-700'
              }>
                {tradeOffer.status}
              </Badge>
            )}
          </SheetTitle>
          {tradeOffer && (
            <p className="text-sm text-slate-600">
              Trading for {tradeOffer.requested_card_title}
            </p>
          )}
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg) => {
                const isSystem = msg.message_type === 'system';
                const isMe = msg.sender_email === currentUser?.email;

                if (isSystem) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center"
                    >
                      <Badge variant="outline" className="bg-slate-50">
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
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        isMe 
                          ? 'bg-violet-600 text-white' 
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-xs text-slate-500 px-2">
                        {format(new Date(msg.created_date), 'h:mm a')}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          {isReadOnly ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">This conversation is {conversation?.status}</p>
            </div>
          ) : (
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
                className="text-sm md:text-base"
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}