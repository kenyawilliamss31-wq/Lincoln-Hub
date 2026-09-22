// SPORTS - three-across grid, live from Lincoln's athletics calendar feed.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { pastGames, record, sportFilters, upcomingGames } from "@/lib/game-helpers";
import { useRemote } from "@/lib/remote";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
// The hardcoded list is now only the offline fallback, not the main source.
import { games as bundledGames, type Game } from "@/data/sports";

// One icon per sport. A plain object used as a lookup table beats a chain of
// if-statements: adding a sport is one line here, not a new branch.
// Real team logos are trademarked, so sport icons stand in for them.
const SPORT_ICONS: Record<string, string> = {
  "Football": "american-football",
  "Volleyball": "tennisball",
  "Women's Soccer": "football",     // Ionicons calls a soccer ball "football"
  "Cross Country": "walk",
};

export default function SportsScreen() {
  // useState gives a value plus a function to change it. Calling setSport makes
  // React re-run this component with the new value, so the grids below redraw
  // on their own. "All" is the starting filter.
  const [sport, setSport] = useState("All");

  // Downloads sports.json, rebuilt every 6 hours from lulions.com.
  // refreshing and refresh drive pull-to-refresh; updatedLabel is "3h ago".
  const { data: games, status, refreshing, refresh, updatedLabel } =
    useRemote<Game[]>("sports.json", bundledGames);

  // These recalculate on every render, so they always match both the current
  // filter AND whichever data source won (live, cached, or bundled).
  const results = pastGames(games, sport);
  const upcoming = upcomingGames(games, sport);
  // Passing results, not games: the record should only count played games.
  const rec = record(results, sport);

  return (
    <ScreenShell
      eyebrow="Lincoln Lions"
      title="Sports"
      sourceUrl="https://lulions.com/calendar"
      sourceLabel="lulions.com"
      updatedLabel={updatedLabel}
      onRefresh={refresh}
      refreshing={refreshing}
    >
      {/* DATA STATUS. Small, but honest: it says whether these are live scores,
          a copy saved on this phone, or the data compiled into the app. */}
      <Text style={styles.status}>
        {status === "live"
          ? "Live from lulions.com"
          : status === "cached"
          ? "Saved on this phone"
          : status === "loading"
          ? "Checking for updates..."
          : "Offline - showing saved data"}
      </Text>

      {/* FILTER CHIPS - wrap to a second line on narrow phones. */}
      <View style={styles.filterRow}>
        {sportFilters.map((name) => {
          const active = name === sport;

          return (
            <Pressable
              key={name}
              // The arrow function matters: onPress wants a function to call
              // LATER. onPress={setSport(name)} would fire during render and
              // cause an infinite loop.
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

      {/* RECORD LINE - only meaningful once games have been played. */}
      {results.length > 0 && (
        <Text style={styles.record}>
          {rec.wins}-{rec.losses}
          {/* Ties only happen in soccer, so hide the third number rather than
              printing a pointless "-0". */}
          {rec.ties > 0 ? "-" + rec.ties : ""} this season
        </Text>
      )}

      <Text style={styles.heading}>Results</Text>

      {/* THE GRID. flexWrap on this PARENT is what breaks tiles into rows: each
          tile is 31% wide, so three fit per row and the fourth wraps on its own.
          These two rules must live on the parent, never on the tiles. */}
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

// One tile in the grid. Its own component so the markup exists in ONE place -
// change the padding here and both grids change together.
// { game }: { game: Game } destructures the props object and tells TypeScript
// the shape, so autocomplete knows game.opponent exists.
function GameTile({ game }: { game: Game }) {
  // Cross country is scored by team placement, not W/L, so a red or green ring
  // would be misleading. Navy is the neutral "this is just an event" color.
  const isTrack = game.sport === "Cross Country";

  // Cancellations live in note, not outcome - a cancellation isn't a result.
  const isCanceled = game.note === "Canceled";

  // Chained ternaries read top to bottom as a list of rules, most specific
  // first. Track and canceled both override the W/L coloring below them.
  const outcomeColor =
    isTrack || isCanceled ? colors.navy :
    game.outcome === "W" ? colors.green :
    game.outcome === "L" ? colors.red :
    colors.grey;

  const siteLabel = game.site === "Home" ? "@ HOME" : "AWAY";

  return (
    <View style={styles.tile}>
      {/* ICON BADGE. The ring carries the result, so green or red reads at a
          glance before any text is read. */}
      <View style={[styles.iconCircle, { borderColor: outcomeColor }]}>
        {/* "as any" tells TypeScript to stop checking this one value. Ionicons
            has about 1300 valid names and TypeScript can't confirm that a name
            pulled out of a plain object is one of them. */}
        <Ionicons
          name={SPORT_ICONS[game.sport] as any}
          size={17}
          color={outcomeColor}
        />
      </View>

      <Text style={styles.date}>{game.date}</Text>

      {/* numberOfLines={2} caps this at two lines and adds "..." past that.
          Without it, "Mississippi Valley State" would run three lines and make
          its tile taller than the two beside it, breaking the row. */}
      <Text style={styles.opponent} numberOfLines={2}>
        {game.opponent}
      </Text>

      {/* Home games get the orange accent - those are the ones a student can
          actually walk to. Track hides this line, since "@ HOME" under a meet
          name adds nothing. An empty string renders nothing while keeping the
          element in place, so tile heights stay consistent. */}
      <Text
        style={[styles.site, game.site === "Home" && { color: colors.orange }]}
      >
        {isTrack ? "" : siteLabel}
      </Text>

      {/* flex: 1 on this spacer absorbs the leftover vertical space, pinning
          everything below it to the bottom of the tile. That's what keeps the
          scores aligned across a row when one opponent name wraps and the
          others don't. */}
      <View style={styles.spacer} />

      {/* Three cases, checked most specific first. Order matters: a canceled
          game has no outcome, so an outcome check first would fall through to
          printing a start time for a game that isn't happening. */}
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
    flexWrap: "wrap",       // lets the chips spill onto a second row
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,      // any number over half the height gives a pill
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
    flexWrap: "wrap",       // this is what makes it a grid, not one long row
    gap: 8,
  },
  tile: {
    width: "31%",           // three across; the spare 7% covers the two gaps
    minHeight: 118,         // a floor, not a fixed height - keeps short tiles
                            // from looking squashed beside taller ones
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 9,
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,       // exactly half the width = a perfect circle
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    // no borderColor here - GameTile passes it so it changes per outcome
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
    // no color here - passed in per game so W is green and L is red
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