// HOME — greeting, advisor card, and the 8 section cards.

import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// EDIT THIS: your advisor's real name and the real appointment link.
const advisor = {
  name: "Your Advisor",
  office: "Office location",
  bookingUrl: "https://www.lincoln.edu/",
};

// Each section now carries an icon name alongside its title and route.
// The icon strings are Ionicons names — browse them at icons.expo.fyi
const sections = [
  { id: 1, title: "Events", href: "/events", icon: "calendar-outline" },
  { id: 2, title: "Digital ID", href: "/digital-id", icon: "card-outline" },
  { id: 3, title: "Sports", href: "/sports", icon: "trophy-outline" },
  { id: 4, title: "Directory", href: "/campus-directory", icon: "call-outline" },
  { id: 5, title: "Dining", href: "/dining", icon: "restaurant-outline" },
  { id: 6, title: "Campus Map", href: "/campus-map", icon: "map-outline" },
  { id: 7, title: "Calendar", href: "/academic-calendar", icon: "school-outline" },
  { id: 8, title: "Quick Links", href: "/quick-links", icon: "link-outline" },
] as const;
// "as const" tells TypeScript these strings are exact fixed values, not just
// any string. Ionicons only accepts names from its own list, so without this
// TypeScript complains that "string" might not be a real icon name.

export default function HomeScreen() {
  const router = useRouter();

  // new Date() reads the actual clock on the phone. This is genuinely live —
  // it updates every time the screen renders, no internet needed.
  const now = new Date();

  // getHours() returns 0-23. We pick a greeting from it.
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  // That's a NESTED TERNARY: condition ? valueIfTrue : valueIfFalse, where the
  // false branch is another whole ternary. Reads as: if before noon, morning;
  // otherwise if before 6pm, afternoon; otherwise evening.

  // toLocaleDateString formats the date into readable text. The options object
  // controls which parts appear and how long each one is.
  const dateText = now.toLocaleDateString("en-US", {
    weekday: "long",   // "Wednesday" instead of "Wed"
    month: "long",     // "September" instead of "Sep"
    day: "numeric",    // "16" with no leading zero
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      {/* ---------- Greeting ---------- */}
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.date}>{dateText}</Text>

      {/* ---------- Advisor card ---------- */}
      <View style={styles.advisorCard}>
        <View style={styles.advisorTop}>
          {/* Circle holding a person icon. */}
          <View style={styles.advisorAvatar}>
            <Ionicons name="person-outline" size={22} color={colors.navy} />
          </View>

          <View style={styles.advisorInfo}>
            <Text style={styles.advisorLabel}>YOUR ADVISOR</Text>
            <Text style={styles.advisorName}>{advisor.name}</Text>
            <Text style={styles.advisorOffice}>{advisor.office}</Text>
          </View>
        </View>

        {/* Booking button. Opens a real page in the phone's browser —
            we can't create appointments inside their system. */}
        <Pressable
          style={styles.bookButton}
          onPress={() => WebBrowser.openBrowserAsync(advisor.bookingUrl)}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.card} />
          <Text style={styles.bookText}>Make an appointment</Text>
        </Pressable>
      </View>

      {/* ---------- Section grid ---------- */}
      <Text style={styles.eyebrow}>Sections</Text>

      <View style={styles.grid}>
        {sections.map((section) => (
          <Pressable
            key={section.id}
            style={styles.card}
            onPress={() => router.push(section.href as any)}
          >
            <Ionicons name={section.icon} size={24} color={colors.orange} />
            <Text style={styles.cardTitle}>{section.title}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.navy,
  },
  date: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 2,
    marginBottom: 20,
  },

  advisorCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  advisorTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  advisorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,        // half of width/height makes a circle
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  advisorInfo: {
    flex: 1,                 // takes the leftover width so text wraps cleanly
  },
  advisorLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    marginBottom: 3,
  },
  advisorName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.navy,
  },
  advisorOffice: {
    fontSize: 13,
    color: colors.grey,
    marginTop: 1,
  },
  bookButton: {
    flexDirection: "row",       // icon and label side by side
    alignItems: "center",
    justifyContent: "center",
    gap: 8,                     // space between icon and label
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 12,
  },
  bookText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: "600",
  },

  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.grey,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    height: 96,                  // taller than before to fit icon above text
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    justifyContent: "space-between",  // icon at top, title at bottom
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },
});