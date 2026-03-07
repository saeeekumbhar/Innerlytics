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

// ─── Quick Stats Row ─────────────────────────
const QuickStats = ({ entries, streak, habitsCount }: { entries: JournalEntry[], streak: number, habitsCount: number }) => {
  const avgMood = entries.length > 0
    ? (entries.reduce((s, e) => s + e.moodScore, 0) / entries.length).toFixed(1)
    : '—';
  const weekEntries = entries.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const stats = [
    { icon: TrendingUp, label: 'Avg Mood', value: `${avgMood}/10`, color: '--color-pastel-purple' },
    { icon: Calendar, label: 'This Week', value: `${weekEntries} entries`, color: '--color-pastel-blue' },
    { icon: Flame, label: 'Streak', value: `${streak} days`, color: '--color-pastel-peach' },
    { icon: CheckCircle2, label: 'Habits', value: `${habitsCount} active`, color: '--color-pastel-teal' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(stat => (
        <motion.div key={stat.label}
          whileHover={{ scale: 1.04, y: -2 }}
          className="glass rounded-2xl p-4 soft-shadow border-none glow-card flex items-center gap-3 relative z-10"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, var(${stat.color}) 20%, transparent)` }}>
            <stat.icon className="w-5 h-5" style={{ color: `var(${stat.color})` }} />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Swipeable Insight Carousel ──────────────
const SwipeableInsights = ({ entries }: { entries: JournalEntry[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reflectionPrompts = [
    "What made you smile today? 😊",
    "What's one kind thing you did for yourself?",
    "Who brought positivity into your day?",
    "What are you grateful for right now?",
    "What challenge did you overcome recently?",
  ];

  const cards = [
    {
      emoji: '🧠', title: "Today's Emotional Insight",
      body: entries.length > 0
        ? `You've been feeling mostly "${entries[0].moodLabel}" recently. Keep tracking to see patterns.`
        : 'Start journaling to unlock personalized insights!',
      gradient: 'from-[var(--color-pastel-purple)]/20 to-[var(--color-pastel-blue)]/10',
    },
    {
      emoji: '📊', title: 'Pattern Detected',
      body: entries.length >= 3
        ? `Over ${entries.length} entries, avg mood is ${(entries.reduce((s, e) => s + e.moodScore, 0) / entries.length).toFixed(1)}/10. ${entries[0].moodScore > 6 ? "Trending up! 🎉" : "Let's work on lifting spirits."}`
        : "Journal a few more days to detect patterns.",
      gradient: 'from-[var(--color-pastel-blue)]/20 to-[var(--color-pastel-teal)]/10',
    },
    {
      emoji: '🌿', title: 'Self-Care Suggestion',
      body: entries.length > 0 && entries[0].moodScore < 5
        ? 'Tough stretch. Try a breathing exercise in Wellness.'
        : 'Keep nurturing wellbeing — try a mindful walk today? 🚶‍♀️',
      gradient: 'from-[var(--color-pastel-teal)]/20 to-[var(--color-pastel-peach)]/10',
    },
    {
      emoji: '💭', title: 'Reflection Prompt',
      body: reflectionPrompts[new Date().getDate() % reflectionPrompts.length],
      gradient: 'from-[var(--color-pastel-pink)]/20 to-[var(--color-pastel-purple)]/10',
    },
  ];

  const next = () => setCurrentIndex((currentIndex + 1) % cards.length);
  const prev = () => setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);

  return (
    <div className="glass rounded-[2rem] p-6 soft-shadow border-none overflow-hidden glow-card relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-pastel-purple)]" /> Daily Insights
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-1.5 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors"><ChevronLeft className="w-4 h-4 text-[var(--color-text-secondary)]" /></button>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium tabular-nums">{currentIndex + 1}/{cards.length}</span>
          <button onClick={next} className="p-1.5 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors"><ChevronRight className="w-4 h-4 text-[var(--color-text-secondary)]" /></button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}
          className={`bg-gradient-to-br ${cards[currentIndex].gradient} rounded-2xl p-5 border border-[var(--color-border-subtle)]/30`}
        >
          <span className="text-3xl block mb-3">{cards[currentIndex].emoji}</span>
          <h4 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">{cards[currentIndex].title}</h4>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{cards[currentIndex].body}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-1.5 mt-4">
        {cards.map((_, i) => (
          <button key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-[var(--color-pastel-purple)] w-5' : 'bg-[var(--color-border-subtle)]'}`} />
        ))}
      </div>
    </div>
  );
};

// ─── Growth Tree ─────────────────────────────
const GrowthTree = ({ streak }: { streak: number }) => {
  let stage = { icon: Sprout, label: 'Seed', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  if (streak >= 30) stage = { icon: TreePine, label: 'Tree', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  else if (streak >= 7) stage = { icon: Leaf, label: 'Plant', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  const StageIcon = stage.icon;

  return (
    <div className="glass rounded-[2rem] p-6 soft-shadow border-none text-center relative overflow-hidden glow-card">
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
      <div className="mt-2 bg-[var(--color-pastel-purple)]/15 rounded-full px-3 py-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-pastel-purple)] border border-[var(--color-pastel-purple)]/20">
        <Zap className="w-3 h-3" /> {stage.xp} Emotional XP
      </div>
    </div>
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

        {/* ── Header ── */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Ready to reflect today?</p>
          </div>
        </motion.header>

        {/* ── Quick Actions ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '#mood-checkin', icon: Smile, label: 'Log Mood', color: '--color-pastel-purple', gradient: 'from-[var(--color-pastel-purple)]/15 to-[var(--color-pastel-purple)]/5' },
            { to: '/journal', icon: BookOpen, label: 'Write Journal', color: '--color-pastel-blue', gradient: 'from-[var(--color-pastel-blue)]/15 to-[var(--color-pastel-blue)]/5' },
            { to: '/chat', icon: MessageSquare, label: 'AI Reflection', color: '--color-pastel-pink', gradient: 'from-[var(--color-pastel-pink)]/15 to-[var(--color-pastel-pink)]/5' },
            { to: '/habits', icon: Activity, label: 'Add Habit', color: '--color-pastel-teal', gradient: 'from-[var(--color-pastel-teal)]/15 to-[var(--color-pastel-teal)]/5' },
          ].map(action => (
            <Link key={action.label} to={action.to} onClick={(e) => {
              if (action.to.startsWith('#')) {
                e.preventDefault();
                document.getElementById(action.to.substring(1))?.scrollIntoView({ behavior: 'smooth' });
              }
            }}>
              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-br ${action.gradient} rounded-2xl p-5 text-center cursor-pointer border border-[var(--color-border-subtle)]/40 soft-shadow glow-card`}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center relative">
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: Math.random() * 2 }} className="absolute inset-0 rounded-2xl" style={{ backgroundColor: `var(${action.color})`, opacity: 0.2 }} />
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: Math.random() * 2 }} className="relative z-10 w-full h-full flex items-center justify-center">
                    <action.icon className="w-6 h-6 drop-shadow-sm" style={{ color: `var(${action.color})` }} />
                  </motion.div>
                </div>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </motion.div>
        {/* ── Quick Stats ── */}
        <motion.div variants={itemVariants}>
          <QuickStats entries={entries} streak={streak} habitsCount={habitsCount} />
        </motion.div>

        {/* ── 3-Column Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* Mood Check-In or Today's Mood */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
            {!todayEntry ? (
              <MoodCheckIn onComplete={handleMoodComplete} />
            ) : (
              <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none flex items-center justify-between relative overflow-hidden glow-card group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-peach)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">You've checked in today</h3>
                  <p className="text-[var(--color-text-secondary)] mt-1">Great job tracking your mood ✨</p>
                </div>
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 bg-[var(--color-bg-primary)]/60 p-3 md:p-4 rounded-2xl relative z-10 border border-[var(--color-border-subtle)]/30">
                  <span className="text-3xl drop-shadow-sm">{getEmoji(todayEntry.moodLabel)}</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{todayEntry.moodLabel}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Emotion Avatar */}
          <motion.div variants={itemVariants}>
            <EmotionAvatar />
          </motion.div>

          {/* Swipeable Insights */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
            <SwipeableInsights entries={entries} />
          </motion.div>

          {/* Growth Tree */}
          <motion.div variants={itemVariants}>
            <GrowthTree streak={streak} />
          </motion.div>

          {/* Weekly Mood Graph */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
            <WeeklyMoodGraph data={entries.slice(0, 7).map(e => ({ date: e.date, moodScore: e.moodScore }))} />
          </motion.div>

          {/* Mood Heatmap - GitHub style */}
          <motion.div variants={itemVariants}>
            <MoodHeatmap entries={entries} getEmoji={getEmoji} />
          </motion.div>

          {/* Life Tracker */}
          <motion.div variants={itemVariants}>
            {lifeEntry ? (
              <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden glow-card">
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
              <div className="glass rounded-[2rem] p-6 soft-shadow border-none flex flex-col justify-between gap-4 glow-card">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Life Tracker</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track 10 daily dimensions.</p>
                </div>
                <Link to="/life" className="block text-center px-5 py-3 bg-[var(--color-pastel-purple)]/15 text-[var(--color-pastel-purple)] rounded-full font-medium hover:bg-[var(--color-pastel-purple)] hover:text-white transition-all border border-[var(--color-pastel-purple)]/20">Open Tracker</Link>
              </div>
            )}
          </motion.div>

          {/* Mood Timeline */}
          <motion.div variants={itemVariants}>
            <MoodTimeline entries={entries} getEmoji={getEmoji} />
          </motion.div>

          {/* AI Insight */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <AIInsightCard entries={entries} />
          </motion.div>

          {/* Achievements */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-3">
            <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden glow-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-purple)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />
              <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Your Growth</h3>
                <Link to="/achievements" className="text-xs font-medium text-[var(--color-pastel-purple)] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
                {achievements.slice(0, 6).map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
                {achievements.length === 0 && (
                  <div className="sm:col-span-3 lg:col-span-6 p-6 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                    <p className="text-sm text-[var(--color-text-secondary)]">Keep journaling to unlock badges! 🌱</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {user && <QuickJournalFAB userId={user.uid} onComplete={fetchData} />}
    </>
  );
};

export default Dashboard;
