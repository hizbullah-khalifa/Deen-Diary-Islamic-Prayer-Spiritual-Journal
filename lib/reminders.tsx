"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/lib/settings-store";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/toast";
import { usePrayerTimes } from "@/lib/use-prayer-times";
import { toMinutes, formatTime, prayerNameKey } from "@/lib/date-utils";
import { getStore, setStore } from "@/lib/storage";
import { playAdhanTone, playChime, playCustomAudio, vibrate } from "@/lib/audio";
import type { PrayerKey } from "@/lib/types";

const PRAYER_LABEL_PATH = "prayer";

export function ReminderEngine() {
  const { settings } = useSettings();
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { times } = usePrayerTimes();

  const stateRef = useRef({ settings, lang, times });
  stateRef.current = { settings, lang, times };

  useEffect(() => {
    const firedKey = (id: string) => `fired:${id}`;
    const dayIdx = () => Math.floor(Date.now() / 86400000);

    const fire = (
      id: string,
      title: string,
      body: string,
      opts: { sound?: "chime" | "adhan" | "custom"; vibrate?: boolean }
    ) => {
      const store = getStore<Record<string, number>>("reminderFired", {});
      const key = firedKey(id);
      if (store[key] === dayIdx()) return;
      setStore("reminderFired", { ...store, [key]: dayIdx() });

      const s = stateRef.current.settings;
      if (opts.vibrate && s.adhan.vibrate) vibrate([120, 60, 120]);
      const style = s.adhan.style;
      if (opts.sound === "adhan") {
        if (style === "short") playChime(s.adhan.volume);
        else if (style === "full") {
          if (s.adhan.customSoundUrl) void playCustomAudio(s.adhan.customSoundUrl, s.adhan.volume);
          else playAdhanTone(s.adhan.volume);
        } else if (style === "custom" && s.adhan.customSoundUrl) {
          void playCustomAudio(s.adhan.customSoundUrl, s.adhan.volume);
        }
      } else if (opts.sound === "chime") {
        playChime(s.audio.volume);
      }
      toast("info", body, 6000);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          void new Notification(title, { body, icon: "/icons/icon.svg", tag: "deen-prayer" });
        } catch {
          /* ignore */
        }
      }
    };

    const check = () => {
      const { settings: s, lang: l, times: tm } = stateRef.current;
      if (!tm) return;
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();

      for (const key of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as PrayerKey[]) {
        const pref = s.notifications.prayers[key];
        if (!pref.enabled) continue;
        const time = tm[key];
        const targetM = toMinutes(time);
        const leadM = pref.leadMinutes;
        const pname = t(`prayer.${prayerNameKey(key)}`);
        // pre-prayer reminder in window
        if (minutes >= targetM - leadM && minutes < targetM) {
          fire(
            `pre:${key}:${targetM}`,
            t("notifications.prePrayerTitle", { prayer: pname, n: leadM }),
            t("notifications.prePrayerBody", { prayer: pname, time: formatTime(time) }),
            { sound: "chime", vibrate: true }
          );
        }
        // exact time
        if (minutes === targetM) {
          fire(
            `prayer:${key}:${targetM}`,
            t("notifications.prayerTitle", { prayer: pname }),
            t("notifications.prayerBody", { prayer: pname, time: formatTime(time) }),
            { sound: "adhan", vibrate: true }
          );
        }
      }

      void lang;

      const targets = s.notifications.targets;
      const runDaily = (
        key: keyof typeof targets,
        titleKey: string,
        bodyKey: string
      ) => {
        const pref = targets[key];
        if (!pref.enabled || !pref.repeat) return;
        const [h, m] = pref.time.split(":").map(Number);
        if (now.getHours() === h && now.getMinutes() === m) {
          fire(
            `daily:${key}`,
            t(titleKey),
            t(bodyKey),
            { sound: pref.sound ? "chime" : undefined, vibrate: false }
          );
        }
      };
      runDaily("quran", "notifications.quranTitle", "notifications.quranBody");
      runDaily("dhikr", "notifications.dhikrTitle", "notifications.dhikrBody");
      runDaily("dua", "notifications.duaTitle", "notifications.duaBody");
      runDaily("morning", "notifications.morningTitle", "notifications.morningBody");
      runDaily("evening", "notifications.eveningTitle", "notifications.eveningBody");
      runDaily("sleep", "notifications.sleepTitle", "notifications.sleepBody");
      runDaily("journal", "notifications.journalTitle", "notifications.journalBody");
    };

    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [t, toast]);

  return null;
}