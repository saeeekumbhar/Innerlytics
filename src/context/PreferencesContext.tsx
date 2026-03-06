import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorPalette = 'lavender' | 'peach' | 'mint' | 'sky_blue' | 'rose_pink' | 'forest' | 'astronomy';
export type EmojiTheme = 'classic' | 'cute' | 'minimal';

interface PreferencesContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    colorPalette: ColorPalette;
    setColorPalette: (palette: ColorPalette) => void;
    emojiTheme: EmojiTheme;
    setEmojiTheme: (theme: EmojiTheme) => void;
    getEmoji: (mood: string) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => (localStorage.getItem('themeMode') as ThemeMode) || 'light');
    const [colorPalette, setColorPaletteState] = useState<ColorPalette>(() => (localStorage.getItem('colorPalette') as ColorPalette) || 'lavender');
    const [emojiTheme, setEmojiThemeState] = useState<EmojiTheme>(() => (localStorage.getItem('emojiTheme') as EmojiTheme) || 'classic');

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        localStorage.setItem('themeMode', mode);
    };

    const setColorPalette = (palette: ColorPalette) => {
        setColorPaletteState(palette);
        localStorage.setItem('colorPalette', palette);
    };

    const setEmojiTheme = (theme: EmojiTheme) => {
        setEmojiThemeState(theme);
        localStorage.setItem('emojiTheme', theme);
    };

    useEffect(() => {
        const applyTheme = () => {
            const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        applyTheme();

        if (themeMode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const listener = () => applyTheme();
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        }
    }, [themeMode]);

    useEffect(() => {
        document.body.classList.remove('theme-lavender', 'theme-peach', 'theme-mint', 'theme-skyblue', 'theme-rosepink', 'theme-forest', 'theme-astronomy');
        const paletteClass = colorPalette === 'sky_blue' ? 'theme-skyblue' : colorPalette === 'rose_pink' ? 'theme-rosepink' : `theme-${colorPalette}`;
        document.body.classList.add(paletteClass);
    }, [colorPalette]);

    const getEmoji = (mood: string) => {
        const emojis = {
            classic: {
                awful: '😭', bad: '😞', "burnt out": '🫠', overwhelmed: '😵‍💫', meh: '😐', peaceful: '😌', productive: '🎯', good: '🙂', happy: '😄', excited: '🤩'
            },
            cute: {
                awful: '😿', bad: '🥺', "burnt out": '🫥', overwhelmed: '🤯', meh: '😶', peaceful: '🌸', productive: '✨', good: '🥰', happy: '🤩', excited: '🎉'
            },
            minimal: {
                awful: '⛈️', bad: '🌧️', "burnt out": '🔥', overwhelmed: '🌪️', meh: '☁️', peaceful: '🍃', productive: '⚡', good: '🌤️', happy: '☀️', excited: '🌟'
            }
        };

        const key = mood.toLowerCase();
        if (key in emojis[emojiTheme]) {
            return emojis[emojiTheme][key as keyof typeof emojis.classic];
        }
        return mood; // default fallback
    };

    return (
        <PreferencesContext.Provider value={{
            themeMode, setThemeMode,
            colorPalette, setColorPalette,
            emojiTheme, setEmojiTheme,
            getEmoji
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
