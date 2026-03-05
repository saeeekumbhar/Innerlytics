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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.displayName?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-1">Here's your emotional overview.</p>
        </div>
        <Link 
          to="/journal" 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {!todayEntry ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MoodCheckIn onComplete={fetchData} />
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900">You've checked in today</h3>
                <p className="text-slate-500 text-sm mt-1">Great job tracking your mood!</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{todayEntry.moodLabel === 'Great' ? '🤩' : todayEntry.moodLabel === 'Good' ? '🙂' : todayEntry.moodLabel === 'Neutral' ? '😐' : todayEntry.moodLabel === 'Anxious' ? '😟' : '😢'}</span>
                <span className="font-medium text-slate-700">{todayEntry.moodLabel}</span>
              </div>
            </div>
          )}

          <WeeklyMoodGraph data={entries.map(e => ({ date: e.date, moodScore: e.moodScore }))} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <AIInsightCard entries={entries} />
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-serif font-bold text-slate-900 mb-4">Recent Entries</h3>
            <div className="space-y-4">
              {entries.slice(0, 3).map(entry => (
                <div key={entry.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-slate-500">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700">{entry.moodLabel}</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{entry.content || "No content"}</p>
                </div>
              ))}
              {entries.length === 0 && (
                <p className="text-sm text-slate-400 italic">No entries yet.</p>
              )}
              <Link to="/journal" className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
