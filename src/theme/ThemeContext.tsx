import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

type ThemePreference = 'system' | 'light' | 'dark';
type EnergyUnit = 'kcal' | 'kJ';

type AppTheme = {
  isDark: boolean;
  colors: {
    background: string;
    card: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    tabBar: string;
    tabBarBorder: string;
    success: string;
    danger: string;
  };
  blurType: 'light' | 'dark';
};

type ThemeContextValue = {
  theme: AppTheme;
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => void;
  unit: EnergyUnit;
  setUnit: (value: EnergyUnit) => void;
};

const THEME_PREFERENCE_KEY = 'bytecal:theme-preference';
const UNIT_PREFERENCE_KEY = 'bytecal:energy-unit';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const createTheme = (isDark: boolean): AppTheme => ({
  blurType: isDark ? 'dark' : 'light',
  colors: {
    accent: '#5E8BFF',
    background: isDark ? '#0B1020' : '#F2F5FF',
    card: isDark ? 'rgba(28, 34, 54, 0.6)' : 'rgba(255, 255, 255, 0.65)',
    cardBorder: isDark ? 'rgba(166, 180, 220, 0.18)' : 'rgba(255, 255, 255, 0.7)',
    danger: isDark ? '#FF8D95' : '#D64559',
    success: isDark ? '#88E0B3' : '#1B9C62',
    tabBar: isDark ? 'rgba(15, 19, 34, 0.85)' : 'rgba(248, 250, 255, 0.86)',
    tabBarBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(90, 110, 154, 0.14)',
    textPrimary: isDark ? '#F4F7FF' : '#101528',
    textSecondary: isDark ? '#A8B3D9' : '#5B678A',
  },
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [unit, setUnitState] = useState<EnergyUnit>('kcal');

  useEffect(() => {
    const loadPreferences = async () => {
      const [savedThemePreference, savedUnit] = await Promise.all([
        AsyncStorage.getItem(THEME_PREFERENCE_KEY),
        AsyncStorage.getItem(UNIT_PREFERENCE_KEY),
      ]);

      if (
        savedThemePreference === 'system' ||
        savedThemePreference === 'light' ||
        savedThemePreference === 'dark'
      ) {
        setThemePreferenceState(savedThemePreference);
      }

      if (savedUnit === 'kcal' || savedUnit === 'kJ') {
        setUnitState(savedUnit);
      }
    };

    loadPreferences().catch(() => {
      // Ignore persistence load failures; app can still run.
    });
  }, []);

  const setThemePreference = useCallback((value: ThemePreference) => {
    setThemePreferenceState(value);
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, value).catch(() => {
      // Ignore persistence failures.
    });
  }, []);

  const setUnit = useCallback((value: EnergyUnit) => {
    setUnitState(value);
    AsyncStorage.setItem(UNIT_PREFERENCE_KEY, value).catch(() => {
      // Ignore persistence failures.
    });
  }, []);

  const effectiveScheme: ColorSchemeName =
    themePreference === 'system'
      ? systemColorScheme
      : themePreference;

  const isDark = effectiveScheme === 'dark';
  const theme = useMemo(() => createTheme(isDark), [isDark]);

  const value = useMemo(
    () => ({
      theme,
      themePreference,
      setThemePreference,
      unit,
      setUnit,
    }),
    [setThemePreference, setUnit, theme, themePreference, unit],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return context;
}
