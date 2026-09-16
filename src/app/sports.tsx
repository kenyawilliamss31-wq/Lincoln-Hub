// SPORTS — past results with win/loss coloring, then upcoming games.
// Data from lulions.com, Lincoln's official athletics site.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

// Games already played. "outcome" is either "W" or "L" and drives the color.
// Both games so far were losses, so the green badge won't appear until the
// Lions win one — the code handles either case.
const pastGames = [
  { id: 1, date: "Sep 12", title: "Football vs Mississippi Valley State", outcome: "L", score: "20 - 31" },
  { id: 2, date: "Sep 5",  title: "Football vs West Chester", outcome: "L", score: "13 - 21" },
];

// Games not yet played, so no score and no color.
const upcoming = [
  { id: 1, date: "Sep 19", title: "Football at Shaw", detail: "1:00 PM — Away" },
  { id: 2, date: "Sep 21", title: "Volleyball at Shaw", detail: "6:00 PM — Away" },
  { id: 3, date: "Sep 24", title: "Volleyball vs Virginia State", detail: "6:00 PM — Home" },
  { id: 4, date: "Sep 26", title: "Football vs Bluefield State", detail: "1:00 PM — Home" },
  { id: 5, date: "Oct 3",  title: "Football vs Virginia State", detail: "1:00 PM — Home" },
];

export default function SportsScreen() {
  return (
    <ScreenShell eyebrow="Lions Athletics" title="Sports">
      <Text style={styles.sectionLabel}>RESULTS</Text>

      {pastGames.map((game) => {
        // We need a variable before returning JSX, so this .map() uses curly
        // braces and an explicit return. The shorter arrow-with-parentheses
        // form only works when you return JSX immediately.
        const isWin = game.outcome === "W";
        const resultColor = isWin ? colors.green : colors.red;
        // Computed once here rather than repeating the same ternary twice below.

        return (
          <View key={game.id} style={styles.card}>
            {/* Style ARRAY: first item is the fixed shape from StyleSheet,
                second overrides just the color. Later items win, which is how
                you mix preset styles with values computed at render time. */}
            <View style={[styles.badge, { backgroundColor: resultColor }]}>
              <Text style={styles.badgeText}>{game.outcome}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.title}>{game.title}</Text>
              <Text style={styles.meta}>{game.date}</Text>
            </View>

            {/* Score picks up the same win/loss color. */}
            <Text style={[styles.score, { color: resultColor }]}>
              {game.score}
            </Text>
          </View>
        );
      })}

      <Text style={styles.sectionLabel}>UPCOMING</Text>

      {upcoming.map((game) => (
        // No variable needed here, so this map uses the short form.
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
    flexDirection: "row",        // badge, text, and score sit in a row
    alignItems: "center",        // vertically centered against each other
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,            // half the width makes a circle
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    // no backgroundColor here on purpose — it's supplied inline per game
  },
  badgeText: {
    color: colors.card,          // white letter on the colored circle
    fontSize: 14,
    fontWeight: "700",
  },
  dateBox: {
    width: 54,                   // fixed width so every date lines up
    marginRight: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.orange,
  },
  info: {
    flex: 1,                     // absorbs leftover width so long team names
                                 // wrap instead of pushing the score off-screen
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
    // no color here — supplied inline so it matches the badge
  },
});