"use client";
// Course progress: localStorage only (no accounts, no DB). Not a credential.

import { useSyncExternalStore } from "react";

export interface ModuleProgress {
  labCleared?: boolean;
  patched?: boolean;
  quizPassed?: boolean;
}
export type Progress = Record<string, ModuleProgress>;

const STORAGE_SLOT = "raa-progress-v1";
const EMPTY: Progress = {};
let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_SLOT);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    cache = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Progress) : {};
  } catch {
    cache = {};
  }
  return cache;
}

export function markProgress(id: string, patch: ModuleProgress) {
  const next = { ...read(), [id]: { ...read()[id], ...patch } };
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_SLOT, JSON.stringify(next));
  } catch {
    // storage blocked: progress lives for this tab only
  }
  listeners.forEach((l) => l());
}

export function resetProgress() {
  cache = {};
  try {
    window.localStorage.removeItem(STORAGE_SLOT);
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Badge rule: patch passed, plus the lab cleared when the module has a playable lab. */
export const isComplete = (p: ModuleProgress | undefined, hasLab: boolean): boolean =>
  Boolean(p?.patched && (!hasLab || p.labCleared));
