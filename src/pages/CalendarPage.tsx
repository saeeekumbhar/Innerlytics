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
    if (moodScore >= 8) return '#FFAFCC'; // Pastel Pink
    if (moodScore >= 5) return '#B8E0D2'; // Soft Teal
    return '#A0C4FF'; // Baby Blue
  };

  const events = entries.map(entry => ({
    id: entry.id,
    title: entry.moodLabel,
    date: entry.date,
    backgroundColor: getEventColor(entry.moodScore),
    borderColor: 'transparent',
    textColor: '#ffffff',
    extendedProps: { ...entry }
  }));

  const handleEventClick = (info: any) => {
    setSelectedEntry(info.event.extendedProps);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)] pb-10">
      <div className="flex-1 glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 overflow-hidden relative fullcalendar-custom">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--color-pastel-peach)]/10 rounded-full blur-2xl -mb-10 -ml-10 pointer-events-none"></div>

        <div className="relative z-10 h-full">
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
      </div>

      <div className="w-full lg:w-96 shrink-0 h-full">
        {selectedEntry ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={selectedEntry.id}
            className="glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 h-full overflow-y-auto relative bg-[var(--color-bg-primary)]/40"
          >
            <div className="mb-6 pb-6 border-b border-[var(--color-border-subtle)]/50">
              <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                {new Date(selectedEntry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <h2 className="text-3xl font-serif font-bold text-[var(--color-text-primary)] mt-2">{selectedEntry.moodLabel}</h2>
            </div>

            <div className="prose prose-slate prose-sm md:prose-base mb-8 text-[var(--color-text-primary)] leading-relaxed">
              <p>{selectedEntry.content || <span className="italic opacity-50">No text content for this entry.</span>}</p>
            </div>

            {selectedEntry.aiAnalysisJson && (
              <div className="bg-gradient-to-br from-[var(--color-pastel-purple)]/10 to-[var(--color-pastel-blue)]/10 p-5 md:p-6 rounded-[1.5rem] relative overflow-hidden">
                <div className="absolute -top-5 -right-5 w-20 h-20 bg-[var(--color-pastel-purple)]/20 rounded-full blur-xl pointer-events-none"></div>
                <h4 className="text-xs font-bold text-[var(--color-pastel-purple)] uppercase mb-3 relative z-10 flex items-center">
                  ✨ AI Insight
                </h4>
                <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed relative z-10">
                  {JSON.parse(selectedEntry.aiAnalysisJson).insight_summary}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="glass bg-[var(--color-bg-primary)]/30 rounded-[2rem] border-none soft-shadow h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-[var(--color-border-subtle)]/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-[var(--color-text-secondary)] text-lg">Select a day to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
