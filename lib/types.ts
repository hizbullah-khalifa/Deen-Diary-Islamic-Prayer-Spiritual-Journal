export type ThemeMode = "light" | "dark" | "system";
export type Lang = "en" | "ur";
export type Dir = "ltr" | "rtl";

export const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

export type PrayerStatus = "prayed" | "qada" | "missed" | "notyet";
export type PrayerDay = Record<PrayerKey, PrayerStatus>;

export interface City {
  id: string;
  nameEn: string;
  nameUr: string;
  lat: number;
  lng: number;
}

export interface LocationSetting {
  type: "city" | "custom";
  cityId?: string;
  lat?: number;
  lng?: number;
  labelEn?: string;
  labelUr?: string;
}

export interface PrayerTune {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
}

export interface PrayerSettings {
  method: number;
  school: number;
  highLatRule: number;
  tune: PrayerTune;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
  firstThird: string;
  lastThird: string;
  dateGregorian: string;
  dateHijri: string;
  cityLat: number;
  cityLng: number;
  method: number;
  fetchedAt: number;
}

export interface ReminderPref {
  enabled: boolean;
  leadMinutes: number;
  sound: boolean;
}

export type NotificationTarget =
  | "quran"
  | "dhikr"
  | "dua"
  | "tasks"
  | "habits"
  | "journal"
  | "morning"
  | "evening"
  | "sleep";

export interface ScheduledPref {
  enabled: boolean;
  time: string;
  sound: boolean;
  repeat: boolean;
}

export interface NotificationsSettings {
  prayers: Record<PrayerKey, ReminderPref>;
  targets: Record<NotificationTarget, ScheduledPref>;
}

export type AdhanStyle = "full" | "short" | "silent" | "custom";

export interface AdhanSettings {
  style: AdhanStyle;
  vibrate: boolean;
  volume: number;
  customSoundUrl?: string;
}

export interface QuranSettings {
  translationSlug: string;
  urduTranslationSlug: string;
  reciterId: number;
  dailyPages: number;
  showTransliteration: boolean;
}

export interface CalendarSettings {
  showMawlid: boolean;
  showAshura: boolean;
  moonSighting: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  lang: Lang;
  largeText: boolean;
  location: LocationSetting;
  prayer: PrayerSettings;
  notifications: NotificationsSettings;
  adhan: AdhanSettings;
  quran: QuranSettings;
  audio: { volume: number; vibrate: boolean };
  privacy: { localOnly: boolean };
  calendar: CalendarSettings;
  onboarded: boolean;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory =
  | "work"
  | "study"
  | "ibadah"
  | "family"
  | "health"
  | "other";

export interface Task {
  id: string;
  title: string;
  date: string;
  priority: TaskPriority;
  due?: string;
  category: TaskCategory;
  reminder?: boolean;
  complete: boolean;
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  category: "islamic" | "general";
  days: Record<string, boolean>;
  createdAt: number;
}

export type Mood = "grateful" | "peaceful" | "happy" | "tired" | "anxious" | "sad";

export interface JournalEntry {
  id: string;
  date: string;
  gratitude: string;
  prayerReflection: string;
  learned: string;
  thankfulToAllah: string;
  improveTomorrow: string;
  mood?: Mood;
  tags: string[];
  favorite: boolean;
  private: boolean;
  updatedAt: number;
}

export interface GratitudeEntry {
  date: string;
  items: string[];
}

export interface QuranBookmark {
  id: string;
  chapter: number;
  verse: number | number[];
  label: string;
  createdAt: number;
}

export interface QuranProgress {
  chapter: number;
  verse: number;
  updatedAt: number;
  totalReadVerses: number;
}

export interface VerseOfDay {
  chapter: number;
  verse: number;
  arabic: string;
  translationEn: string;
  translationUr?: string;
  surahNameEn: string;
  surahNameUr?: string;
  recitationUrl?: string;
  source: string;
}

export interface DailyDhikr {
  date: string;
  counts: Record<string, number>;
}

export interface AdhkarSession {
  date: string;
  part: "morning" | "evening";
  counts: Record<string, number>;
}

export interface RamadanDay {
  date: string;
  fasted: boolean;
  taraweeh: boolean;
  quranPages?: number;
  duaDone: boolean;
  goodDeed: boolean;
  note?: string;
}

export interface TasbihState {
  target: number;
  current: number;
  dhikr: string;
  custom: string;
}

export interface TaskSettings {
  prayerDay: Record<string, string>;
}

export interface Note {
  id: string;
  text: string;
  createdAt: number;
}