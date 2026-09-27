import { useSyncExternalStore } from "react";
import {
  initialStore,
  mergeProgress,
  normalizeStore,
  type Store,
} from "./progress-model";

function safeRead(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
const keyPattern = /^[a-f0-9]{64}$/;
const hashKey = new URLSearchParams(location.hash.slice(1)).get("box");
const savedKey = safeRead("kambley-box-key");
const boxKey =
  hashKey && keyPattern.test(hashKey)
    ? hashKey
    : savedKey && keyPattern.test(savedKey)
      ? savedKey
      : Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
try {
  localStorage.setItem("kambley-box-key", boxKey);
} catch {
  /* The private link can still restore this box. */
}
// A fragment stays out of server access logs and referrer headers.
if (hashKey)
  history.replaceState(null, "", location.pathname + location.search);
// Fresh start requested on 2026-09-27. Never merge the former seeded cache.
const cacheKey = `kambley-progress-v2:${boxKey}`;
let storageFailure = false;
function readCache(): Store {
  try {
    const cached = localStorage.getItem(cacheKey);
    return normalizeStore(JSON.parse(cached || "{}"));
  } catch {
    return initialStore;
  }
}
let current = readCache();
let status = "Connecting to shared progress…";
let dirty = true;
let busy = false;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function persist() {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(current));
    storageFailure = false;
  } catch {
    storageFailure = true;
  }
}
const api = `${import.meta.env.BASE_URL}api/progress`;
async function request(method: string, body?: unknown) {
  return fetch(api, {
    method,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${boxKey}`,
      "X-Progress-Version": "2",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12000),
  });
}
export async function syncNow() {
  if (busy) return;
  busy = true;
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await request("GET");
      if (!response.ok) throw new Error("unavailable");
      const remote = await response.json();
      const remoteState = normalizeStore(remote.state);
      const merged = mergeProgress(remoteState, current);
      // Do not erase pending cache-only changes after a failed request or reload.
      if (
        JSON.stringify(merged) !==
        JSON.stringify(mergeProgress(remoteState, remoteState))
      )
        dirty = true;
      current = merged;
      persist();
      emit();
      if (!dirty) break;
      const sent = current;
      const saved = await request("PUT", {
        revision: remote.revision,
        state: sent,
      });
      if (saved.status === 409) continue;
      if (!saved.ok) throw new Error("unavailable");
      // Edits made while the request was in flight must still be sent.
      if (sent === current) {
        dirty = false;
        break;
      }
    }
    status = dirty
      ? "Changes waiting to sync — retrying shortly"
      : storageFailure
        ? "Cloud saved · local backup unavailable"
        : "All progress saved across devices";
  } catch {
    status = storageFailure
      ? "Not saved — keep this page open and retry"
      : "Saved on this device · cloud unavailable — retrying";
  } finally {
    busy = false;
    emit();
  }
}
function updateStore(updater: (state: Store) => Store) {
  current = updater(current);
  dirty = true;
  persist();
  status = "Saving progress…";
  emit();
  void syncNow();
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function useLearningStore() {
  const store = useSyncExternalStore(subscribe, () => current);
  return { store, updateStore };
}
export function useSyncStatus() {
  return useSyncExternalStore(subscribe, () => status);
}
export function sharedLink() {
  return `${location.origin}${import.meta.env.BASE_URL}#box=${boxKey}`;
}
window.addEventListener("online", () => void syncNow());
window.addEventListener("focus", () => void syncNow());
window.addEventListener("storage", (event) => {
  if (event.key === cacheKey && event.newValue) {
    try {
      current = mergeProgress(
        current,
        normalizeStore(JSON.parse(event.newValue)),
      );
      dirty = true;
      emit();
      void syncNow();
    } catch {
      /* Keep last valid cache. */
    }
  }
});
setInterval(() => void syncNow(), 10000);
void syncNow();
