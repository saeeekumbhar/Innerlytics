import React from 'react';
import { motion } from 'motion/react';
import { Phone, Heart, Wind, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const resources = [
    { name: 'AASRA (India)', number: '9820466726', description: '24/7 helpline for emotional distress' },
    { name: 'iCall', number: '9152987821', description: 'Psychosocial support helpline' },
    { name: 'Vandrevala Foundation', number: '1860-2662-345', description: 'Free mental health counseling' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', description: 'Free 24/7 text-based support' },
];

const Support = () => {
    return (
        <motion.div className="space-y-8 pb-10 max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Support & Resources</h1>
                <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">You are not alone. Help is always available.</p>
            </header>

            {/* Emergency Card */}
            <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-pastel-pink)]/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
                <div className="relative z-10 text-center space-y-4">
                    <Heart className="w-10 h-10 mx-auto text-[var(--color-pastel-pink)]" />
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">Need Immediate Support?</h2>
                    <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">If you're in crisis or having thoughts of self-harm, please reach out. You matter, and support is available 24/7.</p>
                    <a href="tel:9820466726" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-pastel-pink)] to-[var(--color-pastel-purple)] text-white rounded-full font-medium soft-shadow hover:shadow-lg hover:scale-[1.02] transition-all">
                        <Phone className="w-5 h-5" /> Call AASRA: 9820466726
                    </a>
                </div>
            </div>

            {/* Resource List */}
            <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] px-1">Helplines & Resources</h3>
                {resources.map(r => (
                    <div key={r.name} className="glass rounded-2xl p-5 soft-shadow border-none flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-pastel-blue)]/20 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-[var(--color-pastel-blue)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--color-text-primary)]">{r.name}</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">{r.description}</p>
                        </div>
                        <span className="text-sm font-bold text-[var(--color-pastel-purple)] whitespace-nowrap">{r.number}</span>
                    </div>
                ))}
            </div>

            {/* Grounding Link */}
            <div className="glass rounded-[2rem] p-6 lg:p-8 soft-shadow border-none text-center space-y-4">
                <Wind className="w-8 h-8 mx-auto text-[var(--color-pastel-teal)]" />
                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">Need to calm down right now?</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Try one of our wellness tools — breathing exercises, grounding, or affirmations.</p>
                <Link to="/wellness" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-[var(--color-pastel-teal)] border border-[var(--color-pastel-teal)]/30 hover:bg-[var(--color-pastel-teal)]/10 transition-all">
                    Open Wellness Tools <ExternalLink className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
};

export default Support;
