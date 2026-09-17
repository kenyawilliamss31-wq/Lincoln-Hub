// ACADEMIC CALENDAR — Fall 2026, student-facing dates.
// Source: Lincoln University Fall 2026 academic calendar.
//
// New idea here: comparing each date to today so past items render dimmed.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

// "iso" is the sortable date used by code. "date" is what we show on screen.
// For date ranges, iso holds the LAST day, so the item stays highlighted until
// the whole range has passed.
const dates = [
  { id: 1,  iso: "2026-08-24", date: "Aug 24",     title: "Undergraduate classes begin" },
  { id: 2,  iso: "2026-08-28", date: "Aug 28",     title: "Last day to register, add, or change schedule" },
  { id: 3,  iso: "2026-09-04", date: "Sep 4",      title: "Last day to drop with 100% refund" },
  { id: 4,  iso: "2026-09-04", date: "Sep 4",      title: "Payment arrangement deadline" },
  { id: 5,  iso: "2026-09-07", date: "Sep 7",      title: "Labor Day — no classes" },
  { id: 6,  iso: "2026-09-10", date: "Sep 10",     title: "All-University Convocation" },
  { id: 7,  iso: "2026-09-14", date: "Sep 14",     title: "Schedules purged for non-payment" },
  { id: 8,  iso: "2026-09-18", date: "Sep 18",     title: "Deadline to petition for reinstatement" },
  { id: 9,  iso: "2026-09-25", date: "Sep 25",     title: "Fall graduation application deadline" },
  { id: 10, iso: "2026-10-09", date: "Oct 5-9",    title: "Mid-term examination week" },
  { id: 11, iso: "2026-10-14", date: "Oct 14",     title: "Mid-term grades due" },
  { id: 12, iso: "2026-10-24", date: "Oct 24",     title: "Homecoming" },
  { id: 13, iso: "2026-10-30", date: "Oct 30",     title: "Last day to drop with a W grade" },
  { id: 14, iso: "2026-11-02", date: "Nov 2",      title: "Mandatory registration begins" },
  { id: 15, iso: "2026-11-20", date: "Nov 20",     title: "Last day to withdraw from the University" },
  { id: 16, iso: "2026-11-20", date: "Nov 20",     title: "Spring graduation application deadline" },
  { id: 17, iso: "2026-11-28", date: "Nov 23-28",  title: "Thanksgiving recess" },
  { id: 18, iso: "2026-11-30", date: "Nov 30",     title: "Classes resume" },
  { id: 19, iso: "2026-12-04", date: "Dec 4",      title: "Last day of class" },
  { id: 20, iso: "2026-12-07", date: "Dec 5-7",    title: "Reading days" },
  { id: 21, iso: "2026-12-12", date: "Dec 8-12",   title: "Final examinations" },
  { id: 22, iso: "2026-12-14", date: "Dec 14",     title: "Final grades due by 12:00 p.m." },
];

export default function AcademicCalendarScreen() {
  // toISOString() gives "2026-09-17T12:42:00.000Z". slice(0, 10) cuts off the
  // time, leaving "2026-09-17" — the same shape as our iso values, so we can
  // compare them as plain strings.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScreenShell eyebrow="Fall 2026" title="Academic Calendar">
      {dates.map((item) => {
        // Anything before today is history. We dim it rather than hide it,
        // so you can still see where you are in the semester.
        const isPast = item.iso < today;

        return (
          <View key={item.id} style={styles.card}>
            {/* Style arrays again: the base style, then a second object that
                overrides only the color when the date has passed. */}
            <View style={styles.dateBox}>
              <Text style={[styles.dateText, isPast && styles.dimText]}>
                {item.date}
              </Text>
            </View>
            {/* isPast && styles.dimText evaluates to FALSE when the date is
                upcoming, and React Native ignores false in a style array.
                That's the standard way to apply a style conditionally. */}

            <Text style={[styles.title, isPast && styles.dimText]}>
              {item.title}
            </Text>
          </View>
        );
      })}

      <Text style={styles.source}>
        Source: Lincoln University Fall 2026 academic calendar. Confirm with the
        Registrar before relying on a deadline.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  dateBox: {
    width: 68,                   // fixed width so every date column lines up
    marginRight: 12,
    borderRightWidth: 1,         // thin divider between date and description
    borderRightColor: colors.line,
    paddingRight: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.orange,
  },
  title: {
    flex: 1,                     // absorbs the rest of the width so long
                                 // descriptions wrap instead of overflowing
    fontSize: 14,
    color: colors.navy,
    lineHeight: 19,
  },
  dimText: {
    color: colors.grey,          // one override reused for both date and title
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 10,
  },
});