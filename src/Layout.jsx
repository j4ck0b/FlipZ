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
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import FloatingChat from './components/chat/FloatingChat';
import NotificationPanel from './components/notifications/NotificationPanel';

const tierBadges = {
  free: { label: 'FREE', color: 'border-[#1F242D] text-[#94A3B8] bg-[#111318]' },
  basic: { label: 'PRO_TRADER', color: 'border-[#10B981]/40 text-[#10B981] bg-[#10B981]/10' },
  pro: { label: 'PRO_TRADER', color: 'border-[#10B981]/40 text-[#10B981] bg-[#10B981]/10' },
  premium: { label: 'VAULT_MASTER', color: 'border-white text-white bg-white/10' },
  vault_master: { label: 'VAULT_MASTER', color: 'border-white text-white bg-white/10' },
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
    { name: 'Wymiany & Inventory', path: '/my-listings', icon: ArrowRightLeft },
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
    <div className="app-shell vault-grid-bg min-h-screen text-[#F8FAFC]">
      {/* Top Navigation Bar */}
      <header className="app-header border-b border-[#1F242D] sticky top-0 z-50 bg-[#090A0C]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded bg-[#111318] border border-[#1F242D] flex items-center justify-center font-mono-code font-bold text-white text-xs">
                FZ
              </div>
              <span className="font-bold text-white tracking-tight text-sm">
                FLIPZ <span className="font-mono-code text-[11px] text-[#64748B] font-normal uppercase hidden sm:inline">VAULT</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 font-mono-code text-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 rounded transition-all text-xs font-medium ${
                        active
                          ? 'bg-[#161922] text-white border border-[#2E3644] font-semibold'
                          : item.isAdmin
                          ? 'text-[#10B981] hover:bg-[#111318] hover:text-white border border-[#1F242D]'
                          : 'text-[#94A3B8] hover:text-white hover:bg-[#111318]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mr-1.5 opacity-80" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <NotificationPanel />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded p-0 border border-[#1F242D] hover:border-[#2E3644]">
                    <Avatar className="h-full w-full rounded">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                      <AvatarFallback className="bg-[#161922] text-white font-mono-code text-xs font-bold">
                        {profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'FZ'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 bg-[#090A0C] border-[#1F242D] text-[#F8FAFC] p-2 font-mono-code text-xs rounded-lg shadow-2xl" align="end">
                  <DropdownMenuLabel className="p-2 pb-1">
                    <div className="flex flex-col space-y-1">
                      <p className="font-bold text-white text-xs truncate">{profile?.username || 'Użytkownik'}</p>
                      <p className="text-[10px] text-[#64748B] truncate">{user?.email}</p>
                      <div className="pt-1">
                        <Badge variant="outline" className={`text-[9px] font-bold ${badgeConfig.color}`}>
                          ● {badgeConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#1F242D]" />
                  
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user?.id}`)} className="cursor-pointer hover:bg-[#161922] focus:bg-[#161922] text-xs">
                    <User className="mr-2 h-3.5 w-3.5 text-[#94A3B8]" />
                    Profil i Reputacja
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/subscription')} className="cursor-pointer hover:bg-[#161922] focus:bg-[#161922] text-xs">
                    <CreditCard className="mr-2 h-3.5 w-3.5 text-[#94A3B8]" />
                    Plan i Limity Portfela
                  </DropdownMenuItem>

                  {canAccessAdminPanel && (
                    <>
                      <DropdownMenuSeparator className="bg-[#1F242D]" />
                      <DropdownMenuItem 
                        onClick={() => navigate('/admin')}
                        className="cursor-pointer hover:bg-[#161922] focus:bg-[#161922] text-xs text-[#10B981] font-bold"
                      >
                        <Shield className="mr-2 h-3.5 w-3.5" />
                        {canManageUsers ? 'Panel Administracyjny' : 'Terminal Weryfikatora'}
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-[#1F242D]" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-[#E53935]/15 focus:bg-[#E53935]/15 text-[#F87171] text-xs">
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94A3B8] border border-[#1F242D]">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-[#090A0C] border-l border-[#1F242D] text-[#F8FAFC] p-4 font-mono-code">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between pb-4 border-b border-[#1F242D] mb-4">
                      <span className="text-xs font-bold text-white">FLIPZ_NAVIGATION</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#94A3B8]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <nav className="flex flex-col gap-1.5 flex-1 text-xs">
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
                              className={`w-full justify-start gap-2 h-9 text-xs font-mono-code ${
                                active
                                  ? 'bg-[#161922] text-white border border-[#2E3644] font-bold'
                                  : 'text-[#94A3B8] hover:bg-[#111318] hover:text-white'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {item.name}
                            </Button>
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="border-t border-[#1F242D] pt-3">
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-2 text-[#F87171] hover:bg-[#E53935]/15 h-9 text-xs font-mono-code"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Wyloguj się
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="page-surface">
          {children}
        </div>
      </main>

      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
}
