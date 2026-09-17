// EVENTS — upcoming campus events from LU Live.
// The data and the filtering live in src/data/events.ts, so this file is only
// concerned with how things look.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { upcomingEvents } from "@/data/events";
import { StyleSheet, Text, View } from "react-native";

export default function EventsScreen() {
  // Calling the helper gives us only events that haven't passed. Past ones
  // drop off on their own as the semester goes on.
  const events = upcomingEvents();

  return (
    <ScreenShell eyebrow="From LU Live" title="Events">
      {events.map((event) => (
        <View key={event.id} style={styles.card}>
          {/* Left column: date on top, time underneath. */}
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{event.date}</Text>
            <Text style={styles.timeText}>{event.time}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.place}>{event.place}</Text>
            <Text style={styles.host}>{event.host}</Text>
          </View>
        </View>
      ))}

      {/* events.length is how many items the array has. When it hits 0 there's
          nothing left this semester, so we show a message instead of a blank
          screen. An empty list with no explanation looks like a bug. */}
      {events.length === 0 && (
        <Text style={styles.empty}>No upcoming events listed.</Text>
      )}

      <Text style={styles.source}>
        Source: LU Live. Check LU Live for the full listing and any changes.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  dateBox: {
    width: 76,                   // fixed so every date column lines up
    borderRightWidth: 1,
    borderRightColor: colors.line,
    paddingRight: 10,
    marginRight: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.orange,
  },
  timeText: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 2,
    lineHeight: 15,
  },
  info: {
    flex: 1,                     // absorbs remaining width so long event
                                 // names wrap instead of overflowing the card
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
    lineHeight: 20,
    marginBottom: 3,
  },
  place: {
    fontSize: 13,
    color: colors.grey,
    lineHeight: 17,
  },
  host: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
    fontStyle: "italic",         // sets the host apart from the location
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
    marginTop: 6,
  },
});