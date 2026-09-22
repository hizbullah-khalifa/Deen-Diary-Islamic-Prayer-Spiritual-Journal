export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | null {
  if (!notificationsSupported()) return null;
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!notificationsSupported()) return null;
  try {
    return await Notification.requestPermission();
  } catch {
    return notificationsSupported() ? Notification.permission : null;
  }
}

export function showNotification(title: string, body: string): void {
  try {
    if (!notificationsSupported()) return;
    if (Notification.permission !== "granted") return;
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      // Let the in-app toast handle visible tabs; still register for absent ones.
    }
    const n = new Notification(title, { body, tag: `deen-${Date.now()}`, icon: "/icons/icon.svg" });
    n.onclick = () => {
      try {
        window.focus();
        n.close();
      } catch {
        /* ignore */
      }
    };
    setTimeout(() => n.close(), 20000);
  } catch {
    /* ignore */
  }
}