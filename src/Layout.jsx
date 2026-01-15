import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  Home as HomeIcon,
  LayoutDashboard, 
  Menu,
  LogOut,
  Sparkles,
  UserCircle,
  MessageCircle,
  Heart,
  Languages
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationProvider from './components/notifications/NotificationProvider';
import NotificationPanel from './components/notifications/NotificationPanel';
import LanguageProvider, { useLanguage } from './components/LanguageProvider';

function LayoutContent({ children, currentPageName }) {
  const { language, toggleLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: t('home'), page: 'Home', icon: HomeIcon },
    { name: t('myCollection'), page: 'MyListings', icon: LayoutDashboard },
    { name: t('messages'), page: 'Messages', icon: MessageCircle },
    { name: t('profile'), page: 'Profile', icon: UserCircle },
  ];

  // Hide subscription for now - premium features will be added later

  const adminNavItems = user?.role === 'admin' ? [
    { name: 'Panel Admin', page: 'AdminDashboard', icon: Sparkles }
  ] : [];

  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
    };
    loadUser();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center gap-2 font-bold text-xl text-slate-900"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693ecc5599cec84236ae4d99/147165ce2_FLIPCARDZ2.png" 
                alt="FlipCardZ" 
                className="w-9 h-9 rounded-xl"
              />
              <span className="hidden sm:inline">FlipCardZ</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {[...navItems, ...adminNavItems].map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={isActive ? "bg-slate-100" : ""}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="relative"
                title={language === 'en' ? 'Switch to Polish' : 'Przełącz na angielski'}
              >
                <Languages className="w-5 h-5" />
                <span className="absolute -bottom-1 text-[10px] font-bold">
                  {language.toUpperCase()}
                </span>
              </Button>
              {user && (
                <>
                  <NotificationPanel />
                </>
              )}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 hidden md:flex">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer">
                        <UserCircle className="w-4 h-4 mr-2" />
                        {t('profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyListings')} className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t('myCollection')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout(createPageUrl('Home'))}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-8">
                    {user && (
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{user.full_name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      )}

                      {[...navItems, ...adminNavItems].map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPageName === item.page;
                      return (
                        <Link 
                          key={item.page} 
                          to={createPageUrl(item.page)}
                          onClick={() => setMobileOpen(false)}
                        >
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start"
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </Button>
                        </Link>
                      );
                      })}
                    
                    <div className="pt-4 border-t mt-auto">
                      <Button 
                        variant="ghost" 
                        onClick={() => base44.auth.logout(createPageUrl('Home'))}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('logout')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

        {/* Main Content */}
        <main>
          {children}
      </main>
    </div>
  </NotificationProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}