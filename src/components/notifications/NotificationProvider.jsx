import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNotificationSound } from './NotificationSound';
import { 
  MessageCircle, 
  ArrowRightLeft, 
  CheckCircle2, 
  CreditCard, 
  Truck,
  Package
} from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  const playSound = useNotificationSound();
  
  const prevOffersRef = useRef([]);
  const prevMessagesRef = useRef([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  // Poll for incoming offers
  const { data: incomingOffers = [] } = useQuery({
    queryKey: ['notificationOffers', currentUser?.email],
    queryFn: () => base44.entities.TradeOffer.filter({ owner_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
    refetchInterval: 5000,
  });

  // Poll for sent offers (to track status changes)
  const { data: sentOffers = [] } = useQuery({
    queryKey: ['notificationSentOffers', currentUser?.email],
    queryFn: () => base44.entities.TradeOffer.filter({ sender_email: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
    refetchInterval: 5000,
  });

  // Poll for conversations (to track new messages)
  const { data: conversations = [] } = useQuery({
    queryKey: ['notificationConversations', currentUser?.email],
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
    refetchInterval: 5000,
  });

  // Check for new incoming offers
  useEffect(() => {
    if (prevOffersRef.current.length > 0 && incomingOffers.length > prevOffersRef.current.length) {
      const newOffer = incomingOffers[0];
      if (newOffer && newOffer.status === 'pending') {
        playSound();
        toast.success(`New trade offer from ${newOffer.sender_name}!`, {
          icon: <ArrowRightLeft className="w-5 h-5" />,
          duration: 5000,
        });
        addNotification({
          id: `offer-${newOffer.id}`,
          type: 'new_offer',
          title: 'New Trade Offer',
          message: `${newOffer.sender_name} wants to trade for ${newOffer.requested_card_title}`,
          timestamp: new Date(),
          icon: ArrowRightLeft,
        });
      }
    }
    prevOffersRef.current = incomingOffers;
  }, [incomingOffers]);

  // Check for offer status changes
  useEffect(() => {
    if (prevOffersRef.current.length > 0) {
      sentOffers.forEach(offer => {
        const prevOffer = prevOffersRef.current.find(o => o.id === offer.id);
        if (prevOffer && prevOffer.status !== offer.status) {
          if (offer.status === 'accepted') {
            playSound();
            toast.success(`${offer.owner_name} accepted your trade offer!`, {
              icon: <CheckCircle2 className="w-5 h-5" />,
              duration: 5000,
            });
            addNotification({
              id: `accepted-${offer.id}`,
              type: 'offer_accepted',
              title: 'Offer Accepted',
              message: `${offer.owner_name} accepted your trade!`,
              timestamp: new Date(),
              icon: CheckCircle2,
            });
          }
        }
        
        // Check for payment updates
        if (prevOffer && !prevOffer.owner_paid && offer.owner_paid) {
          playSound();
          toast.info(`${offer.owner_name} completed payment`, {
            icon: <CreditCard className="w-5 h-5" />,
          });
          addNotification({
            id: `payment-${offer.id}-owner`,
            type: 'payment',
            title: 'Payment Received',
            message: `${offer.owner_name} completed their payment`,
            timestamp: new Date(),
            icon: CreditCard,
          });
        }

        // Check for shipment updates
        if (prevOffer && !prevOffer.owner_package_sent && offer.owner_package_sent) {
          playSound();
          toast.info(`${offer.owner_name} sent their package`, {
            icon: <Truck className="w-5 h-5" />,
          });
          addNotification({
            id: `shipment-${offer.id}-owner`,
            type: 'shipment',
            title: 'Package Shipped',
            message: `${offer.owner_name} has sent their package`,
            timestamp: new Date(),
            icon: Truck,
          });
        }

        // Check for completion
        if (prevOffer && prevOffer.status !== 'completed' && offer.status === 'completed') {
          playSound();
          toast.success('Trade completed! 🎉', {
            icon: <Package className="w-5 h-5" />,
            duration: 5000,
          });
          addNotification({
            id: `completed-${offer.id}`,
            type: 'completed',
            title: 'Trade Completed',
            message: `Trade with ${offer.owner_name} is complete!`,
            timestamp: new Date(),
            icon: Package,
          });
        }
      });
    }
  }, [sentOffers]);

  // Check for new messages
  useEffect(() => {
    if (prevMessagesRef.current.length > 0) {
      conversations.forEach(conv => {
        const prevConv = prevMessagesRef.current.find(c => c.id === conv.id);
        const isParticipant1 = currentUser?.email === conv.participant_1_email;
        const unreadCount = isParticipant1 ? conv.unread_count_p1 : conv.unread_count_p2;
        const prevUnreadCount = prevConv ? (isParticipant1 ? prevConv.unread_count_p1 : prevConv.unread_count_p2) : 0;
        
        if (prevConv && unreadCount > prevUnreadCount) {
          const otherName = isParticipant1 ? conv.participant_2_name : conv.participant_1_name;
          playSound();
          toast.info(`New message from ${otherName}`, {
            icon: <MessageCircle className="w-5 h-5" />,
            duration: 4000,
          });
          addNotification({
            id: `message-${conv.id}-${Date.now()}`,
            type: 'message',
            title: 'New Message',
            message: `${otherName}: ${conv.last_message_preview?.substring(0, 50)}`,
            timestamp: new Date(),
            icon: MessageCircle,
          });
        }
      });
    }
    prevMessagesRef.current = conversations;
  }, [conversations]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 20)); // Keep last 20
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    clearNotification,
    clearAllNotifications,
    unreadCount: notifications.length,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}