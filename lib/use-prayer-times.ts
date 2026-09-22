"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrayerTimes } from "@/lib/types";
import { getStore, setStore, STORE_KEYS } from "@/lib/storage";
import { useSettings } from "@/lib/settings-store";
import { getCity } from "@/lib/cities";
import { approximateTimes, fetchPrayerTimesFromApi } from "@/lib/prayer";
import { dayKey } from "@/lib/storage";

export type PrayerStatus = "loading" | "ok" | "stale" | "error";

export function currentLocation(settings: ReturnType<typeof useSettings>["settings"]) {
  const loc = settings.location;
  if (loc.type === "custom" && loc.lat !== undefined && loc.lng !== undefined) {
    return {
      lat: loc.lat,
      lng: loc.lng,
      labelEn: loc.labelEn || "Custom location",
      labelUr: loc.labelUr || "اپنا مقام",
    };
  }
  const city = getCity(loc.cityId);
  return { lat: city.lat, lng: city.lng, labelEn: city.nameEn, labelUr: city.nameUr };
}

export function usePrayerTimes() {
  const { settings } = useSettings();
  const { location, prayer } = settings;
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [status, setStatus] = useState<PrayerStatus>("loading");

  const coords = useMemo(() => {
    if (location.type === "custom" && location.lat !== undefined && location.lng !== undefined) {
      return { lat: location.lat, lng: location.lng };
    }
    const city = getCity(location.cityId);
    return { lat: city.lat, lng: city.lng };
  }, [location]);

  const cacheKey = useMemo(() => {
    const today = dayKey();
    return `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}|${today}`;
  }, [coords]);

  const loadPrayerTimes = useCallback(() => {
    if (typeof window === "undefined") return;
    const today = dayKey();
    const store = getStore<Record<string, PrayerTimes>>(STORE_KEYS.lastPrayerTimes, {});
    const cached = store[cacheKey];

    const doFetch = async (): Promise<void> => {
      try {
        const fresh = await fetchPrayerTimesFromApi({
          lat: coords.lat,
          lng: coords.lng,
          date: new Date(),
          method: prayer.method,
          school: prayer.school,
          highLatRule: prayer.highLatRule,
          tune: prayer.tune,
        });
        const next = { ...store, [cacheKey]: fresh };
        setStore(STORE_KEYS.lastPrayerTimes, next);
        setTimes(fresh);
        setStatus("ok");
      } catch {
        const approx = approximateTimes({
          lat: coords.lat,
          lng: coords.lng,
          date: new Date(),
          method: prayer.method,
          school: prayer.school,
          highLatRule: prayer.highLatRule,
          tz: 5,
        });
        approx.dateGregorian = today;
        if (cached) {
          setTimes(cached);
          setStatus("stale");
        } else {
          setTimes(approx);
          setStatus("ok");
        }
      }
    };

    if (cached) {
      setTimes(cached);
      doFetch();
    } else {
      setStatus("loading");
      doFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, coords.lat, coords.lng, prayer.method, prayer.school, prayer.highLatRule, prayer.tune]);

  useEffect(() => {
    loadPrayerTimes();
    const onOnline = () => loadPrayerTimes();
    window.addEventListener("online", onOnline);
    const interval = setInterval(() => {
      const nowDate = new Date();
      if (nowDate.getHours() === 0 && nowDate.getMinutes() >= 1 && nowDate.getMinutes() <= 5) {
        loadPrayerTimes();
      }
    }, 60000);
    return () => {
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
    };
  }, [loadPrayerTimes]);

  const refresh = useCallback(() => {
    setStatus("loading");
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  return { times, status, refresh, coords };
}