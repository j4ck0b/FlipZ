import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from './lib/query-client';
import { AuthProvider, useAuth } from './lib/AuthContext';
import NotificationProvider from './components/notifications/NotificationProvider';
import { LanguageProvider } from './components/LanguageProvider';
import Layout from './Layout';

// Pages - wszystkie istnieją w Twoim drzewie
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
import AdminPanel from './pages/AdminDashboard'; // Uwaga: masz AdminDashboard.jsx, nie AdminPanel.jsx

import './App.css';

// Chroni przed dostępem niezalogowanych
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected routes — UWAGA: ścieżki z myślnikami! */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/card-exchange" element={<ProtectedRoute><CardExchange /></ProtectedRoute>} />
      <Route path="/brick-exchange" element={<ProtectedRoute><BrickExchange /></ProtectedRoute>} />
      <Route path="/diecast-exchange" element={<ProtectedRoute><DiecastExchange /></ProtectedRoute>} />
      <Route path="/figure-exchange" element={<ProtectedRoute><FigureExchange /></ProtectedRoute>} />
      <Route path="/collectible-exchange" element={<ProtectedRoute><CollectibleExchange /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Layout>
                <AppRoutes />
              </Layout>
              <Toaster position="top-right" />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
