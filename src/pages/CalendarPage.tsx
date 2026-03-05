import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../context/AuthContext';
import { getUserEntries, JournalEntry } from '../services/journal';
import { motion } from 'motion/react';

const CalendarPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        const data = await getUserEntries(user.uid, 100); // Fetch last 100 entries
        setEntries(data);
      }
    };
    fetchEntries();
  }, [user]);

  const getEventColor = (moodScore: number) => {
    if (moodScore >= 8) return '#10b981'; // Green
    if (moodScore >= 5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const events = entries.map(entry => ({
    id: entry.id,
    title: entry.moodLabel,
    date: entry.date,
    backgroundColor: getEventColor(entry.moodScore),
    borderColor: 'transparent',
    extendedProps: { ...entry }
  }));

  const handleEventClick = (info: any) => {
    setSelectedEntry(info.event.extendedProps);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          height="100%"
        />
      </div>

      <div className="w-full lg:w-80 shrink-0">
        {selectedEntry ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={selectedEntry.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full overflow-y-auto"
          >
            <div className="mb-4 pb-4 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {new Date(selectedEntry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">{selectedEntry.moodLabel}</h2>
            </div>
            
            <div className="prose prose-slate prose-sm mb-6">
              <p>{selectedEntry.content}</p>
            </div>

            {selectedEntry.aiAnalysisJson && (
              <div className="bg-indigo-50 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-indigo-900 uppercase mb-2">AI Insight</h4>
                <p className="text-sm text-indigo-800">
                  {JSON.parse(selectedEntry.aiAnalysisJson).insight_summary}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-full flex items-center justify-center text-center">
            <p className="text-slate-500 text-sm">Select a day to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
