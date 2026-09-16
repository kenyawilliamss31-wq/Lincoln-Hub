import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const sections = [ // array of objects representing each section
  { id: 1, title: "Events", href: "/events" },
  { id: 2, title: "Digital ID", href: "/digital-id" },
  { id: 3, title: "Sports", href: "/sports" },
  { id: 4, title: "Campus Directory", href: "/campus-directory" },
  { id: 5, title: "Dining", href: "/dining" },
  { id: 6, title: "Campus Map", href: "/campus-map" },
  { id: 7, title: "Academic Calendar", href: "/academic-calendar" },
  {id: 8, title: "Quick Links", href: "/quick-links" },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* small, uppercase text above the main heading */}
      <Text style={styles.eyebrow}>Lincoln University</Text>

      {/* main heading, bold and large */}
      <Text style={styles.heading}>Lincoln Hub</Text>

      <Text style={styles.eyebrow}>Quick Links</Text>

      {/* container for the grid of cards */}
      <View style={styles.grid}>
        {sections.map((section) => (
          <Link key={section.id} href={section.href} style={styles.cardWrap}>
            <View style={styles.card}>
              {/* title of the card */}
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ // styles for the components in the screen
  container: {
    flex: 1,                    // fill the whole screen height
    width: "100%",              // take the full width available
    maxWidth: 480,              // Astop stretching on a wide desktop browser.
                                // Without this, 48% of a 1000px window = a 480px card.
    alignSelf: "center",        // centers the whole layout once maxWidth kicks in
    padding: 20,                // space between screen edge and content
    paddingTop: 48,             // extra room up top so the heading isn't cramped
    backgroundColor: "#f4f4f7",
  },
  eyebrow: { // small, uppercase text above headings
    fontSize: 13,
    fontWeight: "600",
    color: "#8a8a94",           // grey, so it sits behind the main heading
    letterSpacing: 1,           // slight spread — makes small text feel deliberate
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heading: { // main heading, bold and large
    fontSize: 30,
    fontWeight: "700",
    color: "#14213d",           // navy — swap for Lincoln's exact blue
    marginBottom: 24,
  },
  grid: { // container for the grid of cards
    flexDirection: "row",       // lay children left-to-right instead of stacked
    flexWrap: "wrap",           // drop to a new line when the row is full
    gap: 12,                    // handles BOTH the horizontal and vertical spacing.
                                // REMOVED justifyContent: "space-between" — it was
                                // shoving cards to the far edges and fighting the gap.
  },
  cardWrap: { 
    width: "48%",           
    },
  card: {
    width: "100%",              // This makes the card fill its wrapper.
    height: 80,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 17,
    justifyContent: "center", // push text to the bottom of the card
    borderLeftWidth: 3,         // thin accent stripe down the left edge
    borderLeftColor: "#f0801a", // orange — swap for Lincoln's exact orange
  },
  cardTitle: {// title of the card, bold and medium size
    fontSize: 17,
    fontWeight: "600",
    color: "#14213d",
  },
});