// EVENTS - month calendar with dots on days that have events.
// Tap a day to see what's happening. Data comes from src/data/events.ts.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { events } from "@/data/events";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Column headers. Index 0 is Sunday, matching what Date.getDay() returns,
// so a weekday number can index straight into this array.
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Turns a year, month, and day into "2026-09-20" so it matches the iso strings
// in our events data. Months are ZERO-BASED in JavaScript dates - September is
// month 8, not 9 - which is why we add 1 here.
// padStart(2, "0") turns "9" into "09", so string comparison stays correct.
function makeIso(year: number, month: number, day: number) {
  return (
    year +
    "-" +
    String(month + 1).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0")
  );
}

export default function EventsScreen() {
  const today = new Date();
  // Today as an iso string, so we can highlight today's square in the grid.
  const todayIso = makeIso(today.getFullYear(), today.getMonth(), today.getDate());

  // Which month the calendar is showing. We store the year and month rather
  // than a whole Date object, because that's all the grid needs.
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Which day the user tapped. Starts on today so the screen is never empty
  // when it first opens.
  const [selected, setSelected] = useState(todayIso);

  // How many days this month has. The trick: asking for day 0 of the NEXT
  // month gives you the LAST day of this one. new Date(2026, 9, 0) is Sep 30.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Which weekday the 1st falls on: 0 = Sunday through 6 = Saturday. This tells
  // us how many blank squares to draw before day 1 so the columns line up.
  const firstWeekday = new Date(year, month, 1).getDay();

  // Every event in the month being shown. Comparing the first 7 characters
  // ("2026-09") is enough to match a month, and it's cheaper than parsing
  // the date back into a Date object.
  const monthPrefix = year + "-" + String(month + 1).padStart(2, "0");
  const monthEvents = events.filter((e) => e.iso.startsWith(monthPrefix));

  // A Set of just the days that have something on them. A Set can answer
  // "is this in here?" instantly, no matter how many items it holds - an array
  // would have to scan through every event for every square in the grid.
  const busyDays = new Set(monthEvents.map((e) => e.iso));

  // Events on the day the user tapped.
  const dayEvents = events.filter((e) => e.iso === selected);

  // Moves the calendar one month forward or back. step is +1 or -1.
  function changeMonth(step: number) {
    const next = month + step;

    // Rolling past December or before January has to roll the year too.
    if (next > 11) {
      setMonth(0);
      setYear(year + 1);
    } else if (next < 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(next);
    }
  }

  return (
    <ScreenShell eyebrow="Campus calendar" title="Events">
      {/* MONTH HEADER with arrows on either side of the month name. */}
      <View style={styles.monthHeader}>
        <Pressable onPress={() => changeMonth(-1)} style={styles.arrow}>
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </Pressable>

        <Text style={styles.monthName}>
          {MONTH_NAMES[month]} {year}
        </Text>

        <Pressable onPress={() => changeMonth(1)} style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color={colors.navy} />
        </Pressable>
      </View>

      <View style={styles.calendar}>
        {/* WEEKDAY HEADER ROW */}
        <View style={styles.week}>
          {DAY_LABELS.map((label, index) => (
            // The key has to be unique, and "T" appears twice (Tuesday and
            // Thursday), so we combine the letter with its position.
            <Text key={label + index} style={styles.dayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* THE GRID. flexWrap on the parent does the row-breaking for us: each
            square is 14.28% wide (100 / 7), so exactly seven fit per row and
            the eighth wraps automatically. No manual row logic needed. */}
        <View style={styles.grid}>
          {/* BLANK SQUARES before the 1st, so day 1 sits under the right
              weekday. Array.from({ length: n }) makes an empty n-item array
              purely to give .map() something to loop over. */}
          {Array.from({ length: firstWeekday }).map((_unused, index) => (
            <View key={"blank" + index} style={styles.cell} />
          ))}

          {/* ONE SQUARE PER DAY. The array is 0-based but dates start at 1,
              so we add 1 to the index. */}
          {Array.from({ length: daysInMonth }).map((_unused, index) => {
            const day = index + 1;
            const iso = makeIso(year, month, day);

            const isToday = iso === todayIso;
            const isSelected = iso === selected;
            const hasEvents = busyDays.has(iso);

            return (
              <Pressable
                key={iso}
                onPress={() => setSelected(iso)}
                style={styles.cell}
              >
                {/* The circle behind the number. Style arrays apply in order,
                    so later entries win - selected overrides today. */}
                <View
                  style={[
                    styles.dayCircle,
                    isToday && styles.todayCircle,
                    isSelected && styles.selectedCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.selectedNumber,
                    ]}
                  >
                    {day}
                  </Text>
                </View>

                {/* The dot marking a day with events. We always reserve the
                    space with a fixed-height View, so rows don't shift up and
                    down depending on which days have dots. */}
                <View style={styles.dotSlot}>
                  {hasEvents && (
                    <View
                      style={[
                        styles.dot,
                        // On the selected day the circle is navy, so a navy dot
                        // would vanish into it. Orange keeps it visible.
                        isSelected && { backgroundColor: colors.orange },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SELECTED DAY DETAIL */}
      <Text style={styles.heading}>
        {/* Building a Date from the pieces of the selected iso string lets us
            print a friendly label like "Sunday, September 20". */}
        {new Date(year, month, Number(selected.slice(8))).toLocaleDateString(
          undefined,
          { weekday: "long", month: "long", day: "numeric" }
        )}
      </Text>

      {dayEvents.map((event) => (
        <View key={event.id} style={styles.card}>
          <Text style={styles.time}>{event.time}</Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.place}>{event.place}</Text>
          <Text style={styles.host}>{event.host}</Text>
        </View>
      ))}

      {/* An empty list with no explanation looks like a bug, so say so. */}
      {dayEvents.length === 0 && (
        <Text style={styles.empty}>Nothing scheduled this day.</Text>
      )}

      <Text style={styles.source}>
        Source: LU Live. Check LU Live for the full listing and any changes.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",  // arrows to the edges, name in the middle
    marginBottom: 10,
  },
  monthName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy,
  },
  arrow: {
    padding: 6,           // padding, not margin - it enlarges the tap target
                          // so the arrows aren't fiddly to hit with a thumb
  },
  calendar: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 8,
    marginBottom: 16,
  },
  week: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayLabel: {
    width: "14.28%",      // 100 / 7, so the headers align with the grid columns
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: colors.grey,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",     // this is what breaks the squares into weeks
  },
  cell: {
    width: "14.28%",      // seven per row
    alignItems: "center",
    paddingVertical: 3,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,     // exactly half the width = a perfect circle
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: colors.orange,   // outlined: today, but not selected
  },
  selectedCircle: {
    backgroundColor: colors.navy, // filled: the day you tapped
  },
  dayNumber: {
    fontSize: 13,
    color: colors.navy,
  },
  selectedNumber: {
    color: "#ffffff",             // white, because the circle behind is navy
    fontWeight: "700",
  },
  dotSlot: {
    height: 8,            // reserved space, so rows stay the same height
                          // whether or not a day has a dot
    justifyContent: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.navy,
  },
  heading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,  // colored spine ties the card to the dot
  },
  time: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.orange,
    letterSpacing: 0.5,
    marginBottom: 3,
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
  },
  host: {
    fontSize: 12,
    color: colors.grey,
    fontStyle: "italic",
    marginTop: 2,
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