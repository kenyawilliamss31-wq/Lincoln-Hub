// SPORTS â€” full 2026 fall season. Results on top, schedule below,
// with buttons to filter down to one sport.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import {
  pastGames,
  record,
  sportFilters,
  upcomingGames,
  type Game,
} from "@/data/sports";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SportsScreen() {
  // useState gives us a value plus a function that changes it. When we call
  // setSport, React re-runs this whole component with the new value, so the
  // lists below redraw automatically. "All" is the starting value.
  const [sport, setSport] = useState("All");

  // These run again on every render, so they always reflect the current filter.
  const results = pastGames(sport);
  const upcoming = upcomingGames(sport);
  const rec = record(sport);

  return (
    <ScreenShell eyebrow="Lincoln Lions" title="Sports">
      {/* FILTER ROW â€” wraps onto a second line on narrow phones. */}
      <View style={styles.filterRow}>
        {sportFilters.map((name) => {
          // Comparing to the current state tells us which chip to highlight.
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

      {/* RECORD LINE â€” only worth showing when games have actually been played. */}
      {results.length > 0 && (
        <Text style={styles.record}>
          {rec.wins}-{rec.losses}
          {/* Ties only appear in soccer, so we hide the third number when
              there aren't any rather than printing a pointless "-0". */}
          {rec.ties > 0 ? "-" + rec.ties : ""} this season
        </Text>
      )}

      <Text style={styles.heading}>Results</Text>
      {results.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
      {results.length === 0 && <Text style={styles.empty}>No games played yet.</Text>}

      <Text style={styles.heading}>Upcoming</Text>
      {upcoming.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
      {upcoming.length === 0 && <Text style={styles.empty}>Season complete.</Text>}

      <Text style={styles.source}>
        Schedules and scores from lulions.com. Check there for changes.
      </Text>
    </ScreenShell>
  );
}

// A small component used twice above. Pulling it out means the card markup
// exists in ONE place â€” fix the padding here and both lists change.
// { game }: { game: Game } destructures the props object and tells TypeScript
// the shape, so autocomplete knows game.opponent exists.
function GameCard({ game }: { game: Game }) {
  // Picking the color from the outcome. A plain object used as a lookup table
  // is cleaner than three if-statements.
  const outcomeColor =
    game.outcome === "W" ? colors.green :
    game.outcome === "L" ? colors.red :
    colors.grey;

  // "vs" for home games, "at" for away, "vs" for neutral-site games too â€”
  // that's the convention every sports site uses.
  const prefix = game.site === "Away" ? "at" : "vs";

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.sportTag}>{game.sport}</Text>
        <Text style={styles.date}>
          {game.date} - {game.time}
        </Text>
      </View>

      <Text style={styles.opponent}>
        {prefix} {game.opponent}
      </Text>

      <Text style={styles.place}>{game.place}</Text>

      {/* Only render the score badge when there IS an outcome. An empty
          string is falsy, so unplayed games skip this entirely. */}
      {game.outcome !== "" && (
        <Text style={[styles.score, { color: outcomeColor }]}>
          {game.outcome === "W" ? "Won" : game.outcome === "L" ? "Lost" : "Tied"}{" "}
          {game.score}
        </Text>
      )}

      {/* Notes like "Homecoming" or "Canceled" only exist on some games. */}
      {game.note !== "" && <Text style={styles.note}>{game.note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",   // lets the chips spill onto a second row
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,  // any number bigger than half the height = a pill
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",  // pushes the two children to the edges
    marginBottom: 6,
  },
  sportTag: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.orange,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  date: {
    fontSize: 11,
    color: colors.grey,
  },
  opponent: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.navy,
    lineHeight: 21,
  },
  place: {
    fontSize: 13,
    color: colors.grey,
    marginTop: 2,
  },
  score: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
    // no color here â€” GameCard passes it in so it can change per game
  },
  note: {
    fontSize: 12,
    color: colors.grey,
    fontStyle: "italic",
    marginTop: 4,
  },
});
