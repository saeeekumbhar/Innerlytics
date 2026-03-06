import React from 'react';
import { JournalEntry } from '../../features/journal/journalService';
import { motion } from 'motion/react';

interface YearInPixelsProps {
    entries: JournalEntry[];
    year: number;
    onDayClick: (entry: JournalEntry) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 29 for Feb to cover leap years simply

const YearInPixels: React.FC<YearInPixelsProps> = ({ entries, year, onDayClick }) => {
    // Map entries by date 'YYYY-MM-DD'
    const entryMap = new Map<string, JournalEntry>();
    entries.forEach(e => {
        entryMap.set(e.date, e);
    });

    const getDayColor = (score: number) => {
        if (score >= 9) return 'bg-[var(--color-pastel-pink)]'; // Excited/Happy
        if (score >= 7) return 'bg-[var(--color-pastel-teal)]'; // Good/Peaceful
        if (score >= 5) return 'bg-[var(--color-pastel-purple)]'; // Productive/Meh
        if (score >= 3) return 'bg-[var(--color-danger)]'; // Overwhelmed
        return 'bg-[var(--color-text-secondary)] opacity-50'; // Burnt Out/Awful
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px] flex flex-col gap-1">
                {/* Header: Day Numbers */}
                <div className="flex gap-1 ml-10 mb-2">
                    {Array.from({ length: 31 }, (_, i) => (
                        <div key={i} className="w-6 text-center text-[0.65rem] font-bold text-[var(--color-text-secondary)]">
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Grid rows: Months */}
                {months.map((month, mIdx) => (
                    <div key={month} className="flex gap-1 items-center">
                        <div className="w-10 text-[0.7rem] font-bold text-[var(--color-text-secondary)] text-right pr-2">
                            {month}
                        </div>
                        {Array.from({ length: 31 }, (_, dIdx) => {
                            const dayNum = dIdx + 1;
                            const dateStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            const isValidDay = dayNum <= daysInMonth[mIdx];
                            const entry = entryMap.get(dateStr);

                            if (!isValidDay) {
                                return <div key={dIdx} className="w-6 h-6 rounded-md opacity-0 pointer-events-none" />;
                            }

                            return (
                                <motion.button
                                    key={dIdx}
                                    whileHover={{ scale: 1.2, zIndex: 10 }}
                                    onClick={() => entry && onDayClick(entry)}
                                    className={`w-6 h-6 rounded-md transition-colors ${entry ? getDayColor(entry.moodScore) : 'bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]/50'} ${entry ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
                                    title={entry ? `${entry.date}: ${entry.moodLabel}` : `${dateStr}: No entry`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-8 ml-10 text-xs font-medium text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[var(--color-pastel-pink)]" /> Great</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[var(--color-pastel-teal)]" /> Good</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[var(--color-pastel-purple)]" /> Okay</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[var(--color-danger)]" /> Bad</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[var(--color-text-secondary)] opacity-50" /> Awful</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]" /> None</div>
            </div>
        </div>
    );
};

export default YearInPixels;
