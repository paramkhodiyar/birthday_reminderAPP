// src/context/ThemeContext.tsx
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Colors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  card: string;
  accent: string;
  success: string;
  warning: string;
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: Colors;
  toggleTheme: () => void;
}

const lightColors: Colors = {
  primary: '#8B4513',      // Coffee brown
  secondary: '#D2B48C',    // Tan
  background: '#FFF8DC',   // Cornsilk
  surface: '#FFFFFF',      // White
  text: '#3C2415',         // Dark brown
  textSecondary: '#6B4423', // Medium brown
  border: '#E6D7C3',       // Light beige
  shadow: '#8B4513',       // Coffee brown
  card: '#FEFEFE',         // Off white
  accent: '#DAA520',       // Goldenrod
  success: '#8FBC8F',      // Dark sea green
  warning: '#F4A460',      // Sandy brown
};

const darkColors: Colors = {
  primary: '#D2B48C',      // Tan (lighter for dark mode)
  secondary: '#8B4513',    // Coffee brown
  background: '#1C1611',   // Very dark brown
  surface: '#2C2419',      // Dark brown
  text: '#F5F5DC',         // Beige
  textSecondary: '#D2B48C', // Tan
  border: '#3C2E1F',       // Dark beige
  shadow: '#000000',       // Black
  card: '#332B1F',         // Dark card
  accent: '#DAA520',       // Goldenrod
  success: '#90EE90',      // Light green
  warning: '#F4A460',      // Sandy brown
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{theme, colors, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};