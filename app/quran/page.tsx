"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-store";
import { SURAHS, JUZ_BOUNDARIES, getSurah } from "@/lib/quran-data";
import { fetchChapterContent, transliterateArabic } from "@/lib/quran-api";
import type { ChapterContent, VerseRecord } from "@/lib/quran-api";
import { useBookmarks, useQuranProgress } from "@/lib/use-stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Play, Square, ChevronRight, ChevronLeft, ArrowLeft, Bookmark, BookmarkCheck, Search, Volume2 } from "lucide-react";

function normalizeAudioUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://verses.quran.com${url}`;
  return url;
}

function VerseContent({ v, chapter, onBookmark, bookmarked, onPlay, playing }: {
  v: VerseRecord;
  chapter: number;
  onBookmark: () => void;
  bookmarked: boolean;
  onPlay: () => void;
  playing: boolean;
}) {
  const { t, lang } = useI18n();
  const trl = useMemo(() => transliterateArabic(v.arabic), [v.arabic]);
  return (
    <div id={`v-${chapter}-${v.verse}`} className="rounded-xl border border-border p-4 space-y-2 scroll-mt-24">
      <div className="flex items-center justify-between">
        <span className="h-7 w-7 rounded-full bg-secondary text-xs font-semibold flex items-center justify-center text-muted-foreground">{v.verse}</span>
        <div className="flex items-center gap-1">
          <button aria-label={t("quran.bookmarkVerse")} onClick={onBookmark} className="h-8 w-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center">
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
          </button>
          {v.audioUrl && (
            <button aria-label={t("common.listen")} onClick={onPlay} className="h-8 w-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center">
              {playing ? <Square className="h-4 w-4 text-destructive" /> : <Volume2 className="h-4 w-4 text-muted-foreground" />}
            </button>
          )}
        </div>
      </div>
      <p dir="rtl" lang="ar" className="font-quran text-xl sm:text-2xl leading-loose">
        {v.arabic} <span className="text-base text-accent align-top">﴿{v.verse}﴾</span>
      </p>
      {trl && <p className="text-sm text-muted-foreground italic leading-relaxed" dir="ltr">{trl}</p>}
      {v.translationEn && <p className="text-sm text-muted-foreground leading-relaxed">{v.translationEn}</p>}
      {lang === "ur" && v.translationUr && <p className="text-sm text-muted-foreground/80 leading-relaxed">{v.translationUr}</p>}
    </div>
  );
}

function ReaderView({ chapter, startVerse, onBack, onOpenChapter, reciterId, translationSlug, urduTranslationSlug, showTransliteration }: {
  chapter: number;
  startVerse: number;
  onBack: () => void;
  onOpenChapter: (n: number) => void;
  reciterId: number;
  translationSlug: string;
  urduTranslationSlug: string;
  showTransliteration: boolean;
}) {
  const { t, lang } = useI18n();
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playingIdx, setPlayingIdx] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { markRead } = useQuranProgress();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const surah = getSurah(chapter);

  const pages = useMemo(() => (surah ? Math.max(1, Math.ceil(surah.ayahs / 15)) : 1), [surah]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    setContent(null);
    fetchChapterContent({ chapter, translationSlug, urduTranslationSlug, reciterId })
      .then((c) => {
        if (!alive) return;
        setContent(c);
        setLoading(false);
        if (startVerse > 0) {
          setTimeout(() => {
            document.getElementById(`v-${chapter}-${startVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        }
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      alive = false;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [chapter, translationSlug, urduTranslationSlug, reciterId, startVerse]);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    setPlayingIdx(null);
  }, []);

  const playVerse = useCallback(
    (idx: number, url: string) => {
      if (!url) return;
      if (playingIdx === String(idx)) {
        stopAudio();
        return;
      }
      stopAudio();
      const audio = new Audio(normalizeAudioUrl(url));
      audioRef.current = audio;
      audio.onended = () => setPlayingIdx(null);
      setPlayingIdx(String(idx));
      audio.play().catch(() => setPlayingIdx(null));
    },
    [playingIdx, stopAudio]
  );

  const playAll = useCallback(async () => {
    if (!content) return;
    const withAudio = content.verses.filter((v) => v.audioUrl && v.audioUrl.length > 0);
    if (withAudio.length === 0 || playingIdx !== null) {
      stopAudio();
      return;
    }
    for (let i = 0; i < withAudio.length; i += 1) {
      const v = withAudio[i];
      const audio = new Audio(normalizeAudioUrl(v.audioUrl || ""));
      audioRef.current = audio;
      setPlayingIdx(`all-${i}`);
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      if (audioRef.current !== audio) return;
    }
    setPlayingIdx(null);
  }, [content, playingIdx, stopAudio]);

  if (!surah) return null;

  const verses = content?.verses || [];
  const isBookmarked = (v: number) => bookmarks.some((b) => b.chapter === chapter && b.verse === v);
  const last = verses[verses.length - 1];

  return (
    <div className="space-y-4">
      <Card className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur">
        <CardContent className="p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label={t("common.back")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{surah.nameEn} <span dir="rtl" lang="ar" className="font-quran text-primary">{surah.nameAr}</span></h3>
              <p className="text-xs text-muted-foreground">
                {t("quran.chapter")} {chapter} · {surah.ayahs} {t("quran.ayah")} · ~{pages} p
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markRead(chapter, last?.verse || surah.ayahs, pages)}
            >
              <BookOpen className="h-4 w-4" />
              {t("quran.markRead")}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => playAll()} aria-label={t("common.listen")}>
              {playingIdx !== null ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p dir="rtl" lang="ar" className="font-quran text-3xl sm:text-4xl text-center my-3 leading-snug">{surah.nameAr}</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">{t("quran.offline")}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>{t("common.retry")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {verses.map((v, idx) => (
            <VerseContent
              key={v.verse}
              v={v}
              chapter={chapter}
              onBookmark={() => {
                const existing = bookmarks.find((b) => b.chapter === chapter && b.verse === v.verse);
                if (existing) removeBookmark(existing.id);
                else
                  addBookmark({
                    chapter,
                    verse: v.verse,
                    label: `${surah.nameEn} ${v.verse}`,
                  });
              }}
              bookmarked={isBookmarked(v.verse)}
              onPlay={() => playVerse(idx, v.audioUrl || "")}
              playing={playingIdx === String(idx)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {chapter > 1 ? (
          <Button variant="outline" size="sm" onClick={() => onOpenChapter(chapter - 1)}>
            <ChevronLeft className="h-4 w-4" />
            {t("common.previous")}
          </Button>
        ) : (
          <span className="w-24" />
        )}
        <Button size="sm" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          {t("nav.dashboard").replace("Dashboard", "Top")}
        </Button>
        {chapter < 114 ? (
          <Button variant="outline" size="sm" onClick={() => onOpenChapter(chapter + 1)}>
            {t("common.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <span className="w-24" />
        )}
      </div>
    </div>
  );
}

export default function QuranPage() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { progress, pagesToday } = useQuranProgress();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<{ chapter: number; verse: number } | null>(null);
  const [tab, setTab] = useState("surahs");

  const openChapter = useCallback((n: number, verse = 0) => {
    setView({ chapter: n, verse });
    window.scrollTo({ top: 0 });
  }, []);

  if (view) {
    return (
      <ReaderView
        chapter={view.chapter}
        startVerse={view.verse}
        onBack={() => setView(null)}
        onOpenChapter={(n) => openChapter(n)}
        reciterId={settings.quran.reciterId}
        translationSlug={settings.quran.translationSlug}
        urduTranslationSlug={settings.quran.urduTranslationSlug}
        showTransliteration={settings.quran.showTransliteration}
      />
    );
  }

  const q = query.trim().toLowerCase();
  const surahList = SURAHS.filter((s) => {
    if (!q) return true;
    return (
      String(s.id).includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.nameAr.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> {t("quran.progress")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("quran.dailyGoal")}: {settings.quran.dailyPages} {t("quran.dailyPages").toLowerCase()}</span>
            <span className="font-semibold">{pagesToday} / {settings.quran.dailyPages}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (pagesToday / Math.max(1, settings.quran.dailyPages)) * 100)}%` }} />
          </div>
          {progress && (
            <Button variant="outline" size="sm" onClick={() => openChapter(progress.chapter, progress.verse)}>
              <Play className="h-4 w-4" />
              {t("quran.continueReading")} — {getSurah(progress.chapter)?.nameEn || progress.chapter} {progress.verse}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("quran.search")} className="ps-10" />
          </div>
          <Tabs value={tab} onValueChange={setTab} className="mt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="surahs">{t("quran.surahs")}</TabsTrigger>
              <TabsTrigger value="juz">{t("quran.juz")}</TabsTrigger>
              <TabsTrigger value="bookmarks">{t("quran.bookmarks")}</TabsTrigger>
            </TabsList>
            <TabsContent value="surahs">
              {surahList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">{t("quran.noSurah")}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {surahList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openChapter(s.id)}
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-start transition hover:border-primary/40 hover:bg-secondary/50"
                    >
                      <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">{s.id}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {s.nameEn}
                          <span className="text-muted-foreground font-normal text-sm"> · {s.nameAr}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.type === "makki" ? t("quran.makki") : t("quran.madani")} · {s.ayahs} {t("quran.ayah")}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="juz">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JUZ_BOUNDARIES.map((j) => {
                  const s = getSurah(j.surah);
                  return (
                    <button
                      key={j.juz}
                      onClick={() => openChapter(j.surah, j.ayah)}
                      className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-start transition hover:border-primary/40 hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold shrink-0">{j.juz}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">Juz {j.juz}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t("quran.juzStarts")}: {s?.nameEn || `Surah ${j.surah}`} · {j.ayah}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="bookmarks">
              <BookmarkListDumb onJump={(c, v) => openChapter(c, v)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function BookmarkListDumb({ onJump }: { onJump: (chapter: number, verse: number) => void }) {
  const { t } = useI18n();
  const { bookmarks, removeBookmark } = useBookmarks();
  if (bookmarks.length === 0) return <p className="text-sm text-muted-foreground py-6 text-center">{t("quran.noBookmarks")}</p>;
  return (
    <div className="space-y-2">
      {bookmarks
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((b) => {
          const s = getSurah(b.chapter);
          const label = b.label || `${s?.nameEn || b.chapter} ${b.verse}`;
          return (
            <div key={b.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
              <button onClick={() => onJump(b.chapter, Array.isArray(b.verse) ? 0 : b.verse)} className="flex-1 text-start min-w-0">
                <p className="font-medium text-sm truncate">{label}</p>
                <p className="text-xs text-muted-foreground">{t("quran.chapter")} {b.chapter} · {t("quran.verse")} {Array.isArray(b.verse) ? b.verse.join("-") : b.verse}</p>
              </button>
              <button aria-label={t("common.delete")} onClick={() => removeBookmark(b.id)} className="h-8 w-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center text-destructive shrink-0">
                <BookmarkCheck className="h-4 w-4" />
              </button>
            </div>
          );
        })}
    </div>
  );
}