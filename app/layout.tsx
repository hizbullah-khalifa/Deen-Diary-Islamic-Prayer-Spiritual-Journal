import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu, Scheherazade_New } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic", "latin"],
  variable: "--font-urdu",
  display: "swap",
});

const quran = Scheherazade_New({
  subsets: ["arabic", "latin"],
  variable: "--font-quran",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Deen Diary – Prayer Tracker & Spiritual Journal",
    template: "%s · Deen Diary",
  },
  description:
    "Organize your day, remember Allah, and grow spiritually. Prayer times for Pakistan, Quran reading, Dhikr, journal, tasks, habits and more.",
  keywords: [
    "prayer times",
    "namaz",
    "Quran",
    "dhikr",
    "tasbih",
    "Islamic journal",
    "Pakistan",
  ],
  applicationName: "Deen Diary",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Deen Diary",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#10131f" },
  ],
};

const bootScript = `(function(){
  try {
    var lang = localStorage.getItem('dd:lang') || 'en';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('data-lang', lang);
  } catch (e) {}
  try {
    var t = localStorage.getItem('dd:theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();`;

const swScript = `if ('serviceWorker' in navigator) { window.addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); }); }`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${urdu.variable} ${quran.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="theme-color" content="#f7f6f1" />
      </head>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </body>
    </html>
  );
}