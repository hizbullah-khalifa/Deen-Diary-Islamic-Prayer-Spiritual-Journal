"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useHabits } from "@/lib/use-stores";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/lib/toast";
import { dayKey } from "@/lib/storage";
import type { Habit } from "@/lib/types";
import { CalendarCheck2, Flame, Plus, Trash2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

function computeStreak(h: Habit): number {
  let count = 0;
  const d = new Date();
  for (let i = 0; i < 3650; i += 1) {
    const key = dayKey(d);
    if (h.days[key]) {
      count += 1;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

function HabitRow({ habit, onToggle, onDelete }: { habit: Habit; onToggle: (date: string) => void; onDelete: () => void }) {
  const { t } = useI18n();
  const today = dayKey();
  const weekDays = useMemo(() => {
    const list: { key: string; label: string; done: boolean; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      list.push({ key, label: d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2), done: !!habit.days[key], isToday: key === today });
    }
    return list;
  }, [habit.days, today]);
  const streak = useMemo(() => computeStreak(habit), [habit]);
  const doneWeek = weekDays.filter((x) => x.done).length;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant={habit.category === "islamic" ? "accent" : "secondary"} className="shrink-0">
              {habit.category === "islamic" ? t("habits.islamic") : t("habits.general")}
            </Badge>
            <p className="font-medium truncate">{habit.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {streak > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                <Flame className="h-4 w-4" /> {streak} {t("habits.daysDone", { n: streak, m: 1 }).split(" of ")[0]}
              </span>
            )}
            <button aria-label={t("common.delete")} onClick={onDelete} className="h-8 w-8 rounded-lg hover:bg-destructive/10 inline-flex items-center justify-center text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {weekDays.map((d) => (
              <button
                key={d.key}
                aria-label={d.label}
                onClick={() => onToggle(d.key)}
                className={cn(
                  "h-8 w-8 rounded-lg border text-[11px] font-medium transition",
                  d.done ? "border-success bg-success/15 text-success" : d.isToday ? "border-primary text-foreground" : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                {d.done ? "✓" : d.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{doneWeek}/7</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HabitsPage() {
  const { t } = useI18n();
  const { habits, addHabit, toggleHabit, deleteHabit } = useHabits();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"islamic" | "general">("islamic");
  const today = dayKey();
  const monthPrefix = today.slice(0, 7);
  const monthDone = habits.reduce((acc, h) => acc + Object.keys(h.days).filter((d) => d.startsWith(monthPrefix)).length, 0);

  const submit = () => {
    if (!name.trim()) return;
    addHabit(name.trim(), category);
    toast("success", "Habit added");
    setName("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-accent" /> {t("habits.title")}</CardTitle>
          <CardDescription>{t("habits.patience")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="rounded-xl bg-secondary/60 py-3">
              <p className="text-lg font-bold text-success">{habits.filter((h) => h.days[today]).length}/{habits.length}</p>
              <p className="text-[11px] text-muted-foreground">{t("habits.today")}</p>
            </div>
            <div className="rounded-xl bg-secondary/60 py-3">
              <p className="text-lg font-bold">{monthDone}</p>
              <p className="text-[11px] text-muted-foreground">{t("habits.monthly")}</p>
            </div>
            <div className="rounded-xl bg-secondary/60 py-3">
              <p className="text-lg font-bold">{habits.filter((h) => computeStreak(h) >= 7).length}</p>
              <p className="text-[11px] text-muted-foreground">{t("habits.streak")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input value={name} placeholder={t("habits.habitName")} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
            <Select value={category} onValueChange={(v) => setCategory(v as "islamic" | "general")}>
              <SelectTrigger className="w-32 shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="islamic">{t("habits.islamic")}</SelectItem>
                <SelectItem value="general">{t("habits.general")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={submit} className="shrink-0"><Plus className="h-4 w-4" /> {t("habits.addHabbit")}</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> {t("habits.weekly")}</h3>
      </div>

      {habits.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-sm text-muted-foreground">{t("habits.noHabits")}</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {habits.map((h) => (
            <HabitRow key={h.id} habit={h} onToggle={(d) => toggleHabit(h.id, d)} onDelete={() => deleteHabit(h.id)} />
          ))}
        </div>
      )}
    </div>
  );
}