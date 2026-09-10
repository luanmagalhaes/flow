export function canNotify(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notifyState(): NotificationPermission | "unsupported" {
  return canNotify() ? Notification.permission : "unsupported";
}

export async function askToNotify(): Promise<boolean> {
  if (!canNotify() || Notification.permission === "denied") {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

export function buzz(pattern: number | number[] = 240): boolean {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export function nudge(title: string, body: string) {
  buzz([180, 90, 180]);

  if (!canNotify() || Notification.permission !== "granted") {
    return;
  }

  if (typeof document !== "undefined" && document.visibilityState === "visible") {
    return;
  }

  try {
    const alert = new Notification(title, { body, icon: "/icon-192.png", tag: "flow-turn" });

    window.setTimeout(() => alert.close(), 12000);
  } catch {
    return;
  }
}
