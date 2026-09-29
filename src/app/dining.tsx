// DINING - real hours with a live open/closed check against the phone's clock.
//
// Each place has a LIST of serving periods per day, not one block, because the
// Common Dining Hall closes between meals. Hours are stored as minutes since
// midnight, so "is it open?" is a number comparison. Comparing text does not
// work: "9:00" sorts after "10:00", because "9" comes after "1".
// Hours and locations: Luxe Life Dining (luxelifedining.com/lincoln-hourslocations).

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Turns a clock time into minutes since midnight. 7:30 AM becomes 450.
function t(hour: number, minute = 0) {
  return hour * 60 + minute;
}

// One serving window. label is "" for places that don't name their meals.
type Period = { label: string; open: number; close: number };

type Spot = {
  id: number;
  name: string;
  note: string;        // building, plus anything worth knowing
  weekday: Period[];   // Monday - Friday. An empty list [] means closed.
  weekend: Period[];   // Saturday - Sunday.
};

const spots: Spot[] = [
  {
    id: 1,
    name: "Common Dining Hall",
    note: "Thurgood Marshall LLC - all you can eat",
    weekday: [
      { label: "Breakfast", open: t(7), close: t(10) },
      { label: "Lunch", open: t(11), close: t(14) },
      { label: "Dinner", open: t(16), close: t(20) },
    ],
    weekend: [
      { label: "Brunch", open: t(10), close: t(14) },
      { label: "Dinner", open: t(16), close: t(19) },
    ],
  },
  {
    id: 2,
    name: "Jawn",
    note: "Late night - LLC cafeteria",
    // Same hours every day, so both lists match.
    weekday: [{ label: "", open: t(18), close: t(23) }],
    weekend: [{ label: "", open: t(18), close: t(23) }],
  },
  { id: 3, name: "The Lion's Brew", note: "Starbucks - Wellness Center", weekday: [{ label: "", open: t(9), close: t(14) }], weekend: [] },
  { id: 4, name: "Bagel Beaux", note: "Student Union Building (SUB)", weekday: [{ label: "", open: t(9), close: t(15) }], weekend: [] },
  { id: 5, name: "Chick-fil-A", note: "Wellness Center", weekday: [{ label: "", open: t(11), close: t(20) }], weekend: [] },
  { id: 6, name: "Austin Grill", note: "Wellness Center food court", weekday: [{ label: "", open: t(11), close: t(20) }], weekend: [] },
  { id: 7, name: "Chop'd and Wrap'd", note: "Wellness Center", weekday: [{ label: "", open: t(11), close: t(20) }], weekend: [] },
  { id: 8, name: "GoGo Fresh", note: "Smoothie Zone - Wellness Center", weekday: [{ label: "", open: t(11), close: t(20) }], weekend: [] },
  { id: 9, name: "The Gold Room", note: "Faculty and staff only", weekday: [{ label: "", open: t(11, 30), close: t(14) }], weekend: [] },
];

// Turns 450 back into "7:30 AM" for display.
function formatTime(minutes: number) {
  // Math.floor gives whole hours; % ("modulo") gives the leftover minutes.
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  // || 12 turns 0 into 12, so noon doesn't print as "0 PM".
  const hour12 = hour24 % 12 || 12;
  const suffix = hour24 < 12 ? "AM" : "PM";
  // padStart(2, "0") turns "5" into "05", so it reads 7:05, not 7:5.
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

// getDay() returns 0 for Sunday and 6 for Saturday.
function isWeekendToday() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function periodsToday(spot: Spot) {
  return isWeekendToday() ? spot.weekend : spot.weekday;
}

// Minutes since midnight right now - the same unit the hours use.
function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// The period serving right now, or undefined if it's closed at this moment.
// find() returns the first match, so this checks each meal window in turn.
function currentPeriod(spot: Spot) {
  const now = nowMinutes();
  return periodsToday(spot).find((p) => now >= p.open && now < p.close);
}

// The next period today that hasn't started yet, for "Opens 4:00 PM for
// dinner". undefined means nothing else today.
function nextPeriod(spot: Spot) {
  const now = nowMinutes();
  return periodsToday(spot).find((p) => p.open > now);
}

export default function DiningScreen() {
  // Recomputed on every render, so it's right whenever the screen opens.
  const openNow = spots.filter((s) => currentPeriod(s) !== undefined);
  const weekend = isWeekendToday();

  return (
    <ScreenShell
      eyebrow="Hours and locations"
      title="Dining"
      sourceUrl="https://www.luxelifedining.com/lincoln-hourslocations"
      sourceLabel="Luxe Life Dining"
    >
      {/* OPEN RIGHT NOW - the question people open this screen to answer. */}
      <View style={styles.nowCard}>
        <View style={styles.nowHeader}>
          <Ionicons
            name={openNow.length > 0 ? "time" : "time-outline"}
            size={16}
            color={openNow.length > 0 ? colors.green : colors.grey}
          />
          <Text style={styles.nowLabel}>OPEN RIGHT NOW</Text>
        </View>

        {openNow.length > 0 ? (
          openNow.map((spot) => {
            // The ! tells TypeScript this can't be undefined - the filter above
            // already kept only places with a current period.
            const period = currentPeriod(spot)!;
            return (
              <View key={spot.id} style={styles.nowRow}>
                <View style={styles.nowDot} />
                {/* flex: 1 pushes the closing time to the right edge. */}
                <Text style={styles.nowName}>
                  {spot.name}
                  {period.label !== "" ? ` - ${period.label}` : ""}
                </Text>
                <Text style={styles.nowUntil}>until {formatTime(period.close)}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.nowEmpty}>Everything is closed right now.</Text>
        )}
      </View>

      {/* ALL LOCATIONS */}
      <Text style={styles.heading}>{weekend ? "Weekend hours" : "Weekday hours"}</Text>

      {spots.map((spot) => {
        const periods = periodsToday(spot);
        const current = currentPeriod(spot);
        const upcoming = nextPeriod(spot);

        return (
          <View key={spot.id} style={styles.card}>
            <View style={styles.cardTop}>
              {/* flex: 1 pushes the badge to the far right. */}
              <View style={styles.cardBody}>
                <Text style={styles.name}>{spot.name}</Text>
                <Text style={styles.note}>{spot.note}</Text>
              </View>

              <View
                style={[
                  styles.badge,
                  { backgroundColor: current ? colors.green : colors.red },
                ]}
              >
                <Text style={styles.badgeText}>{current ? "OPEN" : "CLOSED"}</Text>
              </View>
            </View>

            {/* One line per serving period. An empty list means closed today. */}
            {periods.length === 0 ? (
              <Text style={styles.hours}>Closed today</Text>
            ) : (
              periods.map((p) => (
                // The period currently serving is bold, so it's easy to spot.
                <Text key={p.open} style={[styles.hours, p === current && styles.hoursNow]}>
                  {p.label !== "" ? `${p.label}  ` : ""}
                  {formatTime(p.open)} - {formatTime(p.close)}
                </Text>
              ))
            )}

            {/* Between meals: say when it opens next instead of just "closed". */}
            {!current && upcoming && (
              <Text style={styles.opensNext}>
                Opens {formatTime(upcoming.open)}
                {upcoming.label !== "" ? ` for ${upcoming.label.toLowerCase()}` : ""}
              </Text>
            )}
          </View>
        );
      })}

      {/* SPECIAL SCHEDULES - text only, since nothing here gets compared. */}
      <Text style={styles.heading}>Special schedules</Text>

      <View style={styles.specialCard}>
        <View style={styles.specialHeader}>
          <Ionicons name="calendar-outline" size={15} color={colors.orange} />
          <Text style={styles.specialTitle}>Holidays</Text>
        </View>
        <Text style={styles.specialLine}>Brunch 10:00 AM - 2:00 PM</Text>
        <Text style={styles.specialLine}>Dinner 4:00 PM - 7:00 PM</Text>
      </View>

      <View style={styles.specialCard}>
        <View style={styles.specialHeader}>
          <Ionicons name="snow-outline" size={15} color={colors.orange} />
          <Text style={styles.specialTitle}>Inclement weather or delayed opening</Text>
        </View>
        <Text style={styles.specialLine}>Brunch 9:00 AM - 2:00 PM</Text>
        <Text style={styles.specialLine}>Dinner 4:00 PM - 7:00 PM</Text>
      </View>

      <View style={styles.specialCard}>
        <View style={styles.specialHeader}>
          <Ionicons name="close-circle-outline" size={15} color={colors.orange} />
          <Text style={styles.specialTitle}>Weekends</Text>
        </View>
        <Text style={styles.specialLine}>
          Retail spots are closed. Common Dining Hall serves brunch and dinner, and
          Jawn is open 6:00 - 11:00 PM.
        </Text>
      </View>

      <Text style={styles.source}>
        Hours can change for holidays, breaks, and weather. Confirm with Dining
        Services.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  nowCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
  },
  nowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  nowLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.grey,
    letterSpacing: 1,        // wide spacing keeps tiny uppercase readable
  },
  nowRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  nowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
    marginRight: 9,
  },
  nowName: {
    flex: 1,                 // pushes the closing time to the right edge
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },
  nowUntil: {
    fontSize: 12,
    color: colors.grey,
  },
  nowEmpty: {
    fontSize: 13,
    color: colors.grey,
  },
  heading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 9,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardBody: {
    flex: 1,                 // leaves the badge at the right edge
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },
  note: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 1,
  },
  hours: {
    fontSize: 13,
    color: colors.navy,
    lineHeight: 19,
  },
  hoursNow: {
    fontWeight: "700",
    color: colors.green,     // the period serving right now
  },
  opensNext: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.orange,
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,       // pill shape
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  specialCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 13,
    marginBottom: 9,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,   // orange spine marks exceptions
  },
  specialHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  specialTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
  },
  specialLine: {
    fontSize: 12,
    color: colors.grey,
    lineHeight: 18,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 10,
  },
});