import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Eye, Sparkles, Brain, ChevronRight } from 'lucide-react';

// --- Breathing Exercise ---
const BreathingExercise = () => {
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [count, setCount] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!active) return;
        let elapsed = 0;
        intervalRef.current = setInterval(() => {
            elapsed += 1;
            const cycle = elapsed % 12; // 4s inhale, 4s hold, 4s exhale
            if (cycle < 4) { setPhase('inhale'); setCount(cycle + 1); }
            else if (cycle < 8) { setPhase('hold'); setCount(cycle - 3); }
            else { setPhase('exhale'); setCount(cycle - 7); }
        }, 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [active]);

    return (
        <div className="text-center space-y-6">
            <motion.div
                animate={active ? {
                    scale: phase === 'inhale' ? [1, 1.6] : phase === 'hold' ? 1.6 : [1.6, 1],
                } : { scale: 1 }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[var(--color-pastel-blue)]/30 to-[var(--color-pastel-teal)]/30 border-2 border-[var(--color-pastel-blue)]/40 flex items-center justify-center"
            >
                <span className="text-sm font-medium text-[var(--color-text-secondary)] capitalize">{active ? phase : 'Ready'}</span>
            </motion.div>
            <button
                onClick={() => setActive(!active)}
                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${active ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20' : 'bg-gradient-to-r from-[var(--color-pastel-blue)] to-[var(--color-pastel-teal)] text-white soft-shadow'} hover:scale-[1.02]`}
            >
                {active ? 'Stop' : 'Start Breathing'}
            </button>
        </div>
    );
};

// --- 5-4-3-2-1 Grounding ---
const groundingSteps = [
    { count: 5, sense: 'See', prompt: 'Name 5 things you can see right now', emoji: '👁️' },
    { count: 4, sense: 'Touch', prompt: 'Name 4 things you can feel', emoji: '✋' },
    { count: 3, sense: 'Hear', prompt: 'Name 3 things you can hear', emoji: '👂' },
    { count: 2, sense: 'Smell', prompt: 'Name 2 things you can smell', emoji: '👃' },
    { count: 1, sense: 'Taste', prompt: 'Name 1 thing you can taste', emoji: '👅' },
];

const GroundingExercise = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [started, setStarted] = useState(false);

    return (
        <div className="text-center space-y-6">
            {!started ? (
                <div className="space-y-4">
                    <p className="text-[var(--color-text-secondary)]">A gentle grounding exercise to bring you back to the present moment.</p>
                    <button onClick={() => setStarted(true)} className="px-8 py-3 rounded-full font-medium bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-pink)] text-white soft-shadow hover:scale-[1.02] transition-all">
                        Begin Exercise
                    </button>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <p className="text-5xl">{groundingSteps[currentStep].emoji}</p>
                        <p className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">{groundingSteps[currentStep].count}</p>
                        <p className="text-lg text-[var(--color-text-secondary)]">{groundingSteps[currentStep].prompt}</p>
                        <div className="flex justify-center gap-2 mt-4">
                            {groundingSteps.map((_, i) => (
                                <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= currentStep ? 'bg-[var(--color-pastel-purple)]' : 'bg-[var(--color-border-subtle)]'}`} />
                            ))}
                        </div>
                        <button
                            onClick={() => currentStep < 4 ? setCurrentStep(currentStep + 1) : setStarted(false)}
                            className="px-8 py-3 rounded-full font-medium bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white soft-shadow hover:scale-[1.02] transition-all mt-4 inline-flex items-center gap-2"
                        >
                            {currentStep < 4 ? 'Next' : 'Done'} <ChevronRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

// --- Affirmations ---
const affirmations = [
    "You are doing better than you think.",
    "It's okay to rest. You don't always have to be productive.",
    "Your feelings are valid, even when they're uncomfortable.",
    "You are worthy of love and kindness — especially from yourself.",
    "One small step forward is still progress.",
    "You are not your anxious thoughts.",
    "It's okay to not have everything figured out.",
    "You deserve peace of mind.",
    "Your best is enough. Always.",
    "This too shall pass, and you will be okay.",
];

const Affirmations = () => {
    const [index, setIndex] = useState(Math.floor(Math.random() * affirmations.length));

    return (
        <div className="text-center space-y-6">
            <AnimatePresence mode="wait">
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl md:text-2xl font-serif text-[var(--color-text-primary)] leading-relaxed italic px-4"
                >
                    "{affirmations[index]}"
                </motion.p>
            </AnimatePresence>
            <button
                onClick={() => setIndex((index + 1) % affirmations.length)}
                className="px-6 py-3 rounded-full font-medium text-[var(--color-pastel-purple)] border border-[var(--color-pastel-purple)]/30 hover:bg-[var(--color-pastel-purple)]/10 transition-all hover:scale-[1.02]"
            >
                Next Affirmation ✨
            </button>
        </div>
    );
};

// --- CBT Thought Reframing ---
const CBTReframe = () => {
    const [thought, setThought] = useState('');
    const [evidence, setEvidence] = useState('');
    const [reframe, setReframe] = useState('');

    return (
        <div className="space-y-5 text-left">
            <p className="text-sm text-[var(--color-text-secondary)] text-center">Challenge unhelpful thoughts with compassion.</p>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 block">😟 The negative thought</label>
                    <textarea value={thought} onChange={e => setThought(e.target.value)} placeholder="What thought is bothering you?" className="w-full p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 text-[var(--color-text-primary)] focus:outline-none glow-focus resize-none placeholder:text-[var(--color-text-secondary)]/60" rows={2} />
                </div>
                <div>
                    <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 block">🔍 Evidence against it</label>
                    <textarea value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="What evidence says this isn't fully true?" className="w-full p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 text-[var(--color-text-primary)] focus:outline-none glow-focus resize-none placeholder:text-[var(--color-text-secondary)]/60" rows={2} />
                </div>
                <div>
                    <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 block">🌱 A kinder reframe</label>
                    <textarea value={reframe} onChange={e => setReframe(e.target.value)} placeholder="How would you reframe this with compassion?" className="w-full p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30 text-[var(--color-text-primary)] focus:outline-none glow-focus resize-none placeholder:text-[var(--color-text-secondary)]/60" rows={2} />
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---
const tools = [
    { id: 'breathing', label: 'Breathing', desc: 'Find your center with guided breathing', icon: Wind, color: '--color-pastel-blue', component: BreathingExercise },
    { id: 'grounding', label: '5-4-3-2-1 Grounding', desc: 'Bring your mind back to the present moment', icon: Eye, color: '--color-pastel-purple', component: GroundingExercise },
    { id: 'affirmations', label: 'Affirmations', desc: 'Positive reminders for your daily life', icon: Sparkles, color: '--color-pastel-pink', component: Affirmations },
    { id: 'cbt', label: 'Thought Reframe', desc: 'Challenge unhelpful thoughts with compassion', icon: Brain, color: '--color-pastel-teal', component: CBTReframe },
];

const Wellness = () => {
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const ActiveComponent = tools.find(t => t.id === activeTool)?.component;

    return (
        <motion.div className="space-y-8 pb-10 max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Wellness Tools</h1>
                <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Take a moment for yourself.</p>
            </header>

            {/* Tool Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map(tool => (
                    <motion.button
                        key={tool.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                        className={`glass rounded-[2rem] p-6 soft-shadow border-none flex flex-col items-start text-left transition-all duration-300 relative overflow-hidden group ${activeTool === tool.id ? 'ring-2 ring-offset-4 ring-offset-[var(--color-bg-primary)]' : 'hover:shadow-lg'
                            }`}
                        style={{ ...(activeTool === tool.id ? { '--tw-ring-color': `var(${tool.color})` } as React.CSSProperties : {}) }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `var(${tool.color})` }}></div>

                        <div
                            className="w-14 h-14 rounded-[1.5rem] mb-4 flex items-center justify-center glow-card relative"
                        >
                            <div className="absolute inset-0 rounded-[1.5rem]" style={{ backgroundColor: `var(${tool.color})`, opacity: 0.2 }} />
                            <tool.icon className="w-7 h-7 relative z-10" style={{ color: `var(${tool.color})` }} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{tool.label}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">{tool.desc}</p>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Active Tool */}
            <AnimatePresence mode="wait">
                {ActiveComponent && (
                    <motion.div
                        key={activeTool}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass rounded-[2rem] p-8 lg:p-10 soft-shadow border-none"
                    >
                        <ActiveComponent />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Wellness;
