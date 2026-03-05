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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
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
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Insights</h1>
        <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Analyze your emotional patterns.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood & Anxiety Trend */}
        <div className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 h-80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>
          <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 relative z-10">Mood & Anxiety Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), 'MM/dd')} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', fontFamily: 'Poppins' }} />
              <Line type="monotone" dataKey="mood" stroke="#C8B6FF" strokeWidth={2.5} name="Mood" dot={{ fill: '#C8B6FF', r: 3 }} />
              <Line type="monotone" dataKey="anxiety" stroke="#FFAFCC" strokeWidth={2.5} name="Anxiety" dot={{ fill: '#FFAFCC', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Frequency */}
        <div className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 h-80 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-pastel-pink)]/10 rounded-full blur-3xl -mb-10 -ml-10 pointer-events-none"></div>
          <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 relative z-10">Emotion Frequency</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', fontFamily: 'Poppins' }} />
              <Bar dataKey="count" fill="#C8B6FF" radius={[8, 8, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Insights;
