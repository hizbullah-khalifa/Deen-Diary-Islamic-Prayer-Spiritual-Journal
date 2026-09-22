"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useJournal, useGratitude } from "@/lib/use-stores";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/lib/toast";
import { dayKey } from "@/lib/storage";
import type { JournalEntry, Mood } from "@/lib/types";
import { formatDate } from "@/lib/date-utils";
import { Plus, Search, Trash2, Heart, Lock, LockOpen, CalendarDays, List, NotebookPen } from "lucide-react";
import { cn } from "@/lib/cn";

const MOODS: Mood[] = ["grateful", "peaceful", "happy", "tired", "anxious", "sad"];
const MOOD_EMOJI: Record<Mood, string> = {
  grateful: "🤲",
  peaceful: "😌",
  happy: "😊",
  tired: "😴",
  anxious: "😟",
  sad: "😢",
};

function emptyEntry(date: string): JournalEntry {
  return {
    id: `draft-${date}-${Date.now()}`,
    date,
    gratitude: "",
    prayerReflection: "",
    learned: "",
    thankfulToAllah: "",
    improveTomorrow: "",
    tags: [],
    favorite: false,
    private: false,
    updatedAt: 0,
  };
}

function EntryEditor({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const { t } = useI18n();
  const { saveEntry } = useJournal();
  const { toast } = useToast();
  const [draft, setDraft] = useState<JournalEntry>(entry);
  const [tagInput, setTagInput] = useState("");

  const save = () => {
    const payload = { ...draft, private: draft.private };
    saveEntry(payload);
    toast("success", "Journal saved");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("journal.new")} — {formatDate(draft.date)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("journal.prompts.gratitude")}</label>
            <Textarea value={draft.gratitude} onChange={(e) => setDraft({ ...draft, gratitude: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("journal.prompts.prayer")}</label>
            <Textarea value={draft.prayerReflection} onChange={(e) => setDraft({ ...draft, prayerReflection: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("journal.prompts.learned")}</label>
            <Textarea value={draft.learned} onChange={(e) => setDraft({ ...draft, learned: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("journal.prompts.thankful")}</label>
            <Textarea value={draft.thankfulToAllah} onChange={(e) => setDraft({ ...draft, thankfulToAllah: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("journal.prompts.improve")}</label>
            <Textarea value={draft.improveTomorrow} onChange={(e) => setDraft({ ...draft, improveTomorrow: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("journal.mood")}</label>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setDraft({ ...draft, mood: draft.mood === m ? undefined : m })}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm",
                    draft.mood === m ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
                  )}
                >
                  {MOOD_EMOJI[m]} {m}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t("journal.tags")}</label>
            <div className="flex gap-2 flex-wrap">
              {(draft.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setDraft({ ...draft, tags: draft.tags.filter((x) => x !== tag) })}>
                  #{tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                placeholder="Add tag…"
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    setDraft({ ...draft, tags: [...(draft.tags ?? []), tagInput.trim().toLowerCase()] });
                    setTagInput("");
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (tagInput.trim()) {
                    setDraft({ ...draft, tags: [...(draft.tags ?? []), tagInput.trim().toLowerCase()] });
                    setTagInput("");
                  }
                }}
              >
                {t("common.add")}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.favorite} onChange={(e) => setDraft({ ...draft, favorite: e.target.checked })} /> {t("journal.favorite")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.private} onChange={(e) => setDraft({ ...draft, private: e.target.checked })} /> {t("journal.privateNote")}
            </label>
          </div>
          <p className="text-xs text-muted-foreground">{t("journal.privateNoteHelp")}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={save}>{t("journal.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EntryRow({ entry, onEdit, onDelete }: { entry: JournalEntry; onEdit: () => void; onDelete: () => void }) {
  const { t } = useI18n();
  const preview = entry.gratitude || entry.prayerReflection || entry.learned || entry.thankfulToAllah || entry.improveTomorrow || "";
  const tags = entry.tags ?? [];
  return (
    <Card className="cursor-pointer hover:border-primary/40 transition" onClick={onEdit}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{formatDate(entry.date)}</span>
          <div className="flex items-center gap-1">
            {entry.mood && <span>{MOOD_EMOJI[entry.mood]}</span>}
            {entry.favorite && <Heart className="h-4 w-4 text-accent fill-accent" />}
            {entry.private ? <Lock className="h-3.5 w-3.5 text-muted-foreground" /> : <LockOpen className="h-3.5 w-3.5 text-muted-foreground/50" />}
            <button
              aria-label={t("common.delete")}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 w-8 rounded-lg hover:bg-destructive/10 inline-flex items-center justify-center text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-sm line-clamp-2 text-muted-foreground">{preview || t("common.none")}</p>
        {tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((x) => (
              <Badge key={x} variant="outline">#{x}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JournalCalendar({ entries, onOpenDate }: { entries: JournalEntry[]; onOpenDate: (date: string) => void }) {
  const { lang } = useI18n();
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = dayKey();
  const entryByDate = new Map(entries.map((e) => [e.date, e]));
  const weekLabels = useMemo(() => {
    const names = lang === "en" ? ["S", "M", "T", "W", "T", "F", "S"] : ["س", "پ", "م", "ب", "ج", "ہ", "س"];
    return Array.from({ length: 7 }, (_, i) => names[(i + 1) % 7]);
  }, [lang]);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground mb-2">
          {weekLabels.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const has = entryByDate.has(dateStr);
            const isToday = dateStr === today;
            return (
              <button
                key={d}
                onClick={() => onOpenDate(dateStr)}
                className={cn(
                  "aspect-square rounded-lg text-sm flex items-center justify-center relative",
                  isToday ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary",
                  has && !isToday && "bg-accent/15 text-foreground"
                )}
              >
                {d}
                {has && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 rtl:text-right">{lang === "ur" ? "تاریخ" : "Calendar — "}{new Date(year, month, 1).toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", { month: "long", year: "numeric" })}</p>
      </CardContent>
    </Card>
  );
}

export default function JournalPage() {
  const { t } = useI18n();
  const { entries, deleteEntry } = useJournal();
  const safeEntries = Array.isArray(entries) ? entries : [];
  const { items, addItem, removeItem } = useGratitude();
  const safeItems = Array.isArray(items) ? items : [];
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [editor, setEditor] = useState<JournalEntry | null>(null);
  const [gratText, setGratText] = useState("");
  const [tab, setTab] = useState("list");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return safeEntries
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((e) => (!favoritesOnly || e.favorite) && (!q || [e.gratitude, e.prayerReflection, e.learned, e.thankfulToAllah, e.improveTomorrow, ...(e.tags ?? [])].join(" ").toLowerCase().includes(q)));
  }, [safeEntries, search, favoritesOnly]);

  const openEdit = (date = dayKey()) => {
    const existing = safeEntries.find((e) => e.date === date);
    setEditor({ ...(existing ? { ...existing, id: existing.id } : emptyEntry(date)) });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><NotebookPen className="h-4 w-4 text-accent" /> {t("journal.gratitude")}</CardTitle>
          <CardDescription>{t("journal.gratitudeItems")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={gratText} placeholder={t("journal.gratitudePlaceholder")} onChange={(e) => setGratText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && gratText.trim()) { addItem(gratText); setGratText(""); } }} />
            <Button onClick={() => { addItem(gratText); setGratText(""); }}>{t("common.add")}</Button>
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

      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("journal.search")} className="ps-10" />
        </div>
        <Button size="sm" variant={favoritesOnly ? "default" : "outline"} onClick={() => setFavoritesOnly((v) => !v)}>
          <Heart className="h-4 w-4" />
          {t("journal.favorite")}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="list"><List className="h-4 w-4 me-1" />{t("journal.listView")}</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays className="h-4 w-4 me-1" />{t("journal.calendarView")}</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          {filtered.length === 0 ? (
            <Card><CardContent className="py-12 text-center space-y-2">
              <p className="text-sm text-muted-foreground">{t("journal.noEntries")}</p>
              <Button onClick={() => openEdit()} size="sm"><Plus className="h-4 w-4" /> {t("journal.new")}</Button>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((e) => (
                <EntryRow key={e.id} entry={e} onEdit={() => setEditor({ ...e })} onDelete={() => deleteEntry(e.id)} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="calendar">
          <JournalCalendar entries={safeEntries} onOpenDate={(d) => openEdit(d)} />
        </TabsContent>
      </Tabs>

      {editor && (
        <EntryEditor
          entry={editor}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}