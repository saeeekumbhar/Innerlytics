import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, MessageSquare, BarChart2, Users, Settings, LogOut, Activity, Heart, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import ThemeToggle from './ThemeToggle';
import Onboarding from './Onboarding';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { path: '/insights', icon: BarChart2, label: 'Insights' },
    { path: '/habits', icon: Activity, label: 'Habits' },
    { path: '/wellness', icon: Heart, label: 'Wellness' },
    { path: '/partner', icon: Users, label: 'Partner' },
    { path: '/support', icon: Shield, label: 'Support' },
    { path: '/privacy', icon: Shield, label: 'Privacy' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 glass-sidebar m-4 rounded-3xl flex flex-col shadow-sm z-10 overflow-hidden">
        <div className="p-6 border-b border-[var(--color-border-subtle)]">
          <h1 className="text-3xl font-serif font-bold tracking-tight bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-transparent bg-clip-text drop-shadow-sm flex items-center gap-1">
            Innerlytics <span className="text-[var(--color-pastel-purple)] text-xl">✦</span>
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2 italic tracking-wide">Reflect. Understand. Evolve.</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                  ? 'text-[var(--color-text-primary)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)] hover:scale-[1.02]'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-[var(--color-pastel-purple)]/20 shadow-[0_0_15px_rgba(200,182,255,0.4)] rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 mr-3 z-10 transition-colors duration-300 ${isActive ? 'text-[var(--color-pastel-purple)]' : 'text-current group-hover:text-[var(--color-pastel-blue)]'}`} />
                <span className="z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-border-subtle)] space-y-4">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
          <div className="flex items-center px-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-teal)]/30 text-[var(--color-pastel-teal)] flex items-center justify-center mr-3 font-bold text-sm shadow-sm">
              {user?.displayName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-[var(--color-text-primary)]">{user?.displayName || 'Local User'}</p>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-[var(--color-danger)] bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20 rounded-full transition-all duration-300 hover:scale-[1.02]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative rounded-l-3xl my-4 mr-4 bg-[var(--color-bg-primary)]">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
      <Onboarding />
    </div>
  );
};

export default Layout;
