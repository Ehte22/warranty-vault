import { useState, useEffect } from 'react';

export function useColorSchemeShim() {
    const [mode, setMode] = useState<'light' | 'dark' | 'system'>('dark');

    useEffect(() => {
        const storedMode = localStorage.getItem('color-mode');
        if (storedMode) {
            setMode(storedMode as 'light' | 'dark' | 'system');
        }
    }, []);

    return { mode, systemMode: 'light' };
}
