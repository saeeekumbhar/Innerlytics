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
    <div className="flex flex-col h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans overflow-hidden transition-colors duration-500">

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
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User avatar */}
          <NavLink to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors group">
            {(user as any)?.photoURL ? (
              <img src={(user as any).photoURL} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-pastel-purple)]/30" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white flex items-center justify-center font-bold text-sm">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-[var(--color-text-primary)] hidden md:block">{user?.displayName?.split(' ')[0] || 'User'}</span>
          </NavLink>

          <button onClick={logout} className="p-2.5 rounded-full text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 overflow-y-auto relative">
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
                  className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white shadow-lg shadow-[var(--color-pastel-purple)]/30'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-pastel-hover)]'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium mt-0.5 leading-none">{item.label}</span>
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

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--color-border-subtle)]/50 mx-1" />

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="relative group"
          >
            <motion.div
              whileHover={{ scale: 1.15, y: -6 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl transition-all duration-200 ${moreOpen
                ? 'bg-[var(--color-pastel-purple)]/20 text-[var(--color-pastel-purple)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-pastel-hover)]'
                }`}
            >
              {moreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="text-[10px] font-medium mt-0.5 leading-none">More</span>
            </motion.div>
          </button>
        </motion.nav>

        {/* ═══ "More" Flyout Menu ═══ */}
        <AnimatePresence>
          {moreOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[-1] pointer-events-auto"
                onClick={() => setMoreOpen(false)}
              />
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute bottom-full mb-3 right-4 pointer-events-auto bg-[var(--color-bg-card)] backdrop-blur-2xl border border-[var(--color-border-subtle)]/50 rounded-2xl soft-shadow p-2 min-w-[220px]"
              >
                {moreItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-[var(--color-pastel-purple)]/15 text-[var(--color-pastel-purple)] font-medium'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-pastel-hover)] hover:text-[var(--color-text-primary)]'
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm flex-1">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" />
                    </NavLink>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Onboarding />
    </div>
  );
};

export default Layout;
