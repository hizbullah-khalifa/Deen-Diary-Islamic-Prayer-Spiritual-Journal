import { exportAllData, importAllData, clearAllData } from "@/lib/storage";

export function downloadData(prefix: string): boolean {
  if (typeof window === "undefined") return false;
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}-deen-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

export async function readUploadedFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text);
}

export function clearEverything(): void {
  clearAllData();
  try {
    localStorage.removeItem("dd:settings");
    localStorage.removeItem("dd:lang");
    localStorage.removeItem("dd:theme");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.location.reload();
}

export function wipeAndReimport(data: unknown): boolean {
  clearAllData();
  return importAllData(data);
}