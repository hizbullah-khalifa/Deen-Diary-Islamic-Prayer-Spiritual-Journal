"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Dir, Lang } from "@/lib/types";
import { en, type Messages } from "@/lib/i18n/en";
import { ur } from "@/lib/i18n/ur";
import { getStore, setStore } from "@/lib/storage";

type Params = Record<string, string | number>;

const dicts: Record<Lang, Messages> = { en, ur };

function resolvePath(dict: Messages, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const part of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur !== "string") return undefined;
  return cur;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

interface I18nValue {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  t: (path: string, params?: Params) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: "en",
  dir: "ltr",
  setLang: () => {},
  t: (path) => path,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = getStore<Lang>("lang", "en");
    return stored === "ur" ? "ur" : "en";
  });

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setStore("lang", next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", next);
      document.documentElement.setAttribute("dir", next === "ur" ? "rtl" : "ltr");
      document.documentElement.setAttribute("data-lang", next);
    }
  }, []);

  const t = useCallback(
    (path: string, params?: Params) => {
      const dict = dicts[lang];
      const template = resolvePath(dict, path) ?? resolvePath(dicts.en, path) ?? path;
      return interpolate(template, params);
    },
    [lang]
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, dir: lang === "ur" ? "rtl" : "ltr", setLang, t }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}