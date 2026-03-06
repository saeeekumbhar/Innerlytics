import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserEntries, JournalEntry } from './journalService';
import { motion } from 'motion/react';
import { Image as ImageIcon, Calendar } from 'lucide-react';

const MemoryGallery = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            if (!user) return;
            try {
                const allEntries = await getUserEntries(user.uid, 50); // Get latest 50 entries
                setEntries(allEntries);
            } catch (error) {
                console.error("Error fetching entries:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full pb-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-pastel-purple)]"></div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10 space-y-8">
            <header>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                    Memory Timeline <ImageIcon className="w-8 h-8 text-[var(--color-pastel-purple)]" />
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Your private feed of moments and reflections.</p>
            </header>

            {entries.length === 0 ? (
                <div className="glass rounded-[2rem] border-none soft-shadow p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-[var(--color-pastel-purple)]/10 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon className="w-10 h-10 text-[var(--color-pastel-purple)] opacity-50" />
                    </div>
                    <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">No entries yet</h3>
                    <p className="text-[var(--color-text-secondary)] max-w-sm">
                        Start journaling to build your memory timeline.
                    </p>
                </div>
            ) : (
                <div className="max-w-xl mx-auto space-y-8">
                    {entries.map((entry) => (
                        <motion.article
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="glass rounded-[2rem] overflow-hidden soft-shadow border border-[var(--color-border-subtle)]"
                        >
                            {/* Header: Date + Mood */}
                            <div className="p-4 flex items-center justify-between border-b border-[var(--color-border-subtle)]/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-pastel-purple)]/10 flex items-center justify-center text-xl shadow-inner">
                                        {/* using a fallback emoji since we don't have getEmoji here easily, but moodLabel is text */}
                                        {entry.moodLabel === 'Happy' ? '😄' :
                                            entry.moodLabel === 'Excited' ? '🤩' :
                                                entry.moodLabel === 'Productive' ? '🎯' :
                                                    entry.moodLabel === 'Peaceful' ? '😌' :
                                                        entry.moodLabel === 'Good' ? '🙂' :
                                                            entry.moodLabel === 'Meh' ? '😐' :
                                                                entry.moodLabel === 'Awful' || entry.moodLabel === 'Burnt Out' ? '🫠' : '🥺'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{entry.moodLabel}</h3>
                                        <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Photo (if any) */}
                            {entry.photoUrl && (
                                <div className="w-full aspect-[4/5] bg-[var(--color-bg-secondary)] overflow-hidden">
                                    <img
                                        src={entry.photoUrl}
                                        alt={`Memory from ${entry.date}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-5 space-y-3 bg-[var(--color-bg-primary)]/40">
                                {entry.emotionTags && entry.emotionTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {entry.emotionTags.map(tag => (
                                            <span key={tag} className="text-[0.65rem] uppercase font-bold text-[var(--color-text-secondary)] bg-[var(--color-border-subtle)] px-2 py-1 rounded-sm tracking-wider">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {entry.content && (
                                    <p className="text-sm md:text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                                        {entry.content}
                                    </p>
                                )}
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemoryGallery;
