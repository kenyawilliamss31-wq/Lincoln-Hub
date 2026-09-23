// ACADEMIC CALENDAR - key dates for the current and next semester, with a
// countdown to whatever is next.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import {
  daysUntil,
  fall2026,
  spring2027,
  todayIso,
  type AcademicDate,
  type DateKind,
} from "@/data/academic";
import { StyleSheet, Text, View } from "react-native";

// One color per kind of date. A lookup object beats a chain of if-statements:
// adding a category is one line here instead of a new branch in the component.
const KIND_COLORS: Record<DateKind, string> = {
  class: colors.navy,
  deadline: colors.red,      // deadlines are the ones that cost you money
  break: colors.green,
  exam: colors.orange,
  event: colors.grey,
};

export default function AcademicCalendarScreen() {
  const today = todayIso();

  // Both semesters in one list, so "what's next" can cross from December into
  // January without any special handling.
  const allDates = [...fall2026, ...spring2027];

  // The next thing coming up. Comparing the END of a span, not the start, means
  // Thanksgiving break still counts as "now" while you're in the middle of it.
  // || falls back to the start date for single-day entries that have no isoEnd.
  const next = allDates.find((d) => (d.isoEnd || d.iso) >= today);

  return (
    <ScreenShell
      eyebrow="Important dates"
      title="Academic Calendar"
      sourceUrl="https://www.lincoln.edu/academics/academic-affairs/registrar/academic-calendar.html"
      sourceLabel="Registrar"
    >
      {/* COUNTDOWN. find() returns undefined after the last date on file, so
          this whole card disappears in May 2027 rather than showing something
          wrong. That's also the signal to update the data file. */}
      {next && (
        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>NEXT UP</Text>
          <Text style={styles.nextTitle}>{next.label}</Text>

          <Text style={styles.nextMeta}>
            {next.display}
            {" - "}
            {/* One expression, three cases. Nested ternaries read as a list of
                rules when each line holds one case. */}
            {daysUntil(next.iso) > 1
              ? `in ${daysUntil(next.iso)} days`
              : daysUntil(next.iso) === 1
              ? "tomorrow"
              : daysUntil(next.iso) === 0
              ? "today"
              : "happening now"}
          </Text>
        </View>
      )}

      <Semester title="Fall 2026" dates={fall2026} today={today} />
      <Semester title="Spring 2027" dates={spring2027} today={today} />

      {/* LEGEND. Color is doing real work here - without a key, a red dot is
          just decoration. */}
      <View style={styles.legend}>
        {/* Object.entries turns { class: "#14213d", ... } into
            [["class", "#14213d"], ...] so it can be mapped over. The [kind,
            color] in the parameter list destructures each pair. */}
        {Object.entries(KIND_COLORS).map(([kind, color]) => (
          <View key={kind} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{kind}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.source}>
        From the Lincoln University Academic Calendar 2026-2028 (Main Campus),
        approved 5/13/26. Always confirm deadlines with the Registrar.
      </Text>
    </ScreenShell>
  );
}

// One semester block. Its own component so the markup exists once and both
// semesters stay identical.
function Semester({
  title,
  dates,
  today,
}: {
  title: string;
  dates: AcademicDate[];
  today: string;
}) {
  return (
    <View style={styles.semester}>
      <Text style={styles.semesterTitle}>{title}</Text>

      {dates.map((item) => {
        // A date is past once its END has passed, so a multi-day break doesn't
        // grey out on its first morning.
        const isPast = (item.isoEnd || item.iso) < today;
        const isToday = item.iso <= today && (item.isoEnd || item.iso) >= today;

        return (
          <View key={item.id} style={styles.row}>
            {/* THE DOT, colored by kind. Past dates get a grey dot instead, so
                the color only draws attention to what still matters. */}
            <View
              style={[
                styles.dot,
                { backgroundColor: isPast ? colors.line : KIND_COLORS[item.kind] },
              ]}
            />

            {/* Fixed-width date column, so every label starts at the same x
                whether the date reads "Dec 4" or "Apr 27 - May 1". */}
            <Text style={[styles.date, isPast && styles.pastText]}>
              {item.display}
            </Text>

            {/* flex: 1 lets a long label wrap inside the row instead of pushing
                past the edge of the card. */}
            <Text
              style={[
                styles.label,
                isPast && styles.pastText,
                isToday && styles.todayText,
              ]}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nextCard: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    padding: 15,
    marginBottom: 20,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.orange,
    letterSpacing: 1.2,     // wide spacing makes tiny uppercase legible
    marginBottom: 4,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.card,
    lineHeight: 21,
  },
  nextMeta: {
    fontSize: 12,
    color: "#c9cdd8",       // muted grey-white, readable on navy
    marginTop: 3,
  },
  semester: {
    marginBottom: 20,
  },
  semesterTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",   // top-aligned, so the dot stays level with the
                                // first line when a label wraps to two
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 5,              // nudged down to sit on the text baseline
    marginRight: 10,
  },
  date: {
    width: 78,                 // fixed, so all the labels line up
    fontSize: 11,
    fontWeight: "700",
    color: colors.navy,
  },
  label: {
    flex: 1,                   // takes the rest, so long labels wrap
    fontSize: 12,
    color: colors.navy,
    lineHeight: 16,
  },
  pastText: {
    color: colors.grey,        // faded, but still readable
  },
  todayText: {
    fontWeight: "700",
    color: colors.orange,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 11,
    color: colors.grey,
    textTransform: "capitalize",
  },
  legendText2: {
    fontSize: 11,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
  },
});