"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { DUAS, DUA_CATEGORIES } from "@/lib/duas-data";
import type { DuaCategory } from "@/lib/duas-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStoredState } from "@/lib/use-stores";
import { STORE_KEYS } from "@/lib/storage";
import { Heart, HeartOff, Search, CheckCircle2, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";

function DuaCardView({ id, expanded, onToggleExpanded }: { id: string; expanded: boolean; onToggleExpanded: () => void }) {
  const { t, lang } = useI18n();
  const dua = DUAS.find((d) => d.id === id);
  const [favs, setFavs] = useStoredState<Record<string, boolean>>("duaFavorites", {});
  const [doneMap, setDoneMap] = useStoredState<Record<string, string>>(STORE_KEYS.duaCompleted, {});
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isFav = !!dua && !!favs[dua.id];
  const isDone = !!dua && doneMap[dua.id] === todayKey;
  if (!dua) return null;
  return (
    <Card className={cn(expanded && "border-primary/40")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold">{lang === "ur" && dua.titleUr ? dua.titleUr : dua.titleEn}</p>
            <p className="text-xs text-accent">{dua.reference}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              aria-label={t("common.favorite")}
              onClick={() => setFavs((prev) => ({ ...prev, [id]: !prev[id] }))}
              className="h-8 w-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center"
            >
              {isFav ? <Heart className="h-4 w-4 text-accent fill-accent" /> : <Heart className="h-4 w-4 text-muted-foreground" />}
            </button>
            <button
              aria-label={t("duas.markCompleted")}
              onClick={() => setDoneMap((prev) => ({ ...prev, [id]: isDone ? "" : todayKey }))}
              className={cn("h-8 w-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center", isDone && "text-success")}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button aria-label={t("common.open")} onClick={onToggleExpanded} className="h-8 w-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {!expanded ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{lang === "ur" && dua.ur ? dua.ur : dua.en}</p>
        ) : (
          <div className="space-y-3">
            <p dir="rtl" lang="ar" className="font-quran text-xl leading-loose text-start">{dua.arabic}</p>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("duas.transliteration")}</p>
              <p className="text-sm italic text-muted-foreground leading-relaxed" dir="ltr">{dua.transliteration}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{lang === "ur" && dua.ur ? dua.ur : dua.en}</p>
            <div className="flex flex-wrap gap-2">
              {dua.category.map((c) => {
                const cat = DUA_CATEGORIES.find((x) => x.key === c);
                return <Badge key={c} variant="secondary">{cat ? (lang === "ur" && cat.labelUr ? cat.labelUr : cat.labelEn) : c}</Badge>;
              })}
              <Badge variant="outline">{t("common.reference")}: {dua.reference}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DuasPage() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DuaCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState("all");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DUAS.filter((d) => {
      if (tab === "favorites") { /* filter via favs below */ }
      const matchCat = category === "all" || d.category.includes(category);
      const matchText =
        !q ||
        d.titleEn.toLowerCase().includes(q) ||
        d.titleUr.includes(q) ||
        d.en.toLowerCase().includes(q) ||
        d.ur.includes(q) ||
        d.transliteration.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [query, category, tab]);

  const favs = useStoredState<Record<string, boolean>>("duaFavorites", {})[0];
  const tabList = tab === "favorites" ? list.filter((d) => favs[d.id]) : list;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("duas.title")}</CardTitle>
          <CardDescription>{t("duas.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("duas.search")} className="ps-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <Button variant={category === "all" ? "default" : "outline"} size="sm" onClick={() => setCategory("all")}>
              {t("duas.all")}
            </Button>
            {DUA_CATEGORIES.map((c) => (
              <Button key={c.key} variant={category === c.key ? "default" : "outline"} size="sm" onClick={() => setCategory(c.key)}>
                {lang === "ur" && c.labelUr ? c.labelUr : c.labelEn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="all">{t("duas.all")}</TabsTrigger>
          <TabsTrigger value="favorites">{t("duas.favorites")}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {list.length === 0 ? (
            <Card><CardContent className="py-10 text-center"><p className="text-sm text-muted-foreground">{t("common.noResults")}</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {list.map((d) => (
                <DuaCardView key={d.id} id={d.id} expanded={expanded === d.id} onToggleExpanded={() => setExpanded(expanded === d.id ? null : d.id)} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="favorites">
          {tabList.length === 0 ? (
            <Card><CardContent className="py-10 text-center"><p className="text-sm text-muted-foreground">{t("duas.emptyFavorites")}</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {tabList.map((d) => (
                <DuaCardView key={d.id} id={d.id} expanded={expanded === d.id} onToggleExpanded={() => setExpanded(expanded === d.id ? null : d.id)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="py-3 text-center">
          <p className="text-xs text-muted-foreground">{t("duas.offlineIntro")}</p>
        </CardContent>
      </Card>
    </div>
  );
}