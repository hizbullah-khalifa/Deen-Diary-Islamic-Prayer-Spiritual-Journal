"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppSettings, Lang, ThemeMode } from "@/lib/types";
import {
  getStore,
  setStore,
  subscribeStore,
  STORE_KEYS,
} from "@/lib/storage";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  lang: "en",
  largeText: false,
  location: { type: "city", cityId: "karachi" },
  prayer: {
    method: 1,
    school: 0,
    highLatRule: 2,
    tune: {},
  },
  notifications: {
    prayers: {
      fajr: { enabled: true, leadMinutes: 10, sound: true },
      dhuhr: { enabled: true, leadMinutes: 10, sound: true },
      asr: { enabled: true, leadMinutes: 10, sound: true },
      maghrib: { enabled: true, leadMinutes: 10, sound: true },
      isha: { enabled: true, leadMinutes: 10, sound: true },
    },
    targets: {
      quran: { enabled: false, time: "10:00", sound: false, repeat: true },
      dhikr: { enabled: false, time: "18:00", sound: false, repeat: true },
      dua: { enabled: false, time: "12:00", sound: false, repeat: true },
      tasks: { enabled: false, time: "09:00", sound: false, repeat: true },
      habits: { enabled: false, time: "21:00", sound: false, repeat: true },
      journal: { enabled: false, time: "21:30", sound: false, repeat: true },
      morning: { enabled: false, time: "06:30", sound: false, repeat: true },
      evening: { enabled: false, time: "18:30", sound: false, repeat: true },
      sleep: { enabled: false, time: "22:30", sound: false, repeat: true },
    },
  },
  adhan: {
    style: "short",
    vibrate: true,
    volume: 1,
  },
  quran: {
    translationSlug: "en.sahih",
    urduTranslationSlug: "ur.jalandhry",
    reciterId: 7,
    dailyPages: 1,
    showTransliteration: false,
  },
  audio: { volume: 0.9, vibrate: true },
  privacy: { localOnly: true },
  calendar: { showMawlid: false, showAshura: true, moonSighting: false },
  onboarded: false,
};

export function getSettings(): AppSettings {
  const saved = getStore<Partial<AppSettings>>(STORE_KEYS.settings, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    prayer: { ...DEFAULT_SETTINGS.prayer, ...saved.prayer },
    notifications: {
      prayers: {
        ...DEFAULT_SETTINGS.notifications.prayers,
        ...saved.notifications?.prayers,
      },
      targets: {
        ...DEFAULT_SETTINGS.notifications.targets,
        ...saved.notifications?.targets,
      },
    },
    adhan: { ...DEFAULT_SETTINGS.adhan, ...saved.adhan },
    quran: { ...DEFAULT_SETTINGS.quran, ...saved.quran },
    audio: { ...DEFAULT_SETTINGS.audio, ...saved.audio },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...saved.privacy },
    calendar: { ...DEFAULT_SETTINGS.calendar, ...saved.calendar },
  } as AppSettings;
}

interface SettingsValue {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  setSettings: (next: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
  setTheme: (theme: ThemeMode) => void;
  setLang: (lang: Lang) => void;
}

const SettingsContext = createContext<SettingsValue>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
  setSettings: () => {},
  setTheme: () => {},
  setLang: () => {},
});

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => getSettings());

  useEffect(() => {
    return subscribeStore(STORE_KEYS.settings, () => {
      setSettingsState(getSettings());
    });
  }, []);

  useEffect(() => {
    applyTheme(settings.theme);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyTheme(settings.theme);
    };
    prefersDark.addEventListener("change", handler);
    return () => prefersDark.removeEventListener("change", handler);
  }, [settings.theme]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    const next = { ...getSettings(), ...patch };
    setStore(STORE_KEYS.settings, next);
  }, []);

  const setSettings = useCallback(
    (next: AppSettings | ((prev: AppSettings) => AppSettings)) => {
      const prev = getSettings();
      const value = typeof next === "function" ? (next as (p: AppSettings) => AppSettings)(prev) : next;
      setStore(STORE_KEYS.settings, { ...prev, ...value, prayer: { ...prev.prayer, ...value.prayer }, quran: { ...prev.quran, ...value.quran }, notifications: { prayers: { ...prev.notifications.prayers, ...value.notifications?.prayers }, targets: { ...prev.notifications.targets, ...value.notifications?.targets } }, adhan: { ...prev.adhan, ...value.adhan }, audio: { ...prev.audio, ...value.audio }, privacy: { ...prev.privacy, ...value.privacy }, calendar: { ...prev.calendar, ...value.calendar } } as AppSettings);
    },
    []
  );

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      update({ theme });
      setStore("theme", theme);
    },
    [update]
  );

  const setLang = useCallback(
    (lang: Lang) => {
      update({ lang });
      setStore("lang", lang);
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
        document.documentElement.setAttribute("data-lang", lang);
      }
    },
    [update]
  );

  const value = useMemo<SettingsValue>(
    () => ({ settings, update, setSettings, setTheme, setLang }),
    [settings, update, setSettings, setTheme, setLang]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}