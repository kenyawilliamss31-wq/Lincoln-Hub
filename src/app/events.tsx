// EVENTS - month calendar with dots on days that have events.
// Live from the Lions Connect feed, cached on the phone, tappable to RSVP.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { useRemote } from "@/lib/remote";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
// The hardcoded list is now only the fallback for a first run with no network.
import { events as bundledEvents } from "@/data/events";

// The shape of one event. Declared here rather than imported, so this file
// doesn't depend on what src/data/events.ts happens to name its type.
type CampusEvent = {
  id: number;
  iso: string;      // "2026-09-22", sortable as plain text
  date: string;     // "Sep 22", for display
  time: string;
  title: string;
  place: string;
  host: string;     // the organization running it
  url?: string;     // the ? means optional - bundled fallback events have none
};

// Column headers. Index 0 is Sunday, matching what Date.getDay() returns, so a
// weekday number can index straight into this array.
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Turns a year, month, and day into "2026-09-22" so it matches the iso strings
// in the data. Months are ZERO-BASED in JavaScript dates - September is month 8,
// not 9 - which is why we add 1 here. Doing it in one function means that
// correction lives in one place instead of being remembered everywhere.
// padStart(2, "0") turns "9" into "09", which keeps text comparison correct.
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
  // Today as an iso string, so we can outline today's square in the grid.
  const todayIso = makeIso(today.getFullYear(), today.getMonth(), today.getDate());

  // Downloads events.json, rebuilt every 6 hours from Lions Connect. Falls back
  // to the phone's saved copy, then to the bundled list.
  const { data: events, status, refreshing, refresh, updatedLabel } =
    useRemote<CampusEvent[]>("events.json", bundledEvents as CampusEvent[]);

  // Which month the calendar shows. Stored as two plain numbers rather than a
  // Date object, because that's all the grid needs.
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Which day the user tapped. Starts on today so the screen has content the
  // moment it opens.
  const [selected, setSelected] = useState(todayIso);

  // How many days this month has. The trick: asking for day 0 of the NEXT month
  // gives you the LAST day of this one - new Date(2026, 9, 0) is Sep 30. This
  // handles leap years for free, with no lookup table.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Which weekday the 1st lands on: 0 = Sunday through 6 = Saturday. That's how
  // many blank squares to draw before day 1 so the columns line up.
  const firstWeekday = new Date(year, month, 1).getDay();

  // Every event in the month on screen. Comparing the first 7 characters
  // ("2026-09") is enough to match a month, and it's far cheaper than turning
  // 222 strings back into Date objects.
  const monthPrefix = year + "-" + String(month + 1).padStart(2, "0");
  const monthEvents = events.filter((e) => e.iso.startsWith(monthPrefix));

  // A Set of just the days that have something on them. A Set answers "is this
  // in here?" instantly no matter how big it is - an array would have to scan
  // every event again for each of the 30 squares in the grid.
  const busyDays = new Set(monthEvents.map((e) => e.iso));

  // Events on the day the user tapped.
  const dayEvents = events.filter((e) => e.iso === selected);

  // Moves the calendar one month. step is +1 or -1.
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

  // Opens an event's RSVP page in the phone's in-app browser.
  const openEvent = (url?: string) => {
    // The guard matters: bundled fallback events have no url, and calling this
    // with undefined would crash.
    if (url) WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScreenShell
      eyebrow="Campus calendar"
      title="Events"
      sourceUrl="https://lionsconnect.lincoln.edu/events"
      sourceLabel="Lions Connect"
      updatedLabel={updatedLabel}
      onRefresh={refresh}
      refreshing={refreshing}
    >
      {/* DATA STATUS - honest about which of the three sources you're seeing. */}
      <Text style={styles.status}>
        {status === "live"
          ? "Live from Lions Connect"
          : status === "cached"
          ? "Saved on this phone"
          : status === "loading"
          ? "Checking for updates..."
          : "Offline - showing saved events"}
      </Text>

      {/* MONTH HEADER with an arrow on each side of the month name. */}
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
            // The key must be unique, and "T" appears twice (Tuesday and
            // Thursday), so combine the letter with its position.
            <Text key={label + index} style={styles.dayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* THE GRID. flexWrap on this parent does the row-breaking: each square
            is 14.28% wide (100 / 7), so exactly seven fit per row and the eighth
            wraps on its own. No manual week-splitting logic needed anywhere. */}
        <View style={styles.grid}>
          {/* BLANK SQUARES before the 1st, so day 1 sits under the right
              weekday. Array.from({ length: n }) builds an empty n-item array
              purely to give .map() something to loop over n times. */}
          {Array.from({ length: firstWeekday }).map((_unused, index) => (
            <View key={"blank" + index} style={styles.cell} />
          ))}

          {/* ONE SQUARE PER DAY. The array is 0-based but dates start at 1,
              hence the + 1. */}
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
                    style={[styles.dayNumber, isSelected && styles.selectedNumber]}
                  >
                    {day}
                  </Text>
                </View>

                {/* The dot marking a day with events. Its space is always
                    reserved by a fixed-height View, so rows don't shift up and
                    down depending on which days happen to have dots. */}
                <View style={styles.dotSlot}>
                  {hasEvents && (
                    <View
                      style={[
                        styles.dot,
                        // On the selected day the circle is navy, so a navy dot
                        // would vanish into it. Orange stays visible.
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

      {/* SELECTED DAY HEADING */}
      <View style={styles.dayHeader}>
        <Text style={styles.heading}>
          {/* Building a Date from the selected day's pieces lets us print a
              friendly label like "Tuesday, September 22". slice(8) grabs the
              day digits off the end of the iso string. */}
          {new Date(year, month, Number(selected.slice(8))).toLocaleDateString(
            undefined,
            { weekday: "long", month: "long", day: "numeric" }
          )}
        </Text>

        {/* The count, only when there's more than one - "1 event" next to a
            single card is clutter. */}
        {dayEvents.length > 1 && (
          <Text style={styles.count}>{dayEvents.length} events</Text>
        )}
      </View>

      {dayEvents.map((event) => (
        // The whole card is tappable when there's a link to open.
        <Pressable
          key={event.id}
          style={styles.card}
          onPress={() => openEvent(event.url)}
        >
          <Text style={styles.time}>{event.time}</Text>
          <Text style={styles.title}>{event.title}</Text>

          {/* Host and place on one row, with the chevron pushed right by
              flex: 1 on the text block beside it. */}
          <View style={styles.metaRow}>
            <View style={styles.meta}>
              <Text style={styles.host}>{event.host}</Text>
              <Text style={styles.place}>{event.place}</Text>
            </View>

            {/* The chevron only appears when tapping actually does something.
                Drawing it on an unlinked card promises an action that isn't
                there. \u203A is the unicode escape for a single angle quote,
                written as an escape so no editor encoding can mangle it. */}
            {event.url !== undefined && event.url !== "" && (
              <Text style={styles.chevron}>{"\u203A"}</Text>
            )}
          </View>
        </Pressable>
      ))}

      {/* An empty list with no explanation reads as a bug, so say it plainly. */}
      {dayEvents.length === 0 && (
        <Text style={styles.empty}>Nothing scheduled this day.</Text>
      )}

      <Text style={styles.source}>
        From Lincoln's Lions Connect calendar. Some locations are only visible
        after signing in on Lions Connect.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 11,
    color: colors.grey,
    marginBottom: 8,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",   // arrows to the edges, name centered
    marginBottom: 10,
  },
  monthName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy,
  },
  arrow: {
    padding: 6,         // padding, not margin - it enlarges the tap target so
                        // the arrows aren't fiddly to hit with a thumb
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
    width: "14.28%",    // 100 / 7, so headers align with the grid columns
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: colors.grey,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",   // this is what breaks the squares into weeks
  },
  cell: {
    width: "14.28%",    // seven per row
    alignItems: "center",
    paddingVertical: 3,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,   // exactly half the width = a perfect circle
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: colors.orange,     // outlined: today, but not selected
  },
  selectedCircle: {
    backgroundColor: colors.navy,   // filled: the day you tapped
  },
  dayNumber: {
    fontSize: 13,
    color: colors.navy,
  },
  selectedNumber: {
    color: "#ffffff",               // white, because the circle behind is navy
    fontWeight: "700",
  },
  dotSlot: {
    height: 8,          // reserved space, so row heights stay identical whether
                        // or not a given day has a dot
    justifyContent: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.navy,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
  },
  count: {
    fontSize: 11,
    color: colors.grey,
    fontWeight: "600",
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
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {
    flex: 1,            // absorbs leftover width, pushing the chevron right
  },
  host: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.grey,
  },
  place: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 1,
  },
  chevron: {
    fontSize: 20,
    color: colors.orange,
    marginLeft: 10,
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