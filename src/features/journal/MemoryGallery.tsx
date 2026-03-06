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
        const fetchPhotos = async () => {
            if (!user) return;
            try {
                const allEntries = await getUserEntries(user.uid, 500);
                // Only keep entries that have a photo
                const photoEntries = allEntries.filter(e => e.photoUrl);
                setEntries(photoEntries);
            } catch (error) {
                console.error("Error fetching photo entries:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
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
                    Memory Gallery <ImageIcon className="w-8 h-8 text-[var(--color-pastel-purple)]" />
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">A visual collection of your journal moments.</p>
            </header>

            {entries.length === 0 ? (
                <div className="glass rounded-[2rem] border-none soft-shadow p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-[var(--color-pastel-purple)]/10 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon className="w-10 h-10 text-[var(--color-pastel-purple)] opacity-50" />
                    </div>
                    <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">No photos yet</h3>
                    <p className="text-[var(--color-text-secondary)] max-w-sm">
                        Attach photos to your journal entries to start building your memory gallery here.
                    </p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
                >
                    {entries.map((entry) => (
                        <motion.div
                            key={entry.id}
                            variants={itemVariants}
                            className="group relative break-inside-avoid glass rounded-2xl overflow-hidden soft-shadow"
                        >
                            <img
                                src={entry.photoUrl!}
                                alt={`Memory from ${entry.date}`}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-4">
                                <div className="text-white">
                                    <div className="flex items-center gap-1.5 text-xs font-medium mb-1 drop-shadow-md">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    {entry.content && (
                                        <p className="text-sm line-clamp-2 drop-shadow-md">{entry.content}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default MemoryGallery;
