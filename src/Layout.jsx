import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  Store, 
  LayoutDashboard, 
  User,
  Menu,
  X,
  LogOut,
  Sparkles
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

const navItems = [
  { name: 'Marketplace', page: 'Marketplace', icon: Store },
  { name: 'My Dashboard', page: 'MyListings', icon: LayoutDashboard },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to={createPageUrl('Marketplace')} 
              className="flex items-center gap-2 font-bold text-xl text-slate-900"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:inline">CardExchange</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
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
                      <Link to={createPageUrl('MyListings')} className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
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
                    
                    {navItems.map((item) => {
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
                        onClick={() => base44.auth.logout()}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
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
  );
}