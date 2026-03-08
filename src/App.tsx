import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Layout from './components/layout/Layout';
import Login from './features/auth/Login';
import Dashboard from './features/mood/Dashboard';
import MySpace from './features/mood/MySpace';
import CalendarPage from './features/mood/CalendarPage';
import Journal from './features/journal/JournalPage';
import Chat from './features/insights/ChatPage';
import Insights from './features/insights/Insights';
import Partner from './features/partner/Partner';
import Settings from './features/mood/Settings';
import Habits from './features/habits/Habits';
import Wellness from './features/wellness/Wellness';
import LifeTracker from './features/life/LifeTracker';
import MemoryGallery from './features/journal/MemoryGallery';
import AchievementsPage from './features/mood/AchievementsPage';
import Support from './features/support/Support';
import Privacy from './features/journal/Privacy';

import ErrorBoundary from './components/ui/ErrorBoundary';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
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
    <ErrorBoundary>
      <PreferencesProvider>
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
                <Route path="myspace" element={<MySpace />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="journal" element={<Journal />} />
                <Route path="chat" element={<Chat />} />
                <Route path="insights" element={<Insights />} />
                <Route path="habits" element={<Habits />} />
                <Route path="wellness" element={<Wellness />} />
                <Route path="life" element={<LifeTracker />} />
                <Route path="gallery" element={<MemoryGallery />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="partner" element={<Partner />} />
                <Route path="support" element={<Support />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}
