// DINING - real campus dining hours with a live open/closed badge.
// Source: lincoln.edu dining services hours page.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Hours are stored as MINUTES SINCE MIDNIGHT, not as text like "7 a.m."
// Numbers can be compared with < and >, strings can't - "11 a.m." is not
// usefully less than "8 p.m." to a computer. 7 a.m. = 7 * 60 = 420.
// null means closed that day.
type Venue = {
  id: number;
  name: string;
  weekday: [number, number] | null;   // [open, close]
  weekend: [number, number] | null;
  facultyOnly: boolean;
};

const venues: Venue[] = [
  { id: 1, name: "Common Dining Hall",   weekday: [420, 1200], weekend: [600, 1140], facultyOnly: false }, // 7a-8p / 10a-7p
  { id: 2, name: "The Lion's Brew",      weekday: [480, 840],  weekend: null,        facultyOnly: false }, // 8a-2p
  { id: 3, name: "Bagel Beaux",          weekday: [720, 1140], weekend: null,        facultyOnly: false }, // 12p-7p
  { id: 4, name: "Chick-fil-A",          weekday: [660, 1200], weekend: null,        facultyOnly: false }, // 11a-8p
  { id: 5, name: "Austin Grill",         weekday: [660, 1200], weekend: null,        facultyOnly: false },
  { id: 6, name: "Chop'd and Wrap'd",    weekday: [660, 1200], weekend: null,        facultyOnly: false },
  { id: 7, name: "GoGo Fresh",           weekday: [660, 1200], weekend: null,        facultyOnly: false },
  { id: 8, name: "The Gold Room",        weekday: [690, 840],  weekend: null,        facultyOnly: true  }, // 11:30a-2p
];

// Extra detail lines that don't fit the hours model.
const subtitles: Record<number, string> = {
  2: "Starbucks, Student Union",
  4: "Wellness Center",
  7: "Smoothie Zone",
  8: "Faculty and staff dining",
};

// Turns 690 back into "11:30 AM" for display. We store numbers for the math
// and convert to text only at the moment we draw it.
function formatTime(minutes: number) {
  // Math.floor throws away the decimal part. 690 / 60 is 11.5, so we get 11.
  const hour24 = Math.floor(minutes / 60);
  // The % (modulo) operator gives the REMAINDER of a division. 690 % 60 is 30,
  // which is the leftover minutes after the whole hours are taken out.
  const mins = minutes % 60;

  const suffix = hour24 >= 12 ? "PM" : "AM";
  // Clock math: 13 becomes 1, but 12 must stay 12 and 0 must become 12.
  // The || 12 catches that - 12 % 12 is 0, and 0 is falsy, so || swaps in 12.
  const hour12 = hour24 % 12 || 12;

  // padStart(2, "0") turns "5" into "05" so we never print "1:5 PM".
  return hour12 + ":" + String(mins).padStart(2, "0") + " " + suffix;
}

// Builds the "7:00 AM - 8:00 PM" line, or "Closed" when there are no hours.
function formatRange(range: [number, number] | null) {
  if (range === null) return "Closed";
  // range[0] is the open time, range[1] is the close time.
  return formatTime(range[0]) + " - " + formatTime(range[1]);
}

export default function DiningScreen() {
  const now = new Date();

  // getDay() returns 0 for Sunday through 6 for Saturday. So 0 or 6 = weekend.
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  // Convert right now into the same minutes-since-midnight scale as our data,
  // so the comparison below is just two numbers.
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <ScreenShell sourceUrl="https://www.lincoln.edu/student-life/dining-services.html" sourceLabel="lincoln.edu dining" eyebrow="Campus Dining" title="Dining">
      {/* Tells the user which column of hours they're looking at, so an empty
          Saturday doesn't read like missing data. */}
      <Text style={styles.dayNote}>
        {isWeekend ? "Weekend hours" : "Weekday hours"} - updates live
      </Text>

      {venues.map((venue) => {
        // Pick today's hours based on what day it actually is.
        const today = isWeekend ? venue.weekend : venue.weekday;

        // Open only if there ARE hours today AND we're inside them.
        // The !== null check has to come first: if today is null, reading
        // today[0] would crash. JavaScript stops evaluating && the moment
        // something is false, which is what protects us here.
        const isOpen =
          today !== null && nowMinutes >= today[0] && nowMinutes < today[1];

        return (
          <View key={venue.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.nameBlock}>
                <Text style={styles.name}>{venue.name}</Text>
                {/* Only some venues have a subtitle. subtitles[venue.id] is
                    undefined for the rest, and undefined is falsy, so && skips
                    the whole Text element for them. */}
                {subtitles[venue.id] && (
                  <Text style={styles.subtitle}>{subtitles[venue.id]}</Text>
                )}
              </View>

              {/* The live badge. Green when open, grey when not. */}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isOpen ? colors.green : colors.grey },
                ]}
              >
                <Text style={styles.badgeText}>{isOpen ? "OPEN" : "CLOSED"}</Text>
              </View>
            </View>

            {venue.facultyOnly && (
              <Text style={styles.faculty}>Faculty and staff only</Text>
            )}

            {/* Both schedules, always shown, so students can plan ahead
                instead of only seeing today. */}
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Mon-Fri</Text>
              <Text style={styles.hoursValue}>{formatRange(venue.weekday)}</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Sat-Sun</Text>
              <Text style={styles.hoursValue}>{formatRange(venue.weekend)}</Text>
            </View>
          </View>
        );
      })}

      {/* MODIFIED SCHEDULES - real info, but it doesn't fit the venue card
          shape, so it gets its own panel at the bottom. */}
      <View style={styles.notice}>
        <View style={styles.noticeTop}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.orange} />
          <Text style={styles.noticeTitle}>Modified Schedules</Text>
        </View>

        <Text style={styles.noticeHeading}>Holidays</Text>
        <Text style={styles.noticeText}>
          Main cafe brunch 10:00 AM - 2:00 PM, dinner 4:00 - 7:00 PM. Retail
          outlets closed.
        </Text>

        <Text style={styles.noticeHeading}>
          Inclement weather or 2-hour delay
        </Text>
        <Text style={styles.noticeText}>
          Brunch 9:00 AM - 2:00 PM, dinner 4:00 - 7:00 PM. Retail outlets
          closed.
        </Text>
      </View>

      <Text style={styles.source}>
        Source: Lincoln University Dining Services. Hours change during breaks
        and finals - confirm at the location.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  dayNote: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.grey,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",   // top-aligns the badge with the first text line
    marginBottom: 8,
  },
  nameBlock: {
    flex: 1,                    // absorbs the width so long names wrap
                                // instead of pushing the badge off the card
    paddingRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
  },
  subtitle: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 1,
  },
  badge: {
    borderRadius: 999,          // any value over half the height = a pill
    paddingHorizontal: 8,
    paddingVertical: 3,
    // no backgroundColor here - it's passed in per venue so it can change
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  faculty: {
    fontSize: 11,
    color: colors.red,
    fontWeight: "600",
    marginBottom: 6,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",  // label left, hours right
    paddingVertical: 3,
  },
  hoursLabel: {
    fontSize: 12,
    color: colors.grey,
    fontWeight: "600",
  },
  hoursValue: {
    fontSize: 12,
    color: colors.navy,
  },
  notice: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    borderLeftWidth: 3,          // a colored spine marks this as an advisory
    borderLeftColor: colors.orange,
  },
  noticeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
  },
  noticeHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.navy,
    marginTop: 6,
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 12,
    color: colors.grey,
    lineHeight: 17,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 14,
  },
});
