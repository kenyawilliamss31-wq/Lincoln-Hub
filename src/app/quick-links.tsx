// QUICK LINKS — opens Lincoln's real websites in the phone's browser.
//
// This is the honest way to handle grades, email and tutoring: we can't log
// into those systems, but we can get the student there in one tap.
//
// New idea here: expo-web-browser, and Pressable with an onPress handler.

import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";

// VERIFY EVERY URL yourself before you show this to anyone. Sites move.
const links = [
  { id: 1, title: "LU Self-Service", note: "Grades, schedule, academic plan", url: "https://www.lincoln.edu/" },
  { id: 2, title: "Outlook Email", note: "Your student email", url: "https://outlook.office.com/" },
  { id: 3, title: "Knack Tutoring", note: "Peer tutoring on demand", url: "https://lionsconnect.lincoln.edu/family/academic-support/" },
  { id: 4, title: "Class Schedules", note: "Registrar course listings", url: "https://www.lincoln.edu/academics/academic-affairs/registrar/class-schedules.html" },
  { id: 5, title: "Student Life", note: "Campus resources and support", url: "https://www.lincoln.edu/student-life/index.html" },
  { id: 6, title: "Directions to Campus", note: "Maps and building list", url: "https://www.lincoln.edu/about/maps/directions-getting-campus.html" },
];

export default function QuickLinksScreen() {
  // A tiny helper function. Declared here because it needs nothing from
  // outside, and naming it keeps the JSX below readable.
  const open = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScreenShell eyebrow="Opens in your browser" title="Quick Links">
      {links.map((link) => (
        // onPress takes a FUNCTION, not a function call. That's why it's
        // () => open(link.url) and not open(link.url) — the second version
        // would fire immediately on render instead of waiting for a tap.
        <Pressable
          key={link.id}
          style={styles.row}
          onPress={() => open(link.url)}
        >
          <View style={styles.info}>
            <Text style={styles.title}>{link.title}</Text>
            <Text style={styles.note}>{link.note}</Text>
          </View>

          {/* A chevron drawn with text — signals "this goes somewhere". */}
          <Text style={styles.chevron}>{"\u203A"}</Text>
        </Pressable>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 2,
  },
  note: {
    fontSize: 13,
    color: colors.grey,
  },
  chevron: {
    fontSize: 22,
    color: colors.orange,
    marginLeft: 10,
  },
});
