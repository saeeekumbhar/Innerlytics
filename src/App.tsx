import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Journal from './pages/Journal';
import Chat from './pages/Chat';
import Insights from './pages/Insights';
import Partner from './pages/Partner';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="journal" element={<Journal />} />
            <Route path="chat" element={<Chat />} />
            <Route path="insights" element={<Insights />} />
            <Route path="partner" element={<Partner />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
