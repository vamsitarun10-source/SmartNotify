import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes, type AppTheme, type ThemeMode } from "../constants/theme";

const THEME_KEY = "app_theme_mode";
const FONT_SIZE_KEY = "app_font_size";

type FontSize = "small" | "default" | "large" | "extra_large";

const FONT_SCALES: Record<FontSize, number> = {
  small: 0.85,
  default: 1.0,
  large: 1.15,
  extra_large: 1.3,
};

function applyFontScale(baseTheme: AppTheme, scale: number): AppTheme {
  return {
    ...baseTheme,
    font: {
      ...baseTheme.font,
      xs: Math.round(baseTheme.font.xs * scale),
      sm: Math.round(baseTheme.font.sm * scale),
      md: Math.round(baseTheme.font.md * scale),
      lg: Math.round(baseTheme.font.lg * scale),
      xl: Math.round(baseTheme.font.xl * scale),
      xxl: Math.round(baseTheme.font.xxl * scale),
      hero: Math.round(baseTheme.font.hero * scale),
    },
  };
}

interface ThemeState {
  theme: AppTheme;
  mode: ThemeMode;
  fontSize: FontSize;
  fontScale: number;
  setMode: (mode: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [fontSize, setFontSizeState] = useState<FontSize>("default");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "amoled") {
        setModeState(stored);
      }
    });
    AsyncStorage.getItem(FONT_SIZE_KEY).then((stored) => {
      if (stored === "small" || stored === "default" || stored === "large" || stored === "extra_large") {
        setFontSizeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  }, []);

  const setFontSize = useCallback((s: FontSize) => {
    setFontSizeState(s);
    AsyncStorage.setItem(FONT_SIZE_KEY, s);
  }, []);

  const fontScale = FONT_SCALES[fontSize];
  const baseTheme = themes[mode];
  const theme = applyFontScale(baseTheme, fontScale);

  return (
    <ThemeContext.Provider value={{ theme, mode, fontSize, fontScale, setMode, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within ThemeProvider");
  return ctx;
}
