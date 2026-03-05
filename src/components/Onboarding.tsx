import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Brain, Zap, ArrowRight, X } from 'lucide-react';

const Onboarding = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeen = localStorage.getItem('innerlytics_onboarded');
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    const close = () => {
        localStorage.setItem('innerlytics_onboarded', 'true');
        setIsOpen(false);
    };

    const steps = [
        {
            title: "Welcome to Innerlytics ✦",
            description: "A soft, safe space for your emotional intelligence journey. We've upgraded your Experience.",
            icon: Sparkles,
            color: 'var(--color-pastel-purple)'
        },
        {
            title: "Deep Mood Tracking",
            description: "Log not just your mood, but energy, stress, and anxiety. Get a fuller picture of your well-being.",
            icon: Zap,
            color: 'var(--color-pastel-blue)'
        },
        {
            title: "AI Insights",
            description: "Our compassionate AI analyzes your patterns and offers gentle coping suggestions tailored to you.",
            icon: Brain,
            color: 'var(--color-pastel-teal)'
        },
        {
            title: "Wellness & Habits",
            description: "From breathing exercises to habit streaks, we give you the tools to evolve one day at a time.",
            icon: Heart,
            color: 'var(--color-pastel-pink)'
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass rounded-[2.5rem] max-w-lg w-full p-8 lg:p-10 soft-shadow border-none relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl rounded-full -mt-20 -mr-20 pointer-events-none" style={{ backgroundColor: steps[step].color }} />

                    <button onClick={close} className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors">
                        <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    </button>

                    <div className="relative z-10 text-center space-y-6">
                        <motion.div
                            key={step}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center"
                            style={{ backgroundColor: steps[step].color, opacity: 0.2 }}
                        >
                            {React.createElement(steps[step].icon, { className: "w-10 h-10", style: { color: steps[step].color } })}
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3"
                            >
                                <h2 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">{steps[step].title}</h2>
                                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">{steps[step].description}</p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-center gap-2 pt-4">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[var(--color-pastel-purple)]' : 'w-2 bg-[var(--color-border-subtle)]'}`} />
                            ))}
                        </div>

                        <button
                            onClick={() => step < steps.length - 1 ? setStep(step + 1) : close()}
                            className="w-full py-4 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-full font-bold text-lg soft-shadow hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            {step < steps.length - 1 ? (
                                <>Next Step <ArrowRight className="w-5 h-5" /></>
                            ) : (
                                "Let's Begin ✨"
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Onboarding;
