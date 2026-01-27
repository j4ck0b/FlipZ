import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Activity,
  Crown,
  Search,
  Ban,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { createPageUrl } from '../utils';

export default function AdminPanel() {
  const { user, isAdmin, promoteToAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTrades: 0,
    pendingTrades: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate(createPageUrl('Home'));
      return;
    }

    fetchAdminData();
  }, [user, isAdmin, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (tradesError) throw tradesError;
      setTrades(tradesData || []);

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => 
        new Date(u.last_seen_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const totalTrades = tradesData?.length || 0;
      const pendingTrades = tradesData?.filter(t => t.status === 'pending').length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalTrades,
        pendingTrades,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    setActionLoading(userId);
    const { error } = await promoteToAdmin(userId);
    
    if (!error) {
      await fetchAdminData();
    }
    
    setActionLoading(null);
  };

  const handleBanUser = async (userId) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId);

      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error banning user:', error);
    }
    setActionLoading(null);
  };

  const handleUnbanUser = async (userId) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false })
        .eq('id', userId);

      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-violet-600" />
              Panel Admina
            </h1>
            <p className="text-slate-600 mt-2">
              Zarządzaj użytkownikami i systemem FlipCardZ
            </p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            variant="outline"
          >
            Powrót do strony głównej
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Użytkownicy</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Aktywni (7 dni)</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Wymiany</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalTrades}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Oczekujące</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingTrades}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Zarządzanie Użytkownikami</CardTitle>
            <CardDescription>
              Lista wszystkich użytkowników w systemie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Szukaj użytkownika..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Users List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{u.username}</p>
                      {u.role === 'admin' && (
                        <Badge className="bg-violet-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {u.subscription_tier !== 'free' && (
                        <Badge variant="secondary">
                          {u.subscription_tier}
                        </Badge>
                      )}
                      {u.is_banned && (
                        <Badge variant="destructive">
                          Zbanowany
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{u.email}</p>
                    <p className="text-xs text-slate-500">
                      Wymiany: {u.trade_count_current_month || 0} w tym miesiącu
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {u.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePromoteToAdmin(u.id)}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-1" />
                            Promuj
                          </>
                        )}
                      </Button>
                    )}
                    
                    {u.is_banned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnbanUser(u.id)}
                        disabled={actionLoading === u.id}
                        className="text-green-600"
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Odbanuj
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBanUser(u.id)}
                        disabled={actionLoading === u.id || u.role === 'admin'}
                        className="text-red-600"
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Zbanuj
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
