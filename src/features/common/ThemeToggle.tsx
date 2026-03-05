import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="relative flex items-center w-[72px] h-9 rounded-full p-1 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md focus:outline-none"
            style={{
                background: isDark
                    ? 'linear-gradient(135deg, #23233A, #2C2C44)'
                    : 'linear-gradient(135deg, #F8F4FF, #FDF6F0)',
                border: `1.5px solid ${isDark ? 'rgba(181,160,255,0.3)' : 'rgba(200,182,255,0.3)'}`,
                boxShadow: isDark
                    ? '0 0 12px rgba(181,160,255,0.2), inset 0 1px 2px rgba(0,0,0,0.2)'
                    : '0 0 12px rgba(200,182,255,0.15), inset 0 1px 2px rgba(255,255,255,0.5)',
            }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sliding Circle */}
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                    left: isDark ? 'calc(100% - 32px)' : '4px',
                    background: isDark
                        ? 'linear-gradient(135deg, #B5A0FF, #A0C4FF)'
                        : 'linear-gradient(135deg, #FFD6A5, #FFAFCC)',
                    boxShadow: isDark
                        ? '0 2px 8px rgba(181,160,255,0.5)'
                        : '0 2px 8px rgba(255,175,204,0.4)',
                }}
            >
                {isDark ? (
                    <Moon className="w-4 h-4 text-white" />
                ) : (
                    <Sun className="w-4 h-4 text-white" />
                )}
            </motion.div>

            {/* Background icons (subtle) */}
            <div className="flex items-center justify-between w-full px-2 pointer-events-none">
                <Sun className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-0'}`} style={{ color: isDark ? '#B8B8C5' : 'transparent' }} />
                <Moon className={`w-3.5 h-3.5 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30'}`} style={{ color: isDark ? 'transparent' : '#8C8C9A' }} />
            </div>
        </button>
    );
};

export default ThemeToggle;
