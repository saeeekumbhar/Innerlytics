import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserEntries, JournalEntry } from '../services/journal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { TrendingUp, Zap, Brain, Tag, MapPin } from 'lucide-react';

const PASTEL_COLORS = ['#C8B6FF', '#FFAFCC', '#A0C4FF', '#B8E0D2', '#FFD6A5', '#FF8FAB', '#94CDB8', '#B5A0FF'];

const Insights = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        const data = await getUserEntries(user.uid, 50);
        setEntries(data.reverse());
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

  // --- Data Processing ---
  const moodData = entries.map(e => ({
    date: e.date,
    mood: e.moodScore,
    energy: e.energyLevel || 0,
    stress: e.stressLevel || 0,
    anxiety: e.anxietyLevel || 0,
  }));

  // Emotion tag frequency
  const emotionCounts: Record<string, number> = {};
  entries.forEach(e => {
    (e.emotionTags || []).forEach(tag => {
      emotionCounts[tag] = (emotionCounts[tag] || 0) + 1;
    });
    // Fallback: use moodLabel if no tags
    if (!e.emotionTags?.length && e.moodLabel) {
      emotionCounts[e.moodLabel] = (emotionCounts[e.moodLabel] || 0) + 1;
    }
  });
  const emotionData = Object.entries(emotionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Context-based mood analysis
  const contextMoods: Record<string, { total: number; count: number }> = {};
  entries.forEach(e => {
    const ctx = e.context || 'Unknown';
    if (!contextMoods[ctx]) contextMoods[ctx] = { total: 0, count: 0 };
    contextMoods[ctx].total += e.moodScore;
    contextMoods[ctx].count += 1;
  });
  const contextData = Object.entries(contextMoods).map(([context, data]) => ({
    context: context.charAt(0).toUpperCase() + context.slice(1),
    avgMood: Math.round((data.total / data.count) * 10) / 10,
    entries: data.count,
  }));

  // Average dimensions (radar chart)
  const hasMultiDim = entries.some(e => e.energyLevel);
  const avgDimensions = hasMultiDim ? [
    { dimension: 'Mood', value: Math.round(entries.reduce((s, e) => s + e.moodScore, 0) / entries.length * 10) / 10 },
    { dimension: 'Energy', value: Math.round(entries.filter(e => e.energyLevel).reduce((s, e) => s + (e.energyLevel || 0), 0) / Math.max(entries.filter(e => e.energyLevel).length, 1) * 10) / 10 },
    { dimension: 'Stress', value: Math.round(entries.filter(e => e.stressLevel).reduce((s, e) => s + (e.stressLevel || 0), 0) / Math.max(entries.filter(e => e.stressLevel).length, 1) * 10) / 10 },
    { dimension: 'Anxiety', value: Math.round(entries.filter(e => e.anxietyLevel).reduce((s, e) => s + (e.anxietyLevel || 0), 0) / Math.max(entries.filter(e => e.anxietyLevel).length, 1) * 10) / 10 },
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const tooltipStyle = {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '16px',
    fontFamily: 'Poppins',
    fontSize: '12px',
  };

  return (
    <motion.div className="space-y-8 pb-10" variants={containerVariants} initial="hidden" animate="show">
      <motion.header variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Insights & Trends</h1>
        <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Understand your emotional patterns.</p>
      </motion.header>

      {entries.length === 0 ? (
        <motion.div variants={itemVariants} className="glass rounded-[2rem] p-12 soft-shadow border-none text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-[var(--color-pastel-purple)] opacity-50" />
          <p className="text-[var(--color-text-secondary)] text-lg">Start journaling to see your emotional patterns here.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood & Anxiety Trend */}
          <motion.div variants={itemVariants} className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 relative z-10">
              <TrendingUp className="w-5 h-5 text-[var(--color-pastel-purple)]" /> Mood Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                  <XAxis dataKey="date" tickFormatter={(str) => { try { return format(parseISO(str), 'MM/dd'); } catch { return str; } }} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="mood" stroke="#C8B6FF" strokeWidth={2.5} name="Mood" dot={{ fill: '#C8B6FF', r: 3 }} />
                  <Line type="monotone" dataKey="anxiety" stroke="#FFAFCC" strokeWidth={2} name="Anxiety" dot={{ fill: '#FFAFCC', r: 2 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Energy vs Stress */}
          <motion.div variants={itemVariants} className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-pastel-teal)]/10 rounded-full blur-3xl -mb-10 -ml-10 pointer-events-none" />
            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 relative z-10">
              <Zap className="w-5 h-5 text-[var(--color-pastel-teal)]" /> Energy vs Stress
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                  <XAxis dataKey="date" tickFormatter={(str) => { try { return format(parseISO(str), 'MM/dd'); } catch { return str; } }} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="energy" stroke="#B8E0D2" strokeWidth={2.5} name="Energy" dot={{ fill: '#B8E0D2', r: 3 }} />
                  <Line type="monotone" dataKey="stress" stroke="#FFD6A5" strokeWidth={2.5} name="Stress" dot={{ fill: '#FFD6A5', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Emotion Tag Frequency */}
          <motion.div variants={itemVariants} className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-[var(--color-pastel-pink)]/10 rounded-full blur-3xl -mt-10 -ml-10 pointer-events-none" />
            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 relative z-10">
              <Tag className="w-5 h-5 text-[var(--color-pastel-pink)]" /> Most Common Emotions
            </h3>
            <div className="h-64">
              {emotionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-subtle)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} width={90} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} name="Count">
                      {emotionData.map((_, i) => (
                        <Cell key={i} fill={PASTEL_COLORS[i % PASTEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)] text-sm">No emotion data yet</div>
              )}
            </div>
          </motion.div>

          {/* Context-Based Mood */}
          <motion.div variants={itemVariants} className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--color-pastel-blue)]/10 rounded-full blur-3xl -mb-10 -mr-10 pointer-events-none" />
            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 relative z-10">
              <MapPin className="w-5 h-5 text-[var(--color-pastel-blue)]" /> Mood by Context
            </h3>
            <div className="h-64">
              {contextData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contextData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis dataKey="context" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="avgMood" radius={[8, 8, 0, 0]} name="Avg Mood">
                      {contextData.map((_, i) => (
                        <Cell key={i} fill={PASTEL_COLORS[i % PASTEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)] text-sm">Add context to your check-ins to see this</div>
              )}
            </div>
          </motion.div>

          {/* Wellness Dimensions Radar — only if multi-dim data exists */}
          {hasMultiDim && avgDimensions.length > 0 && (
            <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-peach)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
              <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 relative z-10">
                <Brain className="w-5 h-5 text-[var(--color-pastel-peach)]" /> Wellness Overview
              </h3>
              <div className="h-72 max-w-lg mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={avgDimensions}>
                    <PolarGrid stroke="var(--color-border-subtle)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 13, fill: 'var(--color-text-secondary)', fontWeight: 500 }} />
                    <Radar name="Average" dataKey="value" stroke="#C8B6FF" fill="#C8B6FF" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Insights;
