// EVENTS - a month calendar of campus events, plus a Saved view of the ones you
// bookmarked. Live from the Lions Connect feed, cached on the phone.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { useSavedEvents } from "@/lib/reminders";
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

// Index 0 is Sunday, matching what Date.getDay() returns, so a weekday number
// can index straight into this array.
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Turns a year, month, and day into "2026-09-22" so it matches the iso strings
// in the data. Months are ZERO-BASED in JavaScript dates - September is month 8,
// not 9 - which is why we add 1 here. Keeping that correction inside one
// function means it can't be forgotten somewhere else.
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

  // Saved events plus their reminders, persisted on the phone.
  const { isSaved, toggle, savedCount } = useSavedEvents();

  // Which view is showing. A union type ("calendar" | "saved") means TypeScript
  // rejects a typo like "saevd" at build time instead of silently showing a
  // blank screen.
  const [view, setView] = useState<"calendar" | "saved">("calendar");

  // Which month the calendar shows. Two plain numbers rather than a Date,
  // because that's all the grid needs.
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Which day the user tapped. Starts on today so the screen has content the
  // moment it opens.
  const [selected, setSelected] = useState(todayIso);

  // How many days this month has. The trick: asking for day 0 of the NEXT month
  // returns the LAST day of this one - new Date(2026, 9, 0) is Sep 30. Leap
  // years handled for free, with no lookup table.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Which weekday the 1st lands on: 0 = Sunday through 6 = Saturday. That's how
  // many blank squares to draw before day 1 so the columns line up.
  const firstWeekday = new Date(year, month, 1).getDay();

  // Every event in the month on screen. Comparing the first 7 characters
  // ("2026-09") is enough to match a month, and far cheaper than turning 222
  // strings back into Date objects.
  const monthPrefix = year + "-" + String(month + 1).padStart(2, "0");
  const monthEvents = events.filter((e) => e.iso.startsWith(monthPrefix));

  // A Set of just the days that have something on them. A Set answers "is this
  // in here?" instantly no matter how big it gets - an array would have to scan
  // every event again for each of the 30 squares.
  const busyDays = new Set(monthEvents.map((e) => e.iso));

  // Events on the day the user tapped.
  const dayEvents = events.filter((e) => e.iso === selected);

  // THE SAVED LIST. Filtering the live data by what's bookmarked - rather than
  // storing copies of the events - means a saved event shows its CURRENT time
  // and place. If an organization moves an event, the saved view updates too.
  const savedEvents = events.filter((e) => isSaved(e));

  // Split into what's ahead and what's done, so past reminders don't sit on top
  // of the list looking current.
  const savedUpcoming = savedEvents.filter((e) => e.iso >= todayIso);
  const savedPast = savedEvents.filter((e) => e.iso < todayIso);

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
      {/* VIEW SWITCH. Two Pressables styled as one segmented control - the
          active half is filled navy, the inactive half is plain. */}
      <View style={styles.switch}>
        <Pressable
          style={[styles.switchHalf, view === "calendar" && styles.switchActive]}
          onPress={() => setView("calendar")}
        >
          <Text
            style={[
              styles.switchText,
              view === "calendar" && styles.switchTextActive,
            ]}
          >
            Calendar
          </Text>
        </Pressable>

        <Pressable
          style={[styles.switchHalf, view === "saved" && styles.switchActive]}
          onPress={() => setView("saved")}
        >
          <Text
            style={[
              styles.switchText,
              view === "saved" && styles.switchTextActive,
            ]}
          >
            {/* The count goes in the label, so you can see you have saved
                events without switching tabs to check. */}
            Saved{savedCount > 0 ? ` (${savedCount})` : ""}
          </Text>
        </Pressable>
      </View>

      {/* CALENDAR VIEW. Everything below is wrapped in a check on view, so only
          one of the two is ever on screen. */}
      {view === "calendar" && (
        <View>
          <Text style={styles.status}>
            {status === "live"
              ? "Live from Lions Connect"
              : status === "cached"
              ? "Saved on this phone"
              : status === "loading"
              ? "Checking for updates..."
              : "Offline - showing saved events"}
          </Text>

          {/* MONTH HEADER */}
          <View style={styles.monthHeader}>
            <Pressable
              onPress={() => changeMonth(-1)}
              style={styles.arrow}
              // Read aloud by a screen reader, which sees an icon as nothing.
              accessibilityLabel="Previous month"
            >
              <Ionicons name="chevron-back" size={20} color={colors.navy} />
            </Pressable>

            <Text style={styles.monthName}>
              {MONTH_NAMES[month]} {year}
            </Text>

            <Pressable
              onPress={() => changeMonth(1)}
              style={styles.arrow}
              accessibilityLabel="Next month"
            >
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

            {/* THE GRID. flexWrap on this parent does the row-breaking: each
                square is 14.28% wide (100 / 7), so exactly seven fit per row and
                the eighth wraps on its own. */}
            <View style={styles.grid}>
              {/* BLANK SQUARES before the 1st. Array.from({ length: n }) builds
                  an empty n-item array purely to give .map() something to loop
                  over n times. */}
              {Array.from({ length: firstWeekday }).map((_unused, index) => (
                <View key={"blank" + index} style={styles.cell} />
              ))}

              {/* ONE SQUARE PER DAY. The array is 0-based, dates start at 1. */}
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
                    {/* Style arrays apply in order, so later entries win -
                        selected overrides today. */}
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

                    {/* The dot marking a day with events. Its space is always
                        reserved by a fixed-height View, so rows don't shift up
                        and down depending on which days have dots. */}
                    <View style={styles.dotSlot}>
                      {hasEvents && (
                        <View
                          style={[
                            styles.dot,
                            // On the selected day the circle behind is navy, so
                            // a navy dot would vanish. Orange stays visible.
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
              {/* Building a Date from the selected day's pieces prints a friendly
                  label like "Tuesday, September 22". slice(8) grabs the day
                  digits off the end of the iso string. */}
              {new Date(year, month, Number(selected.slice(8))).toLocaleDateString(
                undefined,
                { weekday: "long", month: "long", day: "numeric" }
              )}
            </Text>

            {/* The count, only when there's more than one - "1 event" beside a
                single card is clutter. */}
            {dayEvents.length > 1 && (
              <Text style={styles.count}>{dayEvents.length} events</Text>
            )}
          </View>

          {dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              saved={isSaved(event)}
              onToggle={() => toggle(event)}
              onOpen={() => openEvent(event.url)}
              showDate={false}
            />
          ))}

          {/* An empty list with no explanation reads as a bug, so say it. */}
          {dayEvents.length === 0 && (
            <Text style={styles.empty}>Nothing scheduled this day.</Text>
          )}
        </View>
      )}

      {/* SAVED VIEW */}
      {view === "saved" && (
        <View>
          {savedCount === 0 ? (
            // EMPTY STATE. It explains how to get out of it, which is the whole
            // job of an empty state - a blank screen teaches nothing.
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={28} color={colors.grey} />
              <Text style={styles.emptyTitle}>Nothing saved yet</Text>
              <Text style={styles.emptyBody}>
                Tap the bookmark on any event and it shows up here. You get a
                notification an hour before it starts.
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.savedNote}>
                Reminders arrive an hour before each event starts.
              </Text>

              {savedUpcoming.length > 0 && (
                <View>
                  <Text style={styles.heading}>Coming up</Text>
                  {savedUpcoming.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      saved={true}
                      onToggle={() => toggle(event)}
                      onOpen={() => openEvent(event.url)}
                      // The date matters here: unlike the calendar view, this
                      // list spans many different days.
                      showDate={true}
                    />
                  ))}
                </View>
              )}

              {savedPast.length > 0 && (
                <View>
                  <Text style={styles.heading}>Already happened</Text>
                  {savedPast.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      saved={true}
                      onToggle={() => toggle(event)}
                      onOpen={() => openEvent(event.url)}
                      showDate={true}
                      faded={true}
                    />
                  ))}
                </View>
              )}

              {/* Saved events the feed no longer carries. The filter only finds
                  what's still published, so an old bookmark quietly vanishes -
                  and this explains the gap rather than leaving it mysterious. */}
              {savedEvents.length < savedCount && (
                <Text style={styles.savedNote}>
                  {savedCount - savedEvents.length} saved event
                  {savedCount - savedEvents.length === 1 ? "" : "s"} no longer
                  appear in the campus calendar.
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      <Text style={styles.source}>
        From Lincoln's Lions Connect calendar. Some locations are only visible
        after signing in on Lions Connect.
      </Text>
    </ScreenShell>
  );
}

// ONE EVENT CARD, used by both views. Pulling it out is what makes the Saved
// view cheap: it's the same card with two flags flipped, not a second design.
function EventCard({
  event,
  saved,
  onToggle,
  onOpen,
  showDate,
  faded,
}: {
  event: CampusEvent;
  saved: boolean;
  onToggle: () => void;
  onOpen: () => void;
  showDate: boolean;
  faded?: boolean;    // "?" means optional, so the calendar view can omit it
}) {
  return (
    <View style={[styles.card, faded && styles.cardFaded]}>
      {/* Tapping the body opens the RSVP page; the bookmark is its own target,
          so one gesture can't fire both. */}
      <Pressable onPress={onOpen}>
        <Text style={styles.time}>
          {/* In the Saved list the date leads, since the list spans many days. */}
          {showDate ? `${event.date} - ${event.time}` : event.time}
        </Text>
        <Text style={styles.title}>{event.title}</Text>
      </Pressable>

      <View style={styles.metaRow}>
        {/* flex: 1 absorbs the leftover width, pushing the bookmark right. */}
        <View style={styles.meta}>
          <Text style={styles.host}>{event.host}</Text>
          <Text style={styles.place}>{event.place}</Text>
        </View>

        {/* THE BOOKMARK. Filled means saved, outline means not - the standard
            convention, so it needs no text label to be understood. */}
        <Pressable
          style={styles.saveButton}
          onPress={onToggle}
          // A screen reader sees an icon as nothing at all, so the label is what
          // makes this button usable without sight.
          accessibilityLabel={saved ? "Remove reminder" : "Remind me an hour before"}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={20}
            color={saved ? colors.orange : colors.grey}
          />
        </Pressable>

        {/* The chevron only appears when tapping actually opens something.
            \u203A is the unicode escape for a single angle quote, written as an
            escape so no editor encoding can mangle it. */}
        {event.url !== undefined && event.url !== "" && (
          <Text style={styles.chevron}>{"\u203A"}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  switch: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 999,       // pill shape
    padding: 3,
    marginBottom: 14,
  },
  switchHalf: {
    flex: 1,                 // two halves, equal width
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: 999,
  },
  switchActive: {
    backgroundColor: colors.navy,
  },
  switchText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.grey,
  },
  switchTextActive: {
    color: "#ffffff",
  },
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
    padding: 6,          // padding, not margin - it grows the tap target
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
    width: "14.28%",     // 100 / 7, so headers align with the grid columns
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: colors.grey,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",    // this is what breaks the squares into weeks
  },
  cell: {
    width: "14.28%",     // seven per row
    alignItems: "center",
    paddingVertical: 3,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,    // exactly half the width = a perfect circle
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: colors.orange,      // outlined: today, but not selected
  },
  selectedCircle: {
    backgroundColor: colors.navy,    // filled: the day you tapped
  },
  dayNumber: {
    fontSize: 13,
    color: colors.navy,
  },
  selectedNumber: {
    color: "#ffffff",                // white, because the circle behind is navy
    fontWeight: "700",
  },
  dotSlot: {
    height: 8,           // reserved space, so row heights stay identical
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
    marginBottom: 8,
  },
  count: {
    fontSize: 11,
    color: colors.grey,
    fontWeight: "600",
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,   // colored spine ties the card to the dot
  },
  cardFaded: {
    opacity: 0.55,       // one property dims the whole card, text and icon
                         // together - simpler than restyling each child
    borderLeftColor: colors.line,
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
    flex: 1,             // absorbs leftover width, pushing the bookmark right
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
  saveButton: {
    padding: 6,          // grows the tap target so a 20px icon is thumb-sized
    marginLeft: 4,
  },
  chevron: {
    fontSize: 20,
    color: colors.orange,
    marginLeft: 6,
  },
  empty: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 24,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
    marginTop: 10,
  },
  emptyBody: {
    fontSize: 12,
    color: colors.grey,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 5,
  },
  savedNote: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginBottom: 12,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 6,
  },
});