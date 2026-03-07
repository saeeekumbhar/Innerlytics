import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { getUserEntries, getTodayEntry, JournalEntry, addJournalEntry } from '../journal/journalService';
import { getLifeTrackerEntry, LifeTrackerEntry } from '../../services/lifeTrackerService';
import { getHabits } from '../../services/habitService';
import MoodCheckIn from './MoodCheckIn';
import WeeklyMoodGraph from '../../components/charts/WeeklyMoodGraph';
import AIInsightCard from '../../components/ui/InsightCard';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, ArrowRight, BookOpen, MessageSquare, Activity, Smile,
  PenTool, X, ChevronLeft, ChevronRight, Sparkles, Flame, TreePine, Sprout, Leaf,
  TrendingUp, Calendar, Zap, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
// @ts-ignore
import confetti from 'canvas-confetti';

import { getAchievements, Achievement } from '../../services/achievementService';
import AchievementBadge from '../../components/ui/AchievementBadge';
import EmotionAvatar from '../../components/ui/EmotionAvatar';


// ─── Growth Tree ─────────────────────────────
const GrowthTree = ({ streak }: { streak: number }) => {
  let stage = { icon: Sprout, label: 'Seed', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  if (streak >= 30) stage = { icon: TreePine, label: 'Tree', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  else if (streak >= 7) stage = { icon: Leaf, label: 'Plant', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  const StageIcon = stage.icon;

  return (
    <motion.div whileHover={{ scale: 1.01 }} className="glass rounded-[2rem] p-6 soft-shadow border-none text-center relative overflow-hidden glow-card h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-pastel-teal)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />
      <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4 relative z-10">Growth Tree</h3>
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: `color-mix(in srgb, ${stage.color} 20%, transparent)` }}
      >
        <StageIcon className="w-10 h-10" style={{ color: stage.color }} />
      </motion.div>
      <p className="font-semibold text-sm text-[var(--color-text-primary)]">{stage.label}</p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-lg">🔥</motion.span>
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">{streak} day streak</span>
      </div>
      <div className="mt-3 bg-[var(--color-pastel-purple)]/15 rounded-full px-3 py-1 inline-flex items-center justify-center gap-1 text-xs font-bold text-[var(--color-pastel-purple)] border border-[var(--color-pastel-purple)]/20 mx-auto">
        <Zap className="w-3 h-3" /> {stage.xp} Emotional XP
      </div>
    </motion.div>
  );
};

// ─── Mood Heatmap (GitHub Style) ─────────────
const MoodHeatmap = ({ entries, getEmoji }: { entries: JournalEntry[], getEmoji: (l: string) => string }) => {
  const grid = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(e => map.set(e.date, e.moodScore));
    const cells: { date: string; score: number | null }[] = [];
    const today = new Date();
    for (let i = 41; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      cells.push({ date: dStr, score: map.get(dStr) ?? null });
    }
    return cells;
  }, [entries]);

  const getColor = (score: number | null) => {
    if (score === null) return 'var(--color-bg-secondary)';
    if (score >= 8) return 'var(--color-pastel-teal)';
    if (score >= 6) return '#A8E6CF';
    if (score >= 4) return 'var(--color-pastel-yellow)';
    if (score >= 2) return 'var(--color-pastel-peach)';
    return 'var(--color-pastel-pink)';
  };

  return (
    <div className="glass rounded-[2rem] p-6 soft-shadow border-none glow-card relative z-10">
      <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4">Mood Heatmap</h3>
      <div className="grid grid-cols-7 gap-1.5">
        {grid.map(cell => (
          <motion.div
            key={cell.date}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: Math.random() * 0.3 }}
            className="aspect-square rounded-lg cursor-pointer relative group"
            style={{ backgroundColor: getColor(cell.score) }}
            title={`${cell.date}: ${cell.score !== null ? cell.score + '/10' : 'No entry'}`}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-[10px] px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-[var(--color-border-subtle)]">
              {new Date(cell.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {cell.score !== null ? `${cell.score}/10` : '—'}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-[var(--color-text-secondary)] font-medium">
        <span>Low</span>
        {[1, 3, 5, 7, 9].map(s => (
          <div key={s} className="w-3 h-3 rounded" style={{ backgroundColor: getColor(s) }} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
};

// ─── Mood Emoji Timeline ─────────────────────
const MoodTimeline = ({ entries, getEmoji }: { entries: JournalEntry[], getEmoji: (l: string) => string }) => (
  <div className="glass rounded-[2rem] p-6 soft-shadow border-none glow-card relative z-10">
    <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4">Mood Timeline</h3>
    {entries.length === 0 ? (
      <p className="text-sm text-[var(--color-text-secondary)]">No entries yet — start tracking!</p>
    ) : (
      <div className="space-y-2">
        {entries.slice(0, 7).map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-pastel-hover)] transition-colors group border border-transparent hover:border-[var(--color-border-subtle)]">
            <span className="text-2xl drop-shadow-sm">{getEmoji(entry.moodLabel)}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <span className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-pastel-purple)] transition-colors">{entry.moodLabel}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Quick Journal FAB Modal ─────────────────
const QuickJournalFAB = ({ userId, onComplete }: { userId: string; onComplete: () => void }) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addJournalEntry({ userId, date: new Date().toISOString().split('T')[0], moodScore: 5, moodLabel: 'Meh', content: note });
      setNote('');
      setOpen(false);
      onComplete();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      >
        <PenTool className="w-6 h-6" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-[2rem] p-8 w-full max-w-lg soft-shadow relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setOpen(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] mb-1">Quick Journal ✍️</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">Capture a thought before it slips away.</p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="What's on your mind right now?"
                className="w-full p-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50 text-[var(--color-text-primary)] focus:outline-none resize-none placeholder:text-[var(--color-text-secondary)]/60 leading-relaxed glow-focus"
                rows={5} autoFocus />
              <button onClick={handleSave} disabled={saving || !note.trim()}
                className="w-full mt-4 py-3.5 rounded-full font-medium text-white bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] hover:scale-[1.02] active:scale-95 transition-all soft-shadow disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Entry ✨'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


// ─── Onboarding Guide ────────────────────────
const OnboardingGuide = () => {
  const [visible, setVisible] = useState(true);

  // Show only if there's no data in localStorage saying it was dismissed
  useEffect(() => {
    if (localStorage.getItem('hideDashboardGuide')) setVisible(false);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('hideDashboardGuide', 'true');
  };

  return (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass rounded-[2rem] p-6 lg:p-8 mb-8 soft-shadow border border-[var(--color-pastel-purple)]/30 relative overflow-hidden glow-card">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-pastel-purple)]/20 to-[var(--color-pastel-blue)]/20 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none" />
      <div className="flex justify-between items-start relative z-10 mb-6">
        <div>
          <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-pastel-purple)]" /> Welcome to your Digital Sanctuary
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">Here is a quick guide on how to navigate and use the app to feel better.</p>
        </div>
        <button onClick={dismiss} className="p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors" title="Dismiss Guide"><X className="w-5 h-5 text-[var(--color-text-secondary)]" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-[var(--color-bg-primary)]/60 p-5 rounded-2xl border border-[var(--color-border-subtle)]/50 flex flex-col items-start soft-shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-peach)]/20 flex items-center justify-center mb-3"><Smile className="w-5 h-5 text-[var(--color-pastel-peach)]" /></div>
          <h4 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">1. Daily Check-in</h4>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Log your mood every day. Doing so builds your "streak" and helps your virtual tree grow!</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-[var(--color-bg-primary)]/60 p-5 rounded-2xl border border-[var(--color-border-subtle)]/50 flex flex-col items-start soft-shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-blue)]/20 flex items-center justify-center mb-3"><BookOpen className="w-5 h-5 text-[var(--color-pastel-blue)]" /></div>
          <h4 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">2. Journal & Chat</h4>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Use the Journal to reflect in a beautiful notebook, or vent to the AI Coach when things feel heavy.</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="bg-[var(--color-bg-primary)]/60 p-5 rounded-2xl border border-[var(--color-border-subtle)]/50 flex flex-col items-start soft-shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-teal)]/20 flex items-center justify-center mb-3"><Activity className="w-5 h-5 text-[var(--color-pastel-teal)]" /></div>
          <h4 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">3. Track & Grow</h4>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Review your insights down below, master your habits, and unlock beautiful achievements.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};


// ============= MAIN DASHBOARD =============
const Dashboard = () => {
  const { user } = useAuth();
  const { getEmoji } = usePreferences();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lifeEntry, setLifeEntry] = useState<LifeTrackerEntry | null>(null);
  const [habitsCount, setHabitsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const computeStreak = (list: JournalEntry[]) => {
    const dates = new Set(list.map(e => e.date));
    let s = 0;
    const d = new Date();
    for (let i = 0; i < 60; i++) {
      const dStr = d.toISOString().split('T')[0];
      if (dates.has(dStr)) { s++; d.setDate(d.getDate() - 1); }
      else if (i === 0) { d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  };

  const triggerConfetti = () => {
    (confetti as any)({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#B197FC', '#74B9FF', '#55C77A', '#FF6B8A', '#FFCA28'] });
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [recentEntries, today, unlockedAchievements, todayLife, habits] = await Promise.all([
        getUserEntries(user.uid, 42),
        getTodayEntry(user.uid),
        getAchievements(user.uid),
        getLifeTrackerEntry(user.uid, todayStr),
        getHabits(),
      ]);
      setEntries(recentEntries);
      setTodayEntry(today);
      setAchievements(unlockedAchievements);
      setLifeEntry(todayLife);
      setHabitsCount(habits.length);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodComplete = () => {
    triggerConfetti();
    fetchData();
  };

  useEffect(() => { fetchData(); }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
      </div>
    );
  }

  const streak = computeStreak(entries);
  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <>
      <motion.div className="space-y-8 pb-24 relative z-10" variants={containerVariants} initial="hidden" animate="show">

        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Ready to reflect today?</p>
          </div>
        </motion.header>

        <AnimatePresence>
          <OnboardingGuide />
        </AnimatePresence>

        {/* ── 1. Action & Identity Row (Prioritized) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-2">
            {!todayEntry ? (
              <MoodCheckIn onComplete={handleMoodComplete} />
            ) : null}
          </motion.div>
          <motion.div variants={itemVariants} className="xl:col-span-1 h-full">
            <EmotionAvatar />
          </motion.div>
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          <motion.div variants={itemVariants} className="h-full">
            <AIInsightCard entries={entries} />
          </motion.div>
        </div>

        {/* ── 4. Tracking & Progress ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="h-full">
            <MoodHeatmap entries={entries} getEmoji={getEmoji} />
          </motion.div>
          <motion.div variants={itemVariants} className="h-full">
            <GrowthTree streak={streak} />
          </motion.div>
          <motion.div variants={itemVariants} className="h-full">
            {lifeEntry ? (
              <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden glow-card h-full">
                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4">Today's Life Summary</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(lifeEntry.ratings).map(([cat, stars]) => (
                    <div key={cat} className="px-3 py-1.5 bg-[var(--color-bg-primary)]/60 rounded-xl text-sm font-medium border border-[var(--color-border-subtle)]/50 flex items-center gap-1.5">
                      <span className="capitalize text-[var(--color-text-primary)]">{cat.replace('_', ' ')}</span>
                      <span className="text-[var(--color-pastel-yellow)] drop-shadow-sm">{'★'.repeat(stars)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass rounded-[2rem] p-6 soft-shadow border-none flex flex-col justify-between gap-4 glow-card h-full">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Life Tracker</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track 10 daily dimensions.</p>
                </div>
                <Link to="/life" className="block text-center px-5 py-3 bg-[var(--color-pastel-purple)]/15 text-[var(--color-pastel-purple)] rounded-full font-medium hover:bg-[var(--color-pastel-purple)] hover:text-white transition-all border border-[var(--color-pastel-purple)]/20 shadow-sm mt-auto">Open Tracker</Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── 5. Historical Flow ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="h-full">
            <WeeklyMoodGraph data={entries.slice(0, 7).map(e => ({ date: e.date, moodScore: e.moodScore }))} />
          </motion.div>
          <motion.div variants={itemVariants} className="h-full">
            <MoodTimeline entries={entries} getEmoji={getEmoji} />
          </motion.div>
        </div>

        {/* ── 6. Gamification Showcase ── */}
        <motion.div variants={itemVariants}>
          <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden glow-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-purple)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] relative z-10">Your Growth</h3>
              <Link to="/achievements" className="text-xs font-medium text-[var(--color-pastel-purple)] hover:underline flex items-center gap-1 relative z-10">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 gap-3 relative z-10">
              {achievements.slice(0, 6).map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
              {achievements.length === 0 && (
                <div className="sm:col-span-3 xl:col-span-6 p-6 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                  <p className="text-sm text-[var(--color-text-secondary)]">Keep journaling to unlock badges! 🌱</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {user && <QuickJournalFAB userId={user.uid} onComplete={fetchData} />}
    </>
  );
};

export default Dashboard;
