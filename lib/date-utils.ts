import { useMemo } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { toHijri, toGregorian } from "hijri-converter";

export function formatTime(t: string | Date): string {
  const d = typeof t === "string" ? new Date(`1970-01-01T${t}`) : t;
  try {
    return format(d, "HH:mm");
  } catch {
    return typeof t === "string" ? t.slice(0, 5) : "";
  }
}

export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  if (isNaN(date.getTime())) return typeof d === "string" ? d : "";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd MMM yyyy");
}

export interface HijriResult {
  year: number;
  month: number;
  day: number;
  monthNameEn: string;
  monthNameUr: string;
}

const HIJRI_EN = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qa'da",
  "Dhu al-Hijjah",
];
const HIJRI_UR = [
  "محرم",
  "صفر",
  "ربیع الاول",
  "ربیع الثانی",
  "جمادی الاول",
  "جمادی الثانی",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذوالقعدہ",
  "ذوالحجہ",
];

export function getHijri(date: Date = new Date()): HijriResult {
  try {
    const h = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return {
      year: h.hy,
      month: h.hm,
      day: h.hd,
      monthNameEn: HIJRI_EN[h.hm - 1] || "",
      monthNameUr: HIJRI_UR[h.hm - 1] || "",
    };
  } catch {
    return { year: 1448, month: 10, day: 21, monthNameEn: HIJRI_EN[9], monthNameUr: HIJRI_UR[9] };
  }
}

export function formatHijri(h: HijriResult, lang: "en" | "ur" = "en"): string {
  if (lang === "ur") return `${h.day} ${h.monthNameUr} ${h.year}ھ`;
  return `${h.day} ${h.monthNameEn} ${h.year} AH`;
}

export function formatGregorian(date: Date = new Date(), lang: "en" | "ur" = "en"): string {
  const d = format(date, "dd MMMM yyyy");
  if (lang === "ur")     return d.replace(/January|February|March|April|May|June|July|August|September|October|November|December/g, (m: string) => {
    const map: Record<string, string> = {
      January: "جنوری", February: "فروری", March: "مارچ", April: "اپریل", May: "مئی", June: "جون",
      July: "جولائی", August: "اگست", September: "ستمبر", October: "اکتوبر", November: "نومبر", December: "دسمبر",
    };
    return map[m] || m;
  });
  return d;
}

export function toGregorianFromHijri(hy: number, hm: number, hd: number): Date | null {
  try {
    const g = toGregorian(hy, hm, hd);
    return new Date(g.gy, g.gm - 1, g.gd);
  } catch {
    return null;
  }
}

export function addMinutes(time: string, m: number): string {
  const [h, s] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const d = new Date(2000, 0, 1, h, s || 0, 0);
  d.setMinutes(d.getMinutes() + m);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function diffMinutes(from: string, to: string): number {
  const f = toMinutes(from);
  const t = toMinutes(to);
  let diff = t - f;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

export function toMinutes(t: string): number {
  const [h, s] = t.split(":").map(Number);
  if (Number.isNaN(h)) return 0;
  return h * 60 + (s || 0);
}

export function useCountdown(now: Date, targetTime: string): {
  nextAt: Date;
  minutesLeft: number;
  hoursLeft: number;
  totalMinutes: number;
  isNow: boolean;
} {
  return useMemo(() => {
    const [th, tm] = targetTime.split(":").map(Number);
    const nextAt = new Date(now);
    nextAt.setHours(th || 0, tm || 0, 0, 0);
    if (nextAt < now) nextAt.setDate(nextAt.getDate() + 1);
    const totalMinutes = Math.max(0, Math.round((nextAt.getTime() - now.getTime()) / 60000));
    const hoursLeft = Math.floor(totalMinutes / 60);
    const minutesLeft = totalMinutes % 60;
    return { nextAt, minutesLeft, hoursLeft, totalMinutes, isNow: totalMinutes <= 0 };
  }, [now, targetTime]);
}

export function prayerNameKey(k: string): string {
  switch (k) {
    case "fajr": return "fajr";
    case "sunrise": return "sunrise";
    case "dhuhr": return "dhuhr";
    case "asr": return "asr";
    case "maghrib": return "maghrib";
    case "isha": return "isha";
    default: return k;
  }
}

export function isSameDayISO(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}