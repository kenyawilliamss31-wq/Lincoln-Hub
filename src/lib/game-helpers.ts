// Game helpers - filtering and record math that works on any list of games.
// Passing the list in as an argument is what lets the same functions work on
// downloaded data, not just the bundled array.

import type { Game } from "@/data/sports";

export const sportFilters = [
  "All",
  "Football",
  "Volleyball",
  "Women's Soccer",
  "Cross Country",
];

// Local date, not UTC - toISOString() returns tomorrow's date after 8 PM
// Eastern and games would drop off the schedule a day early.
function todayIso() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

// One shared filter. "All" skips the sport check entirely.
function bySport(games: Game[], sport: string) {
  return sport === "All" ? games : games.filter((g) => g.sport === sport);
}

// Played games, newest first.
export function pastGames(games: Game[], sport: string) {
  const today = todayIso();
  return bySport(games, sport)
    .filter((g) => g.iso <= today)
    .reverse();
}

export function upcomingGames(games: Game[], sport: string) {
  const today = todayIso();
  return bySport(games, sport).filter((g) => g.iso > today);
}

// Counts W / L / T. Canceled games have no outcome, so they're excluded
// without needing their own check.
export function record(games: Game[], sport: string) {
  const played = bySport(games, sport);
  return {
    wins: played.filter((g) => g.outcome === "W").length,
    losses: played.filter((g) => g.outcome === "L").length,
    ties: played.filter((g) => g.outcome === "T").length,
  };
}