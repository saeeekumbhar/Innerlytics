import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Brain, Zap, ArrowRight, X, User } from 'lucide-react';

const Onboarding = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        ageGroup: '',
        gender: '',
        frequency: '',
        motivation: ''
    });

    useEffect(() => {
        const hasSeen = localStorage.getItem('innerlytics_onboarded');
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem('innerlytics_onboarded', 'true');
        localStorage.setItem('innerlytics_profile', JSON.stringify(formData));
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
        },
        {
            title: "Tell Us About Yourself",
            description: "Help us personalize your insights. This is completely optional.",
            icon: User,
            color: 'var(--color-pastel-peach)'
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
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl rounded-full -mt-20 -mr-20 pointer-events-none transition-colors duration-500" style={{ backgroundColor: steps[step].color }} />

                    <button onClick={completeOnboarding} className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors">
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

                                {step === 4 && (
                                    <div className="space-y-4 text-left mt-6 px-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Age Group</label>
                                                <select value={formData.ageGroup} onChange={e => setFormData({ ...formData, ageGroup: e.target.value })} className="w-full p-2.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50 focus:outline-none text-[var(--color-text-primary)]">
                                                    <option value="">Select...</option>
                                                    <option value="Under 18">Under 18</option>
                                                    <option value="18-24">18-24</option>
                                                    <option value="25-34">25-34</option>
                                                    <option value="35-44">35-44</option>
                                                    <option value="45+">45+</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Gender (Optional)</label>
                                                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full p-2.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50 focus:outline-none text-[var(--color-text-primary)]">
                                                    <option value="">Prefer not to say</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Non-binary">Non-binary</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Journaling Frequency</label>
                                            <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} className="w-full p-2.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50 focus:outline-none text-[var(--color-text-primary)]">
                                                <option value="">Select...</option>
                                                <option value="Daily">Daily</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Occasionally">Occasionally</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Primary Motivation</label>
                                            <select value={formData.motivation} onChange={e => setFormData({ ...formData, motivation: e.target.value })} className="w-full p-2.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/50 focus:outline-none text-[var(--color-text-primary)]">
                                                <option value="">Select...</option>
                                                <option value="Track Moods">Track Moods</option>
                                                <option value="Reduce Stress">Reduce Stress</option>
                                                <option value="Self-Discovery">Self-Discovery</option>
                                                <option value="Build Habits">Build Good Habits</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-center gap-2 pt-4">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[var(--color-pastel-purple)]' : 'w-2 bg-[var(--color-border-subtle)]'}`} />
                            ))}
                        </div>

                        <button
                            onClick={() => step < steps.length - 1 ? setStep(step + 1) : completeOnboarding()}
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
