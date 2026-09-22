import { getSurah } from "@/lib/quran-data";
import { getStore, setStore, STORE_KEYS } from "@/lib/storage";
import type { VerseOfDay } from "@/lib/types";

const API = "https://api.quran.com/api/v4";

export interface VerseRecord {
  verse: number;
  arabic: string;
  translationEn?: string;
  translationUr?: string;
  audioUrl?: string;
  transliteration?: string;
}

export interface ChapterContent {
  chapter: number;
  verses: VerseRecord[];
  sourceLabels: string[];
}

interface TranslationResource {
  id: number;
  slug: string;
  language_name: string;
  name: string;
}

interface RecitationResource {
  id: number;
  reciter_name: string;
  style?: string;
}

let resources: { translations: TranslationResource[]; recitations: RecitationResource[] } | null = null;

export async function ensureResources(): Promise<{
  translations: TranslationResource[];
  recitations: RecitationResource[];
}> {
  if (resources) return resources;
  const cached = getStore<typeof resources>("quranResources", null);
  if (cached) {
    resources = cached;
    return cached;
  }
  try {
    const [tRes, rRes] = await Promise.all([
      fetch(`${API}/resources/translations`),
      fetch(`${API}/resources/recitations`),
    ]);
    const tJson = (await tRes.json()) as { translations?: TranslationResource[] };
    const rJson = (await rRes.json()) as { recitations?: RecitationResource[] };
    const res = {
      translations: tJson.translations || [],
      recitations: rJson.recitations || [],
    };
    resources = res;
    setStore("quranResources", res);
    return res;
  } catch {
    if (cached) return cached;
    return { translations: [], recitations: [] };
  }
}

function translationIdsByLang(res: { translations: TranslationResource[] }, slug: string, lang: string): { id: number; label: string } {
  const list = res.translations || [];
  const bySlug = list.find((t) => t.slug === slug);
  if (bySlug) return { id: bySlug.id, label: bySlug.name };
  const byLang = list.find((t) => t.language_name === lang);
  if (byLang) return { id: byLang.id, label: byLang.name };
  return { id: 0, label: "" };
}

export async function fetchChapterContent(params: {
  chapter: number;
  translationSlug: string;
  urduTranslationSlug: string;
  reciterId: number;
}): Promise<ChapterContent> {
  const { chapter, translationSlug, urduTranslationSlug, reciterId } = params;
  const res = await ensureResources();
  const en = translationIdsByLang(res, translationSlug, "english");
  const ur = translationIdsByLang(res, urduTranslationSlug, "urdu");
  const chapterCache = getStore<Record<string, ChapterContent>>("quranChapterCache", {});
  const cacheKey = `${chapter}|en${en.id}|ur${ur.id}|${reciterId}`;
  const hit = chapterCache[cacheKey];
  if (hit) return hit;

  const [arabicRes, enRes, urRes, audioRes] = await Promise.all([
    fetch(`${API}/quran/verses/uthmani?chapter_number=${chapter}&per_page=400`).catch(() => null),
    en.id ? fetch(`${API}/quran/translations/${en.id}?chapter_number=${chapter}&per_page=400`).catch(() => null) : Promise.resolve(null),
    ur.id ? fetch(`${API}/quran/translations/${ur.id}?chapter_number=${chapter}&per_page=400`).catch(() => null) : Promise.resolve(null),
    fetch(`${API}/quran/recitations/${reciterId}?chapter_number=${chapter}`).catch(() => null),
  ]);

  const arabicJson = arabicRes ? ((await arabicRes.json()) as { verses?: { verse_key: string; text_uthmani: string }[] }) : null;
  const enJson = enRes ? ((await enRes.json()) as { translations?: { verse_key: string; text: string }[] }) : null;
  const urJson = urRes ? ((await urRes.json()) as { translations?: { verse_key: string; text: string }[] }) : null;
  const audioJson = audioRes ? ((await audioRes.json()) as { audio_files?: { verse_key: string; url: string }[] }) : null;

  const verses = (arabicJson?.verses || []).map((v) => {
    const verseNum = Number(v.verse_key.split(":")[1]) || 0;
    return {
      verse: verseNum,
      arabic: v.text_uthmani,
      translationEn: enJson?.translations?.find((x) => x.verse_key === v.verse_key)?.text,
      translationUr: urJson?.translations?.find((x) => x.verse_key === v.verse_key)?.text,
      audioUrl: audioJson?.audio_files?.find((x) => x.verse_key === v.verse_key)?.url,
    } as VerseRecord;
  });

  const content: ChapterContent = {
    chapter,
    verses,
    sourceLabels: [
      en.label ? `Translation: ${en.label}` : "",
      ur.label ? `Urdu: ${ur.label}` : "",
      arabicJson ? "Arabic: Quran.com (Uthmani)" : "",
      audioJson ? "Recitation: Quran.com audio" : "",
    ].filter(Boolean),
  };

  if (verses.length > 0) {
    const nextCache = { ...chapterCache, [cacheKey]: content };
    try {
      setStore("quranChapterCache", nextCache);
    } catch {
      /* cache too large */
    }
  }
  return content;
}

export function transliterateArabic(text: string): string {
  const map: Record<string, string> = {
    "ا": "a", "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh",
    "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s",
    "ض": "d", "ط": "t", "ظ": "z", "ع": "'", "غ": "gh", "ف": "f", "ق": "q",
    "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y",
    "ى": "a", "ة": "h", "ء": "'", "ئ": "i", "ؤ": "u", "إ": "i", "أ": "a",
    "آ": "aa", "َ": "a", "ُ": "u", "ِ": "i", "ً": "an", "ٌ": "un", "ٍ": "in",
    "ّ": "", "ْ": "", "ـ": "", "ٱ": "a",
  };
  let out = "";
  let prev = "";
  for (const ch of text) {
    const roman = map[ch];
    if (roman !== undefined) {
      out += roman;
      prev = roman;
    } else if (/\s/.test(ch)) {
      out += " ";
      prev = "";
    }
  }
  return out.replace(/\s+/g, " ").trim();
}

export async function fetchVerseViaApi(chapter: number, verse: number, params: {
  translationSlug: string;
  urduTranslationSlug: string;
  reciterId: number;
}): Promise<VerseRecord | null> {
  try {
    const chunk = await fetchChapterContent({ chapter, translationSlug: params.translationSlug, urduTranslationSlug: params.urduTranslationSlug, reciterId: params.reciterId });
    const rec = chunk.verses.find((v) => v.verse === verse);
    return rec || null;
  } catch {
    return null;
  }
}

export interface EmbeddedAyah {
  chapter: number;
  verse: number;
  arabic: string;
  translationEn: string;
}

export const EMBEDDED_AYAHS: EmbeddedAyah[] = [
  {
    chapter: 103, verse: 1,
    arabic: "وَالْعَصْرِ",
    translationEn: "By time,",
  },
  {
    chapter: 103, verse: 2,
    arabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
    translationEn: "Indeed, mankind is in loss,",
  },
  {
    chapter: 103, verse: 3,
    arabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    translationEn: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
  },
  {
    chapter: 2, verse: 286,
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translationEn: "Allah does not burden a soul beyond that it can bear.",
  },
  {
    chapter: 94, verse: 5,
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translationEn: "For indeed, with hardship [will be] ease.",
  },
  {
    chapter: 94, verse: 6,
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translationEn: "Indeed, with hardship [will be] ease.",
  },
  {
    chapter: 39, verse: 53,
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ",
    translationEn: "Say, O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.",
  },
  {
    chapter: 13, verse: 28,
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translationEn: "Unquestionably, by the remembrance of Allah hearts are assured.",
  },
  {
    chapter: 93, verse: 5,
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    translationEn: "And your Lord is going to give you, and you will be satisfied.",
  },
  {
    chapter: 2, verse: 152,
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translationEn: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
  },
];

export function embeddedVerseForToday(now = new Date()): { index: number; verse: EmbeddedAyah } {
  const dayIndex = Math.floor(now.getTime() / 86400000);
  const index = dayIndex % EMBEDDED_AYAHS.length;
  return { index, verse: EMBEDDED_AYAHS[index] };
}

export function surahLabel(chapter: number): string {
  const s = getSurah(chapter);
  return s ? s.nameEn : String(chapter);
}

export function embeddedVerseOfDayRecord(lang: "en" | "ur" = "en"): VerseOfDay | null {
  const { verse } = embeddedVerseForToday();
  const surah = getSurah(verse.chapter);
  if (!surah) return null;
  return {
    chapter: verse.chapter,
    verse: verse.verse,
    arabic: verse.arabic,
    translationEn: verse.translationEn,
    surahNameEn: surah.nameEn,
    surahNameUr: lang === "ur" ? surah.nameEn : undefined,
    source: "Embedded (Sahih International)",
  };
}

export async function fetchVerseOfDay(lang: "en" | "ur" = "en"): Promise<VerseOfDay | null> {
  const initial = embeddedVerseOfDayRecord(lang);
  try {
    const live = await fetchVerseViaApi(initial?.chapter || 1, initial?.verse || 1, {
      translationSlug: "en.sahih",
      urduTranslationSlug: "ur.jalandhry",
      reciterId: 7,
    });
    if (live && initial) {
      return {
        ...initial,
        arabic: live.arabic || initial.arabic,
        translationEn: live.translationEn || initial.translationEn,
        translationUr: live.translationUr,
        source: "Quran.com",
      };
    }
  } catch {
    /* use embedded */
  }
  return initial;
}