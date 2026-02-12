import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from './lib/query-client';
import { AuthProvider, useAuth } from './lib/AuthContext';
import NotificationProvider from './components/notifications/NotificationProvider';
import { LanguageProvider } from './components/LanguageProvider';
import Layout from './Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import CardExchange from './pages/CardExchange';
import BrickExchange from './pages/BrickExchange';
import DiecastExchange from './pages/DiecastExchange';
import FigureExchange from './pages/FigureExchange';
import CollectibleExchange from './pages/CollectibleExchange';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import Subscription from './pages/Subscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import AdminPanel from './pages/AdminPanel';
import MyListings from './pages/MyListings';

import './App.css';

function FullscreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mb-4" />
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, panelAccessLoading } = useAuth();

  if (loading || panelAccessLoading) {
    return <FullscreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AdminRoute({ children }) {
  const { user, canAccessAdminPanel, panelAccessLoading, loading } = useAuth();

  if (loading || panelAccessLoading) {
    return <FullscreenLoader />;
  }

  if (!user || !canAccessAdminPanel) {
    return <Navigate to="/home" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="page-transition" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/card-exchange" element={<ProtectedRoute><CardExchange /></ProtectedRoute>} />
        <Route path="/brick-exchange" element={<ProtectedRoute><BrickExchange /></ProtectedRoute>} />
        <Route path="/diecast-exchange" element={<ProtectedRoute><DiecastExchange /></ProtectedRoute>} />
        <Route path="/figure-exchange" element={<ProtectedRoute><FigureExchange /></ProtectedRoute>} />
        <Route path="/collectible-exchange" element={<ProtectedRoute><CollectibleExchange /></ProtectedRoute>} />
        <Route path="/profile/:userId?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
        <Route path="/my-trades" element={<Navigate to="/my-listings" replace />} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

        <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes />
              <Toaster position="top-right" />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
