import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences, ThemeMode, ColorPalette, EmojiTheme } from '../../context/PreferencesContext';
import { LogOut, User, Shield, Download, Trash2, Bell, FileText, ChevronRight, Palette, Moon, Sun, Monitor, Sparkles } from 'lucide-react';
import { requestNotificationPermission, areNotificationsEnabled, getReminderTime, setReminderTime } from '../../services/notificationService';
import { getUserEntries } from '../journal/journalService';

const Settings = () => {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode, colorPalette, setColorPalette, emojiTheme, setEmojiTheme } = usePreferences();

  const [activeTab, setActiveTab] = useState<'account' | 'personalization'>('account');
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

  const palettes: { id: ColorPalette, name: string, hex: string }[] = [
    { id: 'lavender', name: 'Lavender', hex: '#C8B6FF' },
    { id: 'peach', name: 'Peach', hex: '#FFB5A7' },
    { id: 'mint', name: 'Mint', hex: '#84DCC6' },
    { id: 'sky_blue', name: 'Sky Blue', hex: '#A0C4FF' },
    { id: 'rose_pink', name: 'Rose Pink', hex: '#FFAFCC' },
    { id: 'forest', name: 'Forest', hex: '#A3B18A' },
    { id: 'astronomy', name: 'Astronomy', hex: '#3C096C' },
  ];

  const emojis: { id: EmojiTheme, name: string, sample: string }[] = [
    { id: 'classic', name: 'Classic', sample: '😄 🙂 😐' },
    { id: 'cute', name: 'Cute', sample: '🤩 🥰 😶' },
    { id: 'minimal', name: 'Minimal', sample: '☀️ 🌤️ ☁️' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Manage your account and preferences.</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-[var(--color-border-subtle)]/30 rounded-full p-1 w-full max-w-sm">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'account' ? 'bg-white text-[var(--color-text-primary)] soft-shadow dark:bg-[var(--color-bg-card)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'personalization' ? 'bg-white text-[var(--color-text-primary)] soft-shadow dark:bg-[var(--color-bg-card)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
        >
          <Sparkles className="w-4 h-4" /> Personalization
        </button>
      </div>

      <div className="glass rounded-[2rem] border-none soft-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>

        {activeTab === 'account' && (
          <>
            <div className="p-6 md:p-8 border-b border-[var(--color-border-subtle)]/50 relative z-10">
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-6 flex items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-purple)]/20 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-[var(--color-pastel-purple)]" />
                </div>
                Profile
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                {(user as any)?.photoURL ? (
                  <img src={(user as any).photoURL} alt={user.displayName || 'User'} className="w-20 h-20 rounded-full object-cover border-4 border-[var(--color-bg-card)] soft-shadow flex-shrink-0" referrerPolicy="no-referrer" />
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
          </>
        )}

        {activeTab === 'personalization' && (
          <div className="p-6 md:p-8 space-y-10 relative z-10">
            {/* Theme Mode */}
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-[var(--color-pastel-blue)]" />
                Theme Mode
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setThemeMode('light')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${themeMode === 'light' ? 'border-[var(--color-pastel-purple)] bg-[var(--color-pastel-purple)]/10 shadow-sm' : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-pastel-hover)]'}`}
                >
                  <Sun className={`w-6 h-6 ${themeMode === 'light' ? 'text-[var(--color-pastel-purple)]' : 'text-[var(--color-text-secondary)]'}`} />
                  <span className={`font-medium ${themeMode === 'light' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>Light</span>
                </button>
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${themeMode === 'dark' ? 'border-[var(--color-pastel-purple)] bg-[var(--color-pastel-purple)]/10 shadow-sm' : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-pastel-hover)]'}`}
                >
                  <Moon className={`w-6 h-6 ${themeMode === 'dark' ? 'text-[var(--color-pastel-purple)]' : 'text-[var(--color-text-secondary)]'}`} />
                  <span className={`font-medium ${themeMode === 'dark' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>Dark</span>
                </button>
                <button
                  onClick={() => setThemeMode('system')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${themeMode === 'system' ? 'border-[var(--color-pastel-purple)] bg-[var(--color-pastel-purple)]/10 shadow-sm' : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-pastel-hover)]'}`}
                >
                  <Monitor className={`w-6 h-6 ${themeMode === 'system' ? 'text-[var(--color-pastel-purple)]' : 'text-[var(--color-text-secondary)]'}`} />
                  <span className={`font-medium ${themeMode === 'system' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>System</span>
                </button>
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-[var(--color-pastel-pink)]" />
                Color Palette
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {palettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setColorPalette(palette.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${colorPalette === palette.id ? 'border-[var(--color-pastel-purple)] bg-[var(--color-bg-primary)] shadow-sm scale-105' : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-pastel-hover)] hover:scale-105'}`}
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-inner"
                      style={{ backgroundColor: palette.hex }}
                    />
                    <span className="text-xs font-medium text-[var(--color-text-primary)] text-center tracking-tight">{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Style */}
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-[var(--color-pastel-teal)]" />
                Emoji Theme
              </h3>
              <div className="space-y-3">
                {emojis.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setEmojiTheme(theme.id)}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${emojiTheme === theme.id ? 'border-[var(--color-pastel-purple)] bg-[var(--color-pastel-purple)]/10 shadow-sm' : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-pastel-hover)]'}`}
                  >
                    <span className={`font-medium ${emojiTheme === theme.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                      {theme.name} Theme
                    </span>
                    <span className="text-xl tracking-widest">{theme.sample}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
