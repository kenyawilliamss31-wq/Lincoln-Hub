// A reusable list row: white card, optional left column, title, and detail lines.
//
// Used by Events, Dining, Sports, Directory, Calendar and Map. One component,
// six screens. If you decide cards should have rounded corners of 20 instead
// of 14, you change it once, here.

import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

type Props = {
  left?: string;        // optional short text for the left column (a date, a time)
  title: string;        // main line
  lines?: string[];     // optional array of detail lines under the title
};

export default function InfoCard({ left, title, lines = [] }: Props) {
  // "lines = []" is a DEFAULT VALUE — if nobody passes lines, it's an empty
  // array instead of undefined, so .map() below never crashes.
  return (
    <View style={styles.card}>
      {/* Only draw the left column if a value was passed in. */}
      {left && (
        <View style={styles.leftBox}>
          <Text style={styles.leftText}>{left}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>

        {/* One Text per detail line. index is the position in the array —
            fine to use as a key here because these lines never reorder. */}
        {lines.map((line, index) => (
          <Text key={index} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",         // left column and text sit side by side
    alignItems: "center",         // centers them vertically against each other
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  leftBox: {
    width: 56,
    alignItems: "center",
    borderRightWidth: 1,          // thin divider between left column and text
    borderRightColor: colors.line,
    paddingRight: 12,
    marginRight: 14,
  },
  leftText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.orange,
    textAlign: "center",
  },
  info: {
    flex: 1,                      // absorb the remaining width so text wraps
                                  // properly instead of overflowing the card
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 2,
  },
  line: {
    fontSize: 13,
    color: colors.grey,
    lineHeight: 18,
  },
});
