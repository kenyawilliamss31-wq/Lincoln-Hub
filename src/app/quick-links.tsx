// QUICK LINKS - opens Lincoln's real sites in the phone's browser.
//
// This is the honest way to handle grades, email, and tutoring: we can't log
// into those systems, but we can get a student there in one tap.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";

// The emoji is just another string field. Emoji ARE text - no image files, no
// icon library, and they render on every phone. The tradeoff is that each
// platform draws them slightly differently, so they'll look a bit different on
// Android than on iPhone. That's fine here.
const links = [
  { id: 1, emoji: "🎓", title: "LU Self-Service", note: "Grades, schedule, academic plan, billing", url: "https://lincoln-ss.colleague.elluciancloud.com/Student" },
  { id: 2, emoji: "📧", title: "Outlook Email",   note: "Your student email",                       url: "https://outlook.office.com/" },
  { id: 3, emoji: "📚", title: "Knack Tutoring",  note: "Peer tutoring on demand",                  url: "https://lionsconnect.lincoln.edu/family/academic-support/" },
  { id: 4, emoji: "🦁", title: "Lions Connect",   note: "Campus organizations and resources",        url: "https://lionsconnect.lincoln.edu/web_app?id=24040&menu_id=56483&if=0&" },
  { id: 5, emoji: "🚨", title: "SaferWatch",      note: "Campus safety and incident reporting",      url: "https://www.saferwatchapp.com/" },
  { id: 6, emoji: "💼", title: "Handshake",       note: "Internships and jobs",                     url: "https://lincoln.joinhandshake.com/home" },
];

export default function QuickLinksScreen() {
  // A tiny helper. Declared here because it needs nothing from outside, and
  // naming it keeps the JSX below readable.
  const open = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScreenShell sourceUrl="https://www.lincoln.edu/" sourceLabel="lincoln.edu" eyebrow="Opens in your browser" title="Quick Links">
      {links.map((link) => (
        // onPress takes a FUNCTION, not a function call. That's why it's
        // () => open(link.url) and not open(link.url) - the second version
        // would fire during render instead of waiting for a tap.
        <Pressable
          key={link.id}
          style={styles.row}
          onPress={() => open(link.url)}
        >
          {/* The emoji sits in its own fixed-width box so every title starts at
              the same x-position. Emoji vary in width, so without a fixed box
              the titles would sit at slightly different places down the list
              and the column would look crooked. */}
          <View style={styles.emojiBox}>
            <Text style={styles.emoji}>{link.emoji}</Text>
          </View>

          {/* flex: 1 absorbs the leftover width, which pushes the chevron to
              the far right and lets long notes wrap instead of shoving it off
              the edge of the card. */}
          <View style={styles.info}>
            <Text style={styles.title}>{link.title}</Text>
            <Text style={styles.note}>{link.note}</Text>
          </View>

          {/* A chevron drawn with text - signals "this goes somewhere".
              \u203A is the unicode escape for a single angle quote. Writing it
              as an escape instead of pasting the character means it can't be
              mangled by a text editor saving in the wrong encoding - which is
              exactly what turned our em-dashes into "Â" earlier. */}
          <Text style={styles.chevron}>{"\u203A"}</Text>
        </Pressable>
      ))}

      <Text style={styles.note2}>
        These open Lincoln's official sites. This app never sees your password.
      </Text>
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
  emojiBox: {
    width: 38,               // fixed, so every title lines up down the list
    alignItems: "center",
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,                 // takes the remaining width
    paddingLeft: 4,
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
    lineHeight: 17,
  },
  chevron: {
    fontSize: 22,
    color: colors.orange,
    marginLeft: 10,
  },
  note2: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 6,
  },
});
