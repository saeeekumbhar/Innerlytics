import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Download, Trash2, Bell, FileText, ChevronRight } from 'lucide-react';
import { requestNotificationPermission, areNotificationsEnabled, getReminderTime, setReminderTime } from '../features/common/notificationService';
import { getUserEntries } from '../features/mood/journalService';

const Settings = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(areNotificationsEnabled());
  const [reminderTime, setReminderTimeState] = useState(getReminderTime());

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setReminderTimeState(time);
    setReminderTime(time);
  };

  const handleExportData = async () => {
    if (!user) return;
    const entries = await getUserEntries(user.uid, 1000);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `innerlytics_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Manage your account and preferences.</p>
      </header>

      <div className="glass rounded-[2rem] border-none soft-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-blue)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>
        <div className="p-6 md:p-8 border-b border-[var(--color-border-subtle)]/50 relative z-10">
          <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-6 flex items-center">
            <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-blue)]/20 flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-[var(--color-pastel-blue)]" />
            </div>
            Profile
          </h2>
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-20 h-20 rounded-full object-cover border-4 border-[var(--color-bg-card)] soft-shadow flex-shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white flex items-center justify-center font-bold text-3xl border-4 border-[var(--color-bg-card)] soft-shadow flex-shrink-0">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="mt-2 sm:mt-0">
              <p className="font-bold text-[var(--color-text-primary)] text-2xl">{user?.displayName || 'User'}</p>
              <p className="text-[var(--color-text-secondary)] mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 relative z-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center ml-2">
                <Bell className="w-4 h-4 mr-2 opacity-70" />
                Reminders
              </h3>
              <div className="glass-card-subtle p-5 rounded-2xl border border-[var(--color-border-subtle)]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--color-text-primary)] font-medium">Daily Reminders</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Get a nudge to reflect on your day</p>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-[var(--color-pastel-teal)]' : 'bg-[var(--color-border-subtle)]'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                {notificationsEnabled && (
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]/30">
                    <p className="text-sm text-[var(--color-text-primary)]">Reminder Time</p>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={handleTimeChange}
                      className="bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-subtle)] rounded-lg px-3 py-1 text-sm text-[var(--color-text-primary)] focus:outline-none glow-focus"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center ml-2">
                <Shield className="w-4 h-4 mr-2 opacity-70" />
                Privacy & Data
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-primary)]/40 hover:bg-[var(--color-pastel-hover)] text-left transition-all duration-300 border border-[var(--color-border-subtle)]/50 hover:shadow-sm group"
                >
                  <div className="flex items-center">
                    <Download className="w-5 h-5 mr-3 text-[var(--color-pastel-purple)]" />
                    <div>
                      <p className="text-[var(--color-text-primary)] font-medium">Export Journal Data</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Download your entries as JSON</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] opacity-50" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-primary)]/40 hover:bg-[var(--color-pastel-hover)] text-left transition-all duration-300 border border-[var(--color-border-subtle)]/50 hover:shadow-sm group"
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-[var(--color-pastel-blue)]" />
                    <div>
                      <p className="text-[var(--color-text-primary)] font-medium">Print Reports</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Save analytics and entries to PDF</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] opacity-50" />
                </button>
                <button
                  onClick={() => window.location.href = '/privacy'}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-primary)]/40 hover:bg-[var(--color-pastel-hover)] text-left transition-all duration-300 border border-[var(--color-border-subtle)]/50 hover:shadow-sm group"
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3 text-[var(--color-pastel-teal)]" />
                    <div>
                      <p className="text-[var(--color-text-primary)] font-medium">Privacy Policy</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">Understand how we protect you</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)] opacity-50" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg-primary)]/40 hover:bg-[var(--color-danger)]/5 text-left transition-all duration-300 border border-[var(--color-border-subtle)]/50 hover:border-[var(--color-danger)]/20 hover:shadow-sm group">
                  <div className="flex items-center">
                    <Trash2 className="w-5 h-5 mr-3 text-[var(--color-danger)] opacity-70" />
                    <span className="text-[var(--color-danger)] font-medium">Delete My Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-danger)] opacity-50" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-border-subtle)]/50">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-6 py-4 text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/10 rounded-full font-medium transition-colors group"
            >
              <LogOut className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100 transition-opacity" />
              Sign Out Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
