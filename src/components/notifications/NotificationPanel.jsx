import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Trash2 } from "lucide-react";
import { useNotifications } from './NotificationProvider';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPanel() {
  const { notifications, clearNotification, clearAllNotifications, unreadCount } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllNotifications}
              className="h-7 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              <AnimatePresence>
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors mb-1">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                          ${notification.type === 'new_offer' ? 'bg-violet-100 text-violet-600' : ''}
                          ${notification.type === 'offer_accepted' ? 'bg-green-100 text-green-600' : ''}
                          ${notification.type === 'message' ? 'bg-blue-100 text-blue-600' : ''}
                          ${notification.type === 'payment' ? 'bg-amber-100 text-amber-600' : ''}
                          ${notification.type === 'shipment' ? 'bg-indigo-100 text-indigo-600' : ''}
                          ${notification.type === 'completed' ? 'bg-emerald-100 text-emerald-600' : ''}
                        `}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return time.toLocaleDateString();
}