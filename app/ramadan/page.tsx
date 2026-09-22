"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { usePrayerTimes } from "@/lib/use-prayer-times";
import { useRamadanDays, useQuranProgress } from "@/lib/use-stores";
import { DUAS } from "@/lib/duas-data";
import { getHijri } from "@/lib/date-utils";
import { dayKey } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/lib/toast";
import { CheckCircle2, Circle, MoonStar, Utensils, BookOpen, HeartHandshake, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";

export default function RamadanPage() {
  const { t, lang } = useI18n();
  const { times } = usePrayerTimes();
  const { days, setDay } = useRamadanDays();
  const { toast } = useToast();
  const { pagesToday, dailyGoal, setPagesToday } = useQuranProgress();

  const today = dayKey();
  const now = getHijri();
  const inRamadan = now.month === 9;
  const dayOfRamadan = inRamadan ? now.day : 0;

  const daysArr = useMemo(() => Object.entries(days).sort((a, b) => a[0].localeCompare(b[0])).slice(-30), [days]);

  const ramadanDua = useMemo(() => DUAS.find((d) => d.category.includes("ramadan")) || DUAS[0], []);

  if (!inRamadan) {
    const next = getHijri();
    let daysUntil = 0;
    if (next.month <= 9) {
      daysUntil = Math.round((9 - next.month) * 29.5 - next.day + (next.month === 9 ? 0 : 29.5));
    } else {
      daysUntil = Math.round((9 + 12 - next.month) * 29.5 - next.day + 29.5);
    }
    return (
      <div className="space-y-4">
        <Card className="text-center islamic-pattern">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2"><MoonStar className="h-4 w-4 text-accent" /> {t("ramadan.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-bold">{Math.max(0, daysUntil)}</p>
            <p className="text-sm text-muted-foreground">{t("ramadan.notRamadan", { n: Math.max(0, daysUntil) })}</p>
            <p className="text-sm text-muted-foreground">{t("ramadan.notRamadanBlurb")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sd = days[today];
  const fastedToday = !!sd?.fasted;
  const taraweehToday = !!sd?.taraweeh;
  const duaToday = !!sd?.duaDone;
  const deedToday = !!sd?.goodDeed;

  return (
    <div className="space-y-4">
      <Card className="text-center islamic-pattern">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2"><MoonStar className="h-4 w-4 text-accent" /> {t("ramadan.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-semibold">{t("ramadan.dayOfRamadan", { n: dayOfRamadan })}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm">
              <Utensils className="h-4 w-4" /> {t("ramadan.suhoor")} · {times?.fajr || "—"}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-sm">
              <Utensils className="h-4 w-4" /> {t("ramadan.iftar")} · {times?.maghrib || "—"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{t("ramadan.ramadanJournal")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("ramadan.fasting")}</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => {
              setDay(today, { fasted: !fastedToday });
              if (!fastedToday) toast("success", t("ramadan.fastedYes"));
            }}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-2xl border-2 py-6 text-lg font-semibold transition",
              fastedToday ? "border-success bg-success/10 text-success" : "border-border hover:bg-secondary"
            )}
          >
            {fastedToday ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
            {fastedToday ? t("ramadan.fastedYes") : t("ramadan.trackDay")}
          </button>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium"><BookOpen className="h-4 w-4 text-accent" /> {t("ramadan.quranGoal")}</div>
            <Progress value={dailyGoal > 0 ? Math.min(100, (pagesToday / dailyGoal) * 100) : 0} />
            <p className="text-xs text-muted-foreground">{t("ramadan.pages", { n: pagesToday, m: dailyGoal })}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPagesToday(Math.max(0, pagesToday - 1))}>−</Button>
              <Button size="sm" variant="outline" onClick={() => setPagesToday(pagesToday + 1)}>+</Button>
              <Button size="sm" onClick={() => setPagesToday(dailyGoal)}>{t("ramadan.taraweehDone").slice(0, 12)}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium"><MoonStar className="h-4 w-4 text-accent" /> {t("ramadan.taraweeh")}</div>
            <button onClick={() => setDay(today, { taraweeh: !taraweehToday })} className={cn("w-full rounded-xl border-2 py-4 font-medium", taraweehToday ? "border-success bg-success/10 text-success" : "border-border hover:bg-secondary")}>
              {taraweehToday ? t("ramadan.taraweehDone") : t("ramadan.trackDay")}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium"><HeartHandshake className="h-4 w-4 text-accent" /> {t("ramadan.charityToday")}</div>
            <button onClick={() => setDay(today, { goodDeed: !deedToday })} className={cn("w-full rounded-xl border-2 py-4 font-medium", deedToday ? "border-success bg-success/10 text-success" : "border-border hover:bg-secondary")}>
              {deedToday ? t("ramadan.deed") + " ✓" : t("ramadan.deedLog")}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium"><MoonStar className="h-4 w-4 text-accent" /> {t("ramadan.dailyDua")}</div>
            <div className="rounded-xl bg-secondary/60 p-3 text-center text-2xl leading-relaxed">{ramadanDua.arabic}</div>
            <p className="text-xs text-muted-foreground italic">{ramadanDua.transliteration}</p>
            <p className="text-xs text-muted-foreground">{lang === "ur" ? ramadanDua.ur : ramadanDua.en}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{ramadanDua.reference}</span>
              <button onClick={() => setDay(today, { duaDone: !duaToday })} className={cn("inline-flex items-center gap-1 text-sm", duaToday ? "text-success font-medium" : "text-primary")}>
                {duaToday ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {duaToday ? t("ramadan.duaDone") : t("ramadan.dailyDua")}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /> {t("ramadan.monthTrack")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {daysArr.map(([d, rec]) => (
              <button
                key={d}
                title={d}
                onClick={() => setDay(d, { fasted: !rec.fasted })}
                className={cn(
                  "aspect-square rounded-lg border text-xs font-medium",
                  rec.fasted ? "border-success bg-success/15 text-success" : "border-border text-muted-foreground hover:bg-secondary",
                  d === today && "ring-2 ring-primary"
                )}
              >
                {Number(d.slice(8))}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{t("ramadan.ramadanCalendar")}</p>
        </CardContent>
      </Card>
    </div>
  );
}