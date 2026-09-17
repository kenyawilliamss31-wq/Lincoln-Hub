// SPORTS - full 2026 fall season in a three-across grid, filterable by sport.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import {
  pastGames,
  record,
  sportFilters,
  upcomingGames,
  type Game,
} from "@/data/sports";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// One icon per sport. A plain object used as a lookup table beats a chain of
// if-statements: adding a sport is one line here, not a new branch.
// Real team logos are trademarked, so sport icons stand in for them.
const SPORT_ICONS: Record<string, string> = {
  "Football": "american-football",
  "Volleyball": "tennisball",
  "Women's Soccer": "football",      // Ionicons calls a soccer ball "football"
  "Cross Country": "walk",
};

export default function SportsScreen() {
  // useState gives us a value plus a function that changes it. Calling setSport
  // makes React re-run this component with the new value, so the grids below
  // redraw on their own. "All" is the starting value.
  const [sport, setSport] = useState("All");

  // These recalculate on every render, so they always match the current filter.
  const results = pastGames(sport);
  const upcoming = upcomingGames(sport);
  const rec = record(sport);

  return (
    <ScreenShell eyebrow="Lincoln Lions" title="Sports">
      {/* FILTER CHIPS - wrap onto a second line on narrow phones. */}
      <View style={styles.filterRow}>
        {sportFilters.map((name) => {
          const active = name === sport;

          return (
            <Pressable
              key={name}
              // The arrow function matters: onPress wants a function to call
              // LATER. Writing onPress={setSport(name)} would call it during
              // render and cause an infinite loop.
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

      {/* RECORD LINE - only worth showing once games have been played. */}
      {results.length > 0 && (
        <Text style={styles.record}>
          {rec.wins}-{rec.losses}
          {/* Ties only happen in soccer, so hide the third number when there
              aren't any rather than printing a pointless "-0". */}
          {rec.ties > 0 ? "-" + rec.ties : ""} this season
        </Text>
      )}

      <Text style={styles.heading}>Results</Text>

      {/* THE GRID. flexWrap on this parent is what breaks cards into rows -
          each card is 31% wide, so three fit per row and the fourth wraps.
          These rules have to live on the PARENT, never on the cards. */}
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
        Schedules and scores from lulions.com. Icons stand in for team logos.
      </Text>
    </ScreenShell>
  );
}

// One tile in the grid. Pulling it into its own component means the tile markup
// exists in ONE place - adjust the padding here and both grids change.
// { game }: { game: Game } destructures the props object and tells TypeScript
// the shape, so autocomplete knows game.opponent exists.
function GameTile({ game }: { game: Game }) {
  // Chained ternaries, read top to bottom like a list of rules. Grey covers
  // both ties and games that haven't been played.
  const outcomeColor =
    game.outcome === "W" ? colors.green :
    game.outcome === "L" ? colors.red :
    colors.grey;

  // "at" for away games, "vs" for home and neutral sites - the convention
  // every sports site uses.
  const prefix = game.site === "Away" ? "at" : "vs";

  return (
    <View style={styles.tile}>
      {/* ICON BADGE. The circle is tinted with the outcome color, so a green or
          red ring reads at a glance before you read any text. */}
      <View style={[styles.iconCircle, { borderColor: outcomeColor }]}>
        {/* "as any" tells TypeScript to stop checking this value. Ionicons has
            about 1300 valid names and TypeScript can't confirm that a name
            pulled out of a plain object matches one of them. */}
        <Ionicons
          name={SPORT_ICONS[game.sport] as any}
          size={17}
          color={outcomeColor}
        />
      </View>

      <Text style={styles.date}>{game.date}</Text>

      {/* numberOfLines={2} caps this at two lines and adds "..." if the name is
          longer. Without it, a long opponent name would make one tile taller
          than its neighbors and break the row alignment. */}
      <Text style={styles.opponent} numberOfLines={2}>
        {prefix} {game.opponent}
      </Text>

      {/* flex: 1 on this spacer pushes everything below it to the bottom of the
          tile, so the score lines up across all three cards in a row even when
          one opponent name wraps to two lines and another doesn't. */}
      <View style={styles.spacer} />

      {/* Only draw the score when there IS an outcome. An empty string is
          falsy, so unplayed games skip this entirely. */}
      {game.outcome !== "" ? (
        <Text style={[styles.score, { color: outcomeColor }]}>
          {game.outcome} {game.score}
        </Text>
      ) : (
        // Unplayed games show the start time in the same slot, so every tile
        // has something on its bottom line and none look truncated.
        <Text style={styles.time}>{game.time}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",     // lets the chips spill onto a second row
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,    // any number over half the height gives a pill
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
    flexWrap: "wrap",     // this is what makes it a grid instead of one long row
    gap: 8,
  },
  tile: {
    width: "31%",         // three across; the leftover 7% covers the two gaps
    minHeight: 118,       // a floor, not a fixed height - keeps short tiles
                          // from looking squashed next to taller ones
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 9,
    alignItems: "center", // centers everything horizontally in the tile
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,     // exactly half the width = a perfect circle
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    // no borderColor here - GameTile passes it in so it changes per outcome
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
  spacer: {
    flex: 1,              // absorbs leftover vertical space, pinning the score
                          // to the bottom of every tile
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