"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-store";
import { usePrayerTimes } from "@/lib/use-prayer-times";
import { computeCurrentAndNext } from "@/lib/prayer";
import { PAKISTAN_CITIES, getCity } from "@/lib/cities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/toast";
import { formatTime, prayerNameKey } from "@/lib/date-utils";
import type { PrayerKey, PrayerTune } from "@/lib/types";
import { RefreshCw, Navigation, MapPin, Clock, Sunrise, Sunset, MoonStar } from "lucide-react";
import { cn } from "@/lib/cn";

const TUNE_KEYS: Array<{ key: keyof PrayerTune; labelKey: string }> = [
  { key: "fajr", labelKey: "prayer.fajr" },
  { key: "sunrise", labelKey: "prayer.sunrise" },
  { key: "dhuhr", labelKey: "prayer.dhuhr" },
  { key: "asr", labelKey: "prayer.asr" },
  { key: "maghrib", labelKey: "prayer.maghrib" },
  { key: "isha", labelKey: "prayer.isha" },
];

export default function PrayerTimesPage() {
  const { t, lang } = useI18n();
  const { settings, setSettings } = useSettings();
  const { times, status, refresh } = usePrayerTimes();
  const { toast } = useToast();
  const [locating, setLocating] = useState(false);

  const coordsLabel = useMemo(() => {
    const loc = settings.location;
    return loc.type === "custom"
      ? loc.labelEn || `${Number(loc.lat).toFixed(2)}, ${Number(loc.lng).toFixed(2)}`
      : getCity(loc.cityId).nameEn;
  }, [settings.location]);

  const info = useMemo(() => (times ? computeCurrentAndNext(times) : null), [times]);

  const setCity = (cityId: string) => {
    setSettings((prev) => ({ ...prev, location: { type: "city", cityId } }));
  };

  const selectedCity = settings.location.type === "city" ? settings.location.cityId : undefined;

  const useMyLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast("error", t("prayer.locationFailed"));
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings((prev) => ({
          ...prev,
          location: {
            type: "custom",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            labelEn: lang === "ur" ? "میرا موجودہ مقام" : "My current location",
            labelUr: "میرا موجودہ مقام",
          },
        }));
        toast("success", t("prayer.usesYourLocation"));
        setLocating(false);
      },
      () => {
        toast("error", t("prayer.locationDenied"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const setTune = (key: keyof PrayerTune, val: string) => {
    const n = Number(val);
    const tune = { ...settings.prayer.tune, [key]: Number.isNaN(n) ? undefined : n };
    setSettings((prev) => ({ ...prev, prayer: { ...prev.prayer, tune } }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-2">
          <div>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> {t("prayer.selectCity")}</CardTitle>
            <CardDescription>{t("prayer.country")}: {t("prayer.pakistan")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
            <Navigation className="h-4 w-4" />
            {locating ? t("prayer.locating") : t("prayer.useMyLocation")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("prayer.selectCity")}</Label>
              <Select value={selectedCity} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder={t("prayer.selectCity")} />
                </SelectTrigger>
                <SelectContent>
                  {PAKISTAN_CITIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span dir="auto">{lang === "ur" && c.nameUr ? c.nameUr : c.nameEn}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("prayer.calculationMethod")}</Label>
              <Select value={String(settings.prayer.method)} onValueChange={(v) => setSettings((prev) => ({ ...prev, prayer: { ...prev.prayer, method: Number(v) } }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("prayer.methodKarachi")}</SelectItem>
                  <SelectItem value="2">ISNA (America)</SelectItem>
                  <SelectItem value="3">{lang === "ur" ? "مکہ مکرمہ" : "Umm al-Qura, Makkah"}</SelectItem>
                  <SelectItem value="4">Moonsighting Committee</SelectItem>
                  <SelectItem value="5">Egyptian General Authority</SelectItem>
                  <SelectItem value="8">Gulf Region</SelectItem>
                  <SelectItem value="9">Kuwait</SelectItem>
                  <SelectItem value="10">Qatar</SelectItem>
                  <SelectItem value="15">Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("prayer.juristicSchool")}</Label>
              <Select value={String(settings.prayer.school)} onValueChange={(v) => setSettings((prev) => ({ ...prev, prayer: { ...prev.prayer, school: Number(v) } }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("prayer.schoolShafi")}</SelectItem>
                  <SelectItem value="1">{t("prayer.schoolHanafi")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("prayer.highLatitude")}</Label>
              <Select value={String(settings.prayer.highLatRule)} onValueChange={(v) => setSettings((prev) => ({ ...prev, prayer: { ...prev.prayer, highLatRule: Number(v) } }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("prayer.latNone")}</SelectItem>
                  <SelectItem value="1">{t("prayer.latMiddle")}</SelectItem>
                  <SelectItem value="2">{t("prayer.latSeventh")}</SelectItem>
                  <SelectItem value="3">{t("prayer.latAngle")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
            <span className="text-sm text-muted-foreground">{coordsLabel}</span>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={status === "loading"}>
              <RefreshCw className={cn("h-4 w-4", status === "loading" && "animate-spin")} />
              {status === "loading" ? t("prayer.refreshing") : t("prayer.refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("prayer.adjustments")}</CardTitle>
          <CardDescription>{t("prayer.timeAdjustmentNote")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TUNE_KEYS.map(({ key, labelKey }) => (
            <div key={key} className="space-y-1.5">
              <Label>{t(labelKey)}</Label>
              <Input
                type="number"
                value={settings.prayer.tune[key] ?? 0}
                onChange={(e) => setTune(key, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> {t("prayer.todayTable")}</CardTitle>
          {status === "stale" && <Badge variant="outline">{t("common.offline")}</Badge>}
        </CardHeader>
        <CardContent className="space-y-2">
          {status === "loading" && !times ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : times ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                <Sunrise className="h-4 w-4 text-accent" />
                <span>{t("prayer.imsak")}: <b className="text-foreground">{formatTime(times.imsak)}</b></span>
              </div>
              {(Object.keys(times).filter((k) => ["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(k)) as PrayerKey[]).map((k) => {
                const active = info?.next === k || info?.current === k;
                return (
                  <div key={k} className={cn("flex items-center justify-between rounded-xl border px-4 py-3", active ? "border-primary/50 bg-primary/5" : "border-border")}>
                    <div className="flex items-center gap-3">
                      {k === "fajr" || k === "dhuhr" ? <Sunrise className="h-4 w-4 text-accent" /> : <Sunset className="h-4 w-4 text-accent" />}
                      <span className="capitalize font-medium">{t(`prayer.${prayerNameKey(k)}`)}</span>
                      {info?.next === k && <Badge>{t("dashboard.nextPrayer")}</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">{formatTime(times[k])}</span>
                      <span className="text-xs text-muted-foreground tabular-nums w-14 text-end">
                        {settings.prayer.tune[k] ? (settings.prayer.tune[k]! > 0 ? `+${settings.prayer.tune[k]}` : settings.prayer.tune[k]) : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                {[
                  { label: t("prayer.sunrise"), value: times.sunrise, icon: <Sunrise className="h-4 w-4 text-accent" /> },
                  { label: t("prayer.midnight"), value: times.midnight, icon: <MoonStar className="h-4 w-4 text-accent" /> },
                  { label: t("prayer.lastThird"), value: times.lastThird, icon: <MoonStar className="h-4 w-4 text-accent" /> },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">{row.icon}{row.label}</span>
                    <span className="font-semibold tabular-nums text-sm">{formatTime(row.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-sm text-muted-foreground">{t("errors.fetchFailed")}</p>
              <Button size="sm" onClick={refresh}>{t("common.retry")}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}