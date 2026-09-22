const PREFIX = "dd:";
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

const hasWindow = typeof window !== "undefined";

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function getStore<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  if (!hasWindow) return fallback;
  const raw = readRaw(key);
  if (raw === null) return fallback;
  try {
    const value = JSON.parse(raw) as T;
    cache.set(key, value);
    return value;
  } catch {
    return fallback;
  }
}

export function setStore<T>(key: string, value: T): void {
  cache.set(key, value);
  if (hasWindow) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }
  const set = listeners.get(key);
  if (set) {
    for (const cb of Array.from(set)) {
      try {
        cb();
      } catch {
        /* ignore listener errors */
      }
    }
  }
}

export function updateStore<T>(key: string, updater: (prev: T) => T): void {
  setStore<T>(key, updater(getStore<T>(key, undefined as unknown as T)));
}

export function subscribeStore(key: string, cb: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(cb);
  return () => {
    set.delete(cb);
  };
}

export function removeStore(key: string): void {
  cache.delete(key);
  if (hasWindow) {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  }
}

export function exportAllData(): Record<string, unknown> {
  const data: Record<string, unknown> = { exportedAt: Date.now(), app: "deen-diary", version: 1 };
  if (!hasWindow) return data;
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const rawKey = window.localStorage.key(i);
    if (rawKey && rawKey.startsWith(PREFIX)) {
      const raw = window.localStorage.getItem(rawKey);
      try {
        data[rawKey.slice(PREFIX.length)] = raw === null ? null : JSON.parse(raw);
      } catch {
        data[rawKey.slice(PREFIX.length)] = raw;
      }
    }
  }
  return data;
}

export function importAllData(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  cache.clear();
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof key !== "string" || key === "exportedAt" || key === "app") continue;
    if (hasWindow) {
      try {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch {
        /* ignore */
      }
    }
    setStore(key, value);
  }
  return true;
}

export function clearAllData(): void {
  cache.clear();
  if (!hasWindow) return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const rawKey = window.localStorage.key(i);
    if (rawKey && rawKey.startsWith(PREFIX)) keys.push(rawKey);
  }
  for (const k of keys) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  for (const key of Array.from(listeners.keys())) {
    const set = listeners.get(key);
    if (set) {
      for (const cb of Array.from(set)) {
        try {
          cb();
        } catch {
          /* ignore */
        }
      }
    }
  }
}

export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dayKey();
}

export function uuid(): string {
  if (hasWindow && window.crypto && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const STORE_KEYS = {
  settings: "settings",
  prayers: "prayerRecords",
  lastPrayerTimes: "lastPrayerTimes",
  tasks: "tasks",
  habits: "habits",
  journal: "journal",
  gratitude: "gratitude",
  quranBookmarks: "quranBookmarks",
  quranProgress: "quranProgress",
  quranDay: "quranPagesToday",
  quranGoal: "quranGoal",
  verseOfDay: "verseOfDayCache",
  dates: "hijriCache",
  adhkar: "adhkarSessions",
  dhikr: "dhikrDay",
  tasbih: "tasbih",
  qibla: "qiblaLocation",
  features: "qiblaFeatures",
  ramadan: "ramadan",
  prayerDay: "prayerDayBlocks",
  taskReminderState: "taskReminderState",
  duaCompleted: "duaCompleted",
  notes: "notes",
  sampleSeeded: "sampleSeeded",
} as const;