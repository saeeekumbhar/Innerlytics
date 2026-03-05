import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserEntries, JournalEntry } from '../services/journal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';

const Insights = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        const data = await getUserEntries(user.uid, 50);
        setEntries(data.reverse()); // Oldest first for charts
        setLoading(false);
      }
    };
    fetchEntries();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Process data for charts
  const moodData = entries.map(e => ({
    date: e.date,
    mood: e.moodScore,
    anxiety: e.aiAnalysisJson ? JSON.parse(e.aiAnalysisJson).anxiety_score || 0 : 0
  }));

  // Simple emotion frequency
  const emotionCounts: Record<string, number> = {};
  entries.forEach(e => {
    const emotion = e.moodLabel || 'Unknown';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  const emotionData = Object.entries(emotionCounts).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Insights</h1>
        <p className="text-slate-600 mt-1">Analyze your emotional patterns.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood & Anxiety Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-serif font-bold text-slate-900 mb-4">Mood & Anxiety Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), 'MM/dd')} tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={2} name="Mood" />
              <Line type="monotone" dataKey="anxiety" stroke="#ef4444" strokeWidth={2} name="Anxiety" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Frequency */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-serif font-bold text-slate-900 mb-4">Emotion Frequency</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Insights;
