import { dayKey, getStore, setStore, STORE_KEYS, uuid } from "@/lib/storage";
import type { PrayerDay, PrayerStatus, Habit } from "@/lib/types";

export function ensureSampleData(): void {
  if (typeof window === "undefined") return;
  if (getStore<boolean>(STORE_KEYS.sampleSeeded, false)) return;

  const today = dayKey();
  const iso = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return dayKey(d);
  };

  const prayers = getStore<Record<string, PrayerDay>>(STORE_KEYS.prayers, {});
  for (let i = -7; i < 0; i += 1) {
    const key = iso(i);
    const statuses: PrayerStatus[] =
      i % 3 === 0
        ? ["prayed", "prayed", "missed", "prayed", "prayed"]
        : i % 3 === 1
          ? ["prayed", "prayed", "qada", "prayed", "prayed"]
          : ["prayed", "qada", "qada", "prayed", "missed"];
    if (!prayers[key]) {
      prayers[key] = {
        fajr: statuses[0],
        dhuhr: statuses[1],
        asr: statuses[2],
        maghrib: statuses[3],
        isha: statuses[4],
      };
    }
  }
  setStore(STORE_KEYS.prayers, prayers);

  const tasks = getStore<Record<string, any[]>>(STORE_KEYS.tasks, {});
  if (!tasks[today]) {
    tasks[today] = [
      { id: uuid(), title: "Read 1 page of Quran", date: today, priority: "high", category: "ibadah", complete: false, createdAt: Date.now() },
      { id: uuid(), title: "Finish project proposal", date: today, priority: "high", category: "work", complete: false, createdAt: Date.now() },
      { id: uuid(), title: "Morning walk", date: today, priority: "medium", category: "health", complete: false, createdAt: Date.now() },
      { id: uuid(), title: "Help with household chores", date: today, priority: "low", category: "family", complete: false, createdAt: Date.now() },
    ];
    setStore(STORE_KEYS.tasks, tasks);
  }

  const habits = getStore<Habit[]>(STORE_KEYS.habits, []);
  if (habits.length === 0) {
    const defaults: string[] = ["Quran Reading", "Salah (5 daily)", "Dhikr", "Exercise", "Study", "Charity"];
    const seeded: Habit[] = defaults.map((name, idx) => {
      const days: Record<string, boolean> = {};
      for (let i = -6; i < 0; i += 1) {
        if ((i + idx) % 2 === 0) days[iso(i)] = true;
      }
      return {
        id: uuid(),
        name,
        category: idx < 3 ? "islamic" : "general",
        days,
        createdAt: Date.now(),
      };
    });
    setStore(STORE_KEYS.habits, seeded);
  }

  const journal = getStore<Record<string, any>>(STORE_KEYS.journal, {});
  if (!journal[iso(-1)]) {
    journal[iso(-1)] = {
      id: uuid(),
      date: iso(-1),
      gratitude: "Easy access to the mosque, a quiet morning, and warm food after a long day.",
      prayerReflection: "Prayed dhuhr on time — felt focused during the prayer.",
      learned: "The value of consistency in small good deeds.",
      thankfulToAllah: "For patience and for guiding me through a busy day.",
      improveTomorrow: "Start Quran reading right after fajr.",
      tags: ["reflection"],
      favorite: false,
      private: false,
      updatedAt: Date.now(),
    };
    setStore(STORE_KEYS.journal, journal);
  }

  const gratitude = getStore<Record<string, string[]>>(STORE_KEYS.gratitude, {});
  if (!gratitude[today]) {
    gratitude[today] = ["Family", "Health", "Education"];
    setStore(STORE_KEYS.gratitude, gratitude);
  }

  setStore(STORE_KEYS.sampleSeeded, true);
}