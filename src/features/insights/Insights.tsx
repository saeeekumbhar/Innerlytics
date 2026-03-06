import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserEntries, JournalEntry } from '../journal/journalService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { TrendingUp, Zap, Brain, Tag, MapPin, FileText, Activity as ActivityIcon, Sparkles, Loader, Link as LinkIcon } from 'lucide-react';
import { generateJsonContent } from '../../services/geminiService';
import { getHabits, Habit } from '../../services/habitService';
import { Type } from '@google/genai';

const PASTEL_COLORS = ['#C8B6FF', '#FFAFCC', '#A0C4FF', '#B8E0D2', '#FFD6A5', '#FF8FAB', '#94CDB8', '#B5A0FF'];

const Insights = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState<{ summary: string, happiest_day: string, top_trigger: string, mood_stability: string } | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const data = await getUserEntries(user.uid, 50);
        setEntries(data.reverse());
        setHabits(getHabits());
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
      </div>
    );
  }

  // --- Data Processing ---
  const activityCount = entries.length;
  const avgMood = Math.round(entries.reduce((s, e) => s + e.moodScore, 0) / Math.max(activityCount, 1) * 10) / 10;

  const moodVariance = entries.reduce((s, e) => s + Math.pow(e.moodScore - avgMood, 2), 0) / Math.max(activityCount, 1);
  let moodStability = 'Stable';
  if (moodVariance > 4) moodStability = 'Highly fluctuating';
  else if (moodVariance > 1.5) moodStability = 'Moderate variation';

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

  // Habit Impact Correlation
  const habitImpacts = habits.map(habit => {
    const withHabit = entries.filter(e => habit.completedDates.includes(e.date));
    const withoutHabit = entries.filter(e => !habit.completedDates.includes(e.date));

    if (withHabit.length < 2 || withoutHabit.length < 2) return null; // Need min baseline

    const avgWith = withHabit.reduce((s, e) => s + e.moodScore, 0) / withHabit.length;
    const avgWithout = withoutHabit.reduce((s, e) => s + e.moodScore, 0) / withoutHabit.length;

    const impact = avgWith - avgWithout;
    return { habit, impact, avgWith, avgWithout };
  }).filter(h => h !== null).sort((a, b) => b!.impact - a!.impact) as { habit: Habit, impact: number, avgWith: number, avgWithout: number }[];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants: any = {
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

  const handleGenerateReport = async () => {
    if (entries.length === 0) return;
    setGeneratingReport(true);
    try {
      const last7 = entries.slice(-7);
      const textForAi = last7.map(e => `Date: ${e.date}, Mood: ${e.moodLabel}, Notes: ${e.content}`).join('\n');

      const schema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          happiest_day: { type: Type.STRING },
          top_trigger: { type: Type.STRING },
          mood_stability: { type: Type.STRING }
        },
        required: ["summary", "happiest_day", "top_trigger", "mood_stability"]
      };

      const aiResult = await generateJsonContent(`Summarize this week's emotional journey and identify the happiest day, top triggers (like work, social, etc based on context and text), and mood stability (e.g. erratic, calm, mostly positive):\n${textForAi}`, schema);
      setWeeklyReport(aiResult);
    } catch (error) {
      console.error(error);
      alert("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
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
        <div className="space-y-8">

          {/* Top Level Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="glass p-6 rounded-[2rem] border-none soft-shadow relative overflow-hidden flex items-center gap-4 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-pastel-purple)]/10 rounded-full blur-xl -mt-10 -mr-10"></div>
              <div className="w-14 h-14 bg-[var(--color-bg-primary)]/50 rounded-2xl flex items-center justify-center text-[var(--color-pastel-purple)] shadow-sm group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Activity Count</p>
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{activityCount} entries</h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-6 rounded-[2rem] border-none soft-shadow relative overflow-hidden flex items-center gap-4 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-pastel-teal)]/10 rounded-full blur-xl -mt-10 -mr-10"></div>
              <div className="w-14 h-14 bg-[var(--color-bg-primary)]/50 rounded-2xl flex items-center justify-center text-[var(--color-pastel-teal)] shadow-sm group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Average Daily Mood</p>
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">{avgMood} / 10</h3>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass p-6 rounded-[2rem] border-none soft-shadow relative overflow-hidden flex items-center gap-4 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-pastel-peach)]/10 rounded-full blur-xl -mt-10 -mr-10"></div>
              <div className="w-14 h-14 bg-[var(--color-bg-primary)]/50 rounded-2xl flex items-center justify-center text-[var(--color-pastel-peach)] shadow-sm group-hover:scale-110 transition-transform">
                <ActivityIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Mood Stability</p>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">{moodStability}</h3>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mood & Anxiety Trend */}
            <motion.div variants={itemVariants} className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
              <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 relative z-10">
                <TrendingUp className="w-5 h-5 text-[var(--color-pastel-purple)]" /> Mood Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMoodInsights" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C8B6FF" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#C8B6FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAnxietyInsights" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFAFCC" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#FFAFCC" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis dataKey="date" tickFormatter={(str) => { try { return format(parseISO(str), 'MM/dd'); } catch { return str; } }} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="mood" stroke="#C8B6FF" strokeWidth={3} name="Mood" fillOpacity={1} fill="url(#colorMoodInsights)" />
                    <Area type="monotone" dataKey="anxiety" stroke="#FFAFCC" strokeWidth={2} name="Anxiety" strokeDasharray="5 5" fillOpacity={0.5} fill="url(#colorAnxietyInsights)" />
                  </AreaChart>
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
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEnergyInsights" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B8E0D2" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#B8E0D2" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorStressInsights" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD6A5" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#FFD6A5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                    <XAxis dataKey="date" tickFormatter={(str) => { try { return format(parseISO(str), 'MM/dd'); } catch { return str; } }} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} dy={10} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="energy" stroke="#B8E0D2" strokeWidth={3} name="Energy" fillOpacity={1} fill="url(#colorEnergyInsights)" />
                    <Area type="monotone" dataKey="stress" stroke="#FFD6A5" strokeWidth={3} name="Stress" fillOpacity={1} fill="url(#colorStressInsights)" />
                  </AreaChart>
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
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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

            {/* Habit Impact Correlation */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-pastel-teal)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
              <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2 relative z-10">
                <LinkIcon className="w-5 h-5 text-[var(--color-pastel-teal)]" /> Habit Impact Correlator
              </h3>
              {habitImpacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                  {habitImpacts.map(({ habit, impact }) => {
                    const isPositive = impact > 0;
                    const percentage = Math.round(impact * 10); // scale 1-10 to 1-100%
                    return (
                      <div key={habit.id} className="p-5 bg-[var(--color-bg-primary)]/40 rounded-[1.5rem] border border-[var(--color-border-subtle)] flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-3xl">{habit.emoji}</span>
                          <span className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{habit.name}</span>
                        </div>
                        <div className={`text-2xl font-bold font-serif ${isPositive ? 'text-[var(--color-pastel-teal)]' : 'text-[var(--color-danger)]'}`}>
                          {isPositive ? '+' : ''}{percentage}% mood
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          when completed
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-[var(--color-bg-primary)]/40 rounded-[1.5rem] border border-[var(--color-border-subtle)]">
                  <p className="text-[var(--color-text-secondary)]">Not enough correlation data yet.</p>
                  <p className="text-xs text-[var(--color-text-secondary)]/70 mt-1">Track habits and moods for a few days to see insights.</p>
                </div>
              )}
            </motion.div>

            {/* Wellness Dimensions Radar — only if multi-dim data exists */}
            {hasMultiDim && avgDimensions.length > 0 && (
              <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-peach)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
                <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 relative z-10">
                  <Brain className="w-5 h-5 text-[var(--color-pastel-peach)]" /> Wellness Overview
                </h3>
                <div className="h-72 max-w-lg mx-auto">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <RadarChart data={avgDimensions}>
                      <PolarGrid stroke="var(--color-border-subtle)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 13, fill: 'var(--color-text-secondary)', fontWeight: 500 }} />
                      <Radar name="Average" dataKey="value" stroke="#C8B6FF" fill="#C8B6FF" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* AI Weekly Report */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--color-pastel-purple)]/5 to-transparent">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--color-pastel-purple)]" /> Weekly AI Report
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">A personalized summary of your last 7 days.</p>
                </div>
                {!weeklyReport && (
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-full font-medium shadow-sm hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center disabled:opacity-50"
                  >
                    {generatingReport ? <><Loader className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 'Generate Report ✨'}
                  </button>
                )}
              </div>

              {weeklyReport && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-[var(--color-bg-primary)]/50 rounded-2xl border border-[var(--color-pastel-purple)]/20 relative z-10 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border-subtle)] soft-shadow-sm flex flex-col items-center text-center">
                      <span className="text-[2rem] leading-none mb-2 block">🌟</span>
                      <span className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mb-1">Happiest Day</span>
                      <span className="text-[var(--color-text-primary)] font-medium text-sm">{weeklyReport.happiest_day}</span>
                    </div>
                    <div className="bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border-subtle)] soft-shadow-sm flex flex-col items-center text-center">
                      <span className="text-[2rem] leading-none mb-2 block">🎯</span>
                      <span className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mb-1">Top Trigger</span>
                      <span className="text-[var(--color-text-primary)] font-medium text-sm">{weeklyReport.top_trigger}</span>
                    </div>
                    <div className="bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border-subtle)] soft-shadow-sm flex flex-col items-center text-center">
                      <span className="text-[2rem] leading-none mb-2 block">⚖️</span>
                      <span className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider mb-1">Stability</span>
                      <span className="text-[var(--color-text-primary)] font-medium text-sm capitalize">{weeklyReport.mood_stability}</span>
                    </div>
                  </div>
                  <p className="leading-relaxed text-[var(--color-text-primary)] text-sm md:text-base border-t border-[var(--color-border-subtle)] pt-4">
                    {weeklyReport.summary}
                  </p>
                </motion.div>
              )}
            </motion.div>

          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Insights;
