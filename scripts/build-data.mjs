// BUILD DATA - reads Lincoln's own published calendar feeds and writes the JSON
// files the app downloads. Run by GitHub Actions once a day. No dependencies:
// Node can do everything here on its own.

import { mkdirSync, writeFileSync } from "node:fs";

// Lincoln publishes both of these for anyone to subscribe to. They are the
// official source, which is why this will not break when a page gets redesigned.
const SPORTS_FEED = "https://lulions.com/calendar.ashx/calendar.ics";
const EVENTS_FEED = "https://www.lincoln.edu/events/_data/current.ics";
const OUT_DIR = "public-data";

// ---------- ICS PARSING ----------

// An .ics file wraps long lines: a line starting with a space or tab is a
// continuation of the one above it. Unfolding has to happen FIRST, or every
// long event title comes out chopped in half.
function unfold(text) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

// Splits the file into events, and each event into key/value pairs.
function parseIcs(text) {
  const events = [];
  // slice(1) throws away everything before the first event - the calendar header.
  const blocks = unfold(text).split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const fields = {};
    for (const line of block.split("END:VEVENT")[0].split("\n")) {
      // Split on the FIRST colon only. Values contain colons - URLs do - so a
      // plain split(":") would cut them off at "https".
      const colon = line.indexOf(":");
      if (colon === -1) continue;

      // Some keys carry parameters, like DTSTART;TZID=America/New_York.
      // We only want the part before the semicolon.
      const key = line.slice(0, colon).split(";")[0].trim();

      // Undo the ICS escapes: \, is a literal comma, \n a line break.
      const value = line
        .slice(colon + 1)
        .replace(/\\,/g, ",")
        .replace(/\\n/g, "\n")
        .trim();

      if (key) fields[key] = value;
    }
    // No start date means it isn't a usable event, so skip it.
    if (fields.DTSTART) events.push(fields);
  }
  return events;
}

// The two feeds write dates differently - "20260827T190000Z" from athletics,
// "2026-12-23T00:00-0500" from the university CMS - so strip the punctuation
// and handle both shapes in one code path.
function parseDate(raw) {
  const s = raw.replace(/[-:]/g, "");
  const y = +s.slice(0, 4);
  const mo = +s.slice(4, 6) - 1;      // months are zero-based in JS dates
  const d = +s.slice(6, 8);
  const h = +(s.slice(9, 11) || 0);
  const mi = +(s.slice(11, 13) || 0);

  // A trailing Z means the time is UTC and has to be converted to Eastern.
  // Date.UTC builds a UTC timestamp; without it Node reads those numbers as
  // local time and every game time lands hours off.
  return raw.endsWith("Z")
    ? new Date(Date.UTC(y, mo, d, h, mi))
    : new Date(y, mo, d, h, mi);
}

// Formatting helpers. The locale and timezone are pinned on purpose, so output
// is identical whether this runs on your laptop or on a GitHub server in
// another timezone. Without pinning, the JSON would change depending on where
// it was built - a genuinely nasty bug to track down.
const EASTERN = { timeZone: "America/New_York" };
const iso = (dt) => dt.toLocaleDateString("en-CA", EASTERN);   // en-CA gives YYYY-MM-DD
const pretty = (dt) => dt.toLocaleDateString("en-US", { ...EASTERN, month: "short", day: "numeric" });
const clock = (dt) => dt.toLocaleTimeString("en-US", { ...EASTERN, hour: "numeric", minute: "2-digit" });

// ---------- SPORTS ----------

function buildSports(text) {
  return parseIcs(text)
    .map((e, i) => {
      const dt = parseDate(e.DTSTART);
      let summary = e.SUMMARY || "";

      // The feed puts status in front of the title: "[L]", "[W]", "CANCELLED".
      const canceled = /^(CANCELLED|POSTPONED)/i.test(summary);
      const outcomeMatch = summary.match(/^\[([WLT])\]/);

      // Strip those markers so what's left is just the matchup.
      summary = summary
        .replace(/^(CANCELLED|POSTPONED)\s*/i, "")
        .replace(/^\[[WLT]\]\s*/, "")
        .replace(/^Lincoln Lions\s*/i, "");

      // Find the FIRST " vs " or " at ". This matters: opponents can contain
      // " at " themselves, as in "University of Pittsburgh at Bradford".
      // Splitting on every " at " would mangle that into two teams.
      const split = summary.match(/\s(vs\.?|at)\s/i);
      let sport = summary;
      let opponent = "";
      if (split) {
        sport = summary.slice(0, split.index).trim();
        opponent = summary.slice(split.index + split[0].length).trim();
      }

      // Collapse men's and women's cross country into one name, matching the
      // filter chips the app already has.
      if (/cross country/i.test(sport)) sport = "Cross Country";

      // The score sits on the second line of DESCRIPTION, as "L 0-3".
      const scoreMatch = (e.DESCRIPTION || "").match(/\b([WLT])\s+(\d+-\d+)/);

      return {
        id: i + 1,
        iso: iso(dt),
        date: pretty(dt),
        time: clock(dt),
        sport,
        opponent: opponent || sport,
        // Home games list the campus as their location; anything else is away.
        site: /lincoln university/i.test(e.LOCATION || "") ? "Home" : "Away",
        // A canceled game has no result, so blank these even if the feed
        // left a marker behind.
        outcome: canceled ? "" : outcomeMatch ? outcomeMatch[1] : "",
        score: canceled ? "" : scoreMatch ? scoreMatch[2] : "",
        note: canceled ? "Canceled" : "",
      };
    })
    // localeCompare sorts the iso strings as text, which gives the right order
    // because YYYY-MM-DD happens to sort correctly alphabetically.
    .sort((a, b) => a.iso.localeCompare(b.iso));
}

// ---------- EVENTS ----------

function buildEvents(text) {
  return parseIcs(text)
    .map((e, i) => {
      const dt = parseDate(e.DTSTART);
      // Midnight in this feed means an all-day event, not something at 12 AM.
      const allDay = dt.getHours() === 0 && dt.getMinutes() === 0;

      return {
        id: i + 1,
        iso: iso(dt),
        date: pretty(dt),
        time: allDay ? "All day" : clock(dt),
        title: e.SUMMARY || "Campus event",
        place: e.LOCATION || "Lincoln University",
        host: "Lincoln University",
      };
    })
    .sort((a, b) => a.iso.localeCompare(b.iso));
}

// ---------- RUN ----------

// Promise.all starts both downloads at the same time, instead of waiting for
// the first to finish before beginning the second.
const [sportsText, eventsText] = await Promise.all([
  fetch(SPORTS_FEED).then((r) => r.text()),
  fetch(EVENTS_FEED).then((r) => r.text()),
]);

const sports = buildSports(sportsText);
const events = buildEvents(eventsText);

// recursive: true means "create the folder, and don't error if it already exists".
mkdirSync(OUT_DIR, { recursive: true });

// null, 2 pretty-prints the JSON across many lines. That way a git diff shows
// which single game changed, instead of one unreadable 30,000-character line.
writeFileSync(`${OUT_DIR}/sports.json`, JSON.stringify(sports, null, 2));
writeFileSync(`${OUT_DIR}/events.json`, JSON.stringify(events, null, 2));
writeFileSync(
  `${OUT_DIR}/updated.json`,
  JSON.stringify({ updated: new Date().toISOString() }, null, 2)
);

console.log(`Wrote ${sports.length} games and ${events.length} events.`);