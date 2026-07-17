import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "app_settings";

export interface AppSettings {
  defaultReminder: number;
  vibration: boolean;
  alarmSound: "default" | "alarm" | "gentle" | "silent";
  notificationStyle: "full" | "minimal";
  language: string;
}

const DEFAULTS: AppSettings = {
  defaultReminder: 15,
  vibration: true,
  alarmSound: "default",
  notificationStyle: "full",
  language: "en",
};

interface SettingsState {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  loaded: boolean;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        try {
          const stored = JSON.parse(raw);
          setSettings({ ...DEFAULTS, ...stored });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
