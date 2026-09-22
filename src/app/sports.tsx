// SPORTS - three-across grid, live data from Lincoln's athletics feed.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { pastGames, record, sportFilters, upcomingGames } from "@/lib/game-helpers";
import { useRemote } from "@/lib/remote";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
// The hardcoded list is now only the offline fallback, not the main source.
import { games as bundledGames, type Game } from "@/data/sports";

// One icon per sport. Real team logos are trademarked, so these stand in.
const SPORT_ICONS: Record<string, string> = {
  "Football": "american-football",
  "Volleyball": "tennisball",
  "Women's Soccer": "football",     // Ionicons calls a soccer ball "football"
  "Cross Country": "walk",
};

export default function SportsScreen() {
  const [sport, setSport] = useState("All");

  // Downloads sports.json, which the GitHub Action rebuilds every morning from
  // lulions.com. Until it arrives (or if it fails), games is the bundled list.
  const { data: games, status } = useRemote<Game[]>("sports.json", bundledGames);

  // These recalculate on every render, so they always match both the current
  // filter AND whichever data source won.
  const results = pastGames(games, sport);
  const upcoming = upcomingGames(games, sport);
  const rec = record(results, sport);

  return (
    <ScreenShell eyebrow="Lincoln Lions" title="Sports">
      {/* DATA STATUS. Small, but it's honest: it tells you whether you're
          looking at live scores or the copy that shipped with the app. */}
      <Text style={styles.status}>
        {status === "live"
          ? "Live from lulions.com"
          : status === "loading"
          ? "Checking for updates..."
          : "Offline - showing saved data"}
      </Text>

      {/* FILTER CHIPS */}
      <View style={styles.filterRow}>
        {sportFilters.map((name) => {
          const active = name === sport;
          return (
            <Pressable
              key={name}
              // The arrow function matters: onPress wants a function to call
              // LATER. onPress={setSport(name)} would fire during render.
              onPress={() => setSport(name)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {results.length > 0 && (
        <Text style={styles.record}>
          {rec.wins}-{rec.losses}
          {/* Ties only happen in soccer, so hide the third number rather than
              printing a pointless "-0". */}
          {rec.ties > 0 ? "-" + rec.ties : ""} this season
        </Text>
      )}

      <Text style={styles.heading}>Results</Text>

      {/* flexWrap on this PARENT is what breaks the tiles into rows. Each tile
          is 31% wide, so three fit and the fourth wraps. */}
      <View style={styles.grid}>
        {results.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </View>

      {results.length === 0 && (
        <Text style={styles.empty}>No games played yet.</Text>
      )}

      <Text style={styles.heading}>Upcoming</Text>

      <View style={styles.grid}>
        {upcoming.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </View>

      {upcoming.length === 0 && (
        <Text style={styles.empty}>Season complete.</Text>
      )}

      <Text style={styles.source}>
        Schedules and scores from the official Lincoln Lions athletics calendar.
        Icons stand in for team logos.
      </Text>
    </ScreenShell>
  );
}

// One tile. Its own component so the markup exists in ONE place and both grids
// change together.
function GameTile({ game }: { game: Game }) {
  // Cross country is scored by team placement, not W/L, so a red or green ring
  // would be misleading. Navy is the neutral color.
  const isTrack = game.sport === "Cross Country";

  // Cancellations live in note, not outcome - a cancellation isn't a result.
  const isCanceled = game.note === "Canceled";

  // Rules top to bottom, most specific first.
  const outcomeColor =
    isTrack || isCanceled ? colors.navy :
    game.outcome === "W" ? colors.green :
    game.outcome === "L" ? colors.red :
    colors.grey;

  const siteLabel = game.site === "Home" ? "@ HOME" : "AWAY";

  return (
    <View style={styles.tile}>
      <View style={[styles.iconCircle, { borderColor: outcomeColor }]}>
        {/* "as any" tells TypeScript to stop checking this value. Ionicons has
            about 1300 valid names and it can't confirm a name pulled out of a
            plain object is one of them. */}
        <Ionicons
          name={SPORT_ICONS[game.sport] as any}
          size={17}
          color={outcomeColor}
        />
      </View>

      <Text style={styles.date}>{game.date}</Text>

      {/* numberOfLines={2} caps this and adds "..." past it. Without it, a long
          opponent name makes one tile taller and breaks the row alignment. */}
      <Text style={styles.opponent} numberOfLines={2}>
        {game.opponent}
      </Text>

      {/* Home games get the orange accent - those are the ones a student can
          actually walk to. Track hides this line, since "@ HOME" under a meet
          name adds nothing. */}
      <Text
        style={[styles.site, game.site === "Home" && { color: colors.orange }]}
      >
        {isTrack ? "" : siteLabel}
      </Text>

      {/* flex: 1 here absorbs leftover vertical space, pinning the bottom line
          to the bottom of every tile so scores line up across a row. */}
      <View style={styles.spacer} />

      {/* Three cases, most specific first. Order matters: a canceled game has
          no outcome, so an outcome check first would fall through to printing a
          start time for a game that isn't happening. */}
      {isCanceled ? (
        <Text style={[styles.score, { color: colors.navy }]}>Canceled</Text>
      ) : game.outcome !== "" ? (
        <Text style={[styles.score, { color: outcomeColor }]}>
          {game.outcome} {game.score}
        </Text>
      ) : (
        <Text style={styles.time}>{game.time}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 11,
    color: colors.grey,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,      // anything over half the height gives a pill
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    fontSize: 13,
    color: colors.grey,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  record: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 4,
  },
  heading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",       // makes it a grid instead of one long row
    gap: 8,
  },
  tile: {
    width: "31%",           // three across; the spare 7% covers the two gaps
    minHeight: 118,         // a floor, not a fixed height
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 9,
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,       // half the width = a perfect circle
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    // borderColor comes from GameTile, so it changes per outcome
  },
  date: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 0.3,
  },
  opponent: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.navy,
    textAlign: "center",
    lineHeight: 14,
    marginTop: 2,
  },
  site: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.grey,
    letterSpacing: 0.6,     // wide spacing makes tiny uppercase legible
    marginTop: 2,
  },
  spacer: {
    flex: 1,
    minHeight: 4,
  },
  score: {
    fontSize: 12,
    fontWeight: "800",
    // color passed in per game
  },
  time: {
    fontSize: 10,
    color: colors.grey,
    fontWeight: "600",
  },
  empty: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 10,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 16,
  },
});