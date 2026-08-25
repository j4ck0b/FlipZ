import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Home,
  MessageSquare,
  Heart,
  User,
  LogOut,
  Shield,
  CreditCard,
  ArrowRightLeft,
  X,
  PlusCircle,
  Package
} from 'lucide-react';
import FloatingChat from './components/chat/FloatingChat';
import NotificationPanel from './components/notifications/NotificationPanel';

const tierBadges = {
  free: { label: 'FREE', color: 'bg-surface-container text-on-surface-variant border-outline-variant' },
  basic: { label: 'PRO TRADER', color: 'bg-secondary/15 text-secondary border-secondary/30' },
  pro: { label: 'PRO TRADER', color: 'bg-secondary/15 text-secondary border-secondary/30' },
  premium: { label: 'VAULT MASTER', color: 'bg-primary text-on-primary border-primary' },
  vault_master: { label: 'VAULT MASTER', color: 'bg-primary text-on-primary border-primary' },
};

export default function Layout({ children }) {
  const { user, profile, canManageUsers, canAccessAdminPanel, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <div>{children}</div>;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/home', icon: Home },
    { name: 'Giełda Kart', path: '/card-exchange', icon: Package },
    { name: 'Moje Wymiany', path: '/my-listings', icon: ArrowRightLeft },
    { name: 'Wiadomości', path: '/messages', icon: MessageSquare },
    { name: 'Obserwowane', path: '/favorites', icon: Heart },
    { name: 'Profil', path: `/profile/${user?.id}`, icon: User },
    ...(canAccessAdminPanel ? [{ name: canManageUsers ? 'Panel Admina' : 'Terminal Weryfikatora', path: '/admin', icon: Shield, isAdmin: true }] : []),
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const currentTier = (profile?.subscription_tier || user?.subscription_tier || 'free').toLowerCase();
  const badgeConfig = tierBadges[currentTier] || tierBadges.free;

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen antialiased flex flex-col selection:bg-secondary selection:text-white">
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-extrabold text-white text-base shadow-sm group-hover:scale-105 transition-transform">
              FZ
            </div>
            <span className="font-extrabold text-2xl text-on-surface tracking-tight">
              FlipCardZ <span className="text-secondary text-xs uppercase px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 font-bold hidden sm:inline">Escrow</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-9 px-3.5 rounded-xl transition-all text-xs font-semibold ${
                      active
                        ? 'bg-secondary text-on-secondary hover:bg-secondary shadow-sm'
                        : item.isAdmin
                        ? 'text-secondary hover:bg-secondary/10 border border-secondary/30'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right section: Notifications & User profile */}
          <div className="flex items-center gap-3">
            <NotificationPanel />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 bg-surface-container-lowest border-outline-variant/40 text-on-surface p-2 text-xs rounded-xl shadow-xl" align="end">
                <DropdownMenuLabel className="p-2 pb-1">
                  <div className="flex flex-col space-y-1">
                    <p className="font-bold text-on-surface text-sm truncate">{profile?.username || 'Użytkownik'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                    <div className="pt-1">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeConfig.color}`}>
                        ● {badgeConfig.label}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-outline-variant/30" />
                
                <DropdownMenuItem onClick={() => navigate(`/profile/${user?.id}`)} className="cursor-pointer hover:bg-surface-container text-xs rounded-lg py-2">
                  <User className="mr-2 h-4 w-4 text-on-surface-variant" />
                  Mój Profil & Reputacja
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/subscription')} className="cursor-pointer hover:bg-surface-container text-xs rounded-lg py-2">
                  <CreditCard className="mr-2 h-4 w-4 text-on-surface-variant" />
                  Plan & Pojemność Portfela
                </DropdownMenuItem>

                {canAccessAdminPanel && (
                  <>
                    <DropdownMenuSeparator className="bg-outline-variant/30" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/admin')}
                      className="cursor-pointer hover:bg-secondary/15 text-xs text-secondary font-bold rounded-lg py-2"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {canManageUsers ? 'Panel Administracyjny' : 'Terminal Weryfikatora'}
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-outline-variant/30" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-error-container text-error text-xs rounded-lg py-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj się
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <button className="material-symbols-outlined text-on-surface p-1">
                  menu
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-surface border-l border-outline-variant/40 p-6 text-on-surface">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
                    <span className="font-extrabold text-lg text-on-surface">FlipCardZ</span>
                    <button
                      className="material-symbols-outlined text-on-surface-variant"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      close
                    </button>
                  </div>

                  <nav className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActivePath(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 h-10 text-xs font-semibold rounded-xl ${
                              active
                                ? 'bg-secondary text-on-secondary shadow-sm'
                                : 'text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.name}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="border-t border-outline-variant/30 pt-4">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-3 text-error hover:bg-error-container h-10 text-xs font-semibold rounded-xl"
                    >
                      <LogOut className="w-4 h-4" />
                      Wyloguj się
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 pb-12 w-full flex-1">
        {children}
      </main>

      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
}
