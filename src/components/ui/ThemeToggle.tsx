import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { usePreferences } from '../../context/PreferencesContext';

const ThemeToggle = () => {
    const { themeMode, setThemeMode, colorPalette } = usePreferences();
    const [isDark, setIsDark] = useState(false);

    // Sync local state visually with the actual DOM for smooth animations
    useEffect(() => {
        const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDark();

        // Listen to custom palette changes
        window.addEventListener('theme-palette-changed', checkDark);
        // Observe html class changes natively
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            window.removeEventListener('theme-palette-changed', checkDark);
            observer.disconnect();
        };
    }, []);

    // Hide toggle entirely if forced schema applies
    if (colorPalette === 'forest' || colorPalette === 'galactic') {
        return null;
    }

    const toggleTheme = () => {
        const nextMode = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        setThemeMode(nextMode);
    };

    return (
        <button
            onClick={toggleTheme}
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
                        : 'linear-gradient(135deg, #C8B6FF, #E0C3FC)', /* changed from peach/pink to lavender */
                    boxShadow: isDark
                        ? '0 2px 8px rgba(181,160,255,0.5)'
                        : '0 2px 8px rgba(200,182,255,0.4)', /* changed shadow to lavender */
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
