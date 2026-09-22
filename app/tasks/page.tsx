"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useTasks } from "@/lib/use-stores";
import { useSettings } from "@/lib/settings-store";
import { usePrayerTimes } from "@/lib/use-prayer-times";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/lib/toast";
import { dayKey } from "@/lib/storage";
import type { Task, TaskPriority, TaskCategory } from "@/lib/types";
import { formatDate } from "@/lib/date-utils";
import { Plus, Trash2, CheckCircle2, Circle, Timer, Pause, Play, Briefcase, MoonStar, Sunrise, Sunset, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

const PRIORITIES: TaskPriority[] = ["high", "medium", "low"];
const CATEGORIES: TaskCategory[] = ["work", "study", "ibadah", "family", "health", "other"];

function PriorityBadge({ p }: { p: TaskPriority }) {
  const { t } = useI18n();
  const label = t(`tasks.priority${p.charAt(0).toUpperCase()}${p.slice(1)}` as never) as string;
  return (
    <Badge variant={p === "high" ? "accent" : p === "medium" ? "default" : "outline"} className="shrink-0">
      {label}
    </Badge>
  );
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5">
      <button aria-label={t("tasks.complete")} onClick={onToggle} className="shrink-0">
        {task.complete ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate", task.complete && "line-through text-muted-foreground")}>{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <PriorityBadge p={task.priority} />
          <span className="text-xs text-muted-foreground capitalize">{t(`tasks.cat${task.category.charAt(0).toUpperCase()}${task.category.slice(1)}` as never) as string}</span>
          {task.due && <span className="text-xs text-muted-foreground">· {task.due}</span>}
        </div>
      </div>
      <button aria-label={t("tasks.deleteTask")} onClick={onDelete} className="shrink-0 h-8 w-8 rounded-lg hover:bg-destructive/10 inline-flex items-center justify-center text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddTaskForm({ defaultDue, onDone }: { defaultDue?: string; onDone?: () => void }) {
  const { t } = useI18n();
  const { addTask } = useTasks();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<TaskCategory>("other");
  const [due, setDue] = useState(defaultDue || "");
  const [reminder, setReminder] = useState(false);

  const submit = () => {
    const clean = title.trim();
    if (!clean) return;
    addTask({ title: clean, date: dayKey(), priority, category, due: due || undefined, reminder, complete: false });
    toast("success", "Task added");
    setTitle("");
    setDue(defaultDue || "");
    setReminder(false);
    onDone?.();
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Input value={title} placeholder={t("tasks.taskTitle")} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{t(`tasks.priority${p.charAt(0).toUpperCase()}${p.slice(1)}` as never) as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{t(`tasks.cat${c.charAt(0).toUpperCase()}${c.slice(1)}` as never) as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="time" value={due} onChange={(e) => setDue(e.target.value)} className="h-9" />
          <Button onClick={submit} className="h-9"><Plus className="h-4 w-4" /> {t("tasks.addTask")}</Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={reminder} onCheckedChange={setReminder} />
          <span>{t("tasks.reminder")}</span>
        </div>
      </CardContent>
    </Card>
  );
}

const PRAYER_ICONS: Record<string, any> = {
  fajr: MoonStar,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: MoonStar,
};

function PlannerBlock({ prayerKey, title, tasks, onToggle, onDelete }: {
  prayerKey: string;
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = PRAYER_ICONS[prayerKey] || Briefcase;
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary/60 text-sm font-medium">
        <Icon className="h-4 w-4 text-accent" />
        {title}
        <span className="ms-auto text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="p-2 space-y-1.5">
        {tasks.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1">{title} — plan something meaningful.</p>}
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={() => onToggle(task.id)} onDelete={() => onDelete(task.id)} />
        ))}
      </div>
    </div>
  );
}

function FocusTimer() {
  const { t } = useI18n();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSessions(Number(localStorage.getItem("dd:focusSessions") || 0));
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dd:focusSessions", String(sessions));
    }
  }, [sessions]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          setSessions((x) => x + 1);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(t("tasks.focusDone"));
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, t]);
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Timer className="h-4 w-4 text-accent" /> {t("tasks.focus")} · {t("tasks.pomodoro")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-5xl font-bold tabular-nums">{fmt}</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={() => { setRunning((r) => !r); }}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? t("tasks.pause") : t("tasks.startFocus")}
          </Button>
          <Button variant="outline" onClick={() => { setRunning(false); setSeconds(25 * 60); }}>
            {t("common.reset")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">{sessions} {t("tasks.focusDone")}</p>
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { times } = usePrayerTimes();
  const { tasks, toggleTask, deleteTask } = useTasks();
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const today = dayKey();
  const [tab, setTab] = useState("today");
  const [classDate, setClassDate] = useState(today);

  const todays = useMemo(() => safeTasks.filter((x) => x.date === today), [safeTasks, today]);
  const completed = todays.filter((x) => x.complete).length;

  const blocks = useMemo(() => {
    const keys = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
    const t0 = times
      ? { fajr: times.fajr, dhuhr: times.dhuhr, asr: times.asr, maghrib: times.maghrib, isha: times.isha }
      : { fajr: "04:40", dhuhr: "12:20", asr: "15:45", maghrib: "18:10", isha: "19:35" };
    const toMin = (x: string) => Number(x.split(":")[0]) * 60 + Number(x.split(":")[1]);
    return keys.map((k, i) => {
      const start = toMin(t0[k]);
      const end = i < keys.length - 1 ? toMin(t0[keys[i + 1]]) : 1440;
      const inBlock = todays.filter((task) => {
        if (!task.due) return false;
        const m = toMin(task.due);
        return m >= start && m < end;
      });
      return { key: k, tasks: inBlock };
    });
  }, [todays, times]);

  const unplanned = todays.filter((task) => !task.due);
  const upcoming = todays.filter((t0) => t0.due).sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  const allDates = useMemo(() => Array.from(new Set(safeTasks.map((x) => x.date))).sort().reverse(), [safeTasks]);
  const classTasks = safeTasks.filter((x) => x.date === classDate);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-accent" /> {t("tasks.title")}</CardTitle>
          <CardDescription>{t("tasks.prayerDayBlurb")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-muted-foreground">{t("common.today")} — {t("dashboard.prayersCompleted", { n: completed, m: Math.max(1, todays.length) })}</span>
            <span className="font-semibold">{todays.length}</span>
          </div>
          <AddTaskForm />
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full sm:w-72">
          <TabsTrigger value="today">{t("tasks.today")}</TabsTrigger>
          <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3 items-start">
              <div className="space-y-3">
                <PlannerBlock prayerKey="fajr" title={`${t("tasks.afterFajr")} — ${times?.fajr || "—"}`} tasks={blocks[0].tasks} onToggle={toggleTask} onDelete={deleteTask} />
                <PlannerBlock prayerKey="dhuhr" title={`${t("tasks.afterDhuhr")} — ${times?.dhuhr || "—"}`} tasks={blocks[1].tasks} onToggle={toggleTask} onDelete={deleteTask} />
                <PlannerBlock prayerKey="asr" title={`${t("tasks.afterAsr")} — ${times?.asr || "—"}`} tasks={blocks[2].tasks} onToggle={toggleTask} onDelete={deleteTask} />
                <PlannerBlock prayerKey="maghrib" title={`${t("tasks.afterMaghrib")} — ${times?.maghrib || "—"}`} tasks={blocks[3].tasks} onToggle={toggleTask} onDelete={deleteTask} />
                <PlannerBlock prayerKey="isha" title={`${t("tasks.afterIsha")} — ${times?.isha || "—"}`} tasks={blocks[4].tasks} onToggle={toggleTask} onDelete={deleteTask} />
              </div>
              <div className="space-y-4">
                <FocusTimer />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t("tasks.planning")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {upcoming.length === 0 && <p className="text-sm text-muted-foreground">{t("tasks.noTasks")}</p>}
                    {upcoming.map((task) => (
                      <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
                    ))}
                    {unplanned.length > 0 && (
                      <>
                        <p className="text-sm font-medium pt-1">{t("common.none")} · No time block</p>
                        {unplanned.map((task) => (
                          <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="all">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {allDates.slice(0, 14).map((d) => (
                <Button key={d} variant={classDate === d ? "default" : "outline"} size="sm" onClick={() => setClassDate(d)}>
                  {d === today ? t("common.today") : formatDate(d)}
                </Button>
              ))}
            </div>
            {classTasks.length === 0 ? (
              <Card><CardContent className="py-10 text-center"><p className="text-sm text-muted-foreground">{t("tasks.noTasks")}</p></CardContent></Card>
            ) : (
              classTasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}