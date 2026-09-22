// ACADEMIC CALENDAR - Fall 2026 and Spring 2027.
//
// Typed out on purpose: the registrar publishes this as a PDF only, with no
// calendar feed to subscribe to. It changes about once a year, so verifying it
// by hand beats re-reading a PDF every six hours.
//
// SOURCE: Lincoln University Academic Calendar 2026-2028, Main Campus,
// approved 5/13/26:
// https://www.lincoln.edu/_files/academics/Final-2026-2028-Academic-Calendar_5-13-26.pdf

export type DateKind = "class" | "deadline" | "break" | "exam" | "event";

export type AcademicDate = {
  id: number;
  iso: string;        // start date, "2026-08-24", sortable as plain text
  isoEnd?: string;    // only for multi-day spans; "?" means optional
  display: string;    // what a human reads: "Aug 24" or "Nov 23 - Nov 28"
  label: string;
  kind: DateKind;     // drives the color of the dot on the screen
};

export const fall2026: AcademicDate[] = [
  { id: 1,  iso: "2026-08-24", display: "Aug 24",             label: "Undergraduate classes begin",        kind: "class" },
  { id: 2,  iso: "2026-08-28", display: "Aug 28",             label: "Last day to register, add, or change schedule", kind: "deadline" },
  { id: 3,  iso: "2026-09-04", display: "Sep 4",              label: "Last day to drop with 100% refund",  kind: "deadline" },
  { id: 4,  iso: "2026-09-07", display: "Sep 7",              label: "Labor Day - no classes",             kind: "break" },
  { id: 5,  iso: "2026-09-10", display: "Sep 10",             label: "All University Convocation",         kind: "event" },
  { id: 6,  iso: "2026-09-25", display: "Sep 25",             label: "Fall 2026 graduation application deadline", kind: "deadline" },
  { id: 7,  iso: "2026-10-05", isoEnd: "2026-10-09", display: "Oct 5 - 9",  label: "Mid-term examination week", kind: "exam" },
  { id: 8,  iso: "2026-10-14", display: "Oct 14",             label: "Mid-term grades due",                kind: "deadline" },
  { id: 9,  iso: "2026-10-24", display: "Oct 24",             label: "Homecoming",                         kind: "event" },
  { id: 10, iso: "2026-10-30", display: "Oct 30",             label: "Last day to drop a class with a W",  kind: "deadline" },
  { id: 11, iso: "2026-11-02", display: "Nov 2",              label: "Mandatory registration begins",      kind: "class" },
  { id: 12, iso: "2026-11-20", display: "Nov 20",             label: "Classes end. Last day to withdraw from the University", kind: "deadline" },
  { id: 13, iso: "2026-11-23", isoEnd: "2026-11-28", display: "Nov 23 - 28", label: "Thanksgiving recess", kind: "break" },
  { id: 14, iso: "2026-11-30", display: "Nov 30",             label: "Classes resume",                     kind: "class" },
  { id: 15, iso: "2026-12-04", display: "Dec 4",              label: "Last day of class",                  kind: "class" },
  { id: 16, iso: "2026-12-05", isoEnd: "2026-12-07", display: "Dec 5 - 7",   label: "Reading days",        kind: "break" },
  { id: 17, iso: "2026-12-08", isoEnd: "2026-12-12", display: "Dec 8 - 12",  label: "Final examinations",  kind: "exam" },
  { id: 18, iso: "2026-12-14", display: "Dec 14",             label: "Final grades due by 12:00 PM",       kind: "deadline" },
];

export const spring2027: AcademicDate[] = [
  { id: 101, iso: "2027-01-11", display: "Jan 11",            label: "Undergraduate classes begin",        kind: "class" },
  { id: 102, iso: "2027-01-15", display: "Jan 15",            label: "Last day to register, add, or change schedule", kind: "deadline" },
  { id: 103, iso: "2027-01-18", display: "Jan 18",            label: "Martin Luther King Jr. Day - no classes", kind: "break" },
  { id: 104, iso: "2027-01-22", display: "Jan 22",            label: "Last day to drop with 100% refund",  kind: "deadline" },
  { id: 105, iso: "2027-02-19", display: "Feb 19",            label: "Spring 2027 graduation application deadline", kind: "deadline" },
  { id: 106, iso: "2027-02-22", isoEnd: "2027-02-27", display: "Feb 22 - 27", label: "Spring break - no classes", kind: "break" },
  { id: 107, iso: "2027-03-08", isoEnd: "2027-03-13", display: "Mar 8 - 13",  label: "Mid-term examination week", kind: "exam" },
  { id: 108, iso: "2027-03-15", display: "Mar 15",            label: "Mid-term grades due",                kind: "deadline" },
  { id: 109, iso: "2027-03-22", display: "Mar 22",            label: "Mandatory registration begins",      kind: "class" },
  { id: 110, iso: "2027-03-26", display: "Mar 26",            label: "Easter recess - Good Friday",        kind: "break" },
  { id: 111, iso: "2027-04-09", display: "Apr 9",             label: "Last day to drop a class with a W",  kind: "deadline" },
  { id: 112, iso: "2027-04-16", display: "Apr 16",            label: "Last day to withdraw from the University", kind: "deadline" },
  { id: 113, iso: "2027-04-23", display: "Apr 23",            label: "Last day of class",                  kind: "class" },
  { id: 114, iso: "2027-04-24", isoEnd: "2027-04-26", display: "Apr 24 - 26", label: "Reading days",       kind: "break" },
  { id: 115, iso: "2027-04-27", isoEnd: "2027-05-01", display: "Apr 27 - May 1", label: "Final examinations", kind: "exam" },
  { id: 116, iso: "2027-05-04", display: "May 4",             label: "Final grades due by 12:00 PM",       kind: "deadline" },
  { id: 117, iso: "2027-05-09", display: "May 9",             label: "Spring commencement",                kind: "event" },
];

// Today as "2026-09-22". Built from the local date parts on purpose:
// toISOString() converts to UTC first, so after 8 PM Eastern it returns
// TOMORROW's date and today's entry would stop being "today" early.
export function todayIso() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

// How many days until an iso date. Positive means future, 0 means today,
// negative means past.
export function daysUntil(iso: string) {
  // "T00:00:00" forces the browser to read this as LOCAL midnight. Without it,
  // JavaScript treats a bare "2026-12-04" as UTC, which is off by a day for
  // anyone west of London.
  const target = new Date(iso + "T00:00:00").getTime();

  const now = new Date();
  // Zero out the clock so we compare whole days, not hours. Otherwise "3 days"
  // becomes "2 days" depending on the time of the afternoon.
  now.setHours(0, 0, 0, 0);

  // 86,400,000 is the number of milliseconds in a day: 1000 * 60 * 60 * 24.
  return Math.round((target - now.getTime()) / 86400000);
}