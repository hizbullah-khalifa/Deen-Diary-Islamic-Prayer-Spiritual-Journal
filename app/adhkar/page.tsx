"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { ADHKAR } from "@/lib/adhkar-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStoredState } from "@/lib/use-stores";
import { STORE_KEYS, dayKey } from "@/lib/storage";
import { playChime, vibrate } from "@/lib/audio";
import { Sunrise, Sunset, Hand } from "lucide-react";
import { cn } from "@/lib/cn";

type TodayCounts = Record<string, number>;

export default function AdhkarPage() {
  const { t } = useI18n();
  const today = useMemo(() => dayKey(), []);
  const [counts, setCounts] = useStoredState<Record<string, TodayCounts>>(STORE_KEYS.adhkar, {});

  const countFor = (part: string, id: string) => counts[today]?.[`${part}:${id}`] || 0;

  const tap = (part: string, id: string, target: number) => {
    const key = `${part}:${id}`;
    const prev = counts[today]?.[key] || 0;
    setCounts((all) => {
      const todayMap: TodayCounts = { ...(all[today] || {}) };
      if (prev + 1 >= target) {
        todayMap[key] = 0;
      } else {
        todayMap[key] = prev + 1;
      }
      return { ...all, [today]: todayMap };
    });
    playChime();
    vibrate(25);
  };

  const resetPart = (part: string) => {
    setCounts((all) => {
      const todayMap: TodayCounts = { ...(all[today] || {}) };
      ADHKAR.find((p) => p.key === part)?.items.forEach((item) => {
        todayMap[`${part}:${item.id}`] = 0;
      });
      return { ...all, [today]: todayMap };
    });
  };

  const renderPart = (part: "morning" | "evening") => {
    const data = ADHKAR.find((p) => p.key === part);
    if (!data) return null;
    let totalTarget = 0;
    let totalCount = 0;
    data.items.forEach((item) => {
      totalTarget += item.target;
      totalCount += countFor(part, item.id);
    });
    const allDone = data.items.every((item) => countFor(part, item.id) >= item.target);

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardDescription className="flex items-center gap-1.5">
            {part === "morning" ? <Sunrise className="h-4 w-4 text-accent" /> : <Sunset className="h-4 w-4 text-accent" />}
            {part === "morning" ? t("adhkar.morning") : t("adhkar.evening")}
          </CardDescription>
          <Button variant="ghost" size="sm" onClick={() => resetPart(part)}>{t("adhkar.reset")}</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{t("adhkar.progressToday")}</span>
              <span className="font-semibold">{totalCount} / {totalTarget}</span>
            </div>
            <Progress value={(totalCount / Math.max(1, totalTarget)) * 100} />
          </div>
          {allDone && (
            <div className="rounded-xl bg-success/10 text-success px-4 py-2 text-sm font-medium text-center">
              {t("adhkar.complete")}
            </div>
          )}
          {data.items.map((item) => {
            const count = countFor(part, item.id);
            const done = count >= item.target;
            return (
              <div key={item.id} className="rounded-xl border border-border p-3 space-y-2">
                <p dir="rtl" lang="ar" className="font-quran text-lg leading-loose">{item.arabic}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.reference}</Badge>
                  <span className="text-xs text-muted-foreground">{t("common.repeat")} {item.target} ×</span>
                </div>
                <button
                  onClick={() => tap(part, item.id, item.target)}
                  className={cn(
                    "w-full rounded-xl border py-2.5 text-sm font-medium transition active:scale-[.98]",
                    done ? "border-success/40 bg-success/10 text-success" : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
                  )}
                >
                  {done ? `✓ ${t("adhkar.done")}` : `${count} / ${item.target}`}
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Hand className="h-4 w-4 text-accent" /> {t("adhkar.title")}</CardTitle>
          <CardDescription>{t("adhkar.tapToCount")}</CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue="morning">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="morning">{t("adhkar.morning")}</TabsTrigger>
          <TabsTrigger value="evening">{t("adhkar.evening")}</TabsTrigger>
        </TabsList>
        <TabsContent value="morning">{renderPart("morning")}</TabsContent>
        <TabsContent value="evening">{renderPart("evening")}</TabsContent>
      </Tabs>
    </div>
  );
}