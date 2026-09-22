// DIGITAL ID - a student ID card mockup. NOT a real credential.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

// Deliberately kept at the top of the file so there's one obvious
// place to change them and no hunting through the layout code below.
const student = {
  name: "Kenya Williams",
  major: "Computer Science",
  standing: "Junior",
  classYear: "Class of 2028",
  // Placeholder on purpose. A real student ID number in a public repo is
  // permanent - git keeps deleted lines in its history forever.
  idNumber: "LU-0000000",
  residence: "Residence hall on file",  // EDIT: your dorm, or leave as-is
};

// The three privileges shown as rows. Keeping them in an array means the
// layout code below is one .map() instead of three copy-pasted blocks.
const privileges = [
  { id: 1, icon: "restaurant-outline",   label: "Meal Plan",      status: "Active" },
  { id: 2, icon: "bed-outline",          label: "Residence",      status: student.residence },
  { id: 3, icon: "library-outline",      label: "Library Access", status: "Active" },
];

export default function DigitalIdScreen() {
  // A live clock. Real campus ID apps show a ticking timestamp so a staff
  // member can tell a live screen from a screenshot someone shared.
  const [now, setNow] = useState(new Date());

  // useEffect runs code AFTER the screen renders - here, starting a timer.
  useEffect(() => {
    // setInterval runs the function every 1000 milliseconds (one second).
    const timer = setInterval(() => setNow(new Date()), 1000);

    // The returned function is CLEANUP. React calls it when you leave the
    // screen. Without it the timer keeps running forever in the background,
    // trying to update a screen that's gone - a memory leak.
    return () => clearInterval(timer);
    // The empty [] means "run this once when the screen appears," not on every
    // render. Without it, every tick would start another timer, and you'd have
    // hundreds within a minute.
  }, []);

  return (
    <ScreenShell eyebrow="Student credential" title="Digital ID">
      {/* THE CARD. overflow: hidden is what lets the navy header band respect
          the rounded corners - without it the band's square corners poke out
          past the card's rounding. */}
      <View style={styles.card}>
        {/* HEADER BAND */}
        <View style={styles.band}>
          <Text style={styles.school}>LINCOLN UNIVERSITY</Text>
          <Text style={styles.bandSub}>Student Identification</Text>
        </View>

        <View style={styles.body}>
          {/* PHOTO PLACEHOLDER plus the name block, side by side. */}
          <View style={styles.identity}>
            <View style={styles.photo}>
              {/* A person icon standing in for a photo. Honest placeholder -
                  better than a grey rectangle that looks like a loading bug. */}
              <Ionicons name="person" size={38} color={colors.grey} />
            </View>

            {/* flex: 1 here absorbs the leftover width, so a long name wraps
                instead of pushing past the edge of the card. */}
            <View style={styles.nameBlock}>
              <Text style={styles.name}>{student.name}</Text>
              <Text style={styles.major}>{student.major}</Text>
              <Text style={styles.year}>
                {student.standing} - {student.classYear}
              </Text>
            </View>
          </View>

          {/* ID NUMBER */}
          <View style={styles.idRow}>
            <Text style={styles.idLabel}>ID NUMBER</Text>
            <Text style={styles.idValue}>{student.idNumber}</Text>
          </View>

          {/* PRIVILEGES - one row per item in the array. */}
          {privileges.map((item) => (
            <View key={item.id} style={styles.privRow}>
              {/* "as any" tells TypeScript to stop checking this one value.
                  Ionicons has a list of ~1300 valid icon names, and TypeScript
                  can't confirm a name stored in a plain string matches one. */}
              <Ionicons name={item.icon as any} size={15} color={colors.navy} />
              <Text style={styles.privLabel}>{item.label}</Text>
              <Text style={styles.privStatus}>{item.status}</Text>
            </View>
          ))}

          {/* BARCODE - drawn, not an image. A row of thin Views with varying
              widths. Purely decorative: it encodes nothing and won't scan. */}
          <View style={styles.barcode}>
            {/* Array.from({ length: 40 }) builds an empty 40-item array, which
                gives .map() something to loop over 40 times. There's no data
                here - we just need 40 bars. */}
            {Array.from({ length: 40 }).map((_unused, index) => (
              <View
                key={index}
                style={[
                  styles.bar,
                  // index % 3 cycles 0, 1, 2, 0, 1, 2... so the bar widths
                  // repeat in a pattern instead of being uniform.
                  { width: index % 3 === 0 ? 3 : index % 3 === 1 ? 1 : 2 },
                ]}
              />
            ))}
          </View>

          {/* LIVE CLOCK - the whole reason for the useEffect above. */}
          <Text style={styles.clock}>
            {/* toLocaleTimeString formats a Date using the phone's own locale
                settings, so it matches whatever clock format the user has. */}
            {now.toLocaleDateString()} {now.toLocaleTimeString()}
          </Text>
        </View>
      </View>

      {/* portfolio mockup, and it should never
          be mistakable for a real credential. */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.orange} />
        <Text style={styles.disclaimerText}>
          This is a student-built demonstration, not an official Lincoln
          University credential. It cannot be used for building access,
          dining, or identification.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",       // clips the navy band to the rounded corners
    marginBottom: 14,
  },
  band: {
    backgroundColor: colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  school: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 1.2,       // wide spacing reads as formal and official
  },
  bandSub: {
    fontSize: 11,
    color: "#c9cdd8",         // muted grey-white, readable on navy
    marginTop: 2,
  },
  body: {
    padding: 16,
  },
  identity: {
    flexDirection: "row",
    marginBottom: 14,
  },
  photo: {
    width: 66,
    height: 82,               // taller than wide, like a real ID photo
    borderRadius: 8,
    backgroundColor: colors.bg,
    alignItems: "center",     // centers the icon horizontally
    justifyContent: "center", // and vertically
    marginRight: 14,
  },
  nameBlock: {
    flex: 1,                  // takes leftover width so long names wrap
    justifyContent: "center",
  },
  name: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 3,
  },
  major: {
    fontSize: 14,
    color: colors.orange,
    fontWeight: "600",
  },
  year: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  idRow: {
    borderTopWidth: 1,
    borderTopColor: colors.line,   // thin divider between card sections
    paddingTop: 10,
    marginBottom: 10,
  },
  idLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
  },
  idValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy,
    letterSpacing: 1.5,       // spacing out digits makes them easier to read
    marginTop: 2,
  },
  privRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  privLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.navy,
    width: 92,                // fixed width lines up every status value
  },
  privStatus: {
    fontSize: 12,
    color: colors.grey,
    flex: 1,                  // takes the rest so long text wraps cleanly
  },
  barcode: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 40,
    marginTop: 14,
    marginBottom: 8,
  },
  bar: {
    flex: 1,                  // stretches the row to fill the card width
    height: "100%",
    backgroundColor: colors.navy,
    maxWidth: 4,              // stops bars getting fat on a wide screen
  },
  clock: {
    fontSize: 11,
    color: colors.grey,
    textAlign: "center",
  },
  disclaimer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,  // colored spine marks this as a warning
  },
  disclaimerText: {
    flex: 1,                  // wraps the text instead of overflowing
    fontSize: 12,
    color: colors.grey,
    lineHeight: 17,
  },
});