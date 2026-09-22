// GAME HELPERS - filtering and record math that works on ANY list of games.
//
// The old versions in src/data/sports.ts read the hardcoded array directly,
// which meant they could only ever describe that array. Passing the list in as
// an argument is what lets the same functions work on downloaded data.

import type { Game } from "@/data/sports";

export const sportFilters = [
  "All",
  "Football",
  "Volleyball",
  "Women's Soccer",
  "Cross Country",
];

// Today as "2026-09-22". Built from the local date parts on purpose:
// toISOString() converts to UTC first, so after 8 PM Eastern it returns
// TOMORROW's date and games would drop off the schedule a day early.
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

// Played games, newest first - reverse() because the data is stored oldest
// first, and the most recent result is what someone opening the app wants.
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

// Counts W / L / T. A canceled game has no outcome, so it's excluded
// automatically without needing its own check.
export function record(games: Game[], sport: string) {
  const played = bySport(games, sport);
  return {
    wins: played.filter((g) => g.outcome === "W").length,
    losses: played.filter((g) => g.outcome === "L").length,
    ties: played.filter((g) => g.outcome === "T").length,
  };
}