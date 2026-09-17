// Every 2026 fall sports date from lulions.com.
// One flat array of all sports — the screen filters it, so adding a new sport
// later means adding rows here and nothing else.
//
// outcome: "W" won, "L" lost, "T" tied, "" not played yet or canceled.
// The screen turns outcome into a color, so this file stays pure data.

export type Game = {
  id: number;
  sport: "Football" | "Volleyball" | "Women's Soccer" | "Cross Country";
  iso: string;      // sortable date, "2026-09-05"
  date: string;     // display date, "Sep 5"
  time: string;
  opponent: string;
  site: "Home" | "Away" | "Neutral";
  place: string;
  outcome: "W" | "L" | "T" | "";
  score: string;    // "" when not played
  note: string;     // "" when there's nothing special
};

export const games: Game[] = [
  // ---------- FOOTBALL ----------
  { id: 101, sport: "Football", iso: "2026-09-05", date: "Sep 5",  time: "6:00 PM", opponent: "West Chester",           site: "Home",    place: "Lincoln University, PA",  outcome: "L", score: "13-21", note: "" },
  { id: 102, sport: "Football", iso: "2026-09-12", date: "Sep 12", time: "3:00 PM", opponent: "Mississippi Valley St.", site: "Neutral", place: "Chicago, IL",             outcome: "L", score: "20-31", note: "Chicago Football Classic" },
  { id: 103, sport: "Football", iso: "2026-09-19", date: "Sep 19", time: "1:00 PM", opponent: "Shaw",                   site: "Away",    place: "Raleigh, NC",             outcome: "",  score: "",      note: "" },
  { id: 104, sport: "Football", iso: "2026-09-26", date: "Sep 26", time: "1:00 PM", opponent: "Bluefield State",        site: "Home",    place: "Lincoln University, PA",  outcome: "",  score: "",      note: "" },
  { id: 105, sport: "Football", iso: "2026-10-03", date: "Oct 3",  time: "1:00 PM", opponent: "Virginia State",         site: "Neutral", place: "Rochester, NY",           outcome: "",  score: "",      note: "Frederick Douglass Classic" },
  { id: 106, sport: "Football", iso: "2026-10-10", date: "Oct 10", time: "1:00 PM", opponent: "Elizabeth City State",   site: "Away",    place: "Elizabeth City, NC",      outcome: "",  score: "",      note: "" },
  { id: 107, sport: "Football", iso: "2026-10-17", date: "Oct 17", time: "2:00 PM", opponent: "Johnson C. Smith",       site: "Away",    place: "Charlotte, NC",           outcome: "",  score: "",      note: "" },
  { id: 108, sport: "Football", iso: "2026-10-24", date: "Oct 24", time: "1:00 PM", opponent: "Winston-Salem State",    site: "Home",    place: "Lincoln University, PA",  outcome: "",  score: "",      note: "Homecoming / Senior Day" },
  { id: 109, sport: "Football", iso: "2026-10-30", date: "Oct 30", time: "7:00 PM", opponent: "Virginia Union",         site: "Neutral", place: "Lincoln Financial Field", outcome: "",  score: "",      note: "Philadelphia" },
  { id: 110, sport: "Football", iso: "2026-11-07", date: "Nov 7",  time: "1:00 PM", opponent: "Bowie State",            site: "Away",    place: "Bowie, MD",               outcome: "",  score: "",      note: "" },

  // ---------- VOLLEYBALL ----------
  { id: 201, sport: "Volleyball", iso: "2026-08-28", date: "Aug 28", time: "3:00 PM",  opponent: "West Chester",         site: "Neutral", place: "West Chester, PA",       outcome: "L", score: "0-3", note: "West Chester Tournament" },
  { id: 202, sport: "Volleyball", iso: "2026-08-29", date: "Aug 29", time: "11:00 AM", opponent: "Jefferson",            site: "Neutral", place: "West Chester, PA",       outcome: "L", score: "0-3", note: "West Chester Tournament" },
  { id: 203, sport: "Volleyball", iso: "2026-08-29", date: "Aug 29", time: "3:00 PM",  opponent: "Caldwell",             site: "Neutral", place: "West Chester, PA",       outcome: "L", score: "0-3", note: "West Chester Tournament" },
  { id: 204, sport: "Volleyball", iso: "2026-09-02", date: "Sep 2",  time: "6:00 PM",  opponent: "Caldwell",             site: "Away",    place: "Caldwell, NJ",           outcome: "L", score: "0-3", note: "" },
  { id: 205, sport: "Volleyball", iso: "2026-09-05", date: "Sep 5",  time: "12:00 PM", opponent: "Goldey-Beacom",        site: "Away",    place: "Wilmington, DE",         outcome: "L", score: "0-3", note: "" },
  { id: 206, sport: "Volleyball", iso: "2026-09-09", date: "Sep 9",  time: "6:00 PM",  opponent: "Jefferson",            site: "Away",    place: "Philadelphia, PA",       outcome: "L", score: "0-3", note: "" },
  { id: 207, sport: "Volleyball", iso: "2026-09-15", date: "Sep 15", time: "7:00 PM",  opponent: "Millersville",         site: "Away",    place: "Millersville, PA",       outcome: "L", score: "0-3", note: "" },
  { id: 208, sport: "Volleyball", iso: "2026-09-19", date: "Sep 19", time: "1:00 PM",  opponent: "Cheyney",              site: "Home",    place: "Oxford, PA",             outcome: "",  score: "",    note: "" },
  { id: 209, sport: "Volleyball", iso: "2026-09-21", date: "Sep 21", time: "6:00 PM",  opponent: "Shaw",                 site: "Away",    place: "Raleigh, NC",            outcome: "",  score: "",    note: "" },
  { id: 210, sport: "Volleyball", iso: "2026-09-24", date: "Sep 24", time: "6:00 PM",  opponent: "Virginia State",       site: "Home",    place: "Oxford, PA",             outcome: "",  score: "",    note: "" },
  { id: 211, sport: "Volleyball", iso: "2026-09-28", date: "Sep 28", time: "6:00 PM",  opponent: "Elizabeth City State", site: "Away",    place: "Elizabeth City, NC",     outcome: "",  score: "",    note: "" },
  { id: 212, sport: "Volleyball", iso: "2026-10-02", date: "Oct 2",  time: "3:00 PM",  opponent: "Livingstone",          site: "Neutral", place: "Winston-Salem, NC",      outcome: "",  score: "",    note: "CIAA Roundup #1" },
  { id: 213, sport: "Volleyball", iso: "2026-10-02", date: "Oct 2",  time: "7:00 PM",  opponent: "Claflin",              site: "Neutral", place: "Winston-Salem, NC",      outcome: "",  score: "",    note: "CIAA Roundup #1" },
  { id: 214, sport: "Volleyball", iso: "2026-10-03", date: "Oct 3",  time: "1:00 PM",  opponent: "Winston-Salem State",  site: "Neutral", place: "Winston-Salem, NC",      outcome: "",  score: "",    note: "CIAA Roundup #1" },
  { id: 215, sport: "Volleyball", iso: "2026-10-03", date: "Oct 3",  time: "5:00 PM",  opponent: "Fayetteville State",   site: "Neutral", place: "Winston-Salem, NC",      outcome: "",  score: "",    note: "CIAA Roundup #1" },
  { id: 216, sport: "Volleyball", iso: "2026-10-04", date: "Oct 4",  time: "9:00 AM",  opponent: "Bluefield State",      site: "Neutral", place: "Winston-Salem, NC",      outcome: "",  score: "",    note: "CIAA Roundup #1" },
  { id: 217, sport: "Volleyball", iso: "2026-10-04", date: "Oct 4",  time: "5:00 PM",  opponent: "Johnson C. Smith",     site: "Neutral", place: "Winston-Salem, NC",      outcome: "",  score: "",    note: "CIAA Roundup #1" },
  { id: 218, sport: "Volleyball", iso: "2026-10-07", date: "Oct 7",  time: "7:00 PM",  opponent: "Felician",             site: "Away",    place: "Rutherford, NJ",         outcome: "",  score: "",    note: "" },
  { id: 219, sport: "Volleyball", iso: "2026-10-08", date: "Oct 8",  time: "6:00 PM",  opponent: "Virginia Union",       site: "Home",    place: "Oxford, PA",             outcome: "",  score: "",    note: "" },
  { id: 220, sport: "Volleyball", iso: "2026-10-12", date: "Oct 12", time: "6:00 PM",  opponent: "Virginia State",       site: "Away",    place: "Petersburg, VA",         outcome: "",  score: "",    note: "" },
  { id: 221, sport: "Volleyball", iso: "2026-10-14", date: "Oct 14", time: "7:00 PM",  opponent: "Chestnut Hill",        site: "Away",    place: "Philadelphia, PA",       outcome: "",  score: "",    note: "" },
  { id: 222, sport: "Volleyball", iso: "2026-10-16", date: "Oct 16", time: "11:00 AM", opponent: "Bluefield State",      site: "Neutral", place: "Ettrick, VA",            outcome: "",  score: "",    note: "CIAA Roundup #2" },
  { id: 223, sport: "Volleyball", iso: "2026-10-16", date: "Oct 16", time: "7:00 PM",  opponent: "Claflin",              site: "Neutral", place: "Ettrick, VA",            outcome: "",  score: "",    note: "CIAA Roundup #2" },
  { id: 224, sport: "Volleyball", iso: "2026-10-17", date: "Oct 17", time: "1:00 PM",  opponent: "Livingstone",          site: "Neutral", place: "Ettrick, VA",            outcome: "",  score: "",    note: "CIAA Roundup #2" },
  { id: 225, sport: "Volleyball", iso: "2026-10-17", date: "Oct 17", time: "7:00 PM",  opponent: "Fayetteville State",   site: "Neutral", place: "Ettrick, VA",            outcome: "",  score: "",    note: "CIAA Roundup #2" },
  { id: 226, sport: "Volleyball", iso: "2026-10-18", date: "Oct 18", time: "1:00 PM",  opponent: "Winston-Salem State",  site: "Neutral", place: "Ettrick, VA",            outcome: "",  score: "",    note: "CIAA Roundup #2" },
  { id: 227, sport: "Volleyball", iso: "2026-10-18", date: "Oct 18", time: "5:00 PM",  opponent: "Johnson C. Smith",     site: "Neutral", place: "Ettrick, VA",            outcome: "",  score: "",    note: "CIAA Roundup #2" },
  { id: 228, sport: "Volleyball", iso: "2026-10-22", date: "Oct 22", time: "6:00 PM",  opponent: "Bowie State",          site: "Away",    place: "Bowie, MD",              outcome: "",  score: "",    note: "" },
  { id: 229, sport: "Volleyball", iso: "2026-10-26", date: "Oct 26", time: "6:00 PM",  opponent: "Elizabeth City State", site: "Home",    place: "Oxford, PA",             outcome: "",  score: "",    note: "" },
  { id: 230, sport: "Volleyball", iso: "2026-10-29", date: "Oct 29", time: "6:00 PM",  opponent: "Virginia Union",       site: "Away",    place: "Richmond, VA",           outcome: "",  score: "",    note: "" },
  { id: 231, sport: "Volleyball", iso: "2026-11-02", date: "Nov 2",  time: "6:00 PM",  opponent: "Bowie State",          site: "Home",    place: "Oxford, PA",             outcome: "",  score: "",    note: "" },
  { id: 232, sport: "Volleyball", iso: "2026-11-05", date: "Nov 5",  time: "6:00 PM",  opponent: "Shaw",                 site: "Home",    place: "Oxford, PA",             outcome: "",  score: "",    note: "" },

  // ---------- WOMEN'S SOCCER ----------
  { id: 301, sport: "Women's Soccer", iso: "2026-08-27", date: "Aug 27", time: "3:00 PM",  opponent: "Pitt-Bradford",        site: "Home", place: "LU Athletics Stadium", outcome: "",  score: "", note: "Canceled" },
  { id: 302, sport: "Women's Soccer", iso: "2026-09-02", date: "Sep 2",  time: "2:00 PM",  opponent: "Bluefield State",      site: "Home", place: "LU Athletics Stadium", outcome: "T", score: "2-2", note: "" },
  { id: 303, sport: "Women's Soccer", iso: "2026-09-07", date: "Sep 7",  time: "1:30 PM",  opponent: "Shaw",                 site: "Away", place: "Raleigh, NC",          outcome: "L", score: "0-1", note: "" },
  { id: 304, sport: "Women's Soccer", iso: "2026-09-13", date: "Sep 13", time: "6:00 PM",  opponent: "Salem",                site: "Home", place: "LU Athletics Stadium", outcome: "T", score: "1-1", note: "" },
  { id: 305, sport: "Women's Soccer", iso: "2026-09-16", date: "Sep 16", time: "2:00 PM",  opponent: "Monroe",               site: "Home", place: "LU Athletics Stadium", outcome: "L", score: "0-4", note: "" },
  { id: 306, sport: "Women's Soccer", iso: "2026-09-20", date: "Sep 20", time: "12:00 PM", opponent: "Felician",             site: "Away", place: "Rutherford, NJ",       outcome: "",  score: "", note: "" },
  { id: 307, sport: "Women's Soccer", iso: "2026-09-22", date: "Sep 22", time: "7:00 PM",  opponent: "Chestnut Hill",        site: "Away", place: "Lafayette Hill, PA",   outcome: "",  score: "", note: "" },
  { id: 308, sport: "Women's Soccer", iso: "2026-09-25", date: "Sep 25", time: "1:00 PM",  opponent: "Georgian Court",       site: "Home", place: "LU Athletics Stadium", outcome: "",  score: "", note: "" },
  { id: 309, sport: "Women's Soccer", iso: "2026-09-30", date: "Sep 30", time: "2:00 PM",  opponent: "Virginia State",       site: "Home", place: "LU Athletics Stadium", outcome: "",  score: "", note: "Breast Cancer Awareness" },
  { id: 310, sport: "Women's Soccer", iso: "2026-10-02", date: "Oct 2",  time: "1:00 PM",  opponent: "Caldwell",             site: "Home", place: "LU Athletics Stadium", outcome: "",  score: "", note: "Domestic Violence Awareness" },
  { id: 311, sport: "Women's Soccer", iso: "2026-10-06", date: "Oct 6",  time: "3:00 PM",  opponent: "Jefferson",            site: "Away", place: "Philadelphia, PA",     outcome: "",  score: "", note: "" },
  { id: 312, sport: "Women's Soccer", iso: "2026-10-10", date: "Oct 10", time: "12:00 PM", opponent: "Bridgeport",           site: "Home", place: "LU Athletics Stadium", outcome: "",  score: "", note: "Homecoming" },
  { id: 313, sport: "Women's Soccer", iso: "2026-10-14", date: "Oct 14", time: "3:30 PM",  opponent: "Wilmington (Del.)",    site: "Home", place: "LU Athletics Stadium", outcome: "",  score: "", note: "" },
  { id: 314, sport: "Women's Soccer", iso: "2026-10-17", date: "Oct 17", time: "1:00 PM",  opponent: "Post",                 site: "Away", place: "Waterbury, CT",        outcome: "",  score: "", note: "" },
  { id: 315, sport: "Women's Soccer", iso: "2026-10-20", date: "Oct 20", time: "3:00 PM",  opponent: "Goldey-Beacom",        site: "Away", place: "Wilmington, DE",       outcome: "",  score: "", note: "" },
  { id: 316, sport: "Women's Soccer", iso: "2026-10-23", date: "Oct 23", time: "12:00 PM", opponent: "Dominican (N.Y.)",     site: "Home", place: "LU Athletics Stadium", outcome: "",  score: "", note: "Senior Night" },
  { id: 317, sport: "Women's Soccer", iso: "2026-10-28", date: "Oct 28", time: "4:00 PM",  opponent: "Holy Family",          site: "Away", place: "Philadelphia, PA",     outcome: "",  score: "", note: "" },

  // ---------- CROSS COUNTRY (men's and women's run the same schedule) ----------
  // Meets are scored by team placement, not W/L, so outcome stays "" on all of them.
  { id: 401, sport: "Cross Country", iso: "2026-09-11", date: "Sep 11", time: "3:00 PM",  opponent: "DSU Stinger Invite",           site: "Away",    place: "Dover, DE",         outcome: "", score: "", note: "Meet" },
  { id: 402, sport: "Cross Country", iso: "2026-09-19", date: "Sep 19", time: "11:00 AM", opponent: "UMES Invitational",            site: "Away",    place: "Princess Anne, MD", outcome: "", score: "", note: "Meet" },
  { id: 403, sport: "Cross Country", iso: "2026-10-03", date: "Oct 3",  time: "3:00 PM",  opponent: "Virginia State HBCU Challenge", site: "Away",   place: "Petersburg, VA",    outcome: "", score: "", note: "Meet" },
  { id: 404, sport: "Cross Country", iso: "2026-10-10", date: "Oct 10", time: "9:30 AM",  opponent: "Golden Ram Invitational",      site: "Away",    place: "West Chester, PA",  outcome: "", score: "", note: "Meet" },
  { id: 405, sport: "Cross Country", iso: "2026-10-15", date: "Oct 15", time: "3:00 PM",  opponent: "Championship Tune-Up",         site: "Home",    place: "Lincoln University, PA", outcome: "", score: "", note: "Meet" },
  { id: 406, sport: "Cross Country", iso: "2026-10-22", date: "Oct 22", time: "11:00 AM", opponent: "CIAA Championships",           site: "Neutral", place: "Green Hill Park, VA", outcome: "", score: "", note: "Championship" },
  { id: 407, sport: "Cross Country", iso: "2026-11-21", date: "Nov 21", time: "10:00 AM", opponent: "NCAA Regionals",               site: "Neutral", place: "Kernersville, NC",  outcome: "", score: "", note: "Championship" },
];

// The list of sports for the filter buttons. "All" is first so it's the default.
// We hard-code it instead of deriving it from the data because we want a
// specific order, and because the labels need to stay short enough to fit.
export const sportFilters = ["All", "Football", "Volleyball", "Women's Soccer", "Cross Country"];

// Games that have already happened, NEWEST FIRST — that's what people want to
// see on a results list.
export function pastGames(sport: string) {
  const today = new Date().toISOString().slice(0, 10);

  return games
    // Two conditions joined by &&: it must be in the past AND match the filter.
    // The second half is true whenever "All" is selected, which is how "All"
    // gets to mean "don't filter".
    .filter((g) => g.iso < today && (sport === "All" || g.sport === sport))
    // .sort() would reorder the ORIGINAL array, which would corrupt our data
    // for every other part of the app. [...array] makes a shallow copy first
    // so sorting is safe. The spread operator (...) is doing that copying.
    .slice()
    // b.iso.localeCompare(a.iso) sorts descending. Flipping a and b flips the
    // direction. localeCompare returns negative / zero / positive, which is
    // exactly what sort() wants.
    .sort((a, b) => b.iso.localeCompare(a.iso));
}

// Games still to come, SOONEST FIRST.
export function upcomingGames(sport: string) {
  const today = new Date().toISOString().slice(0, 10);

  return games
    .filter((g) => g.iso >= today && (sport === "All" || g.sport === sport))
    .slice()
    .sort((a, b) => a.iso.localeCompare(b.iso));
}

// Counts wins, losses and ties for the record line at the top.
export function record(sport: string) {
  const played = pastGames(sport);

  // .filter().length is the shortest way to count matches: filter to only the
  // ones you want, then ask how many there are.
  return {
    wins:   played.filter((g) => g.outcome === "W").length,
    losses: played.filter((g) => g.outcome === "L").length,
    ties:   played.filter((g) => g.outcome === "T").length,
  };
}
