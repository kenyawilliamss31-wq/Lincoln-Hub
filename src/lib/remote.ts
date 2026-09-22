// REMOTE DATA - downloads the JSON the GitHub Action builds, and falls back to
// the copy bundled in the app when the network is unavailable.
//
// This is what makes the app self-updating: new scores appear without you
// rebuilding or resubmitting anything.

import { useEffect, useState } from "react";

// Where the data lives. raw.githubusercontent.com serves the plain file
// contents of a repo. THE REPO MUST BE PUBLIC - GitHub returns an error for
// raw files in a private repo, and the app would silently use bundled data.
const USER = "kenyawilliamss31-wq";
const REPO = "lincoln-hub";
const BRANCH = "main";
const BASE = `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/public-data`;

// "live" means we got fresh data, "bundled" means we're showing what shipped
// with the app. Worth surfacing in the UI so stale data never looks current.
export type Status = "loading" | "live" | "bundled";

// <T> is a generic: this one function works for any shape of data. Whatever
// type the fallback is, that's what comes back out - so the screens keep full
// autocomplete on games and events without a separate function for each.
export function useRemote<T>(file: string, fallback: T) {
  // Starts on the bundled data, so the screen has something to draw
  // immediately instead of flashing empty for a second.
  const [data, setData] = useState<T>(fallback);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    // A guard flag. If the user leaves this screen while the download is still
    // in flight, we must not call setData afterward - React warns about
    // updating a screen that no longer exists.
    let alive = true;

    // AbortController lets us cancel the request. Paired with the timeout
    // below, this stops a dead network from leaving the app hanging forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Date.now() appends a different number every time, which defeats caching.
    // GitHub caches raw files for a few minutes, and without this the app can
    // keep getting yesterday's JSON after the Action has already updated it.
    fetch(`${BASE}/${file}?t=${Date.now()}`, { signal: controller.signal })
      .then((res) => {
        // fetch does NOT throw on a 404 or 403 - it resolves with ok: false.
        // Forgetting this check is the classic fetch bug: you end up trying to
        // parse an error page as JSON.
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!alive) return;
        setData(json);
        setStatus("live");
      })
      .catch(() => {
        // Any failure at all - offline, private repo, bad JSON - lands here,
        // and we simply keep the bundled data. The app never shows an error
        // screen over something the student doesn't care about.
        if (alive) setStatus("bundled");
      })
      .finally(() => clearTimeout(timeout));

    // Cleanup, run when the screen closes.
    return () => {
      alive = false;
      clearTimeout(timeout);
      controller.abort();
    };
    // [file] means "re-run this if the filename changes." Leaving the array out
    // entirely would re-download on every single render, forever.
  }, [file]);

  return { data, status };
}