import { useSyncExternalStore } from "react";

import { createSeedState } from "./seed";
import type { DemoState } from "./types";

const STORAGE_KEY = "anisuri-demo-v1";

let state: DemoState = createSeedState();
let loaded = false;
const serverState = createSeedState();
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.version === 1) state = { ...createSeedState(), ...parsed };
    }
  } catch {
    // Corrupt demo data: fall back to the sample data.
  }
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  load();
  return state;
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverState);
}

export function getDemoState(): DemoState {
  load();
  return state;
}

/** Apply a pure action. Throws the action's error so forms can show it. */
export function updateDemo(action: (s: DemoState) => DemoState) {
  load();
  state = action(state);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full (large photo): keep state in memory for this visit.
  }
  listeners.forEach((l) => l());
}

export function resetDemo() {
  const session = getDemoState().session;
  updateDemo(() => ({ ...createSeedState(), session }));
}
