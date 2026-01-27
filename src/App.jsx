import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from './lib/query-client';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { NotificationProvider } from './components/notifications/NotificationProvider';
import { LanguageProvider } from './components/LanguageProvider'; // ✅ DODANE
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
import AdminPanel from './pages/AdminDashboard';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  return children;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/Home" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/Home" replace /> : <Landing />} />
      <Route path="/Login" element={user ? <Navigate to="/Home" replace /> : <Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route
        path="/Home"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Card-Exchange"
        element={
          <ProtectedRoute>
            <Layout>
              <CardExchange />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Brick-Exchange"
        element={
          <ProtectedRoute>
            <Layout>
              <BrickExchange />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Diecast-Exchange"
        element={
          <ProtectedRoute>
            <Layout>
              <DiecastExchange />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Figure-Exchange"
        element={
          <ProtectedRoute>
            <Layout>
              <FigureExchange />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Collectible-Exchange"
        element={
          <ProtectedRoute>
            <Layout>
              <CollectibleExchange />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Profile/:userId?"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Messages"
        element={
          <ProtectedRoute>
            <Layout>
              <Messages />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Favorites"
        element={
          <ProtectedRoute>
            <Layout>
              <Favorites />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Subscription"
        element={
          <ProtectedRoute>
            <Layout>
              <Subscription />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Subscription-Success"
        element={
          <ProtectedRoute>
            <SubscriptionSuccess />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/Admin-Panel"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />

      {/* Catch all - redirect to home or landing */}
      <Route path="*" element={<Navigate to={user ? "/Home" : "/"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider> {/* ✅ OPKUJ CAŁĄ APLIKACJĘ */}
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
