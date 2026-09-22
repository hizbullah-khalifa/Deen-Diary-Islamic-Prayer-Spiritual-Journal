"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePrayerRecords } from "@/lib/use-stores";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dayKey } from "@/lib/storage";
import type { PrayerKey, PrayerStatus } from "@/lib/types";
import { CheckCheck, Clock3, XCircle, Check, TrendingUp, Flame, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/cn";

const ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const STATUS_OPTIONS: Array<{ status: PrayerStatus; label: "prayed" | "qada" | "missed" }> = [
  { status: "prayed", label: "prayed" },
  { status: "qada", label: "qada" },
  { status: "missed", label: "missed" },
];

function statusIcon(s: PrayerStatus) {
  if (s === "prayed") return <CheckCheck className="h-4 w-4 text-success" />;
  if (s === "qada") return <Clock3 className="h-4 w-4 text-accent" />;
  if (s === "missed") return <XCircle className="h-4 w-4 text-destructive" />;
  return <span className="h-4 w-4 rounded-full border border-border" />;
}

export default function PrayerTrackerPage() {
  const { t } = useI18n();
  const { records, today, todayKey, setDayPrayer } = usePrayerRecords();

  const days = useMemo(() => {
    const list: Array<{ key: string; label: string; done: number; total: number; isToday: boolean }> = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const day = records[key];
      const done = day ? ORDER.filter((k) => day[k] === "prayed" || day[k] === "qada").length : 0;
      list.push({ key, label: d.toLocaleDateString("en-GB", { weekday: "short" }), done, total: 5, isToday: key === todayKey });
    }
    return list;
  }, [records, todayKey]);

  const todayDone = ORDER.filter((k) => today[k] === "prayed" || today[k] === "qada").length;
  const weekRows = useMemo(() => {
    const arr: PrayerKey[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(dayKey(d) as PrayerKey);
    }
    return arr;
  }, []);
  const weeklyTotal = weekRows.reduce((acc, k) => acc + (records[k] ? ORDER.filter((x) => records[k][x] === "prayed").length : 0), 0);
  const weeklyGoal = 35;
  const monthKey = todayKey.slice(0, 7);
  const monthTotal = Object.entries(records)
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((acc, [, day]) => acc + ORDER.filter((x) => day[x] === "prayed").length, 0);
  const monthDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthGoal = monthDays * 5;

  const encourage = weeklyTotal >= 30 ? "greatWeek" : weeklyTotal >= 21 ? "almostThere" : "encouragement";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> {t("tracker.daily")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ORDER.map((k) => (
            <div key={k} className="rounded-xl border border-border px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {statusIcon(today[k])}
                  <span className="capitalize font-medium">{t(`prayer.${k}`)}</span>
                  {today[k] === "prayed" && <Badge variant="success">{t("tracker.prayed")}</Badge>}
                  {today[k] === "qada" && <Badge variant="accent">{t("tracker.qada")}</Badge>}
                  {today[k] === "missed" && <Badge variant="destructive">{t("tracker.missed")}</Badge>}
                </div>
                <div className="flex items-center gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.status}
                      aria-label={t(`tracker.${opt.label}`)}
                      onClick={() => setDayPrayer(todayKey, k, today[k] === opt.status ? "notyet" : opt.status)}
                      className={cn(
                        "h-8 w-8 rounded-full border inline-flex items-center justify-center transition",
                        today[k] === opt.status ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {opt.status === "prayed" ? <Check className="h-4 w-4" /> : opt.status === "qada" ? <Clock3 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-1 pt-1 text-sm">
            <span className="text-muted-foreground">{t("tracker.todayProgress")}</span>
            <span className="font-semibold">{todayDone} / 5</span>
          </div>
          <Progress value={(todayDone / 5) * 100} className="mt-1" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><Flame className="h-4 w-4 text-accent" /> {t("tracker.thisWeek")}</CardTitle>
          <span className="text-sm text-muted-foreground">{weeklyTotal} / {weeklyGoal}</span>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {days.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[11px] text-muted-foreground">{d.done}</span>
                <div className="w-full rounded-t-lg bg-secondary overflow-hidden" style={{ height: `${(d.done / d.total) * 100}%`, maxHeight: 96 }}>
                  <div className="w-full bg-primary h-full" />
                </div>
                <span className={cn("text-[11px]", d.isToday ? "font-semibold text-primary" : "text-muted-foreground")}>{d.label}</span>
                {d.isToday && <span className="text-[10px] text-primary font-medium">{t("common.today")}</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> {t("tracker.thisMonth")}</CardTitle>
          <CardDescription>{t("tracker.statsNote")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{t("tracker.todayProgress").replace("Today's", t("common.month"))}</span>
              <span className="font-semibold">{monthTotal} / {monthGoal}</span>
            </div>
            <Progress value={(monthTotal / monthGoal) * 100} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="rounded-xl bg-secondary/60 py-3">
              <p className="text-lg font-bold text-success">{monthDays - Math.floor(monthTotal / 5)}</p>
              <p className="text-[11px] text-muted-foreground">{t("tracker.daysLeft")}</p>
            </div>
            <div className="rounded-xl bg-secondary/60 py-3">
              <p className="text-lg font-bold">{weeklyTotal}</p>
              <p className="text-[11px] text-muted-foreground">{t("tracker.thisWeek")}</p>
            </div>
            <div className="rounded-xl bg-secondary/60 py-3">
              <p className="text-lg font-bold text-accent">{Math.round((monthTotal / monthGoal) * 100)}%</p>
              <p className="text-[11px] text-muted-foreground">{t("common.progress")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="islamic-pattern">
        <CardContent className="flex items-start gap-3 p-5">
          <HeartHandshake className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">{t(`tracker.${encourage}`)}</p>
        </CardContent>
      </Card>
    </div>
  );
}