"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-store";
import { PAKISTAN_CITIES } from "@/lib/cities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/lib/toast";
import { downloadData, clearEverything, wipeAndReimport, readUploadedFile } from "@/lib/export-data";
import type { PrayerKey } from "@/lib/types";
import { Moon, Sun, Monitor, Globe, MapPin, MoonStar, HeartHandshake, Settings2, Loader2, Download, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

const PRAYER_ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const LEAD_OPTIONS = [5, 10, 15, 20, 30];
const TRANSLATION_OPTIONS = [
  { slug: "en.sahih", label: "English — Saheeh International" },
  { slug: "ur.jalandhry", label: "اردو — جالندھری" },
];
const RECITER_OPTIONS = [
  { id: 7, label: "Mishary Rashid Alafasy" },
  { id: 3, label: "Abdul Basit" },
  { id: 2, label: "Saud Al-Shuraim" },
  { id: 4, label: "Abdur Rahman As-Sudais" },
];

function Row({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {help && <p className="text-xs text-muted-foreground">{help}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function playTestSound(volume: number) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    /* audio unavailable */
  }
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { settings, setSettings, setTheme, setLang } = useSettings();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [testPlaying, setTestPlaying] = useState(false);
  const [tab, setTab] = useState("appearance");

  const requestPermission = async () => {
    if (typeof Notification === "undefined") {
      toast("error", t("settings.adhanSettings.permissionDeniedMsg"));
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") toast("success", t("settings.adhanSettings.permissionGranted"));
    else toast("error", t("settings.adhanSettings.permissionDeniedMsg"));
  };

  const onExport = () => {
    downloadData("deen-diary-backup");
    toast("success", t("settings.privacySettings.exportData"));
  };

  const onImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    readUploadedFile(file)
      .then((data) => {
        wipeAndReimport(data);
        toast("success", t("settings.privacySettings.importSuccess"));
      })
      .catch(() => toast("error", t("settings.privacySettings.importHelp")))
      .finally(() => setImporting(false));
  };

  const onClear = () => {
    if (!window.confirm(`${t("settings.privacySettings.clearConfirmTitle")}\n\n${t("settings.privacySettings.clearConfirmBody")}`)) return;
    setClearing(true);
    clearEverything();
    toast("success", t("settings.privacySettings.cleared"));
    setTimeout(() => setClearing(false), 400);
  };

  const setNotifTarget = (key: keyof typeof settings.notifications.targets, patch: Partial<typeof settings.notifications.targets["quran"]>) => {
    setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, targets: { ...prev.notifications.targets, [key]: { ...prev.notifications.targets[key], ...patch } } } }));
  };

  const setPrayerPref = (key: PrayerKey, patch: Partial<typeof settings.notifications.prayers["fajr"]>) => {
    setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, prayers: { ...prev.notifications.prayers, [key]: { ...prev.notifications.prayers[key], ...patch } } } }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-accent" /> {t("settings.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-transparent p-0">
              {[
                ["appearance", t("settings.appearance")],
                ["prayer", t("settings.prayer")],
                ["notifications", t("settings.notifications")],
                ["adhan", t("settings.adhan")],
                ["quran", t("settings.quran")],
                ["audio", t("settings.audio")],
                ["privacy", t("settings.privacy")],
                ["calendar", t("settings.calendar")],
                ["location", t("settings.location")],
                ["about", t("settings.about")],
              ].map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="border rounded-full px-3 py-1.5 text-xs">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="appearance" className="space-y-4 pt-4">
              <div>
                <p className="text-sm font-medium mb-2">{t("settings.theme")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((th) => (
                    <Button key={th} variant={settings.theme === th ? "default" : "outline"} className="flex-col gap-1 py-3 h-auto" onClick={() => setTheme(th)}>
                      {th === "light" ? <Sun className="h-4 w-4" /> : th === "dark" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                      {t(`settings.${th}`)}
                    </Button>
                  ))}
                </div>
              </div>
              <Row label={t("settings.largeText")} help={t("settings.appearance")}>
                <Switch checked={settings.largeText} onCheckedChange={(v) => setSettings((p) => ({ ...p, largeText: v }))} />
              </Row>
              <div>
                <p className="text-sm font-medium mb-2">{t("settings.language")}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={settings.lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}><Globe className="h-4 w-4" /> {t("settings.english")}</Button>
                  <Button variant={settings.lang === "ur" ? "default" : "outline"} onClick={() => setLang("ur")}><Globe className="h-4 w-4" /> {t("settings.urdu")}</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prayer" className="space-y-1 pt-4">
              <Row label={t("prayer.calculationMethod")}>
                <Select value={String(settings.prayer.method)} onValueChange={(v) => setSettings((p) => ({ ...p, prayer: { ...p.prayer, method: Number(v) } }))}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("prayer.methodKarachi")}</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("prayer.juristicSchool")}>
                <Select value={String(settings.prayer.school)} onValueChange={(v) => setSettings((p) => ({ ...p, prayer: { ...p.prayer, school: Number(v) } }))}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t("prayer.schoolShafi")}</SelectItem>
                    <SelectItem value="1">{t("prayer.schoolHanafi")}</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("prayer.highLatitude")}>
                <Select value={String(settings.prayer.highLatRule)} onValueChange={(v) => setSettings((p) => ({ ...p, prayer: { ...p.prayer, highLatRule: Number(v) } }))}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t("prayer.latNone")}</SelectItem>
                    <SelectItem value="1">{t("prayer.latAngle")}</SelectItem>
                    <SelectItem value="2">{t("prayer.latMiddle")}</SelectItem>
                    <SelectItem value="3">{t("prayer.latSeventh")}</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <div className="pt-2 text-xs text-muted-foreground">{t("prayer.adjustments")}</div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 pt-4">
              <div>
                <p className="text-sm font-medium mb-2">{t("settings.notifPrefs.title")}</p>
                <div className="rounded-xl border border-border divide-y divide-border/60">
                  {PRAYER_ORDER.map((k) => {
                    const pref = settings.notifications.prayers[k];
                    return (
                      <div key={k} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={pref.enabled} onCheckedChange={(v) => setPrayerPref(k, { enabled: v })} />
                          <span className="text-sm">{t(`prayer.${k}`)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={String(pref.leadMinutes)} onValueChange={(v) => setPrayerPref(k, { leadMinutes: Number(v) })} disabled={!pref.enabled}>
                            <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {LEAD_OPTIONS.map((m) => <SelectItem key={m} value={String(m)}>{m}m</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Switch checked={pref.sound} onCheckedChange={(v) => setPrayerPref(k, { sound: v })} disabled={!pref.enabled} aria-label={t("settings.notifPrefs.sound")} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-xl border border-border divide-y divide-border/60">
                {(["quran", "dhikr", "dua", "tasks", "habits", "journal", "morning", "evening", "sleep"] as const).map((k) => {
                  const pref = settings.notifications.targets[k];
                  return (
                    <div key={k} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Switch checked={pref.enabled} onCheckedChange={(v) => setNotifTarget(k, { enabled: v })} />
                        <span className="text-sm">{t(`settings.notifPrefs.${k}`)}</span>
                      </div>
                      {k !== "morning" && k !== "evening" && k !== "sleep" ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Input type="time" value={pref.time} disabled={!pref.enabled} className="h-8 w-32 text-xs" onChange={(e) => setNotifTarget(k, { time: e.target.value })} />
                      )}
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" onClick={requestPermission} className="w-full">{t("settings.adhanSettings.permissionBtn")}</Button>
              <p className="text-xs text-muted-foreground">{t("settings.adhanSettings.limitation")}</p>
            </TabsContent>

            <TabsContent value="adhan" className="space-y-1 pt-4">
              <Row label={t("settings.adhanSettings.style")}>
                <Select value={settings.adhan.style} onValueChange={(v) => setSettings((p) => ({ ...p, adhan: { ...p.adhan, style: v as typeof p.adhan.style } }))}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">{t("settings.adhanSettings.short")}</SelectItem>
                    <SelectItem value="silent">{t("settings.adhanSettings.silent")}</SelectItem>
                    <SelectItem value="custom">{t("settings.adhanSettings.custom")}</SelectItem>
                    <SelectItem value="full" disabled>{t("settings.adhanSettings.full")}</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.adhanSettings.vibrate")}>
                <Switch checked={settings.adhan.vibrate} onCheckedChange={(v) => setSettings((p) => ({ ...p, adhan: { ...p.adhan, vibrate: v } }))} />
              </Row>
              <Row label={t("settings.audioSettings.volume")}>
                <div className="w-40">
                  <Slider value={[settings.adhan.volume * 100]} min={0} max={100} step={1} onValueChange={(v) => setSettings((p) => ({ ...p, adhan: { ...p.adhan, volume: v[0] / 100 } }))} />
                </div>
              </Row>
              <p className="pt-2 text-xs text-muted-foreground">{t("settings.adhanSettings.attachLimitation")}</p>
            </TabsContent>

            <TabsContent value="quran" className="space-y-1 pt-4">
              <Row label={t("settings.quranSettings.translation")}>
                <Select value={settings.quran.translationSlug} onValueChange={(v) => setSettings((p) => ({ ...p, quran: { ...p.quran, translationSlug: v } }))}>
                  <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRANSLATION_OPTIONS.map((o) => <SelectItem key={o.slug} value={o.slug}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.quranSettings.reciter")}>
                <Select value={String(settings.quran.reciterId)} onValueChange={(v) => setSettings((p) => ({ ...p, quran: { ...p.quran, reciterId: Number(v) } }))}>
                  <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RECITER_OPTIONS.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
              <Row label={t("settings.quranSettings.dailyPages")}>
                <Select value={String(settings.quran.dailyPages)} onValueChange={(v) => setSettings((p) => ({ ...p, quran: { ...p.quran, dailyPages: Number(v) } }))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 10].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
            </TabsContent>

            <TabsContent value="audio" className="space-y-1 pt-4">
              <Row label={t("settings.audioSettings.volume")}>
                <div className="w-40">
                  <Slider value={[settings.audio.volume * 100]} min={0} max={100} step={1} onValueChange={(v) => setSettings((p) => ({ ...p, audio: { ...p.audio, volume: v[0] / 100 } }))} />
                </div>
              </Row>
              <Row label={t("settings.audioSettings.vibrate")}>
                <Switch checked={settings.audio.vibrate} onCheckedChange={(v) => setSettings((p) => ({ ...p, audio: { ...p.audio, vibrate: v } }))} />
              </Row>
              <Row label={t("settings.audioSettings.test")}>
                <Button variant="outline" onClick={() => { setTestPlaying(true); playTestSound(settings.audio.volume); setTimeout(() => setTestPlaying(false), 500); }} disabled={testPlaying}>
                  {testPlaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
                  {testPlaying ? t("settings.audioSettings.playing") : t("settings.audioSettings.test")}
                </Button>
              </Row>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-1 pt-4">
              <Row label={t("settings.privacySettings.localOnly")} help={t("settings.privacySettings.localOnlyHelp")}>
                <Switch checked={settings.privacy.localOnly} onCheckedChange={(v) => setSettings((p) => ({ ...p, privacy: { ...p.privacy, localOnly: v } }))} />
              </Row>
              <div className="pt-3 space-y-3">
                <div>
                  <p className="text-sm font-medium">{t("settings.privacySettings.exportData")}</p>
                  <p className="text-xs text-muted-foreground pb-1">{t("settings.privacySettings.exportHelp")}</p>
                  <Button variant="outline" onClick={onExport}><Download className="h-4 w-4" /> {t("settings.privacySettings.exportData")}</Button>
                </div>
                <div>
                  <p className="text-sm font-medium">{t("settings.privacySettings.importData")}</p>
                  <p className="text-xs text-muted-foreground pb-1">{t("settings.privacySettings.importHelp")}</p>
                  <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
                  <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
                    {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {t("settings.privacySettings.importData")}
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">{t("settings.privacySettings.clearAll")}</p>
                  <p className="text-xs text-muted-foreground pb-1">{t("settings.privacySettings.clearHelp")}</p>
                  <Button variant="destructive" onClick={onClear} disabled={clearing}>
                    <Trash2 className="h-4 w-4" /> {t("settings.privacySettings.clearAll")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-1 pt-4">
              <Row label={t("settings.calendarSettings.showMawlid")}>
                <Switch checked={settings.calendar.showMawlid} onCheckedChange={(v) => setSettings((p) => ({ ...p, calendar: { ...p.calendar, showMawlid: v } }))} />
              </Row>
              <Row label={t("settings.calendarSettings.showAshura")}>
                <Switch checked={settings.calendar.showAshura} onCheckedChange={(v) => setSettings((p) => ({ ...p, calendar: { ...p.calendar, showAshura: v } }))} />
              </Row>
              <Row label={t("settings.calendarSettings.moonSighting")}>
                <Switch checked={settings.calendar.moonSighting} onCheckedChange={(v) => setSettings((p) => ({ ...p, calendar: { ...p.calendar, moonSighting: v } }))} />
              </Row>
            </TabsContent>

            <TabsContent value="location" className="space-y-1 pt-4">
              <Row label={t("prayer.selectCity")}>
                <Select value={settings.location.type === "city" ? settings.location.cityId || "karachi" : "custom"} onValueChange={(v) => setSettings((p) => ({ ...p, location: v === "custom" ? { type: "custom", ...(p.location.type === "custom" ? { lat: p.location.lat, lng: p.location.lng } : {}) } : { type: "city", cityId: v } }))}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">{t("settings.locationSettings.customCoordinates")}</SelectItem>
                    {PAKISTAN_CITIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
              {settings.location.type === "custom" && (
                <div className="grid grid-cols-2 gap-2 py-2">
                  <div>
                    <Label className="text-xs">{t("settings.locationSettings.customLat")}</Label>
                    <Input type="number" value={settings.location.lat ?? ""} onChange={(e) => setSettings((p) => ({ ...p, location: { ...p.location, lat: Number(e.target.value) } }))} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("settings.locationSettings.customLng")}</Label>
                    <Input type="number" value={settings.location.lng ?? ""} onChange={(e) => setSettings((p) => ({ ...p, location: { ...p.location, lng: Number(e.target.value) } }))} />
                  </div>
                </div>
              )}
              <Row label={t("settings.locationSettings.locate")}>
                <Button variant="outline" size="sm"
                  onClick={() => {
                    if (!navigator.geolocation) { toast("error", t("prayer.locationFailed")); return; }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setSettings((p) => ({ ...p, location: { type: "custom", lat: pos.coords.latitude, lng: pos.coords.longitude, labelEn: t("settings.locationSettings.locate"), labelUr: "میرا مقام" } })),
                      () => toast("error", t("prayer.locationDenied")),
                      { enableHighAccuracy: true, timeout: 12000 }
                    );
                  }}
                >
                  <MapPin className="h-4 w-4" /> {t("prayer.useMyLocation")}
                </Button>
              </Row>
            </TabsContent>

            <TabsContent value="about" className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center"><MoonStar className="h-6 w-6" /></div>
                <div>
                  <p className="font-semibold">Deen Diary</p>
                  <p className="text-xs text-muted-foreground">v1.0.0 · 2026</p>
                </div>
              </div>
              <p className={cn("text-sm text-muted-foreground", settings.lang === "ur" && "text-right")}>
                Deen Diary is an offline-first companion for prayer, Qur'an reading, dhikr, journaling and Ramadan tracking. Your data never leaves this device.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}