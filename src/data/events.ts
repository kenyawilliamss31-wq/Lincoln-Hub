// Shared event data. Both the Events screen and the Home banner import this.
// This is why data lives in its own file: one source of truth.

export const events = [
  // "iso" is the sortable date used by code. "date" is the pretty version we
  // show on screen. Storing both means we never have to parse "Sep 20".
  { id: 1, iso: "2026-09-20", date: "Sep 20", title: "Dorm Clean Up", lines: ["Ashmun and Lorraine Hansberry Hall"] },
  { id: 2, iso: "2026-09-21", date: "Sep 21", title: "Brother Circle", lines: ["LLC"] },
  { id: 3, iso: "2026-09-22", date: "Sep 22", title: "Study Abroad 101", lines: ["Location TBD"] },
  { id: 4, iso: "2026-09-25", date: "Sep 25", title: "Career Readiness Workshop", lines: ["Career Fair Prep Part 1", "Wright Hall 314"] },
  { id: 5, iso: "2026-09-28", date: "Sep 28", title: "Meet President Allen", lines: ["Open Office Hours", "Vail Hall 201"] },
];

// Finds the soonest event that hasn't happened yet.
export function nextEvent() {
  // toISOString() gives "2026-09-16T20:41:00.000Z". slice(0, 10) cuts off
  // everything after the date, leaving "2026-09-16" — the same shape as our
  // "iso" values, so we can compare them as plain strings.
  const today = new Date().toISOString().slice(0, 10);

  // .find() walks the array and returns the FIRST item where the test is true,
  // or undefined if nothing matches. Our list is already in date order.
  return events.find((event) => event.iso >= today);
}
