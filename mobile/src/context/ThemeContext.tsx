import { useColorScheme } from 'react-native'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { CustomTheme, darkTheme, lightTheme } from '../theme/theme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance } from 'react-native'

interface ThemeContextType {
    theme: CustomTheme,
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
    children: ReactNode
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemTheme = useColorScheme();
    const [theme, setTheme] = useState<CustomTheme>(systemTheme === "dark" ? darkTheme : lightTheme)

    const toggleTheme = () => {
        const newTheme = theme === lightTheme ? darkTheme : lightTheme
        setTheme(newTheme)
        AsyncStorage.setItem("theme", newTheme === darkTheme ? "dark" : "light")
    }

    useEffect(() => {
        AsyncStorage.getItem("theme").then((localTheme) => {
            if (localTheme === "dark") {
                setTheme(localTheme === "dark" ? darkTheme : lightTheme);
            } else {
                setTheme(systemTheme === "dark" ? darkTheme : lightTheme);
            }
        })
    }, [systemTheme])

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }} >
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeProvider

export const useCustomTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useCustomTheme must be used within a ThemeProvider");
    }
    return context;
};
