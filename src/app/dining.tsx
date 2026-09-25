// DINING - real hours with a live open/closed check against the phone's clock.
//
// Hours are stored as MINUTES SINCE MIDNIGHT, not as text. "Is it open?" then
// becomes one number comparison. Comparing time strings does not work: "9:00"
// sorts before "10:00" alphabetically, because "1" comes before "9".

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Turns a clock time into minutes since midnight. 7:30 AM becomes 450.
// A helper means the data below reads like a posted sign while still being
// stored as numbers the open/closed check can compare.
function t(hour: number, minute = 0) {
  return hour * 60 + minute;
}

// null means closed that day - a different idea from zero, because zero would
// read as midnight.
type Hours = { open: number; close: number } | null;

type Spot = {
  id: number;
  name: string;
  note: string;      // empty string when there's nothing to add
  weekday: Hours;
  weekend: Hours;
};

const spots: Spot[] = [
  { id: 1, name: "Common Dining Hall",  note: "Thurgood Marshall LLC",                 weekday: { open: t(7), close: t(20) },      weekend: { open: t(10), close: t(19) } },
  { id: 2, name: "The Lion's Brew",     note: "Starbucks - Wellness Center",           weekday: { open: t(8), close: t(14) },      weekend: null },
  { id: 3, name: "Bagel Beaux",         note: "Student Union Building (SUB)",          weekday: { open: t(12), close: t(19) },     weekend: null },
  { id: 4, name: "Chick-fil-A",         note: "Wellness Center",                       weekday: { open: t(11), close: t(20) },     weekend: null },
  { id: 5, name: "Austin Grill",        note: "Wellness Center food court",            weekday: { open: t(11), close: t(20) },     weekend: null },
  { id: 6, name: "Chop'd and Wrap'd",   note: "Wellness Center",                       weekday: { open: t(11), close: t(20) },     weekend: null },
  { id: 7, name: "GoGo Fresh",          note: "Smoothie Zone - Wellness Center",       weekday: { open: t(11), close: t(20) },     weekend: null },
  { id: 8, name: "The Gold Room",       note: "Faculty and staff only",                weekday: { open: t(11, 30), close: t(14) }, weekend: null },
];

// Turns 450 back into "7:30 AM" for display.
function formatTime(minutes: number) {
  // Math.floor drops the remainder, giving whole hours. The % operator
  // ("modulo") gives what's left over, which is the minutes.
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;

  // || 12 handles midnight and noon: 0 % 12 is 0, and 0 is falsy, so it becomes
  // 12. Without this, 12 PM would print as "0 PM".
  const hour12 = hour24 % 12 || 12;
  const suffix = hour24 < 12 ? "AM" : "PM";

  // padStart(2, "0") turns "5" into "05", so it reads 7:05, not 7:5.
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

// Which set of hours applies right now. getDay() returns 0 for Sunday and 6 for
// Saturday, so those two are the weekend.
function hoursForToday(spot: Spot) {
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  return isWeekend ? spot.weekend : spot.weekday;
}

// Minutes since midnight, right now. The same unit the hours are stored in,
// which is the whole reason the comparison below is a single line.
function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// True when the place is serving at this moment.
function isOpenNow(spot: Spot) {
  const hours = hoursForToday(spot);
  // Closed today. The ! means "not", so this reads "if there are no hours".
  if (!hours) return false;

  const now = nowMinutes();
  return now >= hours.open && now < hours.close;
}

export default function DiningScreen() {
  // filter() with the check above, run fresh on every render - so this is
  // correct whenever the screen is opened, with no timers to manage.
  const openNow = spots.filter(isOpenNow);

  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;

  return (
    <ScreenShell
      eyebrow="Hours and locations"
      title="Dining"
      sourceUrl="https://www.lincoln.edu/student-life/dining-services.html"
      sourceLabel="lincoln.edu dining"
    >
      {/* OPEN RIGHT NOW - the answer to the only question anyone opens this
          screen to ask. Everything below is reference material. */}
      <View style={styles.nowCard}>
        <View style={styles.nowHeader}>
          <Ionicons
            // A filled icon when something's open, an outline when nothing is.
            name={openNow.length > 0 ? "time" : "time-outline"}
            size={16}
            color={openNow.length > 0 ? colors.green : colors.grey}
          />
          <Text style={styles.nowLabel}>OPEN RIGHT NOW</Text>
        </View>

        {openNow.length > 0 ? (
          openNow.map((spot) => {
            // The ! is a non-null assertion: isOpenNow already proved these
            // hours exist, but TypeScript can't follow that reasoning across
            // two functions, so this tells it to trust us.
            const hours = hoursForToday(spot)!;

            return (
              <View key={spot.id} style={styles.nowRow}>
                <View style={styles.nowDot} />

                {/* flex: 1 absorbs the leftover width, pushing the closing time
                    to the right edge of the card. */}
                <Text style={styles.nowName}>{spot.name}</Text>

                <Text style={styles.nowUntil}>until {formatTime(hours.close)}</Text>
              </View>
            );
          })
        ) : (
          // An empty section with no explanation looks broken, so say it plainly.
          <Text style={styles.nowEmpty}>
            Everything is closed right now.
            {isWeekend ? " Retail spots are weekdays only." : ""}
          </Text>
        )}
      </View>

      {/* ALL LOCATIONS */}
      <Text style={styles.heading}>
        {isWeekend ? "Weekend hours" : "Weekday hours"}
      </Text>

      {spots.map((spot) => {
        const hours = hoursForToday(spot);
        const open = isOpenNow(spot);

        return (
          <View key={spot.id} style={styles.card}>
            {/* flex: 1 here pushes the badge to the far right no matter how long
                the name is. */}
            <View style={styles.cardBody}>
              <Text style={styles.name}>{spot.name}</Text>

              {/* Only render the note when there is one. An empty string is
                  falsy, so places with no note skip this rather than leaving a
                  blank line behind. */}
              {spot.note !== "" && <Text style={styles.note}>{spot.note}</Text>}

              <Text style={styles.hours}>
                {hours
                  ? `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                  : "Closed today"}
              </Text>
            </View>

            {/* THE BADGE. Green open, red closed - the fastest thing on the
                screen to read, which is the point of it. */}
            <View
              style={[
                styles.badge,
                { backgroundColor: open ? colors.green : colors.red },
              ]}
            >
              <Text style={styles.badgeText}>{open ? "OPEN" : "CLOSED"}</Text>
            </View>
          </View>
        );
      })}

      {/* SPECIAL SCHEDULES - the Common Dining Hall runs different service on
          these days: two meal periods instead of continuous hours. Written as
          text rather than stored as numbers, because there's nothing here for
          the open/closed check to compare. */}
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
          <Text style={styles.specialTitle}>
            Inclement weather or delayed opening
          </Text>
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
          All retail locations are closed. Common Dining Hall serves 10:00 AM -
          7:00 PM.
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
    letterSpacing: 1,      // wide spacing makes tiny uppercase legible
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
    flex: 1,               // pushes the closing time to the right edge
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
    lineHeight: 18,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 9,
  },
  cardBody: {
    flex: 1,               // takes the leftover width so the badge sits right
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
    marginTop: 3,
  },
  badge: {
    borderRadius: 999,     // pill shape
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginLeft: 10,
    // backgroundColor set per card, green or red
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
    borderLeftColor: colors.orange,   // orange spine marks these as exceptions
  },
  specialHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  specialTitle: {
    flex: 1,               // wraps a long title instead of pushing past the edge
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