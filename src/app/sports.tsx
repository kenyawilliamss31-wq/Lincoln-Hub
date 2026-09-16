// SPORTS — past results with win/loss coloring, then upcoming games.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

// EDIT THE DATA: real opponents and real scores.
// "outcome" is either "W" or "L" and drives the color.
const pastGames = [
  { id: 1, date: "Sep 12", title: "Football vs Opponent", outcome: "W", score: "24 - 17" },
  { id: 2, date: "Sep 9",  title: "Volleyball vs Opponent", outcome: "L", score: "1 - 3" },
  { id: 3, date: "Sep 5",  title: "Soccer vs Opponent", outcome: "W", score: "2 - 0" },
  { id: 4, date: "Aug 30", title: "Football vs Opponent", outcome: "L", score: "10 - 28" },
];

const upcoming = [
  { id: 1, date: "Sep 19", title: "Football vs Opponent", detail: "1:00 PM — Home" },
  { id: 2, date: "Sep 23", title: "Volleyball vs Opponent", detail: "6:00 PM — Away" },
  { id: 3, date: "Oct 2",  title: "Basketball Scrimmage", detail: "7:00 PM — Home" },
];

export default function SportsScreen() {
  return (
    <ScreenShell eyebrow="Lions Athletics" title="Sports">
      <Text style={styles.sectionLabel}>RESULTS</Text>

      {pastGames.map((game) => {
        // A win gets green, a loss gets red. We compute the color ONCE here
        // instead of writing the same ternary three times in the JSX below.
        const isWin = game.outcome === "W";
        const resultColor = isWin ? colors.green : colors.red;

        return (
          <View key={game.id} style={styles.card}>
            {/* The colored badge. Note the style ARRAY: the first item is the
                shared shape from StyleSheet, the second overrides just the
                color. Later items win, so this is how you mix fixed styles
                with values computed at render time. */}
            <View style={[styles.badge, { backgroundColor: resultColor }]}>
              <Text style={styles.badgeText}>{game.outcome}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.title}>{game.title}</Text>
              <Text style={styles.meta}>{game.date}</Text>
            </View>

            {/* Score also picks up the win/loss color. */}
            <Text style={[styles.score, { color: resultColor }]}>
              {game.score}
            </Text>
          </View>
        );
      })}
      {/* Because we needed a variable before returning JSX, this .map() uses
          curly braces and an explicit "return". The arrow-with-parentheses
          shortcut only works when you return JSX immediately. */}

      <Text style={styles.sectionLabel}>UPCOMING</Text>

      {upcoming.map((game) => (
        <View key={game.id} style={styles.card}>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{game.date}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{game.title}</Text>
            <Text style={styles.meta}>{game.detail}</Text>
          </View>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    // no backgroundColor here — it's supplied inline per game
  },
  badgeText: {
    color: colors.card,      // white letter on the colored circle
    fontSize: 14,
    fontWeight: "700",
  },
  dateBox: {
    width: 54,
    marginRight: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.orange,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },
  meta: {
    fontSize: 13,
    color: colors.grey,
    marginTop: 1,
  },
  score: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
});