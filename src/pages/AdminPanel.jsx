import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  TrendingUp,
  Activity,
  Crown,
  Search,
  Ban,
  CheckCircle,
  Loader2,
  PackageCheck,
  Truck,
  ClipboardCheck
} from "lucide-react";
import { createPageUrl } from '../utils';

const ORDER_STATUS_FLOW = ['payment', 'preparing_shipment', 'hub_verification', 'completed'];

export default function AdminPanel() {
  const { user, canManageUsers, canAccessAdminPanel, changeUserRole } = useAuth();
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

  const canProcessOrders = canAccessAdminPanel;
  const defaultTab = canManageUsers ? 'admin' : 'warehouse';

  useEffect(() => {
    if (!user || !canAccessAdminPanel) {
      navigate(createPageUrl('Home'));
      return;
    }

    fetchAdminData();
  }, [user, canAccessAdminPanel, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      const { data: tradesData, error: tradesError } = await supabase
        .from('trade_offers')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(100);

      if (tradesError) throw tradesError;
      setTrades(tradesData || []);

      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter((u) =>
        new Date(u.last_seen_at || u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;
      const totalTrades = tradesData?.length || 0;
      const pendingTrades = tradesData?.filter((t) => t.status === 'pending').length || 0;

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
    const { error } = await changeUserRole(userId, 'admin');

    if (!error) {
      await fetchAdminData();
    }

    setActionLoading(null);
  };

  const handleAssignWarehouse = async (userId) => {
    setActionLoading(userId);
    const { error } = await changeUserRole(userId, 'employee');

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

  const handleUpdateTradeStatus = async (tradeId, nextStep) => {
    setActionLoading(tradeId);
    try {
      const updates = { progress_step: nextStep };
      if (nextStep === 'completed') {
        updates.status = 'completed';
      }
      
      const { error } = await supabase
        .from('trade_offers')
        .update(updates)
        .eq('id', tradeId);

      if (error) throw error;
      await fetchAdminData();
    } catch (error) {
      console.error('Error updating trade status:', error);
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const warehouseOrders = trades.filter((trade) => ['accepted', 'completed'].includes(trade.status));

  const getNextStatus = (progressStep) => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(progressStep || 'payment');
    if (currentIndex === -1 || currentIndex >= ORDER_STATUS_FLOW.length - 1) return null;
    return ORDER_STATUS_FLOW[currentIndex + 1];
  };

  const getStatusLabel = (step) => {
    const labels = {
      negotiating: 'Negocjacje',
      payment: 'Oczekuje na płatność',
      preparing_shipment: 'W trakcie wysyłki',
      hub_verification: 'Weryfikacja w Hubie',
      completed: 'Zakończone'
    };
    return labels[step] || step || 'Nieznany';
  };

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-violet-600" />
              {canManageUsers ? 'Panel administracyjny' : 'Panel magazynu'}
            </h1>
            <p className="text-slate-600 mt-2">
              Zarządzaj użytkownikami i przetwarzaniem zamówień FlipCardZ
            </p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            variant="outline"
          >
            Powrót do strony głównej
          </Button>
        </div>

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
                  <p className="text-sm text-slate-600">Do obsłużenia</p>
                  <p className="text-2xl font-bold text-slate-900">{warehouseOrders.length}</p>
                </div>
                <PackageCheck className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList>
            {canManageUsers && <TabsTrigger value="admin">Zarządzanie użytkownikami</TabsTrigger>}
            {canProcessOrders && <TabsTrigger value="warehouse">Magazyn i zamówienia</TabsTrigger>}
          </TabsList>

          {canManageUsers && (
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Zarządzanie użytkownikami</CardTitle>
                  <CardDescription>Lista wszystkich użytkowników w systemie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            {u.role === 'employee' && (
                              <Badge className="bg-blue-600">
                                <Truck className="w-3 h-3 mr-1" />
                                Magazynier
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
                                  Promuj admin
                                </>
                              )}
                            </Button>
                          )}

                          {u.role !== 'employee' && u.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAssignWarehouse(u.id)}
                              disabled={actionLoading === u.id}
                            >
                              {actionLoading === u.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Truck className="w-4 h-4 mr-1" />
                                  Magazynier
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
            </TabsContent>
          )}

          {canProcessOrders && (
            <TabsContent value="warehouse">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-violet-600" />
                    Kolejka magazynowa
                  </CardTitle>
                  <CardDescription>
                    Zamówienia/wymiany gotowe do obsługi przez magazyn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {warehouseOrders.length === 0 && (
                      <p className="text-sm text-slate-500">Brak zadań magazynowych do obsłużenia.</p>
                    )}
                    {warehouseOrders.map((trade) => {
                      const nextStatus = getNextStatus(trade.progress_step);
                      return (
                        <div key={trade.id} className="p-4 rounded-lg border bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">Wymiana #{String(trade.trade_id || trade.id).slice(0, 8)}</p>
                            <p className="text-sm text-slate-600 truncate max-w-sm">Od: {trade.sender_email} <br/> Do: {trade.owner_email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline">{getStatusLabel(trade.progress_step)}</Badge>
                              <span className="text-xs text-slate-500">Utworzono: {new Date(trade.created_date || trade.updated_date).toLocaleString('pl-PL')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {nextStatus && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTradeStatus(trade.id, nextStatus)}
                                disabled={actionLoading === trade.id}
                              >
                                {actionLoading === trade.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <PackageCheck className="w-4 h-4 mr-1" />
                                    Przenieś do: {getStatusLabel(nextStatus)}
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
