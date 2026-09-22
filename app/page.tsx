"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { usePrayerTimes } from "@/lib/use-prayer-times";
import { computeCurrentAndNext } from "@/lib/prayer";
import { usePrayerRecords, useTasks, useHabits, useGratitude, useJournal, useTasbih, useHydrated } from "@/lib/use-stores";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { getHijri, formatHijri, formatGregorian, formatTime } from "@/lib/date-utils";
import { embeddedVerseOfDayRecord, fetchVerseOfDay } from "@/lib/quran-api";
import type { VerseOfDay } from "@/lib/types";
import { DUAS } from "@/lib/duas-data";
import { playChime, vibrate } from "@/lib/audio";
import { Sunrise, Sunset, Star, Heart, ListTodo, CalendarDays, BookOpen, Sparkles, Moon } from "lucide-react";
import { cn } from "@/lib/cn";

function Greeting() {
  const { t } = useI18n();
  return (
    <div className="space-y-1">
      <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t("greeting.salam")}</h3>
      <p className="text-muted-foreground text-sm">{t("greeting.peace")}</p>
    </div>
  );
}

function HijriBar({ className }: { className?: string }) {
  const { lang } = useI18n();
  const date = useMemo(() => new Date(), []);
  const hijri = useMemo(() => formatHijri(getHijri(date), lang), [date, lang]);
  const gregorian = useMemo(() => formatGregorian(date, lang), [date, lang]);
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{lang === "ur" ? "اسلامی تاریخ" : "Islamic Date"}</p>
            <p className="font-semibold">{hijri}</p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-sm text-muted-foreground">{lang === "ur" ? "عیسوی تاریخ" : "Gregorian Date"}</p>
          <p className="font-semibold">{gregorian}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PrayerCard() {
  const { t } = useI18n();
  const { status, times } = usePrayerTimes();
  const { today } = usePrayerRecords();
  const hydrated = useHydrated();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const info = useMemo(() => (times ? computeCurrentAndNext(times) : null), [times, tick]);
  const minutes = info?.countdownMinutes ?? 0;
  const safeToday = today ?? {};
  const doneCount = (["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).filter((k) => safeToday[k] === "prayed").length;

  return (
    <Card className="islamic-pattern relative overflow-hidden">
      <CardContent className="p-5">
        {!hydrated || status === "loading" || !times || !info ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                {info.current && <p className="text-sm text-muted-foreground">{t("dashboard.currentPrayer")}: <span className="capitalize font-medium text-foreground">{t(`prayer.${info.current}`)}</span></p>}
                {status === "stale" && <Badge variant="outline" className="mt-1">{t("common.offline")}</Badge>}
              </div>
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {info.current === "maghrib" || info.current === "isha" ? <Sunset className="h-5 w-5" /> : <Sunrise className="h-5 w-5" />}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.nextPrayer")}</p>
            <p className="text-lg font-semibold capitalize">{t(`prayer.${info.next}`)}</p>
            <p className="text-3xl font-bold tracking-tight">{formatTime(times[info.next])}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {minutes < 60
                ? t("dashboard.countdown", { n: minutes })
                : t("dashboard.countdownHour", { h: Math.floor(minutes / 60), m: minutes % 60 })}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>{t("dashboard.prayersCompleted", { n: doneCount, m: 5 })}</span>
                <span>{Math.round((doneCount / 5) * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(doneCount / 5) * 100}%` }} />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function VerseCard() {
  const { t, lang } = useI18n();
  const [verse, setVerse] = useState<VerseOfDay | null>(null);
  useEffect(() => {
    let alive = true;
    setVerse(embeddedVerseOfDayRecord(lang));
    fetchVerseOfDay(lang)
      .then((v) => {
        if (alive && v) setVerse(v);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [lang]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-accent" /> {t("dashboard.verseOfDay")}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-3">
        {!verse ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <p dir="rtl" lang="ar" className="font-quran text-lg sm:text-xl leading-relaxed text-right">{verse.arabic}</p>
            <p className="text-sm text-muted-foreground">{verse.translationEn}</p>
            <p className="text-xs text-accent">{verse.surahNameEn} · {t("quran.verse")} {verse.verse}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DuaCard() {
  const { t, lang } = useI18n();
  const dayIndex = useMemo(() => Math.floor(Date.now() / 86400000) % DUAS.length, []);
  const dua = DUAS[dayIndex];
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Heart className="h-4 w-4 text-accent" /> {t("dashboard.dailyDua")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {dua ? (
          <>
            <p dir="rtl" lang="ar" className="font-quran text-lg text-right leading-relaxed">{dua.arabic}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{lang === "ur" ? dua.ur : dua.en}</p>
            <p className="text-xs text-accent">{dua.reference || ""}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DhikrCard() {
  const { t } = useI18n();
  const { state, increment } = useTasbih();
  const label =
    state.dhikr === "subhanAllah"
      ? "سُبْحَانَ الله"
      : state.dhikr === "alhamdulillah"
        ? "الْحَمْدُ لِله"
        : state.dhikr === "allahuAkbar"
          ? "اللهُ أَكْبَر"
          : state.custom || t("common.custom");
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>{t("dashboard.quickDhikr")}</CardTitle>
          <p dir="rtl" lang="ar" className="text-lg font-quran mt-1 truncate">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{state.current} / {state.target}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/tasbih"><Button variant="outline" size="icon-sm"><Sparkles className="h-4 w-4" /></Button></Link>
          <Button
            size="icon"
            onClick={() => {
              increment();
              playChime();
              vibrate(30);
            }}
          >
            <Star className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TasksCard() {
  const { t } = useI18n();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { tasks, toggleTask } = useTasks();
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const todays = safeTasks.filter((x) => x.date === today);
  const done = todays.filter((x) => x.complete).length;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2"><ListTodo className="h-4 w-4 text-accent" /> {t("dashboard.todayTasks")}</CardTitle>
        <Link href="/tasks"><Button variant="ghost" size="sm">{t("common.viewAll")}</Button></Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {todays.length === 0 && <p className="text-sm text-muted-foreground">{t("dashboard.noTasksToday")}</p>}
        {todays.slice(0, 4).map((task) => (
          <button key={task.id} onClick={() => toggleTask(task.id)} className={cn("w-full text-start flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm", task.complete && "text-muted-foreground line-through")}>
            <span className={cn("h-3 w-3 rounded-full shrink-0", task.complete ? "bg-primary" : "bg-secondary")} />
            <span className="truncate">{task.title}</span>
            {task.priority === "high" && !task.complete && <Badge variant="accent" className="shrink-0">{t("tasks.priorityHigh")}</Badge>}
          </button>
        ))}
        {todays.length > 0 && <p className="text-xs text-muted-foreground pt-1">{done} / {todays.length} {t("common.done")}</p>}
      </CardContent>
    </Card>
  );
}

function HabitsCard() {
  const { t } = useI18n();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { habits, toggleHabit } = useHabits();
  const safeHabits = Array.isArray(habits) ? habits : [];
  const done = safeHabits.filter((h) => h.days && h.days[today]).length;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /> {t("dashboard.habitProgress")}</CardTitle>
        <Link href="/habits"><Button variant="ghost" size="sm">{t("common.viewAll")}</Button></Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {safeHabits.length === 0 && <p className="text-sm text-muted-foreground">{t("dashboard.noHabitToday")}</p>}
        {safeHabits.slice(0, 4).map((h) => (
          <button key={h.id} onClick={() => toggleHabit(h.id, today)} className="w-full text-start flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm">
            <span className="truncate">{h.name}</span>
            <span className={cn("h-3 w-3 rounded-full shrink-0", h.days && h.days[today] ? "bg-success" : "bg-secondary")} />
          </button>
        ))}
        <p className="text-xs text-muted-foreground pt-1">{done} / {safeHabits.length} {t("common.done")}</p>
      </CardContent>
    </Card>
  );
}

function GratitudeCard() {
  const { t } = useI18n();
  const { items, addItem, removeItem } = useGratitude();
  const safeItems = Array.isArray(items) ? items : [];
  const [val, setVal] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Heart className="h-4 w-4 text-accent" /> {t("dashboard.gratitude")}</CardTitle>
        <CardDescription>{t("dashboard.gratitudePrompt")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={val}
            placeholder={t("journal.gratitudePlaceholder")}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && val.trim()) {
                addItem(val);
                setVal("");
              }
            }}
          />
          <Button
            onClick={() => {
              addItem(val);
              setVal("");
            }}
          >
            {t("common.add")}
          </Button>
        </div>
        {safeItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {safeItems.map((item) => (
              <Badge key={item} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeItem(item)}>
                {item} <span className="opacity-60">×</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JournalCard() {
  const { t } = useI18n();
  const { entries } = useJournal();
  const safeEntries = Array.isArray(entries) ? entries : [];
  const latest = safeEntries[0];
  const text = latest?.gratitude || latest?.prayerReflection || latest?.learned || "";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> {t("dashboard.journal")}</CardTitle>
        <Link href="/journal"><Button size="sm">{t("dashboard.writeReflection")}</Button></Link>
      </CardHeader>
      <CardContent>
        {text ? <p className="text-sm text-muted-foreground line-clamp-3">{text}</p> : <p className="text-sm text-muted-foreground">{t("journal.noEntries")}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const hydrated = useHydrated();
  return (
    <div className="space-y-4">
      <Greeting />
      <HijriBar />
      {!hydrated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <PrayerCard />
          <VerseCard />
          <DuaCard />
          <DhikrCard />
          <TasksCard />
          <HabitsCard />
          <GratitudeCard />
          <JournalCard />
        </div>
      )}
    </div>
  );
}