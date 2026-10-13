// Remote data. Downloads the JSON built by the GitHub Action, caches it on
// the phone, and falls back to the bundled copy when the network is gone.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

// Must be a public repo - GitHub 404s raw files in private ones.
const USER = "kenyawilliamss31-wq";
const REPO = "lincoln-hub";
const BRANCH = "main";
const BASE = `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/public-data`;

export type Status = "loading" | "live" | "cached" | "bundled";

export function useRemote<T>(file: string, fallback: T) {
  // Draw instantly with bundled data instead of flashing empty.
  const [data, setData] = useState<T>(fallback);
  const [status, setStatus] = useState<Status>("loading");


  const [fetchedAt, setFetchedAt] = useState<number>(0);


  const [refreshing, setRefreshing] = useState(false);

  // Prefix avoids colliding with other apps using device storage.
  const cacheKey = `lh-cache-${file}`;
  const stampKey = `lh-stamp-${file}`;

  // useCallback keeps this stable so the effect below doesn't loop.
  const load = useCallback(
    async (manual: boolean) => {
      if (manual) setRefreshing(true);

      // Show the cached copy first so the screen isn't empty while the network
      // is being tried. Skipped on manual refresh.
      if (!manual) {
        try {
          const saved = await AsyncStorage.getItem(cacheKey);
          const stamp = await AsyncStorage.getItem(stampKey);
          if (saved) {
  
            setData(JSON.parse(saved));
            setStatus("cached");
            if (stamp) setFetchedAt(Number(stamp));
          }
        } catch {}
      }

      // Try the network. The abort timer keeps a dead connection from hanging.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        // Cache-buster. GitHub caches raw files briefly.
        const res = await fetch(`${BASE}/${file}?t=${Date.now()}`, {
          signal: controller.signal,
        });

        // fetch resolves with ok: false on 404/403 instead of throwing.
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const now = Date.now();

        setData(json);
        setStatus("live");
        setFetchedAt(now);

        // Save for next time. AsyncStorage only holds strings.
        await AsyncStorage.setItem(cacheKey, JSON.stringify(json));
        await AsyncStorage.setItem(stampKey, String(now));
      } catch {
        setStatus((prev) => (prev === "cached" ? "cached" : "bundled"));
      } finally {
        clearTimeout(timeout);
        if (manual) setRefreshing(false);
      }
    },
    [file, cacheKey, stampKey]
  );


  useEffect(() => {
    load(false);
  }, [load]);

  return {
    data,
    status,
    refreshing,
    refresh: () => load(true),
    updatedLabel: fetchedAt ? timeAgo(fetchedAt) : "",
  };
}

function timeAgo(when: number) {
  const seconds = Math.floor((Date.now() - when) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}