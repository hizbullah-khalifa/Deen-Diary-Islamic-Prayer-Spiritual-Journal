"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dayKey, getStore, setStore, updateStore, STORE_KEYS, subscribeStore } from "@/lib/storage";
import type {
  PrayerDay,
  PrayerKey,
  PrayerStatus,
  Habit,
  JournalEntry,
  Task,
  TasbihState,
  QuranBookmark,
  QuranProgress,
  RamadanDay,
} from "@/lib/types";

export function useStoredState<T>(key: string, fallback: T): [T, (updater: T | ((prev: T) => T)) => void] {
  // Keep the latest fallback available without making the effect below
  // depend on it. Callers frequently pass literals like `[]` or `{}`,
  // which are a *new* reference on every render — if the effect depended
  // on `fallback` directly, it would rerun (and call setValue) on every
  // single render, causing an infinite update loop.
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const [value, setValue] = useState<T>(() => (typeof window === "undefined" ? fallback : getStore<T>(key, fallback)));

  useEffect(() => {
    const update = () => setValue(getStore<T>(key, fallbackRef.current));
    const unsub = subscribeStore(key, update);
    update();
    return unsub;
  }, [key]);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      updateStore<T>(key, (prev) => (typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater));
    },
    [key]
  );
  return [value, update];
}

export function useHydrated(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

const FALLBACK_DAY: PrayerDay = {
  fajr: "notyet",
  dhuhr: "notyet",
  asr: "notyet",
  maghrib: "notyet",
  isha: "notyet",
};

export function ensurePrayerDays(count = 7): void {
  const days = getStore<Record<string, PrayerDay>>(STORE_KEYS.prayers, {});
  let changed = false;
  const today = dayKey();
  for (let i = 0; i < count; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    if (!days[key]) {
      days[key] = { ...FALLBACK_DAY };
      changed = true;
    }
  }
  if (changed) setStore(STORE_KEYS.prayers, days);
}

export function usePrayerRecords(): {
  records: Record<string, PrayerDay>;
  today: PrayerDay;
  todayKey: string;
  setPrayer: (key: PrayerKey, status: PrayerStatus) => void;
  setDayPrayer: (day: string, key: PrayerKey, status: PrayerStatus) => void;
} {
  const tk = dayKey();
  const [records, setRecords] = useStoredState<Record<string, PrayerDay>>(STORE_KEYS.prayers, {});

  useEffect(() => {
    if (typeof window !== "undefined") ensurePrayerDays(7);
  }, []);

  const setPrayer = useCallback(
    (key: PrayerKey, status: PrayerStatus) => {
      setRecords((prev) => {
        const days = { ...prev };
        const cur = { ...(days[tk] || FALLBACK_DAY) };
        cur[key] = status;
        days[tk] = cur;
        return days;
      });
    },
    [setRecords, tk]
  );

  const setDayPrayer = useCallback(
    (day: string, key: PrayerKey, status: PrayerStatus) => {
      setRecords((prev) => {
        const days = { ...prev };
        const cur = { ...(days[day] || FALLBACK_DAY) };
        cur[key] = status;
        days[day] = cur;
        return days;
      });
    },
    [setRecords]
  );

  return {
    records,
    today: records[tk] || FALLBACK_DAY,
    todayKey: tk,
    setPrayer,
    setDayPrayer,
  };
}

const DEFAULT_TASBIH: TasbihState = { target: 33, current: 0, dhikr: "subhanAllah", custom: "" };

export function useTasbih(): {
  state: TasbihState;
  setTarget: (n: number) => void;
  setDhikr: (key: "subhanAllah" | "alhamdulillah" | "allahuAkbar" | "custom", customText?: string) => void;
  increment: () => void;
  reset: () => void;
} {
  const [state, setState] = useStoredState<TasbihState>(STORE_KEYS.tasbih, DEFAULT_TASBIH);
  const increment = useCallback(() => {
    setState((prev) => ({
      ...prev,
      current: prev.current + 1 >= prev.target ? 0 : prev.current + 1,
    }));
  }, [setState]);
  const reset = useCallback(() => setState((prev) => ({ ...prev, current: 0 })), [setState]);
  const setTarget = useCallback((n: number) => setState((prev) => ({ ...prev, target: Math.max(1, Math.min(10000, n)) })), [setState]);
  const setDhikr = useCallback(
    (key: "subhanAllah" | "alhamdulillah" | "allahuAkbar" | "custom", customText?: string) => {
      setState((prev) => ({
        ...prev,
        current: 0,
        dhikr: key,
        target: key === "custom" ? 33 : 33,
        custom: key === "custom" ? customText || "" : prev.custom,
      }));
    },
    [setState]
  );
  return { state, setTarget, setDhikr, increment, reset };
}

export function useJournal(): {
  entries: JournalEntry[];
  saveEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePrivate: (id: string) => void;
} {
  const [entries, setEntries] = useStoredState<JournalEntry[]>(STORE_KEYS.journal, []);
  const saveEntry = useCallback(
    (entry: JournalEntry) => {
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.id === entry.id);
        const next = [...prev];
        if (idx >= 0) next[idx] = { ...entry, updatedAt: Date.now() };
        else next.unshift({ ...entry, updatedAt: Date.now() });
        return next;
      });
    },
    [setEntries]
  );
  const deleteEntry = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries]
  );
  const toggleFavorite = useCallback(
    (id: string) => setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e))),
    [setEntries]
  );
  const togglePrivate = useCallback(
    (id: string) => setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, private: !e.private } : e))),
    [setEntries]
  );
  return { entries, saveEntry, deleteEntry, toggleFavorite, togglePrivate };
}

export function useTasks(): {
  tasks: Task[];
  addTask: (t: Omit<Task, "id" | "createdAt">) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (t: Task) => void;
} {
  const [tasks, setTasks] = useStoredState<Task[]>(STORE_KEYS.tasks, []);
  const addTask = useCallback(
    (t: Omit<Task, "id" | "createdAt">) => {
      setTasks((prev) => [...prev, { ...t, id: crypto?.randomUUID?.() || `id-${Date.now()}`, createdAt: Date.now() }]);
    },
    [setTasks]
  );
  const toggleTask = useCallback(
    (id: string) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, complete: !t.complete } : t))),
    [setTasks]
  );
  const deleteTask = useCallback((id: string) => setTasks((prev) => prev.filter((t) => t.id !== id)), [setTasks]);
  const updateTask = useCallback(
    (t: Task) => setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x))),
    [setTasks]
  );
  return { tasks, addTask, toggleTask, deleteTask, updateTask };
}

export function useHabits(): {
  habits: Habit[];
  addHabit: (name: string, category: Habit["category"]) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
} {
  const [habits, setHabits] = useStoredState<Habit[]>(STORE_KEYS.habits, []);
  const addHabit = useCallback(
    (name: string, category: Habit["category"]) => {
      setHabits((prev) => [
        ...prev,
        { id: crypto?.randomUUID?.() || `id-${Date.now()}`, name, category, days: {}, createdAt: Date.now() },
      ]);
    },
    [setHabits]
  );
  const toggleHabit = useCallback(
    (id: string, date: string) => {
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, days: { ...h.days, [date]: !h.days[date] } } : h))
      );
    },
    [setHabits]
  );
  const deleteHabit = useCallback((id: string) => setHabits((prev) => prev.filter((h) => h.id !== id)), [setHabits]);
  return { habits, addHabit, toggleHabit, deleteHabit };
}

export function useGratitude(): {
  items: string[];
  addItem: (text: string) => void;
  removeItem: (text: string) => void;
} {
  const tk = dayKey();
  const [map, setMap] = useStoredState<Record<string, string[]>>(STORE_KEYS.gratitude, {});
  const items = map[tk] || [];
  const addItem = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setMap((prev) => ({ ...prev, [tk]: [...(prev[tk] || []), clean] }));
    },
    [setMap, tk]
  );
  const removeItem = useCallback(
    (text: string) => {
      setMap((prev) => ({ ...prev, [tk]: (prev[tk] || []).filter((x) => x !== text) }));
    },
    [setMap, tk]
  );
  return { items, addItem, removeItem };
}

interface QiblaLocation {
  lat: number;
  lng: number;
  labelEn: string;
  labelUr: string;
}

export function useQibla(): {
  loc: QiblaLocation | null;
  setLoc: (loc: QiblaLocation) => void;
  featureCount: number;
  incrementFeature: () => void;
} {
  const tk = dayKey();
  const [loc, setLocState] = useStoredState<QiblaLocation | null>(STORE_KEYS.qibla, null);
  const [feats, setFeats] = useStoredState<Record<string, number>>(STORE_KEYS.features, {});
  const featureCount = feats[tk] || 0;
  const incrementFeature = useCallback(() => {
    setFeats((prev) => ({ ...prev, [tk]: (prev[tk] || 0) + 1 }));
  }, [setFeats, tk]);
  return { loc, setLoc: setLocState, featureCount, incrementFeature };
}

export function useRamadanDays(): {
  days: Record<string, RamadanDay>;
  setDay: (date: string, patch: Partial<RamadanDay>) => void;
  resetRamadan: () => void;
} {
  const [days, setDays] = useStoredState<Record<string, RamadanDay>>(STORE_KEYS.ramadan, {});
  useEffect(() => {
    const today = dayKey();
    if (!days[today]) {
      setDays((prev) => ({
        ...prev,
        [today]: { date: today, fasted: false, taraweeh: false, duaDone: false, goodDeed: false },
      }));
    }
  }, [days, setDays]);
  const setDay = useCallback(
    (date: string, patch: Partial<RamadanDay>) => {
      setDays((prev) => ({ ...prev, [date]: { ...(prev[date] || { date, fasted: false, taraweeh: false, duaDone: false, goodDeed: false }), ...patch } }));
    },
    [setDays]
  );
  const resetRamadan = useCallback(() => setDays({}), [setDays]);
  return { days, setDay, resetRamadan };
}

export function useQuranProgress(): {
  progress: QuranProgress | null;
  pagesToday: number;
  dailyGoal: number;
  setPagesToday: (n: number) => void;
  markRead: (chapter: number, verse: number, pages: number) => void;
} {
  const [progress, setProgress] = useStoredState<QuranProgress | null>(STORE_KEYS.quranProgress, null);
  const [pageMap, setPageMap] = useStoredState<Record<string, number>>(STORE_KEYS.quranDay, {});
  const [goal, setGoal] = useStoredState<number>(STORE_KEYS.quranGoal, 1);
  const today = dayKey();
  const pagesToday = pageMap[today] || 0;
  const setPagesToday = useCallback(
    (n: number) => setPageMap((prev) => ({ ...prev, [today]: Math.max(0, n) })),
    [setPageMap, today]
  );
  const markRead = useCallback(
    (chapter: number, verse: number, pages: number) => {
      setProgress((prev) => ({
        chapter,
        verse,
        updatedAt: Date.now(),
        totalReadVerses: (prev?.totalReadVerses || 0) + verse,
      }));
      setPageMap((prev) => ({ ...prev, [today]: (prev[today] || 0) + pages }));
    },
    [setProgress, setPageMap, today]
  );
  return { progress, pagesToday, dailyGoal: goal, setPagesToday, markRead };
}

export function useBookmarks(): {
  bookmarks: QuranBookmark[];
  addBookmark: (b: Omit<QuranBookmark, "id" | "createdAt">) => void;
  removeBookmark: (id: string) => void;
} {
  const [bookmarks, setBookmarks] = useStoredState<QuranBookmark[]>(STORE_KEYS.quranBookmarks, []);
  const addBookmark = useCallback(
    (b: Omit<QuranBookmark, "id" | "createdAt">) => {
      setBookmarks((prev) => [...prev, { ...b, id: crypto?.randomUUID?.() || `id-${Date.now()}`, createdAt: Date.now() }]);
    },
    [setBookmarks]
  );
  const removeBookmark = useCallback(
    (id: string) => setBookmarks((prev) => prev.filter((b) => b.id !== id)),
    [setBookmarks]
  );
  return { bookmarks, addBookmark, removeBookmark };
}