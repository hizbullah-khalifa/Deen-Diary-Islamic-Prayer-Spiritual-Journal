"use client";

import { useEffect, useState } from "react";
import { useI18n, I18nProvider } from "@/lib/i18n";
import { SettingsProvider, useSettings } from "@/lib/settings-store";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  Book,
  Calendar,
  Compass,
  Heart,
  Home,
  Moon,
  NotebookPen,
  Settings,
  Sun,
  Sunrise,
  Timer,
  Waypoints,
  Notebook,
  CalendarDays,
  Star,
  Menu,
  X,
  Layers,
  MoonStar,
  WifiOff,
} from "lucide-react";
import { ToastProvider } from "@/lib/toast";
import { ReminderEngine } from "@/lib/reminders";
import { ensureSampleData } from "@/lib/sample-data";
import { useToast } from "@/lib/toast";

const desktopNav = [
  { key: "dashboard", href: "/", icon: Home },
  { key: "prayerTimes", href: "/prayer-times", icon: Sunrise },
  { key: "prayerTracker", href: "/prayer-tracker", icon: Timer },
  { key: "quran", href: "/quran", icon: Book },
  { key: "duas", href: "/duas", icon: Heart },
  { key: "adhkar", href: "/adhkar", icon: Star },
  { key: "tasbih", href: "/tasbih", icon: Waypoints },
  { key: "journal", href: "/journal", icon: NotebookPen },
  { key: "tasks", href: "/tasks", icon: Notebook },
  { key: "habits", href: "/habits", icon: CalendarDays },
  { key: "qibla", href: "/qibla", icon: Compass },
  { key: "calendar", href: "/calendar", icon: Calendar },
  { key: "ramadan", href: "/ramadan", icon: MoonStar },
  { key: "settings", href: "/settings", icon: Settings },
];

const mobileNav = [
  { key: "home", href: "/", icon: Home },
  { key: "prayer", href: "/prayer-times", icon: Sunrise },
  { key: "quran", href: "/quran", icon: Book },
  { key: "dhikr", href: "/tasbih", icon: Waypoints },
  { key: "more", href: "/settings", icon: Layers },
];

function routeTitleKey(pathname: string): string {
  if (pathname === "/") return "nav.dashboard";
  const match = desktopNav.find((n) => `/${n.key === "prayerTimes" ? "prayer-times" : n.key === "prayerTracker" ? "prayer-tracker" : n.key}` === pathname);
  if (match) return `nav.${match.key}`;
  const special: Record<string, string> = {
    "/prayer-times": "nav.prayerTimes",
    "/prayer-tracker": "nav.prayerTracker",
  };
  return special[pathname] || "nav.dashboard";
}

function ThemeToggle() {
  const { settings, setTheme } = useSettings();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const mode = settings.theme;
  const next = mode === "dark" ? "light" : mode === "light" ? "system" : "dark";
  const Icon = mode === "system" || mode === "light" ? Sun : Moon;
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(next)}
      className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-secondary"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function LangToggle() {
  const { lang, setLang } = useI18n();
  const next = lang === "en" ? "ur" : "en";
  return (
    <button
      onClick={() => setLang(next)}
      className="h-10 px-3 inline-flex items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-secondary"
    >
      <span className="text-sm font-medium">{lang === "en" ? "اردو" : "English"}</span>
    </button>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: any;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate text-start">{label}</span>
    </Link>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t, dir } = useI18n();
  const { settings } = useSettings();
  const { toast } = useToast();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    ensureSampleData();
  }, []);

  useEffect(() => {
    const setOnline = () => {
      setIsOnline(true);
      toast("success", t("errors.backOnline"), 3000);
    };
    const setOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, [t, toast]);

  useEffect(() => {
    document.documentElement.classList.toggle("large-text", settings.largeText);
  }, [settings.largeText]);

  const Brand = (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-2xl border border-border bg-primary/95 flex items-center justify-center shadow-sm">
        <Moon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <h1 className="text-base font-semibold tracking-tight truncate">{t("appName")}</h1>
        <p className="text-xs text-muted-foreground truncate hidden sm:block">{t("tagline")}</p>
      </div>
    </div>
  );

  const title = t(routeTitleKey(pathname));

  return (
    <div className="min-h-dvh relative flex" dir={dir}>
      <aside
        className={cn(
          "islamic-pattern hidden lg:flex lg:flex-col fixed inset-y-0 w-72 border-border bg-background/95 backdrop-blur",
          dir === "rtl" ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-border bg-card/70">{Brand}</div>
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          {desktopNav.map((n) => (
            <NavLink
              key={n.href}
              href={n.href}
              icon={n.icon}
              label={t(`nav.${n.key}`)}
              active={pathname === n.href}
            />
          ))}
        </nav>
        <div className="p-3 border-t border-border flex items-center justify-between bg-card/70">
          <ThemeToggle />
          <LangToggle />
        </div>
      </aside>

      <div className={cn("flex-1 flex flex-col min-h-dvh", dir === "rtl" ? "lg:mr-72" : "lg:ml-72")}>
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
          <div className="h-14 md:h-16 px-3 sm:px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                className="lg:hidden h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-xl border border-border bg-card shadow-sm"
                onClick={() => setSidebarOpen(true)}
                aria-label={t("common.open")}
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="lg:hidden shrink-0 rounded-2xl border border-border bg-primary/95 flex items-center justify-center shadow-sm h-9 w-9">
                <Moon className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="text-base md:text-lg font-semibold tracking-tight truncate">{title}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <LangToggle />
            </div>
          </div>
        </header>
        {!isOnline && (
          <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive text-sm">
            <WifiOff className="h-4 w-4" />
            <span>{t("offlineBanner")}</span>
          </div>
        )}
        <main className="flex-1 page-fade px-3 sm:px-4 md:px-6 py-4 md:py-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-sm">
          <div className="grid grid-cols-5 h-16">
            {mobileNav.map((n) => {
              const active = pathname === n.href;
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 text-[11px] transition",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "scale-105")} />
                  <span>{t(`bottomNav.${n.key}`)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div
            className={cn(
              "absolute inset-y-0 w-[86vw] max-w-xs bg-background border-border flex flex-col shadow-xl islamic-pattern",
              dir === "rtl" ? "right-0 border-l" : "left-0 border-r"
            )}
          >
            <div className="h-16 px-3 flex items-center justify-between border-b border-border bg-card/70">
              {Brand}
              <button
                className="h-10 w-10 rounded-xl border border-border bg-card inline-flex items-center justify-center"
                onClick={() => setSidebarOpen(false)}
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin">
              {desktopNav.map((n) => (
                <NavLink
                  key={n.href}
                  href={n.href}
                  icon={n.icon}
                  label={t(`nav.${n.key}`)}
                  active={pathname === n.href}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <SettingsProvider>
        <ToastProvider>
          <ReminderEngine />
          <Shell>{children}</Shell>
        </ToastProvider>
      </SettingsProvider>
    </I18nProvider>
  );
}