import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, Server } from 'lucide-react';

const Privacy = () => {
    const sections = [
        {
            title: "Your Data is Yours",
            description: "Innerlytics is a private space. We do not sell your personal data. Your journal entries and emotional tracking are stored securely and used only to provide you with insights.",
            icon: Shield,
            color: '--color-pastel-purple'
        },
        {
            title: "Local-First Storage",
            description: "While we use cloud synchronization for account features, your data is primarily managed through your secure account. You can export or delete your data at any time from Settings.",
            icon: Server,
            color: '--color-pastel-blue'
        },
        {
            title: "AI Privacy",
            description: "Our AI analysis tool (Gemini) processes your entries to provide compassionate insights. Your data is processed securely and is not used to train global AI models without your explicit consent.",
            icon: Eye,
            color: '--color-pastel-teal'
        },
        {
            title: "Security Measures",
            description: "We use industry-standard encryption to protect your data both in transit and at rest. Your emotional well-being and privacy are our top priorities.",
            icon: Lock,
            color: '--color-pastel-pink'
        }
    ];

    return (
        <motion.div className="max-w-4xl mx-auto space-y-8 pb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text-primary)]">Privacy Policy</h1>
                <p className="text-[var(--color-text-secondary)] mt-1.5 text-lg">Transparent, safe, and secure.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map(section => (
                    <div key={section.title} className="glass rounded-[2rem] p-8 soft-shadow border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mt-10 -mr-10 pointer-events-none" style={{ backgroundColor: `var(${section.color})` }} />
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 relative">
                            <div className="absolute inset-0 rounded-2xl" style={{ backgroundColor: `var(${section.color})`, opacity: 0.2 }} />
                            <section.icon className="w-6 h-6 relative z-10" style={{ color: `var(${section.color})` }} />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-3">{section.title}</h3>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{section.description}</p>
                    </div>
                ))}
            </div>

            <div className="glass rounded-[2rem] p-8 soft-shadow border-none text-center space-y-4 bg-[var(--color-pastel-teal)]/5">
                <p className="text-[var(--color-text-primary)] font-medium italic">"We believe emotional intelligence should never come at the cost of personal privacy."</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
        </motion.div>
    );
};

export default Privacy;
