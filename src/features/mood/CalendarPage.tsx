import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../context/AuthContext';
import { getUserEntries, JournalEntry } from '../journal/journalService';
import { getImportantDays, addImportantDay, ImportantDay } from '../../services/calendarService';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Calendar as CalendarIcon, Grid } from 'lucide-react';
import YearInPixels from '../../components/charts/YearInPixels';

const CalendarPage = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'calendar' | 'pixels'>('calendar');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [importantDays, setImportantDays] = useState<ImportantDay[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventType, setNewEventType] = useState<ImportantDay['type']>('birthday');

  const fetchAllData = async () => {
    if (user) {
      const [entriesData, daysData] = await Promise.all([
        getUserEntries(user.uid, 365), // Fetch 365 mapping to support Year in Pixels
        getImportantDays(user.uid)
      ]);
      setEntries(entriesData);
      setImportantDays(daysData);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEventTitle.trim()) return;

    await addImportantDay({
      userId: user.uid,
      date: newEventDate,
      title: newEventTitle,
      type: newEventType
    });

    setShowAddModal(false);
    setNewEventTitle('');
    fetchAllData();
  };

  const getEventColor = (moodScore: number) => {
    if (moodScore >= 8) return '#FFAFCC'; // Pastel Pink
    if (moodScore >= 6) return '#FFD6A5'; // Peach/Neutral
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
    extendedProps: { ...entry, isJournal: true }
  }));

  const importantDayEvents = importantDays.map(day => {
    const icons = { birthday: '🎂', exam: '📝', trip: '✈', anniversary: '💖', achievement: '🏆', other: '⭐' };
    return {
      id: `imp-${day.id}`,
      title: `${icons[day.type] || '⭐'} ${day.title}`,
      date: day.date,
      backgroundColor: 'rgba(255,255,255,0.8)',
      borderColor: 'var(--color-border-subtle)',
      textColor: 'var(--color-text-primary)',
      className: 'important-day-event shadow-sm font-bold',
      extendedProps: { ...day, isJournal: false }
    };
  });

  const allEvents = [...events, ...importantDayEvents];

  const handleEventClick = (info: any) => {
    if (info.event.extendedProps.isJournal) {
      setSelectedEntry(info.event.extendedProps);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)] pb-10">
      <div className="flex-1 glass rounded-[2rem] border-none soft-shadow p-6 lg:p-8 overflow-hidden relative fullcalendar-custom">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-pastel-purple)]/10 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--color-pastel-peach)]/10 rounded-full blur-2xl -mb-10 -ml-10 pointer-events-none"></div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="bg-[var(--color-bg-primary)] p-1 rounded-full flex border border-[var(--color-border-subtle)] soft-shadow">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                <CalendarIcon className="w-4 h-4 mr-2" /> Month
              </button>
              <button
                onClick={() => setViewMode('pixels')}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === 'pixels' ? 'bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
              >
                <Grid className="w-4 h-4 mr-2" /> Year in Pixels
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-[var(--color-pastel-purple)]/10 text-[var(--color-pastel-purple)] hover:bg-[var(--color-pastel-purple)]/20 text-sm font-medium rounded-full transition-transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Important Day
            </button>
          </div>

          <div className="flex-1 min-h-0 bg-white/40 dark:bg-black/20 rounded-2xl p-4">
            {viewMode === 'calendar' ? (
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={allEvents}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: ''
                }}
                height="100%"
              />
            ) : (
              <div className="h-full overflow-y-auto w-full pt-4">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] mb-6 text-center">Your Year in Pixels</h2>
                <YearInPixels
                  entries={entries}
                  year={new Date().getFullYear()}
                  onDayClick={(entry) => setSelectedEntry(entry)}
                />
              </div>
            )}
          </div>
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
            <button onClick={() => setSelectedEntry(null)} className="mt-8 w-full py-3 border border-[var(--color-border-subtle)] rounded-xl text-sm font-medium hover:bg-[var(--color-bg-primary)] transition-colors">Close Details</button>
          </motion.div>
        ) : (
          <div className="glass bg-[var(--color-bg-primary)]/30 rounded-[2rem] border-none soft-shadow h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-[var(--color-border-subtle)]/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-[var(--color-text-secondary)] text-lg">Select a journal entry day to view details.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-3xl w-full max-w-md relative soft-shadow"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] mb-6">Mark Important Day</h2>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Title</label>
                  <input required autoFocus type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] focus:border-[var(--color-pastel-purple)] focus:ring-2 focus:ring-[var(--color-pastel-purple)]/20 outline-none transition-all" placeholder="e.g. Maya's Birthday" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Date</label>
                  <input required type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] focus:border-[var(--color-pastel-purple)] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
                  <select value={newEventType} onChange={e => setNewEventType(e.target.value as any)} className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] focus:border-[var(--color-pastel-purple)] outline-none transition-all">
                    <option value="birthday">🎂 Birthday</option>
                    <option value="anniversary">💖 Anniversary</option>
                    <option value="trip">✈ Trip</option>
                    <option value="exam">📝 Exam</option>
                    <option value="achievement">🏆 Achievement</option>
                    <option value="other">⭐ Other</option>
                  </select>
                </div>
                <button type="submit" className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white font-medium soft-shadow hover:scale-[1.02] active:scale-95 transition-all">
                  Save Important Day
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
