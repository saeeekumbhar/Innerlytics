import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { getUserEntries, getTodayEntry, JournalEntry, addJournalEntry } from '../journal/journalService';
import { getLifeTrackerEntry, LifeTrackerEntry } from '../../services/lifeTrackerService';
import MoodCheckIn from './MoodCheckIn';
import WeeklyMoodGraph from '../../components/charts/WeeklyMoodGraph';
import AIInsightCard from '../../components/ui/InsightCard';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, ArrowRight, BookOpen, MessageSquare, Activity, Smile,
  PenTool, X, ChevronLeft, ChevronRight, Sparkles, Flame, TreePine, Sprout, Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { getAchievements, Achievement } from '../../services/achievementService';
import AchievementBadge from '../../components/ui/AchievementBadge';
import EmotionAvatar from '../../components/ui/EmotionAvatar';

// --- Swipeable Insight Carousel ---
const SwipeableInsights = ({ entries }: { entries: JournalEntry[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const getEmoji = usePreferences().getEmoji;

  const reflectionPrompts = [
    "What made you smile today? 😊",
    "What's one kind thing you did for yourself?",
    "Who brought positivity into your day?",
    "What are you grateful for right now?",
    "What challenge did you overcome recently?",
  ];

  const cards = [
    {
      emoji: '🧠',
      title: "Today's Emotional Insight",
      body: entries.length > 0
        ? `You've been feeling mostly "${entries[0].moodLabel}" recently. Keep tracking to see patterns emerge.`
        : 'Start journaling to unlock personalized insights!',
      gradient: 'from-[var(--color-pastel-purple)]/20 to-[var(--color-pastel-blue)]/10',
    },
    {
      emoji: '📊',
      title: 'Pattern Detected',
      body: entries.length >= 3
        ? `Over your last ${entries.length} entries, your average mood is ${(entries.reduce((s, e) => s + e.moodScore, 0) / entries.length).toFixed(1)}/10. ${entries[0].moodScore > 6 ? "You're trending up! 🎉" : "Let's work on lifting your spirits."}`
        : "Journal a few more days to detect emotional patterns.",
      gradient: 'from-[var(--color-pastel-blue)]/20 to-[var(--color-pastel-teal)]/10',
    },
    {
      emoji: '🌿',
      title: 'Self-Care Suggestion',
      body: entries.length > 0 && entries[0].moodScore < 5
        ? 'It seems like a tough stretch. Try a quick breathing exercise in the Wellness tab.'
        : 'Keep nurturing your wellbeing — maybe take a mindful walk today? 🚶‍♀️',
      gradient: 'from-[var(--color-pastel-teal)]/20 to-[var(--color-pastel-peach)]/10',
    },
    {
      emoji: '💭',
      title: 'Reflection Prompt',
      body: reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)],
      gradient: 'from-[var(--color-pastel-pink)]/20 to-[var(--color-pastel-purple)]/10',
    },
  ];

  const next = () => setCurrentIndex((currentIndex + 1) % cards.length);
  const prev = () => setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);

  return (
    <div className="relative glass rounded-[2rem] p-6 soft-shadow border-none overflow-hidden">
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
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className={`bg-gradient-to-br ${cards[currentIndex].gradient} rounded-2xl p-5`}
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

// --- Growth Tree ---
const GrowthTree = ({ streak }: { streak: number }) => {
  let stage = { icon: Sprout, label: 'Seed', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  if (streak >= 30) stage = { icon: TreePine, label: 'Tree', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  else if (streak >= 7) stage = { icon: Leaf, label: 'Plant', color: 'var(--color-pastel-teal)', xp: streak * 10 };
  const StageIcon = stage.icon;
  return (
    <div className="glass rounded-[2rem] p-6 soft-shadow border-none text-center relative overflow-hidden">
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
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">{streak} day streak</span>
      </div>
      <div className="mt-2 bg-[var(--color-bg-primary)]/40 rounded-full px-3 py-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-pastel-purple)]">
        ✨ {stage.xp} Emotional XP
      </div>
    </div>
  );
};

// --- Mood Emoji Timeline ---
const MoodTimeline = ({ entries, getEmoji }: { entries: JournalEntry[], getEmoji: (label: string) => string }) => (
  <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden">
    <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4">Mood Timeline</h3>
    {entries.length === 0 ? (
      <p className="text-sm text-[var(--color-text-secondary)]">No entries yet — start tracking!</p>
    ) : (
      <div className="space-y-2">
        {entries.slice(0, 7).map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-pastel-hover)] transition-colors group">
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

// --- Quick Journal FAB Modal ---
const QuickJournalFAB = ({ userId, onComplete }: { userId: string; onComplete: () => void }) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addJournalEntry({
        userId,
        date: new Date().toISOString().split('T')[0],
        moodScore: 5,
        moodLabel: 'Meh',
        content: note,
      });
      setNote('');
      setOpen(false);
      onComplete();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white flex items-center justify-center soft-shadow hover:shadow-xl transition-shadow"
      >
        <PenTool className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-[2rem] p-8 w-full max-w-lg soft-shadow relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setOpen(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] mb-1">Quick Journal ✍️</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">Capture a thought before it slips away.</p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What's on your mind right now?"
                className="w-full p-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 text-[var(--color-text-primary)] focus:outline-none resize-none placeholder:text-[var(--color-text-secondary)]/60 leading-relaxed glow-focus"
                rows={5}
                autoFocus
              />
              <button onClick={handleSave} disabled={saving || !note.trim()}
                className="w-full mt-4 py-3.5 rounded-full font-medium text-white bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] hover:scale-[1.02] active:scale-95 transition-all soft-shadow disabled:opacity-50"
              >
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
  const [loading, setLoading] = useState(true);

  // Compute streak
  const computeStreak = (entryList: JournalEntry[]) => {
    const dates = new Set(entryList.map(e => e.date));
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 60; i++) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dates.has(dStr)) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else if (i === 0) { checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [recentEntries, today, unlockedAchievements, todayLife] = await Promise.all([
        getUserEntries(user.uid, 14),
        getTodayEntry(user.uid),
        getAchievements(user.uid),
        getLifeTrackerEntry(user.uid, todayStr)
      ]);
      setEntries(recentEntries);
      setTodayEntry(today);
      setAchievements(unlockedAchievements);
      setLifeEntry(todayLife);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVariants: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <>
      <motion.div className="space-y-8 pb-24" variants={containerVariants} initial="hidden" animate="show">
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
            { to: '/', icon: Smile, label: 'Log Mood', color: '--color-pastel-purple', gradient: 'from-[var(--color-pastel-purple)]/15 to-[var(--color-pastel-purple)]/5' },
            { to: '/journal', icon: BookOpen, label: 'Write Journal', color: '--color-pastel-blue', gradient: 'from-[var(--color-pastel-blue)]/15 to-[var(--color-pastel-blue)]/5' },
            { to: '/chat', icon: MessageSquare, label: 'AI Reflection', color: '--color-pastel-pink', gradient: 'from-[var(--color-pastel-pink)]/15 to-[var(--color-pastel-pink)]/5' },
            { to: '/habits', icon: Activity, label: 'Add Habit', color: '--color-pastel-teal', gradient: 'from-[var(--color-pastel-teal)]/15 to-[var(--color-pastel-teal)]/5' },
          ].map(action => (
            <Link key={action.label} to={action.to}>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
                className={`bg-gradient-to-br ${action.gradient} rounded-2xl p-5 text-center cursor-pointer border border-[var(--color-border-subtle)]/30 soft-shadow hover:shadow-md transition-shadow`}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, var(${action.color}) 25%, transparent)` }}>
                  <action.icon className="w-6 h-6" style={{ color: `var(${action.color})` }} />
                </div>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* ── 3-Column Content Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* — Card 1: Mood Check-In or Today's Mood — */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
            {!todayEntry ? (
              <MoodCheckIn onComplete={fetchData} />
            ) : (
              <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-peach)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">You've checked in today</h3>
                  <p className="text-[var(--color-text-secondary)] mt-1">Great job tracking your mood ✨</p>
                </div>
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 bg-[var(--color-bg-primary)]/50 p-3 md:p-4 rounded-2xl relative z-10">
                  <span className="text-3xl drop-shadow-sm">{getEmoji(todayEntry.moodLabel)}</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{todayEntry.moodLabel}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* — Card 2: Emotion Avatar — */}
          <motion.div variants={itemVariants}>
            <EmotionAvatar />
          </motion.div>

          {/* — Card 3: Swipeable Insights — */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
            <SwipeableInsights entries={entries} />
          </motion.div>

          {/* — Card 4: Growth Tree & XP — */}
          <motion.div variants={itemVariants}>
            <GrowthTree streak={streak} />
          </motion.div>

          {/* — Card 5: Weekly Mood Graph — */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
            <WeeklyMoodGraph data={entries.map(e => ({ date: e.date, moodScore: e.moodScore }))} />
          </motion.div>

          {/* — Card 6: Mood Timeline — */}
          <motion.div variants={itemVariants}>
            <MoodTimeline entries={entries} getEmoji={getEmoji} />
          </motion.div>

          {/* — Card 7: Life Tracker — */}
          <motion.div variants={itemVariants}>
            {lifeEntry ? (
              <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden hover:shadow-md transition-shadow">
                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4">Today's Life Summary</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(lifeEntry.ratings).map(([cat, stars]) => (
                    <div key={cat} className="px-3 py-1.5 bg-[var(--color-bg-primary)]/50 rounded-xl text-sm font-medium border border-[var(--color-border-subtle)]/50 flex items-center gap-1.5">
                      <span className="capitalize text-[var(--color-text-primary)]">{cat.replace('_', ' ')}</span>
                      <span className="text-[var(--color-pastel-yellow)] drop-shadow-sm">{'★'.repeat(stars)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass rounded-[2rem] p-6 soft-shadow border-none flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Life Tracker</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Track 10 daily dimensions.</p>
                </div>
                <Link to="/life" className="block text-center px-5 py-3 bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)] rounded-full font-medium hover:bg-[var(--color-pastel-purple)] hover:text-white transition-all">Open Tracker</Link>
              </div>
            )}
          </motion.div>

          {/* — Card 8: AI Insight (full) — */}
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <AIInsightCard entries={entries} />
          </motion.div>

          {/* — Card 9: Achievements — */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-2">
            <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-purple)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />
              <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Your Growth</h3>
                <Link to="/achievements" className="text-xs font-medium text-[var(--color-pastel-purple)] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
                {achievements.slice(0, 3).map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
                {achievements.length === 0 && (
                  <div className="sm:col-span-3 p-6 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                    <p className="text-sm text-[var(--color-text-secondary)]">Keep journaling to unlock badges! 🌱</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* — Card 10: Recent Entries — */}
          <motion.div variants={itemVariants}>
            <div className="glass rounded-[2rem] p-6 soft-shadow border-none relative overflow-hidden hover:shadow-md transition-shadow">
              <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)] mb-4">Recent Entries</h3>
              <div className="space-y-3">
                {entries.slice(0, 3).map(entry => (
                  <div key={entry.id} className="p-3 bg-[var(--color-bg-primary)]/40 rounded-2xl hover:bg-[var(--color-pastel-hover)] transition-all cursor-pointer group border border-[var(--color-border-subtle)]/50 hover:shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-xs font-bold text-[var(--color-pastel-purple)]">{entry.moodLabel}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-primary)] line-clamp-2 leading-relaxed">{entry.content || <span className="italic opacity-50">No content.</span>}</p>
                  </div>
                ))}
                {entries.length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                    <p className="text-sm text-[var(--color-text-secondary)]">No entries yet.</p>
                  </div>
                )}
                <Link to="/journal" className="flex items-center justify-center w-full p-3 text-sm font-medium text-[var(--color-pastel-purple)] bg-[var(--color-pastel-purple)]/5 hover:bg-[var(--color-pastel-purple)]/10 rounded-xl transition-colors mt-1 group">
                  View all <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Action Button */}
      {user && <QuickJournalFAB userId={user.uid} onComplete={fetchData} />}
    </>
  );
};

export default Dashboard;
