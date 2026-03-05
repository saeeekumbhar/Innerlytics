import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

interface DataPoint {
  date: string;
  moodScore: number;
}

const WeeklyMoodGraph = ({ data }: { data: DataPoint[] }) => {
  // Fill in missing days with null or previous value if needed, but for now just show available data
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none h-80 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-pastel-teal)]/10 rounded-full blur-2xl -mt-10 -ml-10 pointer-events-none"></div>

      <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-6 relative z-10">Weekly Mood Trend</h2>
      <div className="h-64 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C8B6FF" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#C8B6FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 182, 255, 0.2)" />
            <XAxis
              dataKey="date"
              tickFormatter={(str) => format(parseISO(str), 'EEE')}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
              dy={10}
            />
            <YAxis
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(200, 182, 255, 0.3)', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
              itemStyle={{ color: '#C8B6FF' }}
              cursor={{ stroke: '#C8B6FF', strokeWidth: 2, strokeDasharray: '3 3' }}
            />
            <Area
              type="basis"
              dataKey="moodScore"
              stroke="#C8B6FF"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorMood)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyMoodGraph;
