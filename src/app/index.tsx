import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const sections = [ // array of objects representing each section
  { id: 1, title: "Events", href: "/events" },
  { id: 2, title: "Digital ID", href: "/digital-id" },
  { id: 3, title: "Sports", href: "/sports" },
  { id: 4, title: "Campus Directory", href: "/campus-directory" },
  { id: 5, title: "Dining", href: "/dining" },
  { id: 6, title: "Campus Map", href: "/campus-map" },
  { id: 7, title: "Academic Calendar", href: "/academic-calendar" },
  { id: 8, title: "Quick Links", href: "/quick-links" },
];

export default function HomeScreen() {
  // gives us router.push(), which navigates to another screen
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* small, uppercase text above the main heading */}
      <Text style={styles.eyebrow}>Lincoln University</Text>

      {/* main heading, bold and large */}
      <Text style={styles.heading}>Lincoln Hub</Text>

      {/* label for the grid below */}
      <Text style={styles.eyebrow}>Sections</Text>

      {/* container for the grid of cards */}
      <View style={styles.grid}>
        {sections.map((section) => (
          // Pressable IS the card now — no Link wrapper, no asChild.
          // onPress fires router.push() with this section's href.
          <Pressable
            key={section.id}
            style={styles.card}
            onPress={() => router.push(section.href as any)}
          >
            <Text style={styles.cardTitle}>{section.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                    // fill the whole screen height
    width: "100%",              // take the full width available
    maxWidth: 480,              // stop stretching on a wide desktop browser
    alignSelf: "center",        // centers the layout once maxWidth kicks in
    padding: 20,                // space between screen edge and content
    paddingTop: 48,             // extra room up top so the heading isn't cramped
    backgroundColor: "#f4f4f7",
  },
  eyebrow: {                    // small, uppercase label text
    fontSize: 13,
    fontWeight: "600",
    color: "#8a8a94",           // grey, so it sits behind the main heading
    letterSpacing: 1,           // slight spread — makes small text feel deliberate
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heading: {                    // main heading, bold and large
    fontSize: 30,
    fontWeight: "700",
    color: "#14213d",           // navy — swap for Lincoln's exact blue
    marginBottom: 24,
  },
  grid: {                       // holds the cards
    flexDirection: "row",       // lay children left-to-right instead of stacked
    flexWrap: "wrap",           // drop to a new line when the row is full
    gap: 12,                    // spacing between cards, both directions
    marginTop: 8,               // small gap below the "Sections" label
  },
  card: {
    width: "48%",               // two per row; leftover 4% covers the gap
    height: 80,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 17,
    justifyContent: "center",   // centers the title vertically
    borderLeftWidth: 3,         // thin accent stripe down the left edge
    borderLeftColor: "#f0801a", // orange — swap for Lincoln's exact orange
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#14213d",
  },
});