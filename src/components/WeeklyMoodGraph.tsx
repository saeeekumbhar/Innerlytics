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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-80">
      <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">Weekly Mood Trend</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => format(parseISO(str), 'EEE')} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              domain={[0, 10]} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="moodScore" 
              stroke="#6366f1" 
              strokeWidth={3}
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
