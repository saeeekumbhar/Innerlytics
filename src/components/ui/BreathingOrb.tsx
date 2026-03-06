import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BreathingOrb = () => {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const runCycle = () => {
            setPhase('Inhale');
            timeout = setTimeout(() => {
                setPhase('Hold');
                timeout = setTimeout(() => {
                    setPhase('Exhale');
                    timeout = setTimeout(runCycle, 6000); // Exhale for 6s
                }, 2000); // Hold for 2s
            }, 4000); // Inhale for 4s
        };

        runCycle();

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-6 glass rounded-[2rem] soft-shadow relative overflow-hidden h-full min-h-[220px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-teal)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-pastel-blue)]/10 rounded-full blur-2xl -mb-8 -ml-8 pointer-events-none" />

            <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-6 relative z-10 w-full text-left">Take a Moment</h3>

            <div className="relative flex items-center justify-center flex-1 w-full">
                {/* The glowing orb */}
                <motion.div
                    animate={{
                        scale: phase === 'Inhale' ? 2.5 : phase === 'Hold' ? 2.5 : 1,
                        opacity: phase === 'Inhale' ? 0.3 : phase === 'Hold' ? 0.4 : 0.1,
                    }}
                    transition={{
                        duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 2 : 6,
                        ease: "easeInOut"
                    }}
                    className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--color-pastel-teal)] to-[var(--color-pastel-blue)] blur-xl"
                />

                {/* The solid center */}
                <motion.div
                    animate={{
                        scale: phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : 1,
                    }}
                    transition={{
                        duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 2 : 6,
                        ease: "easeInOut"
                    }}
                    className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--color-pastel-teal)] to-[var(--color-pastel-blue)] soft-shadow flex items-center justify-center"
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={phase}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-white text-xs font-bold drop-shadow-sm"
                        >
                            {phase}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default BreathingOrb;
