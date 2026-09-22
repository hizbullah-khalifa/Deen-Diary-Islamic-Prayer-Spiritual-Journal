"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-store";
import { getCity } from "@/lib/cities";
import { qiblaBearing, directionLabel } from "@/lib/qibla";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast";
import { MapPin, Navigation, Compass, Star } from "lucide-react";

export default function QiblaPage() {
  const { t, lang } = useI18n();
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();
  const [heading, setHeading] = useState<number | null>(null);
  const [support, setSupport] = useState<boolean | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof DeviceOrientationEvent !== "undefined") {
      setSupport(true);
      const handler = (e: DeviceOrientationEvent) => {
        const we = e as unknown as { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
        if (we.webkitCompassHeading != null) {
          setHeading(360 - we.webkitCompassHeading);
        } else if (e.alpha != null) {
          setHeading((360 - e.alpha) % 360);
        }
      };
      window.addEventListener("deviceorientation", handler);
      return () => window.removeEventListener("deviceorientation", handler);
    }
    setSupport(false);
  }, []);

  const loc = useMemo(() => {
    const l = settings.location;
    if (l.type === "custom" && l.lat !== undefined && l.lng !== undefined) {
      return { lat: l.lat, lng: l.lng, label: lang === "ur" ? (l.labelUr || "میرا مقام") : (l.labelEn || "My location") };
    }
    const city = getCity(l.cityId);
    return { lat: city.lat, lng: city.lng, label: lang === "ur" ? city.nameUr : city.nameEn };
  }, [settings.location, lang]);

  const bearing = useMemo(() => qiblaBearing(loc.lat, loc.lng), [loc.lat, loc.lng]);
  const rotation = heading != null ? (bearing - heading + 360) % 360 : null;

  const useMyLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast("error", t("qibla.unavailable"));
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings((prev) => ({ ...prev, location: { type: "custom", lat: pos.coords.latitude, lng: pos.coords.longitude, labelEn: t("qibla.location"), labelUr: "میرا مقام" } }));
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

  return (
    <div className="space-y-4">
      <Card className="text-center islamic-pattern">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2"><Compass className="h-4 w-4 text-accent" /> {t("qibla.title")}</CardTitle>
          <CardDescription>{t("qibla.instructions")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative h-72 w-72">
            <div className="absolute inset-0 rounded-full border-8 border-secondary" />
            <div className="absolute inset-0 rounded-full border border-dashed border-muted-foreground/40" style={{ transform: `rotate(${rotation ?? 0}deg)` }}>
              <div className="absolute left-1/2 top-0 -translate-x-1/2 h-8 w-1.5 rounded-full bg-destructive" />
            </div>
            <div
              className="absolute inset-8 rounded-full border border-accent/40"
            >
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 h-10 w-2 rounded-full bg-accent"
                style={{ transform: `rotate(${rotation ?? bearing}deg) translateY(${rotation == null ? 0 : 18}px)` }}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
              <Star className="h-6 w-6" />
            </div>
            <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-bold text-destructive">N</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-accent">Q</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="accent" className="text-base px-3 py-1">{bearing}° {directionLabel(bearing)}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("qibla.bearing")}: {bearing}°</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-accent shrink-0" />
              <span className="text-sm truncate">{loc.label}</span>
              <span className="text-xs text-muted-foreground">{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
              <Navigation className="h-4 w-4" />
              {locating ? t("qibla.locating") : t("qibla.useLocation")}
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">{t("qibla.direction")}</span>
            <span className="font-semibold">{rotation != null ? `${Math.round(rotation)}°` : `${bearing}°`}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {rotation != null
              ? t("qibla.offlineHeading")
              : t("qibla.unavailable")}
          </p>
          <a
            href={`https://www.google.com/maps?q=Kaaba&ll=21.4225,39.8262&z=4`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <span className="h-4 w-4 rounded-full border border-primary flex items-center justify-center"><Star className="h-3 w-3" /></span>
            Kaaba — Makkah
          </a>
        </CardContent>
      </Card>
    </div>
  );
}