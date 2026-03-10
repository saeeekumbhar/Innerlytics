import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, X, ChevronDown, Check } from 'lucide-react';

/* ── Custom Dropdown Component ─────────────────────────────────── */
interface DropdownOption {
    value: string;
    label: string;
}

const CustomDropdown = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Select...'
}: {
    label: string;
    options: DropdownOption[];
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className="relative">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/60 backdrop-blur-sm text-left transition-all duration-200 hover:border-[var(--color-pastel-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--color-pastel-purple)]/30"
                style={{ minHeight: '48px' }}
            >
                <span className={`text-sm ${selected ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)]/60'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute z-50 left-0 right-0 mt-2 py-2 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] shadow-xl backdrop-blur-xl overflow-hidden"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all duration-150 ${value === opt.value
                                        ? 'bg-[var(--color-pastel-purple)]/15 text-[var(--color-text-primary)] font-medium'
                                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-pastel-hover)]'
                                    }`}
                            >
                                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${value === opt.value
                                        ? 'border-[var(--color-pastel-purple)] bg-[var(--color-pastel-purple)]'
                                        : 'border-[var(--color-border-subtle)]'
                                    }`}>
                                    {value === opt.value && <Check className="w-3 h-3 text-white" />}
                                </span>
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Main Onboarding Component ─────────────────────────────────── */
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
            description: "A soft, safe space for your emotional intelligence journey. Let's get you started.",
            color: 'var(--color-pastel-purple)'
        },
        {
            title: "Deep Mood Tracking",
            description: "Log not just your mood, but energy, stress, and anxiety. Get a fuller picture of your well-being.",
            color: 'var(--color-pastel-blue)'
        },
        {
            title: "AI Insights",
            description: "Our compassionate AI analyzes your patterns and offers gentle coping suggestions tailored to you.",
            color: 'var(--color-pastel-teal)'
        },
        {
            title: "Wellness & Habits",
            description: "From breathing exercises to habit streaks, we give you the tools to evolve one day at a time.",
            color: 'var(--color-pastel-pink)'
        },
        {
            title: "Tell Us About Yourself",
            description: "Help us personalize your insights. This is completely optional.",
            color: 'var(--color-pastel-peach)'
        }
    ];

    const ageOptions: DropdownOption[] = [
        { value: 'Under 18', label: 'Under 18' },
        { value: '18-24', label: '18–24' },
        { value: '25-34', label: '25–34' },
        { value: '35-44', label: '35–44' },
        { value: '45+', label: '45+' },
    ];
    const genderOptions: DropdownOption[] = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Non-binary', label: 'Non-binary' },
        { value: 'Other', label: 'Other' },
        { value: '', label: 'Prefer not to say' },
    ];
    const frequencyOptions: DropdownOption[] = [
        { value: 'Daily', label: 'Daily' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Occasionally', label: 'Occasionally' },
    ];
    const motivationOptions: DropdownOption[] = [
        { value: 'Track Moods', label: 'Track Moods' },
        { value: 'Reduce Stress', label: 'Reduce Stress' },
        { value: 'Self-Discovery', label: 'Self-Discovery' },
        { value: 'Build Habits', label: 'Build Good Habits' },
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

                    <button onClick={completeOnboarding} className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-pastel-hover)] transition-colors z-20">
                        <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    </button>

                    <div className="relative z-10 text-center space-y-6">
                        {/* Logo instead of icon */}
                        <motion.div
                            key={step}
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            className="w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center"
                            style={{ backgroundColor: steps[step].color + '22' }}
                        >
                            <img src="/logo.svg" alt="Innerlytics" className="w-12 h-12 object-contain" />
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
                                            <CustomDropdown
                                                label="Age Group"
                                                options={ageOptions}
                                                value={formData.ageGroup}
                                                onChange={val => setFormData({ ...formData, ageGroup: val })}
                                            />
                                            <CustomDropdown
                                                label="Gender (Optional)"
                                                options={genderOptions}
                                                value={formData.gender}
                                                onChange={val => setFormData({ ...formData, gender: val })}
                                                placeholder="Prefer not to say"
                                            />
                                        </div>
                                        <CustomDropdown
                                            label="Journaling Frequency"
                                            options={frequencyOptions}
                                            value={formData.frequency}
                                            onChange={val => setFormData({ ...formData, frequency: val })}
                                        />
                                        <CustomDropdown
                                            label="Primary Motivation"
                                            options={motivationOptions}
                                            value={formData.motivation}
                                            onChange={val => setFormData({ ...formData, motivation: val })}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Step indicators */}
                        <div className="flex justify-center gap-2 pt-4">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[var(--color-pastel-purple)]' : 'w-2 bg-[var(--color-border-subtle)]'}`} />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3">
                            {step > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-4 rounded-full font-bold text-lg border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-pastel-hover)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Back
                                </motion.button>
                            )}
                            <button
                                onClick={() => step < steps.length - 1 ? setStep(step + 1) : completeOnboarding()}
                                className="flex-1 py-4 bg-gradient-to-r from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-full font-bold text-lg soft-shadow hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                {step < steps.length - 1 ? (
                                    <>Next Step <ArrowRight className="w-5 h-5" /></>
                                ) : (
                                    "Let's Begin ✨"
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Onboarding;
