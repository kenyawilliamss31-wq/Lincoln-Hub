// HOME — event banner, fun fact, greeting, sections, advisor at the bottom.

import { colors } from "@/constants/colors";
import { nextEvent } from "@/data/events";
import { factOfTheDay } from "@/data/facts";
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

export default function HomeScreen() {
  const router = useRouter();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateText = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Call the helpers from our data files. Both read the real clock, so this
  // updates on its own as days pass — no server, no internet.
  const upcoming = nextEvent();   // may be undefined once all events pass
  const fact = factOfTheDay();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ---------- Event notification ---------- */}
      {/* Only shows if there IS an upcoming event. Once every event is in the
          past, nextEvent() returns undefined and this whole block disappears
          instead of crashing. That's what the && guard is protecting against. */}
      {upcoming && (
        <Pressable style={styles.banner} onPress={() => router.push("/events")}>
          <Ionicons name="notifications-outline" size={18} color={colors.card} />
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerLabel}>COMING UP</Text>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {upcoming.title}
            </Text>
            {/* numberOfLines={1} truncates with "..." instead of letting a long
                event name wrap and break the banner's height. */}
          </View>
          <Text style={styles.bannerDate}>{upcoming.date}</Text>
        </Pressable>
      )}

      {/* ---------- Greeting ---------- */}
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.date}>{dateText}</Text>

      {/* ---------- Fun fact ---------- */}
      <View style={styles.factCard}>
        <View style={styles.factHeader}>
          <Ionicons name="bulb-outline" size={15} color={colors.orange} />
          <Text style={styles.factLabel}>DID YOU KNOW</Text>
        </View>
        <Text style={styles.factText}>{fact}</Text>
      </View>

      {/* ---------- Section grid ---------- */}
      <Text style={styles.eyebrow}>Sections</Text>

      <View style={styles.grid}>
        {sections.map((section) => ( // each section is a card that navigates to a different screen
          <Pressable
            key={section.id} // the key is required for React to track which items change, are added, or are removed
            style={styles.card}
            onPress={() => router.push(section.href as any)}
          >
            <Ionicons name={section.icon} size={24} color={colors.orange} />
            <Text style={styles.cardTitle}>{section.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* ---------- Advisor, now at the bottom ---------- */}
      <View style={styles.advisorCard}>
        <View style={styles.advisorTop}>
          <View style={styles.advisorAvatar}>
            <Ionicons name="person-outline" size={22} color={colors.navy} />
          </View>
          <View style={styles.advisorInfo}>
            <Text style={styles.advisorLabel}>YOUR ADVISOR</Text>
            <Text style={styles.advisorName}>{advisor.name}</Text>
            <Text style={styles.advisorOffice}>{advisor.office}</Text>
          </View>
        </View>

        <Pressable
          style={styles.bookButton}
          onPress={() => WebBrowser.openBrowserAsync(advisor.bookingUrl)}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.card} />
          <Text style={styles.bookText}>Make an appointment</Text>
        </Pressable>
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
    paddingTop: 36,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  banner: { // the event banner at the top of the screen
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.navy,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.card,
    letterSpacing: 1,
    opacity: 0.85,          // slightly faded so it sits behind the title
    marginBottom: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.card,
  },
  bannerDate: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.card,
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
    marginBottom: 16,
  },

  factCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
    marginBottom: 24,
  },
  factHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  factLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
  },
  factText: {
    fontSize: 14,
    color: colors.navy,
    lineHeight: 20,        // extra line spacing so multi-line text stays readable
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
    marginBottom: 28,
  },
  card: {
    width: "48%",
    height: 96,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    justifyContent: "space-between",
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },

  advisorCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  advisorTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  advisorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  advisorInfo: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 12,
  },
  bookText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: "600",
  },
});
