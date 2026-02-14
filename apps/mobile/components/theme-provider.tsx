import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themePreference: ThemePreference;
    setThemePreference: (theme: ThemePreference) => void;
    colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
    themePreference: 'system',
    setThemePreference: () => { },
    colorScheme: 'light',
});

const THEME_STORAGE_KEY = 'user_theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useNativeColorScheme();
    const [themePreference, setThemePreference] = useState<ThemePreference>('system');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Load saved preference
        AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
            if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
                setThemePreference(saved as ThemePreference);
            }
            setLoaded(true);
        });
    }, []);

    const setTheme = (newTheme: ThemePreference) => {
        setThemePreference(newTheme);
        AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };

    // effective color scheme
    const colorScheme =
        themePreference === 'system'
            ? (systemColorScheme ?? 'light')
            : themePreference;



    if (!loaded) {
        return null; // or a splash screen
    }

    return (
        <ThemeContext.Provider value={{ themePreference, setThemePreference: setTheme, colorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
