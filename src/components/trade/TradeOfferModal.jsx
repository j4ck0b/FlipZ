import React, { useState, useEffect } from 'react';
import { flipzApi } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, Plus, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function TradeOfferModal({ open, onClose, targetCard, onSuccess }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [valueNote, setValueNote] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await flipzApi.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: myListings = [], isLoading } = useQuery({
    queryKey: ['myAvailableListings', currentUser?.id],
    queryFn: async () => {
      const filters = [
        { created_by: currentUser.id, status: 'available' },
        { created_by_id: currentUser.id, status: 'available' }
      ];

      if (currentUser?.email) {
        filters.push({ owner_email: currentUser.email, status: 'available' });
      }

      const listings = await flipzApi.entities.CardListing.filter({ $or: filters });
      return Array.from(new Map((listings || []).map((item) => [item.id, item])).values());
    },
    enabled: !!currentUser
  });

  const handleToggleCard = (card) => {
    if (card.id === targetCard?.id) {
      toast.error("You can't trade your own card!");
      return;
    }
    
    setSelectedCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) {
        return prev.filter(c => c.id !== card.id);
      }
      return [...prev, card];
    });
  };

  const resolveTargetOwnerDetails = async () => {
    let ownerId = targetCard?.created_by_id || targetCard?.created_by || null;
    let ownerName = targetCard?.collector_name || targetCard?.owner_name || null;
    let ownerEmail = targetCard?.owner_email || null;

    if (targetCard?.id) {
      try {
        const freshListing = await flipzApi.entities.CardListing.get(targetCard.id);
        ownerId = ownerId || freshListing?.created_by_id || freshListing?.created_by || null;
        ownerName = ownerName || freshListing?.collector_name || freshListing?.owner_name || null;
        ownerEmail = ownerEmail || freshListing?.owner_email || null;
      } catch (listingError) {
        console.warn('Could not refresh listing owner data:', listingError);
      }
    }

    return { ownerEmail, ownerId, ownerName };
  };

  const handleSubmit = async () => {
    if (!selectedCards.length) {
      toast.error('Select at least one card to trade');
      return;
    }

    if (!currentUser?.email) {
      toast.error('Nie można odczytać Twojego konta. Zaloguj się ponownie.');
      return;
    }

    if (!targetCard?.id) {
      toast.error('Nie udało się odczytać ogłoszenia. Zamknij okno i spróbuj ponownie.');
      return;
    }

    const { ownerEmail, ownerId, ownerName } = await resolveTargetOwnerDetails();
    if (!ownerEmail && !ownerId) {
      toast.error('Nie można ustalić właściciela ogłoszenia. Odśwież stronę i spróbuj ponownie.');
      return;
    }

    if ((ownerEmail && ownerEmail === currentUser.email) || (ownerId && ownerId === currentUser.id)) {
      toast.error("Nie możesz rozpocząć wymiany ze swoim własnym ogłoszeniem.");
      return;
    }

    // Check trade limits
    const tier = currentUser.subscription_tier || 'free';
    const tradeCount = currentUser.trade_count_current_month || 0;
    
    const limits = {
      free: 3,
      basic: 10,
      premium: 0 // 0 = unlimited
    };
    
    const limit = limits[tier];
    if (limit > 0 && tradeCount >= limit) {
      toast.error(`Osiągnięto limit ${limit} wymian w tym miesiącu. Ulepsz subskrypcję, aby wysłać więcej ofert.`, {
        action: {
          label: 'Zobacz plany',
          onClick: () => window.location.href = '/subscription'
        }
      });
      return;
    }

    setSending(true);

    try {
      // Generate unique 12-digit trade ID locally (edge function may be unavailable/CORS-blocked)
      const tradeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-12);
      
      const baseOfferPayload = {
        trade_id: tradeId,
        requested_card_id: targetCard.id,
        requested_card_title: targetCard.title,
        owner_email: ownerEmail || null,
        owner_name: ownerName || targetCard.collector_name || (ownerEmail ? ownerEmail.split('@')[0] : 'Collector'),
        sender_email: currentUser.email,
        sender_name: currentUser.full_name || currentUser.email.split('@')[0],
        offered_card_ids: selectedCards.map(c => c.id),
        offered_cards_info: selectedCards.map(c => ({
          id: c.id,
          title: c.title,
          image_url: c.image_url,
          category: c.category,
          condition: c.condition
        })),
        value_note: valueNote,
        message: message,
        status: 'pending'
      };

      let offer;
      try {
        offer = await flipzApi.entities.TradeOffer.create({
          ...baseOfferPayload,
          owner_id: ownerId || null,
          sender_id: currentUser.id
        });
      } catch (offerError) {
        const offerMessage = String(offerError?.message || '').toLowerCase();
        if (!offerMessage.includes('column') || !offerMessage.includes('does not exist')) {
          throw offerError;
        }
        offer = await flipzApi.entities.TradeOffer.create(baseOfferPayload);
      }

      // Create conversation/message as best-effort (offer should still succeed)
      let conversation = null;
      try {
        conversation = await flipzApi.entities.Conversation.create({
          user_id: currentUser.id,
          partner_id: ownerId || targetCard.created_by_id || targetCard.created_by || null,
          trade_offer_id: offer.id,
          last_message: 'Trade offer sent',
          unread_count: 0,
          updated_at: new Date().toISOString()
        });
      } catch (conversationError) {
        console.warn('Conversation create skipped:', conversationError);
      }

      if (conversation?.id) {
        try {
          await flipzApi.entities.Message.create({
            conversation_id: conversation.id,
            sender_email: 'system',
            sender_name: 'System',
            message_type: 'system',
            content: `${currentUser.full_name || 'Collector'} sent a trade offer`,
            read: false
          });
        } catch (messageError) {
          console.warn('System message create skipped:', messageError);
        }
      }

      setSending(false);
      toast.success('Trade offer sent!');
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Trade offer error:', error);
      setSending(false);
      const message = String(error?.message || '');
      if (message.includes('row-level security')) {
        toast.error('Brak uprawnień do utworzenia oferty. Sprawdź czy jesteś zalogowany poprawnym kontem i odśwież stronę.');
      } else {
        toast.error(error.message || 'Failed to send trade offer. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setSelectedCards([]);
    setValueNote('');
    setMessage('');
  };

  const isSubmitDisabled = sending || selectedCards.length === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-violet-600" />
            Propose Trade for {targetCard?.title}
          </DialogTitle>
          <DialogDescription>
            Select cards from your collection to offer in exchange
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 py-4">
          {/* My Cards Selection */}
          <div>
            <Label className="text-base mb-3 block">Select Cards to Offer</Label>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-600">You don't have any available cards to trade</p>
                <p className="text-sm text-slate-500 mt-1">List some cards first!</p>
              </div>
            ) : (
              <ScrollArea className="h-64 border rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {myListings.map((card) => {
                    const isSelected = selectedCards.find(c => c.id === card.id);
                    const isOwnCard = card.id === targetCard?.id;
                    
                    return (
                      <motion.div
                        key={card.id}
                        whileHover={{ scale: isOwnCard ? 1 : 1.02 }}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                          isOwnCard 
                            ? 'border-red-200 bg-red-50 opacity-50 cursor-not-allowed'
                            : isSelected 
                            ? 'border-violet-500 bg-violet-50' 
                            : 'border-slate-200 hover:border-violet-300'
                        }`}
                        onClick={() => !isOwnCard && handleToggleCard(card)}
                      >
                        <div className="aspect-[3/4] relative">
                          {card.image_url ? (
                            <img src={card.image_url} alt={card.title} className="w-full h-full object-cover rounded-t-lg" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl rounded-t-lg">
                              🃏
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                              <Plus className="w-4 h-4 text-white rotate-45" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="font-medium text-sm truncate">{card.title}</p>
                          <Badge variant="outline" className="text-xs mt-1">{card.condition}</Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Selected Cards Preview */}
            <AnimatePresence>
              {selectedCards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <Label className="text-sm text-slate-600 mb-2 block">
                    Selected ({selectedCards.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCards.map(card => (
                      <Badge key={card.id} className="bg-violet-100 text-violet-700 pr-1">
                        {card.title}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCard(card);
                          }}
                          className="ml-1 hover:bg-violet-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Value Note */}
          <div>
            <Label htmlFor="valueNote" className="mb-2 block">
              Value Balance Note <span className="text-slate-500 text-sm">(optional)</span>
            </Label>
            <Input
              id="valueNote"
              placeholder="e.g., + sealed protector, + rare variant, etc."
              value={valueNote}
              onChange={(e) => setValueNote(e.target.value)}
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="mb-2 block">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell them why this is a great trade..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Send Trade Offer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
