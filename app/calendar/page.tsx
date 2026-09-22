"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-store";
import { getHijri, formatHijri, toGregorianFromHijri, isSameDayISO } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, ChevronLeft, ChevronRight, Star, MoonStar, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { dayKey } from "@/lib/storage";

type ImportantDate = { id: string; hijri: { m: number; d: number }; labelKey: string };

const IMPORTANT_DATES: ImportantDate[] = [
  { id: "islamicNewYear", hijri: { m: 1, d: 1 }, labelKey: "islamicNewYear" },
  { id: "ashura", hijri: { m: 1, d: 10 }, labelKey: "ashura" },
  { id: "mawlid", hijri: { m: 3, d: 12 }, labelKey: "mawlid" },
  { id: "ramadan", hijri: { m: 9, d: 1 }, labelKey: "ramadan" },
  { id: "laylatulQadr", hijri: { m: 9, d: 27 }, labelKey: "laylatulQadr" },
  { id: "eidFitr", hijri: { m: 10, d: 1 }, labelKey: "eidFitr" },
  { id: "arafah", hijri: { m: 12, d: 9 }, labelKey: "arafah" },
  { id: "eidAdha", hijri: { m: 12, d: 10 }, labelKey: "eidAdha" },
];

export default function CalendarPage() {
  const { t, lang } = useI18n();
  const { settings, setSettings } = useSettings();
  const todayHijri = getHijri();
  const [hijriYear, setHijriYear] = useState(todayHijri.year);
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = dayKey();

  const importantDates = useMemo(() => {
    const list: { date: Date; id: string; labelKey: string }[] = [];
    for (const it of IMPORTANT_DATES) {
      if (it.id === "mawlid" && !settings.calendar.showMawlid) continue;
      if (it.id === "ashura" && !settings.calendar.showAshura) continue;
      const d = toGregorianFromHijri(hijriYear, it.hijri.m, it.hijri.d);
      if (d) list.push({ date: d, id: it.id, labelKey: it.labelKey });
    }
    return list;
  }, [hijriYear, settings.calendar.showMawlid, settings.calendar.showAshura]);

  const visibleDates = useMemo(() => importantDates.filter((x) => x.date.getFullYear() === year && x.date.getMonth() === month), [importantDates, year, month]);
  const monthHijri = getHijri(new Date(year, month, 1));
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const shift = (dir: number) => {
    const d = new Date(year, month + dir, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /> {t("calendar.title")}</CardTitle>
          <CardDescription>
            {formatHijri(getHijri(), lang)} · {t("calendar.hijriYear", { y: hijriYear })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Button variant="outline" size="sm" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="font-semibold">
              {new Date(year, month, 1).toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", { month: "long", year: "numeric" })}
            </h3>
            <Button variant="outline" size="sm" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground mb-2">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <span key={`pad-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const key = iso(new Date(year, month, d));
              const hijri = getHijri(new Date(year, month, d));
              const isToday = key === today;
              const hits = visibleDates.filter((v) => isSameDayISO(iso(v.date), key));
              return (
                <div
                  key={d}
                  className={cn(
                    "rounded-xl border p-1.5 min-h-[52px] relative",
                    isToday ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"
                  )}
                >
                  <span className={cn("text-xs font-medium", isToday && "text-primary font-bold")}>{d}</span>
                  <span className="block text-[10px] text-muted-foreground ltr:tabular-nums">{hijri.day} {hijri.monthNameEn.slice(0, 3)}</span>
                  {hits.map((h) => (
                    <Badge key={h.id} variant="outline" className="mt-0.5 px-1 py-0 text-[9px] h-4 bg-secondary/80">
                      {t(`calendar.${h.labelKey}`)}
                    </Badge>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{t("calendar.monthGrid")}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-accent" /> {t("calendar.importantDates")} ({formatHijri(monthHijri, lang)} → {formatHijri(getHijri(new Date(year, month, daysInMonth)), lang)})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {importantDates.length === 0 && <p className="text-sm text-muted-foreground">{t("common.empty")}</p>}
          {importantDates.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <div className="flex items-center gap-2">
                <MoonStar className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">{t(`calendar.${d.labelKey}`)}</span>
              </div>
              <span className="text-xs text-muted-foreground ltr:tabular-nums">
                {d.date.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", { weekday: "short", day: "numeric", month: "short" })}
                {d.id === "laylatulQadr" && " · " + t("calendar.qadrNote")}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> {t("calendar.preferences")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("calendar.showMawlid")}</span>
            <Switch checked={settings.calendar.showMawlid} onCheckedChange={(v) => setSettings((p) => ({ ...p, calendar: { ...p.calendar, showMawlid: v } }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("calendar.showAshura")}</span>
            <Switch checked={settings.calendar.showAshura} onCheckedChange={(v) => setSettings((p) => ({ ...p, calendar: { ...p.calendar, showAshura: v } }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t("calendar.moonSighting")}</span>
            <Switch checked={settings.calendar.moonSighting} onCheckedChange={(v) => setSettings((p) => ({ ...p, calendar: { ...p.calendar, moonSighting: v } }))} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}