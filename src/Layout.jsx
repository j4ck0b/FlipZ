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
  Crown,
  Shield,
  CreditCard,
  ArrowRightLeft,
  X
} from 'lucide-react';
import FloatingChat from './components/chat/FloatingChat';
import NotificationPanel from './components/notifications/NotificationPanel';

export default function Layout({ children }) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Jeśli nie ma usera, nie pokazuj nawigacji (nie powinno się zdarzyć bo ProtectedRoute to pilnuje)
  if (!user) {
    return <div>{children}</div>;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Moje Wymiany', path: '/my-listings', icon: ArrowRightLeft },
    { name: 'Wiadomości', path: '/messages', icon: MessageSquare },
    { name: 'Ulubione', path: '/favorites', icon: Heart },
    { name: 'Profil', path: `/profile/${user?.id}`, icon: User },
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="app-shell min-h-screen">
      <div className="app-shell__glow app-shell__glow--primary" aria-hidden="true" />
      <div className="app-shell__glow app-shell__glow--secondary" aria-hidden="true" />
      {/* Header */}
      <header className="app-header glass-panel sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="logo-orb w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src="/logo.svg" alt="FlipCardZ" className="w-7 h-7 drop-shadow" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent hidden sm:inline">
                FlipCardZ
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={active ? "default" : "ghost"}
                      className={`gap-2 ${
                        active
                          ? 'bg-gradient-to-r from-violet-300 to-pink-300 text-white accent-glow'
                          : 'text-slate-700 hover:text-violet-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationPanel />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-violet-200">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                        {profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {profile?.subscription_tier !== 'free' && (
                      <Crown className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.username || 'Użytkownik'}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                      {profile?.subscription_tier && profile?.subscription_tier !== 'free' && (
                        <Badge className="w-fit bg-gradient-to-r from-violet-300 to-pink-300">
                          <Crown className="w-3 h-3 mr-1" />
                          {profile.subscription_tier}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user?.id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subskrypcja
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigate('/admin')}
                        className="text-violet-600 font-medium"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Panel Admina
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Trigger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold">Menu</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
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
                              variant={active ? "default" : "ghost"}
                              className={`w-full justify-start gap-3 ${
                                active
                                  ? 'bg-gradient-to-r from-violet-300 to-pink-300 text-white accent-glow'
                                  : 'text-slate-700'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              {item.name}
                            </Button>
                          </Link>
                        );
                      })}

                      {isAdmin && (
                        <>
                          <div className="my-2 border-t border-slate-200" />
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-3 text-violet-600 border-violet-200"
                            >
                              <Shield className="w-5 h-5" />
                              Panel Admina
                            </Button>
                          </Link>
                        </>
                      )}
                    </nav>

                    <div className="border-t border-slate-200 pt-4">
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-3 text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="page-surface">
          {children}
        </div>
      </main>

      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
}
