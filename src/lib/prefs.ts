const mutedKey = "flow.muted";
const tutorialKey = "flow.tutorial";
const listeners = new Set<() => void>();

interface Prefs {
  muted: boolean;
  tutorialSeen: boolean;
}

const serverPrefs: Prefs = { muted: false, tutorialSeen: true };

let cached: Prefs = serverPrefs;
let cachedRaw = "";

function read(): Prefs {
  try {
    return {
      muted: window.localStorage.getItem(mutedKey) === "1",
      tutorialSeen: window.localStorage.getItem(tutorialKey) === "1",
    };
  } catch {
    return { muted: false, tutorialSeen: true };
  }
}

export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function prefsSnapshot(): Prefs {
  const fresh = read();
  const raw = `${fresh.muted}|${fresh.tutorialSeen}`;

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = fresh;
  }

  return cached;
}

export function serverPrefsSnapshot(): Prefs {
  return serverPrefs;
}

function write(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    return;
  }

  listeners.forEach((listener) => listener());
}

export function rememberMuted(next: boolean) {
  write(mutedKey, next);
}

export function rememberTutorialSeen() {
  write(tutorialKey, true);
}
