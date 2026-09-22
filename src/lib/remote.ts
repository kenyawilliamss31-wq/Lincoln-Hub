// REMOTE DATA - downloads the JSON the GitHub Action builds, saves a copy on
// the phone, and falls back gracefully when the network is gone.
//
// Three layers of data, best to worst:
//   1. live    - just downloaded, current within 6 hours
//   2. cached  - the last successful download, saved on this phone
//   3. bundled - the copy compiled into the app, oldest but always present
//
// The cache is what makes the app genuinely usable offline. Without it, a
// student in a dead zone sees whatever data existed the day the app was built.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

// Where the data lives. raw.githubusercontent.com serves the plain contents of
// a file in a repo. The repo must be PUBLIC - GitHub 404s raw files in private
// repos, which would silently push the app down to cached or bundled data.
const USER = "kenyawilliamss31-wq";
const REPO = "lincoln-hub";
const BRANCH = "main";
const BASE = `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/public-data`;

export type Status = "loading" | "live" | "cached" | "bundled";

export function useRemote<T>(file: string, fallback: T) {
  // Starts on the bundled data so the screen draws instantly instead of
  // flashing empty while the network is being tried.
  const [data, setData] = useState<T>(fallback);
  const [status, setStatus] = useState<Status>("loading");

  // When this data was fetched, for the "updated 2 hours ago" line.
  const [fetchedAt, setFetchedAt] = useState<number>(0);

  // Separate from status: this drives the spinner on pull-to-refresh, which
  // should only appear when the USER asked for it, not on the automatic load.
  const [refreshing, setRefreshing] = useState(false);

  // Where this file's copy is stored on the phone. A prefix keeps the app's
  // keys from colliding with anything else using device storage.
  const cacheKey = `lh-cache-${file}`;
  const stampKey = `lh-stamp-${file}`;

  // useCallback stops this function from being rebuilt on every render. Without
  // it, the useEffect below would see a "new" function each time and re-run
  // forever - the classic React infinite-loop bug.
  const load = useCallback(
    async (manual: boolean) => {
      if (manual) setRefreshing(true);

      // STEP 1: show the phone's saved copy immediately, before the network is
      // even tried. On a slow connection this is the difference between data
      // appearing instantly and a five-second wait.
      // Skipped on manual refresh, where the point is to get something NEWER.
      if (!manual) {
        try {
          const saved = await AsyncStorage.getItem(cacheKey);
          const stamp = await AsyncStorage.getItem(stampKey);
          if (saved) {
            // JSON.parse turns the stored text back into real objects.
            setData(JSON.parse(saved));
            setStatus("cached");
            if (stamp) setFetchedAt(Number(stamp));
          }
        } catch {
          // A corrupt cache is not worth crashing over - just skip it and let
          // the network attempt below sort it out.
        }
      }

      // STEP 2: try the network.
      // AbortController plus a timer means a dead connection fails in 8
      // seconds instead of hanging the screen indefinitely.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        // Date.now() makes every URL unique, which defeats caching. GitHub
        // caches raw files for a few minutes, and without this the app can keep
        // receiving yesterday's JSON after the Action has already updated it.
        const res = await fetch(`${BASE}/${file}?t=${Date.now()}`, {
          signal: controller.signal,
        });

        // fetch does NOT throw on a 404 or 403 - it resolves with ok: false.
        // Forgetting this is the classic fetch bug: you end up trying to parse
        // an HTML error page as JSON.
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const now = Date.now();

        setData(json);
        setStatus("live");
        setFetchedAt(now);

        // STEP 3: save it for next time. Storage only holds strings, so the
        // data has to be stringified going in and parsed coming out.
        await AsyncStorage.setItem(cacheKey, JSON.stringify(json));
        await AsyncStorage.setItem(stampKey, String(now));
      } catch {
        // Every failure lands here - offline, private repo, bad JSON, timeout.
        // If a cache was loaded above, keep showing it; otherwise we're on the
        // bundled copy. Either way, no error screen over campus dining hours.
        setStatus((prev) => (prev === "cached" ? "cached" : "bundled"));
      } finally {
        // finally always runs, success or failure. Clearing the timer here
        // means one line instead of two, and it can never be missed.
        clearTimeout(timeout);
        if (manual) setRefreshing(false);
      }
    },
    [file, cacheKey, stampKey]
  );

  // Runs once when the screen opens. The dependency array holds load, which
  // useCallback keeps stable - so this fires once, not on every render.
  useEffect(() => {
    load(false);
  }, [load]);

  return {
    data,
    status,
    refreshing,
    // What pull-to-refresh calls. Arrow function so the "manual" flag is set.
    refresh: () => load(true),
    // A human-readable age, computed here so no screen has to do date math.
    updatedLabel: fetchedAt ? timeAgo(fetchedAt) : "",
  };
}

// Turns a timestamp into "just now" / "5m ago" / "3h ago" / "2d ago".
function timeAgo(when: number) {
  // Both values are milliseconds since 1970, so subtracting gives the gap.
  const seconds = Math.floor((Date.now() - when) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}