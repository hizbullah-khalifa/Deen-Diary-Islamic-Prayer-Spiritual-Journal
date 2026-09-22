import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Deen Diary – Prayer Tracker & Spiritual Journal",
    short_name: "Deen Diary",
    description:
      "Organize your day, remember Allah, and grow spiritually with prayer times, Quran, Dhikr, journaling and productivity tools.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6f1",
    theme_color: "#1a5c37",
    orientation: "portrait-primary",
    categories: ["lifestyle", "productivity", "education"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}