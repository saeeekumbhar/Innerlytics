import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserEntries, getTodayEntry, JournalEntry } from '../services/journal';
import MoodCheckIn from '../components/MoodCheckIn';
import WeeklyMoodGraph from '../components/WeeklyMoodGraph';
import AIInsightCard from '../components/AIInsightCard';
import { motion } from 'motion/react';
import { Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [recentEntries, today] = await Promise.all([
        getUserEntries(user.uid, 7),
        getTodayEntry(user.uid)
      ]);
      setEntries(recentEntries);
      setTodayEntry(today);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Here's your emotional overview.</p>
        </div>
        <Link
          to="/journal"
          className="flex items-center px-6 py-3 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-full font-medium transition-all duration-300 soft-shadow hover:shadow-lg hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Entry
        </Link>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {!todayEntry ? (
            <motion.div variants={itemVariants}>
              <MoodCheckIn onComplete={fetchData} />
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-peach)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">You've checked in today</h3>
                <p className="text-[var(--color-text-secondary)] mt-1">Great job tracking your mood ✨</p>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 bg-[var(--color-bg-primary)]/50 p-3 md:p-4 rounded-2xl relative z-10">
                <span className="text-3xl drop-shadow-sm">{todayEntry.moodLabel === 'Great' ? '🤩' : todayEntry.moodLabel === 'Good' ? '🙂' : todayEntry.moodLabel === 'Neutral' ? '😐' : todayEntry.moodLabel === 'Anxious' ? '😟' : '😢'}</span>
                <span className="font-medium text-[var(--color-text-primary)]">{todayEntry.moodLabel}</span>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <WeeklyMoodGraph data={entries.map(e => ({ date: e.date, moodScore: e.moodScore }))} />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <motion.div variants={itemVariants}>
            <AIInsightCard entries={entries} />
          </motion.div>

          <motion.div variants={itemVariants} className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-pastel-teal)]/10 rounded-full blur-2xl -mt-10 -ml-10 pointer-events-none"></div>
            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-5 relative z-10">Recent Entries</h3>
            <div className="space-y-4 relative z-10">
              {entries.slice(0, 3).map(entry => (
                <div key={entry.id} className="p-4 bg-[var(--color-bg-primary)]/40 rounded-2xl hover:bg-[var(--color-pastel-hover)] transition-all duration-300 cursor-pointer group border border-[var(--color-border-subtle)]/50 hover:shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="text-xs font-bold text-[var(--color-pastel-purple)] group-hover:text-[var(--color-pastel-blue)] transition-colors">{entry.moodLabel}</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)] line-clamp-2 leading-relaxed">{entry.content || <span className="italic opacity-50">No content attached.</span>}</p>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="p-6 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl">
                  <p className="text-sm text-[var(--color-text-secondary)]">No entries yet. Start reflecting to see history.</p>
                </div>
              )}
              <Link to="/journal" className="inline-flex items-center justify-center w-full p-3 text-sm font-medium text-[var(--color-pastel-purple)] bg-[var(--color-pastel-purple)]/5 hover:bg-[var(--color-pastel-purple)]/10 rounded-xl transition-colors mt-2 group">
                View all <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
