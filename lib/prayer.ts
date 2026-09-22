import type { PrayerKey, PrayerTimes, PrayerTune } from "@/lib/types";
import { toMinutes, addMinutes } from "@/lib/date-utils";

export const PRAYER_ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export interface AstroRule {
  fajrAngle: number;
  ishaAngle: number | null;
  ishaMinutes: number | null;
  maghribOffsetMinutes: number | null;
  asrFactor: number;
}

export const METHOD_RULES: Record<number, AstroRule> = {
  0: { fajrAngle: 16, ishaAngle: 14, ishaMinutes: null, maghribOffsetMinutes: 4, asrFactor: 1 },
  1: { fajrAngle: 18, ishaAngle: 18, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
  2: { fajrAngle: 15, ishaAngle: 15, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
  3: { fajrAngle: 18, ishaAngle: 17, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
  4: { fajrAngle: 18.5, ishaAngle: null, ishaMinutes: 90, maghribOffsetMinutes: null, asrFactor: 1 },
  5: { fajrAngle: 19.5, ishaAngle: 17.5, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
  7: { fajrAngle: 17.7, ishaAngle: 14, ishaMinutes: null, maghribOffsetMinutes: 4.5, asrFactor: 1 },
  8: { fajrAngle: 19.5, ishaAngle: null, ishaMinutes: 90, maghribOffsetMinutes: null, asrFactor: 1 },
  9: { fajrAngle: 18, ishaAngle: null, ishaMinutes: 90, maghribOffsetMinutes: null, asrFactor: 1 },
  10: { fajrAngle: 18, ishaAngle: null, ishaMinutes: 90, maghribOffsetMinutes: null, asrFactor: 1 },
  11: { fajrAngle: 20, ishaAngle: 18, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
  12: { fajrAngle: 12, ishaAngle: 12, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
  13: { fajrAngle: 18.2, ishaAngle: null, ishaMinutes: 90, maghribOffsetMinutes: null, asrFactor: 1 },
  14: { fajrAngle: 18, ishaAngle: 18, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
  15: { fajrAngle: 18, ishaAngle: 17, ishaMinutes: null, maghribOffsetMinutes: null, asrFactor: 1 },
};

export const HIGH_LAT_RULES = [
  { id: 0, label: "none" },
  { id: 1, label: "middle" },
  { id: 2, label: "angle" },
  { id: 3, label: "seventh" },
];

export const CALC_METHODS = [
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 0, name: "Shia Ithna-Ashari (Jafari)" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League (MWL)" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 12, name: "Union of Islamic Organisations, France (UOIF)" },
  { id: 13, name: "Dubai (Shari'ah)" },
  { id: 14, name: "Jordan" },
  { id: 15, name: "Turkey" },
];

export function parseAladhanTime(raw: string): string {
  const m = raw.match(/(\d{1,2}):(\d{2})/);
  if (!m) return raw.slice(0, 5);
  return `${String(Number(m[1])).padStart(2, "0")}:${m[2]}`;
}

const API_BASE = "https://api.aladhan.com/v1";

export async function fetchPrayerTimesFromApi(params: {
  lat: number;
  lng: number;
  date: Date;
  method: number;
  school: number;
  highLatRule: number;
  tune?: PrayerTune;
}): Promise<PrayerTimes> {
  const { lat, lng, date, method, school, highLatRule, tune } = params;
  const dd = String(date.getDate()).padStart(2, "0");
  const mmStr = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const url = new URL(`${API_BASE}/timings/${dd}-${mmStr}-${yyyy}`);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("method", String(method));
  url.searchParams.set("school", String(school));
  url.searchParams.set("latitudeAdjustmentMethod", String(highLatRule || 0));
  const order = ["imsak", "fajr", "sunrise", "dhuhr", "asr", "sunset", "maghrib", "isha"] as const;
  const tuneValues = order.map((k) => String(tune?.[k as keyof PrayerTune] ?? 0));
  url.searchParams.set("tune", tuneValues.join(","));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`api error ${res.status}`);
  const json = (await res.json()) as {
    data?: {
      timings?: Record<string, string>;
      date?: { gregorian?: { date?: string }; hijri?: { date?: string } };
    };
  };
  const t = json.data?.timings;
  if (!t) throw new Error("no timings");
  return {
    fajr: parseAladhanTime(t.Fajr),
    sunrise: parseAladhanTime(t.Sunrise),
    dhuhr: parseAladhanTime(t.Dhuhr),
    asr: parseAladhanTime(t.Asr),
    maghrib: parseAladhanTime(t.Maghrib),
    isha: parseAladhanTime(t.Isha),
    imsak: parseAladhanTime(t.Imsak),
    midnight: parseAladhanTime(t.Midnight),
    firstThird: parseAladhanTime(t.Firstthird),
    lastThird: parseAladhanTime(t.Lastthird),
    dateGregorian: json.data?.date?.gregorian?.date || "",
    dateHijri: json.data?.date?.hijri?.date || "",
    cityLat: lat,
    cityLng: lng,
    method,
    fetchedAt: Date.now(),
  };
}

/* ------------------------- offline approximation ------------------------- */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function solarDeclination(dayOfYear: number): number {
  const b = (2 * Math.PI / 365) * (dayOfYear - 81);
  return 23.44 * Math.sin(b) * D2R;
}

function equationOfTime(dayOfYear: number): number {
  const b = (2 * Math.PI / 365) * (dayOfYear - 81);
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function hourAngleOf(latDeg: number, decRad: number, elevationDeg: number): number {
  const c =
    (Math.sin(elevationDeg * D2R) - Math.sin(latDeg * D2R) * Math.sin(decRad)) /
    (Math.cos(latDeg * D2R) * Math.cos(decRad));
  const clamped = Math.max(-1, Math.min(1, c));
  return (Math.acos(clamped) * R2D) / 15; // in hours
}

export function approximateTimes(params: {
  lat: number;
  lng: number;
  date: Date;
  method: number;
  school: number;
  highLatRule: number;
  tz: number;
}): PrayerTimes {
  const { lat, lng, date, method, school, highLatRule } = params;
  void highLatRule;
  const rule = METHOD_RULES[method] || METHOD_RULES[1];
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfYear = Math.floor((start.getTime() - new Date(start.getFullYear(), 0, 0).getTime()) / 86400000);
  const dec = solarDeclination(dayOfYear);
  const eot = equationOfTime(dayOfYear) / 60;
  const transit = 12 - lng / 15 + 5 + eot; // Pakistan standard time (+5)

  const asrFactor = school === 1 ? 2 : rule.asrFactor;
  const asrEl =
    Math.atan(1 / (asrFactor + Math.tan(Math.abs(lat - dec * R2D) * D2R))) * R2D;

  const fajr = timeOf(transit - hourAngleOf(lat, dec, -rule.fajrAngle));
  const sunrise = timeOf(transit - hourAngleOf(lat, dec, -0.833));
  const dhuhr = timeOf(transit);
  const asr = timeOf(transit + hourAngleOf(lat, dec, asrEl));
  let maghrib = timeOf(transit + hourAngleOf(lat, dec, -0.833));
  if (rule.maghribOffsetMinutes) {
    maghrib = addMinutes(maghrib, rule.maghribOffsetMinutes);
  }
  let isha: string;
  if (rule.ishaAngle !== null) {
    isha = timeOf(transit + hourAngleOf(lat, dec, -rule.ishaAngle));
  } else {
    isha = addMinutes(maghrib, rule.ishaMinutes || 90);
  }

  const nightH = hourAngleOf(lat, dec, -rule.fajrAngle) + hourAngleOf(lat, dec, -0.833) - 12;
  const nightLen = Math.max(1, Math.min(12, Math.abs(hourAngleOf(lat, dec, -0.833)) + hourAngleOf(lat, dec, -rule.fajrAngle)));
  void nightH;
  const maghM = toMinutes(maghrib);
  const roundM = (offsetH: number) => {
    const v = ((maghM + Math.round(offsetH * 60)) % 1440 + 1440) % 1440;
    return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
  };

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    maghrib,
    isha,
    imsak: addMinutes(fajr, -10),
    midnight: roundM(nightLen / 2),
    firstThird: roundM(nightLen / 3),
    lastThird: roundM((nightLen * 2) / 3),
    dateGregorian: "",
    dateHijri: "",
    cityLat: lat,
    cityLng: lng,
    method,
    fetchedAt: Date.now(),
  };
}

function timeOf(hours: number): string {
  let m = Math.round((((hours % 24) + 24) % 24) * 60) % 1440;
  m = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function computeCurrentAndNext(
  times: PrayerTimes,
  now: Date = new Date()
): { current: PrayerKey | null; next: PrayerKey; countdownMinutes: number } {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const map: Record<PrayerKey, number> = {
    fajr: toMinutes(times.fajr),
    dhuhr: toMinutes(times.dhuhr),
    asr: toMinutes(times.asr),
    maghrib: toMinutes(times.maghrib),
    isha: toMinutes(times.isha),
  };

  let current: PrayerKey | null = null;
  if (minutes >= map.isha) current = "isha";
  else if (minutes >= map.maghrib) current = "maghrib";
  else if (minutes >= map.asr) current = "asr";
  else if (minutes >= map.dhuhr) current = "dhuhr";
  else if (minutes >= map.fajr) current = "fajr";
  else current = null;

  let next: PrayerKey = "fajr";
  let countdownMinutes = 0;
  for (const key of PRAYER_ORDER) {
    if (map[key] > minutes) {
      next = key;
      countdownMinutes = map[key] - minutes;
      break;
    }
  }
  if (countdownMinutes === 0) {
    next = "fajr";
    countdownMinutes = 1440 - minutes + map.fajr;
  }
  return { current, next, countdownMinutes };
}