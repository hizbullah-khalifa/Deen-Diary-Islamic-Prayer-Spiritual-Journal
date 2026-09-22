"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useTasbih } from "@/lib/use-stores";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/toast";
import { playChime, vibrate } from "@/lib/audio";
import { RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const DZIKR_LABEL: Record<string, string> = {
  subhanAllah: "سُبْحَانَ الله",
  alhamdulillah: "الْحَمْدُ لِله",
  allahuAkbar: "اللهُ أَكْبَر",
};

export default function TasbihPage() {
  const { t } = useI18n();
  const { state, setTarget, setDhikr, increment, reset } = useTasbih();
  const { toast } = useToast();
  const [vibrateOn, setVibrateOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  const label = DZIKR_LABEL[state.dhikr] || state.custom || t("common.custom");
  const progress = Math.min(100, (state.current / Math.max(1, state.target)) * 100);

  const tap = () => {
    const next = state.current + 1 >= state.target ? 0 : state.current + 1;
    increment();
    if (soundOn) playChime();
    if (vibrateOn) vibrate(30);
    if (next === 0 && state.current > 0) {
      toast("success", t("tasbih.reached"));
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("tasbih.presets")}</span>
            <div className="flex items-center gap-2">
              {[33, 99, 100, 500, 1000].map((n) => (
                <Button key={n} variant={state.target === n ? "default" : "outline"} size="sm" onClick={() => setTarget(n)}>
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DZIKR_LABEL).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setDhikr(key as "subhanAllah" | "alhamdulillah" | "allahuAkbar")}
                className={cn(
                  "rounded-xl border py-2.5 px-2 text-sm font-medium transition",
                  state.dhikr === key ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-secondary"
                )}
                dir="rtl"
                lang="ar"
              >
                {val}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={state.custom || ""}
              placeholder={t("tasbih.customLabel")}
              onChange={(e) => setDhikr("custom", e.target.value)}
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="islamic-pattern">
        <CardContent className="p-8 flex flex-col items-center">
          <p dir="rtl" lang="ar" className="font-quran text-2xl mb-2">{label}</p>
          <p className="text-xs text-muted-foreground mb-6">{t("tasbih.progress")}: {Math.round(progress)}%</p>
          <button
            onClick={tap}
            aria-label={t("tasbih.tap")}
            className="tasbih-tap relative h-56 w-56 rounded-full bg-primary text-primary-foreground shadow-xl inline-flex items-center justify-center"
          >
            <span className="absolute inset-3 rounded-full border border-primary-foreground/25" />
            <span className="flex flex-col items-center gap-1">
              <span className="text-6xl font-bold tabular-nums">{state.current}</span>
              <span className="text-sm opacity-80">/ {state.target}</span>
            </span>
          </button>
          <Button variant="ghost" size="sm" className="mt-6" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            {t("tasbih.reset")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> {t("tasbih.vibration")}</Label>
            <Switch checked={vibrateOn} onCheckedChange={setVibrateOn} />
          </div>
          <div className="flex items-center justify-between">
            <Label>{t("tasbih.sound")}</Label>
            <Switch checked={soundOn} onCheckedChange={setSoundOn} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}