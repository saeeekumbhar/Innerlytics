import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, BookOpen, MessageSquare, BarChart2,
  Users, Settings, LogOut, Activity, Heart, Shield, Star,
  Image as ImageIcon, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import ThemeToggle from '../ui/ThemeToggle';
import Onboarding from '../ui/Onboarding';
import { useReminders } from '../../hooks/useReminders';
import { Logo } from '../ui/Logo';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { showUINotification, dismissNotification } = useReminders();
  const [moreOpen, setMoreOpen] = useState(false);

  // Primary nav — the 6 most-used items for the dock
  const dockItems = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/insights', icon: BarChart2, label: 'Insights' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/habits', icon: Activity, label: 'Habits' },
  ];

  // Secondary nav — less frequent pages accessed via a "More" menu
  const moreItems = [
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/life', icon: Star, label: 'Life Tracker' },
    { path: '/gallery', icon: ImageIcon, label: 'Memory Gallery' },
    { path: '/partner', icon: Users, label: 'Partner' },
    { path: '/achievements', icon: Star, label: 'Achievements' },
    { path: '/support', icon: Shield, label: 'Support' },
    { path: '/privacy', icon: Shield, label: 'Privacy' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="app-bg flex flex-col h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans overflow-hidden transition-colors duration-500">
      {/* ═══ Top Header Bar ═══ */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 bg-[var(--color-bg-card)]/80 backdrop-blur-xl border-b border-[var(--color-border-subtle)]/50 z-30 relative">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <Logo className="w-9 h-9 group-hover:scale-110 transition-transform duration-300" />
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-transparent bg-clip-text leading-tight">
              Innerlytics
            </h1>
            <p className="text-[10px] text-[var(--color-text-secondary)] tracking-widest uppercase -mt-0.5">Digital Diary</p>
          </div>
        </NavLink>

        {/* Right side */}
        <div className="flex items-center gap-3 relative z-50">
          <ThemeToggle />

          {/* More menu button in header */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`p-2 rounded-full transition-colors flex items-center justify-center border border-transparent ${moreOpen ? 'bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)] border-[var(--color-pastel-purple)]/30 scale-105' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-pastel-hover)] hover:text-[var(--color-text-primary)]'}`}
              title="More Options"
            >
              {moreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* "More" Flyout Menu Dropdown */}
            <AnimatePresence>
              {moreOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 pointer-events-auto"
                    onClick={() => setMoreOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute top-full mt-3 right-0 w-56 z-50 pointer-events-auto bg-[var(--color-bg-card)] backdrop-blur-2xl border border-[var(--color-border-subtle)]/50 rounded-2xl soft-shadow p-2 origin-top"
                  >
                    <div className="px-3 py-2 border-b border-[var(--color-border-subtle)]/50 mb-2">
                      <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Features</p>
                    </div>
                    {moreItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMoreOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                            ? 'bg-[var(--color-pastel-purple)]/15 text-[var(--color-pastel-purple)] font-medium'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-pastel-hover)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-pastel-purple)]' : 'group-hover:text-[var(--color-pastel-purple)]'}`} />
                          <span className="text-sm flex-1">{item.label}</span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-pastel-purple)] mr-1" />}
                        </NavLink>
                      );
                    })}

                    <div className="h-px bg-[var(--color-border-subtle)]/50 my-2" />
                    <button
                      onClick={() => {
                        setMoreOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 border border-transparent hover:border-[var(--color-danger)]/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm flex-1 text-left font-medium">Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <NavLink to="/settings" className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-[var(--color-bg-primary)] transition-colors group border border-[var(--color-border-subtle)]/50">
            {(user as any)?.photoURL ? (
              <img src={(user as any).photoURL} alt="" className="w-7 h-7 rounded-full object-cover border border-[var(--color-pastel-purple)]/30" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/20">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-[var(--color-text-primary)] hidden md:block pr-1">{user?.displayName?.split(' ')[0] || 'User'}</span>
          </NavLink>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 overflow-y-auto w-full">
        <AnimatePresence>
          {showUINotification && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="mx-4 md:mx-10 mt-4 p-4 rounded-2xl bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white soft-shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl drop-shadow-sm">✨</span>
                <div>
                  <h4 className="font-bold">Daily Check-in</h4>
                  <p className="text-sm opacity-90">How are you feeling today? Take a moment to reflect.</p>
                </div>
              </div>
              <button onClick={dismissNotification} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full px-4 md:px-10 py-6 pb-28">
          <Outlet />
        </div>
      </main>

      {/* ═══ Floating Bottom Dock ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-5 pointer-events-none">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
          className="pointer-events-auto flex items-center gap-1 px-3 py-2.5 rounded-full bg-[var(--color-bg-card)]/90 backdrop-blur-2xl border border-[var(--color-border-subtle)]/50 shadow-[0_8px_32px_-4px_rgba(177,151,252,0.25),0_4px_16px_-2px_rgba(0,0,0,0.1)]"
        >
          {dockItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path} className="relative group">
                <motion.div
                  whileHover={{ scale: 1.15, y: -6 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-[var(--color-bg-primary)] shadow-lg shadow-[var(--color-pastel-purple)]/30'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-pastel-purple)] hover:bg-[var(--color-pastel-hover)]'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-bg-primary)]' : ''}`} />
                  <span className={`text-[10px] font-medium mt-0.5 leading-none ${isActive ? 'text-[var(--color-bg-primary)]' : ''}`}>{item.label}</span>
                </motion.div>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="dock-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-pastel-purple)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}

        </motion.nav>
      </div>

      <Onboarding />
    </div>
  );
};

export default Layout;
