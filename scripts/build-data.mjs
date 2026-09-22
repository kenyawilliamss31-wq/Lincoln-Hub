// BUILD DATA - reads Lincoln's own published calendar feeds and writes the JSON
// files the app downloads. Run by GitHub Actions once a day. No dependencies:
// Node can do all of this on its own.

import { mkdirSync, writeFileSync } from "node:fs";

// Both of these are official feeds Lincoln publishes for anyone to subscribe
// to, which is why this won't break when a web page gets redesigned.
const SPORTS_FEED = "https://lulions.com/calendar.ashx/calendar.ics";
// Lions Connect (CampusGroups) - real student organization events, with the
// hosting org and an RSVP link. Far richer than the main university calendar.
const EVENTS_FEED = "https://lionsconnect.lincoln.edu/ical/lincoln/ical_lincoln.ics";
const OUT_DIR = "public-data";

// ---------- ICS PARSING ----------

// An .ics file wraps long lines: a line starting with a space or tab continues
// the one above it. Unfolding has to happen FIRST, or every long event title
// comes out chopped in half.
function unfold(text) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

// Splits the file into events, and each event into key/value pairs.
function parseIcs(text) {
  const events = [];
  // slice(1) discards everything before the first event - the calendar header.
  const blocks = unfold(text).split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const fields = {};
    for (const line of block.split("END:VEVENT")[0].split("\n")) {
      // Split on the FIRST colon only. Values contain colons - URLs do - so a
      // plain split(":") would cut them off after "https".
      const colon = line.indexOf(":");
      if (colon === -1) continue;

      // Keys can carry parameters, like DTSTART;TZID=America/New_York.
      const rawKey = line.slice(0, colon);
      const key = rawKey.split(";")[0].trim();

      // Undo the ICS escapes: \, is a literal comma, \n a line break.
      const value = line
        .slice(colon + 1)
        .replace(/\\,/g, ",")
        .replace(/\\n/g, "\n")
        .trim();

      if (!key) continue;
      fields[key] = value;
      // Keep the parameters too, under a "_p" suffix. The host name lives in a
      // parameter, not the value: ORGANIZER;CN="Black Student Union":mailto:...
      fields[key + "_p"] = rawKey;
    }
    // No start date means it isn't a usable event.
    if (fields.DTSTART) events.push(fields);
  }
  return events;
}

// The feeds write dates differently - "20260827T190000Z" from athletics,
// "2026-12-23T00:00-0500" from a CMS - so strip the punctuation and handle
// both shapes in one code path.
function parseDate(raw) {
  const s = raw.replace(/[-:]/g, "");
  const y = +s.slice(0, 4);
  const mo = +s.slice(4, 6) - 1;      // months are zero-based in JS dates
  const d = +s.slice(6, 8);
  const h = +(s.slice(9, 11) || 0);
  const mi = +(s.slice(11, 13) || 0);

  // A trailing Z means the time is UTC and must be converted to Eastern.
  // Date.UTC builds a UTC timestamp; without it Node reads those numbers as
  // local time and every game lands hours off.
  return raw.endsWith("Z")
    ? new Date(Date.UTC(y, mo, d, h, mi))
    : new Date(y, mo, d, h, mi);
}

// Formatting helpers. The locale and timezone are pinned deliberately, so the
// output is identical whether this runs on your laptop or on a GitHub server in
// another timezone. Unpinned, the JSON would change depending on where it built.
const EASTERN = { timeZone: "America/New_York" };
const iso = (dt) => dt.toLocaleDateString("en-CA", EASTERN);   // en-CA gives YYYY-MM-DD
const pretty = (dt) => dt.toLocaleDateString("en-US", { ...EASTERN, month: "short", day: "numeric" });
const clock = (dt) => dt.toLocaleTimeString("en-US", { ...EASTERN, hour: "numeric", minute: "2-digit" });

// CampusGroups encodes titles as quoted-printable: a space becomes "=20", an
// equals sign "=3D", and a lone "=" at the end of a line is a soft break that
// should vanish. Without decoding, titles read "Movie=20Night".
function decodeQP(text) {
  return text
    .replace(/=\r?\n/g, "")
    // The replacer's second argument is whatever the parentheses captured -
    // here the two hex digits, which parseInt turns back into a character.
    .replace(/=([0-9A-F]{2})/gi, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Pulls the host out of ORGANIZER;CN="Name":mailto:... and trims the
// "Lincoln University - " prefix that sits on most of them.
function organizer(params) {
  const m = (params || "").match(/CN="?([^";:]+)"?/);
  if (!m) return "Lincoln University";
  return m[1].replace(/^Lincoln University\s*-\s*/i, "").trim();
}

// Locations arrive with the full mailing address appended. Everything from the
// street number on is noise to a student already standing on campus.
function shortPlace(loc) {
  if (!loc) return "See Lions Connect";
  // Many organizations hide the room behind a login, and the feed sends that
  // sentence as the location. Printed verbatim it looks broken, so replace it.
  if (/sign in/i.test(loc)) return "See Lions Connect";

  const cut = loc.split(/,?\s*1570 Baltimore/i)[0].trim();
  // Still long? Keep the first two comma-separated parts - building and room.
  const parts = cut.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 2).join(", ") || "See Lions Connect";
}

// ---------- SPORTS ----------

function buildSports(text) {
  return parseIcs(text)
    .map((e, i) => {
      const dt = parseDate(e.DTSTART);
      let summary = e.SUMMARY || "";

      // The feed puts status in front of the title: "[L]", "[W]", "CANCELLED".
      const canceled = /^(CANCELLED|POSTPONED)/i.test(summary);
      const outcomeMatch = summary.match(/^\[([WLT])\]/);

      // Strip those markers so what remains is just the matchup.
      summary = summary
        .replace(/^(CANCELLED|POSTPONED)\s*/i, "")
        .replace(/^\[[WLT]\]\s*/, "")
        .replace(/^Lincoln Lions\s*/i, "");

      // Find the FIRST " vs " or " at ". This matters: opponents can contain
      // " at " themselves, as in "University of Pittsburgh at Bradford".
      const split = summary.match(/\s(vs\.?|at)\s/i);
      let sport = summary;
      let opponent = "";
      if (split) {
        sport = summary.slice(0, split.index).trim();
        opponent = summary.slice(split.index + split[0].length).trim();
      }

      // Collapse men's and women's cross country into the one filter chip the
      // app already has.
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
        // A canceled game has no result, so blank these even if the feed left
        // a marker behind.
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
  // A floor 14 days back. The feed carries the whole year including last
  // summer's orientation, and 319 events is a needlessly large download for an
  // app that only shows the current and next month.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  // And a ceiling 120 days out. Nobody browses to next spring in a campus app,
  // and every event kept is bytes every phone downloads.
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 120);

  return parseIcs(text)
    .map((e) => {
      const dt = parseDate(e.DTSTART);
      // Midnight start means an all-day event, not something at 12 AM.
      const allDay = dt.getHours() === 0 && dt.getMinutes() === 0;

      return {
        dt,                                  // kept only for the date filter
        iso: iso(dt),
        date: pretty(dt),
        time: allDay ? "All day" : clock(dt),
        title: decodeQP(e.SUMMARY || "Campus event"),
        place: shortPlace(e.LOCATION),
        host: organizer(e.ORGANIZER_p),
        url: e.URL || "",                    // the RSVP page for this event
      };
    })
    .filter((e) => e.dt >= cutoff && e.dt <= horizon)
    .sort((a, b) => a.iso.localeCompare(b.iso))
    // Numbering happens AFTER sorting and filtering, so ids run 1..n in
    // display order. map's second argument is the index.
    .map((e, i) => {
      // Drop the Date object - it existed only for the comparison above, and
      // JSON has no date type so it would serialize as a long UTC string.
      const { dt, ...rest } = e;
      return { id: i + 1, ...rest };
    });
}

// ---------- RUN ----------

// Promise.all starts both downloads at once, instead of waiting for the first
// to finish before beginning the second.
const [sportsText, eventsText] = await Promise.all([
  fetch(SPORTS_FEED).then((r) => r.text()),
  fetch(EVENTS_FEED).then((r) => r.text()),
]);

const sports = buildSports(sportsText);
const events = buildEvents(eventsText);

// recursive: true means "create the folder, don't error if it already exists".
mkdirSync(OUT_DIR, { recursive: true });

// null, 2 pretty-prints across lines, so a git diff shows which single game
// changed instead of one unreadable 60,000-character line.
writeFileSync(`${OUT_DIR}/sports.json`, JSON.stringify(sports, null, 2));
writeFileSync(`${OUT_DIR}/events.json`, JSON.stringify(events, null, 2));
writeFileSync(
  `${OUT_DIR}/updated.json`,
  JSON.stringify({ updated: new Date().toISOString() }, null, 2)
);

console.log(`Wrote ${sports.length} games and ${events.length} events.`);