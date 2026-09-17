// Shared event data from LU Live. Both the Events screen and the Home banner
// import this — one source of truth.
//
// "iso" is the sortable date used by code. "date" is the pretty version we show.
// Storing both means we never have to parse "Sep 20" back into a real date.

export const events = [
  { id: 1,  iso: "2026-09-17", date: "Sep 17", time: "8 AM - 6 PM",      title: "Industry Exchange Week: STEM & Health Science", place: "TBD", host: "Office of Career Success" },
  { id: 2,  iso: "2026-09-17", date: "Sep 17", time: "12 - 1 PM",        title: "Registered Student Organization Meeting", place: "SUB Theatre", host: "Student Life and Development" },
  { id: 3,  iso: "2026-09-17", date: "Sep 17", time: "12:30 - 2 PM",     title: "Start Strong: Student Success Fair", place: "Bottom of the U", host: "Division of Student Success" },
  { id: 4,  iso: "2026-09-17", date: "Sep 17", time: "6 - 8 PM",         title: "ASA Aux Wars", place: "Wellness Auditorium", host: "African Student Association" },
  { id: 5,  iso: "2026-09-17", date: "Sep 17", time: "7:55 - 10:55 PM",  title: "Fear Factor", place: "Grim Auditorium", host: "Iota Phi Theta" },
  { id: 6,  iso: "2026-09-18", date: "Sep 18", time: "10 AM - 12 PM",    title: "Career Readiness: Job Searching", place: "Wright Hall 314", host: "Office of Career Success" },
  { id: 7,  iso: "2026-09-18", date: "Sep 18", time: "5 - 6 PM",         title: "Thurgood Marshall Law Society Interest Meeting", place: "Dickey Mock Court Room 312", host: "TMLS" },
  { id: 8,  iso: "2026-09-18", date: "Sep 18", time: "5 - 6:30 PM",      title: "Fitness Friday", place: "Wellness weight room", host: "Lion Heart Fitness Club" },
  { id: 9,  iso: "2026-09-19", date: "Sep 19", time: "6 - 10 PM",        title: "Movie Night", place: "Dickey Auditorium", host: "Royal Court" },
  { id: 10, iso: "2026-09-20", date: "Sep 20", time: "12 - 2 PM",        title: "Dorm Clean Up", place: "Ashmun and Lorraine Hansberry Hall", host: "Sigma Gamma Rho" },
  { id: 11, iso: "2026-09-20", date: "Sep 20", time: "12 - 4 PM",        title: "Campus Clean Up", place: "Meet at Top of U", host: "Iota Phi Theta" },
  { id: 12, iso: "2026-09-21", date: "Sep 21", time: "6 - 7 PM",         title: "Brother Circle", place: "LLC", host: "Counseling Services" },
  { id: 13, iso: "2026-09-22", date: "Sep 22", time: "11 AM - 12 PM",    title: "Resume Building & Cover Letters", place: "Wright Hall 314", host: "Office of Career Success" },
  { id: 14, iso: "2026-09-22", date: "Sep 22", time: "12 - 1:30 PM",     title: "Drone Flying", place: "Top of the U", host: "Computer Science Club" },
  { id: 15, iso: "2026-09-22", date: "Sep 22", time: "4:30 - 5:30 PM",   title: "Study Abroad 101", place: "TBD", host: "International Programs" },
  { id: 16, iso: "2026-09-23", date: "Sep 23", time: "7 - 9 PM",         title: "Ping Pong Tournament", place: "SUB Lair", host: "Campus Activities Board" },
  { id: 17, iso: "2026-09-24", date: "Sep 24", time: "12:30 - 2 PM",     title: "All-University Convocation", place: "International Cultural Center", host: "Lincoln University" },
  { id: 18, iso: "2026-09-24", date: "Sep 24", time: "12:30 - 2 PM",     title: "Senior Town Hall", place: "Dickey Auditorium", host: "Class of 2027" },
  { id: 19, iso: "2026-09-25", date: "Sep 25", time: "10 AM - 12 PM",    title: "Career Readiness: Career Fair Prep", place: "Wright Hall 314", host: "Office of Career Success" },
  { id: 20, iso: "2026-09-25", date: "Sep 25", time: "8 - 11:30 PM",     title: "Miss Black and Old Gold Pageant", place: "International Cultural Center", host: "Alpha Phi Alpha" },
  { id: 21, iso: "2026-09-28", date: "Sep 28", time: "3 - 5 PM",         title: "Meet President Allen: Open Office Hours", place: "Vail Hall 201", host: "Lincoln University" },
  { id: 22, iso: "2026-09-30", date: "Sep 30", time: "6 - 8 PM",         title: "Study With the AKAs: LinkedIn Edition", place: "Library 3rd Floor", host: "Alpha Kappa Alpha" },
  { id: 23, iso: "2026-10-01", date: "Oct 1",  time: "All day",          title: "Gilman Scholarship Deadline", place: "TBD", host: "International Programs" },
  { id: 24, iso: "2026-10-07", date: "Oct 7",  time: "11 AM - 2 PM",     title: "Study Abroad Fair", place: "LLC Cafe", host: "International Programs" },
  { id: 25, iso: "2026-10-08", date: "Oct 8",  time: "12:30 - 1:30 PM",  title: "Undergraduate Research Info Session", place: "Online", host: "Undergraduate Research" },
  { id: 26, iso: "2026-10-20", date: "Oct 20", time: "11 AM - 2 PM",     title: "Fall Career Fair 2026", place: "Wellness MPR", host: "Office of Career Success" },
  { id: 27, iso: "2026-10-29", date: "Oct 29", time: "12 - 1:30 PM",     title: "Majors on the U", place: "Student Union, 2nd Floor", host: "Division of Student Success" },
];

// Finds the soonest event that hasn't happened yet.
export function nextEvent() {
  // toISOString() gives "2026-09-17T12:48:00.000Z". slice(0, 10) cuts off
  // everything after the date, leaving "2026-09-17" — the same shape as our
  // iso values, so we can compare them as plain strings.
  const today = new Date().toISOString().slice(0, 10);

  // .find() walks the array and returns the FIRST item where the test is true,
  // or undefined if nothing matches. Our list is already in date order.
  return events.find((event) => event.iso >= today);
}

// Returns only events from today forward, so the Events screen never shows
// something that already happened.
export function upcomingEvents() {
  const today = new Date().toISOString().slice(0, 10);

  // .filter() returns a NEW array containing every item that passes the test.
  // find() gives you one item; filter() gives you all of them.
  return events.filter((event) => event.iso >= today);
}