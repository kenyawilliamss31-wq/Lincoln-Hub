// HOME - event banner, fun fact, greeting, sections, then live campus
// info and safety at the bottom.

import { colors } from "@/constants/colors";
import { events as bundledEvents } from "@/data/events";
import { factOfTheDay } from "@/data/facts";
import { games as bundledGames, type Game } from "@/data/sports";
import { useRemote } from "@/lib/remote";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";


// Public Safety, digits only so the tel: link can use the value directly.
const SAFETY_PHONE = "4843657211";

// The shape of one event. Declared here so this file doesn't depend on what
// src/data/events.ts names its type.
type CampusEvent = {
  id: number;
  iso: string;
  date: string;
  time: string;
  title: string;
  place: string;
  host: string;
  url?: string;
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

// Today as "2026-09-22". Built from the local date parts on purpose:
// toISOString() converts to UTC first, so after 8 PM Eastern it returns
// TOMORROW's date, and today's events would vanish in the evening.
function todayIso() {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

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

  // LIVE DATA. Both files download in parallel, each with its own saved copy on
  // the phone. The banner used to read the hardcoded list; now it reads the same
  // downloaded data the Events screen does, so the two can never disagree.
  const { data: events } = useRemote<CampusEvent[]>(
    "events.json",
    bundledEvents as CampusEvent[]
  );
  const { data: games } = useRemote<Game[]>("sports.json", bundledGames);

  const today = todayIso();

  // find() returns the FIRST match and stops looking, which works because the
  // data arrives sorted oldest first. It returns undefined when nothing is left,
  // which is what the && guards below are protecting against.
  const upcoming = events.find((e) => e.iso >= today);

  // Today's events, capped at three. slice() never errors on a short array -
  // asking for three from a one-item list just returns the one.
  const todayEvents = events.filter((e) => e.iso === today).slice(0, 3);

  const nextGame = games.find((g) => g.iso >= today && g.note !== "Canceled");

  // Fact of the day reads the real clock, so it rotates on its own - no server,
  // no internet.
  const fact = factOfTheDay();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ---------- Event notification ---------- */}
      {/* Only shows if there IS an upcoming event. Once every event has passed,
          find() returns undefined and this whole block disappears instead of
          crashing. That's what the && guard is protecting against. */}
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
        {sections.map((section) => ( // each card navigates to a different screen
          <Pressable
            key={section.id} // the key lets React track which items change, are added, or removed
            style={styles.card}
            onPress={() => router.push(section.href as any)}
          >
            <Ionicons name={section.icon} size={24} color={colors.orange} />
            <Text style={styles.cardTitle}>{section.title}</Text>
          </Pressable>
        ))}
      </View>

     
      {/* ---------- Happening today ---------- */}
      {/* Only drawn when something is actually on. An empty "Today" heading
          every Sunday would make the app look broken. */}
      {todayEvents.length > 0 && (
        <View style={styles.bottomSection}>
          <Text style={styles.eyebrow}>Happening today</Text>

          {todayEvents.map((event) => (
            <Pressable
              key={event.id}
              style={styles.eventRow}
              // Goes to the Events screen rather than the RSVP page, so the home
              // screen stays a map of the app rather than a place you leave from.
              onPress={() => router.push("/events")}
            >
              {/* A fixed-width time column lines up every title, whether the
                  time reads "9:00 AM" or "All day". */}
              <Text style={styles.eventTime}>{event.time}</Text>

              <View style={styles.eventBody}>
                {/* numberOfLines={1} keeps each row exactly one line tall, so
                    three events always occupy the same height. */}
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.eventHost} numberOfLines={1}>
                  {event.host}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* ---------- Next game ---------- */}
      {/* find() returns undefined once the season is over, so this block
          disappears on its own in December without any date logic. */}
      {nextGame && (
        <Pressable style={styles.gameCard} onPress={() => router.push("/sports")}>
          <Text style={styles.gameLabel}>NEXT GAME</Text>

          <Text style={styles.gameTitle}>
            {nextGame.sport} {nextGame.site === "Home" ? "vs" : "at"}{" "}
            {nextGame.opponent}
          </Text>

          <Text style={styles.gameMeta}>
            {nextGame.date} - {nextGame.time}
            {/* Home games get called out, since those are the ones a student can
                actually walk to. */}
            {nextGame.site === "Home" ? " - at home" : ""}
          </Text>
        </Pressable>
      )}

      {/* ---------- Public Safety ---------- */}
      <Pressable
        style={styles.safety}
        // tel: hands the number to the phone's dialer. It does NOT place the
        // call - the user still presses the call button - so this is safe to tap
        // by accident. Linking is React Native's way to open something outside
        // the app.
        onPress={() => Linking.openURL(`tel:${SAFETY_PHONE}`)}
      >
        <View style={styles.safetyIcon}>
          <Ionicons name="shield-checkmark" size={20} color={colors.card} />
        </View>

        {/* flex: 1 absorbs the leftover width, pushing the phone icon to the far
            right edge regardless of screen size. */}
        <View style={styles.safetyText}>
          <Text style={styles.safetyTitle}>Call Public Safety</Text>
          <Text style={styles.safetySub}>(484) 365-7211 - 24/7</Text>
        </View>

        <Ionicons name="call" size={18} color={colors.card} />
      </Pressable>
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
    lineHeight: 20,        // extra line spacing keeps multi-line text readable
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

  bottomSection: {
    marginBottom: 16,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  eventTime: {
    width: 62,             // fixed, so every title starts at the same x
    fontSize: 11,
    fontWeight: "700",
    color: colors.orange,
  },
  eventBody: {
    flex: 1,               // takes the rest, so long titles truncate instead of
                           // pushing past the card edge
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },
  eventHost: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 1,
  },

  gameCard: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  gameLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.orange,
    letterSpacing: 1.2,    // wide spacing makes tiny uppercase legible
    marginBottom: 4,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.card,
    lineHeight: 21,
  },
  gameMeta: {
    fontSize: 12,
    color: "#c9cdd8",      // muted grey-white, readable on navy
    marginTop: 3,
  },

  safety: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.red,
    borderRadius: 14,
    padding: 13,
  },
  safetyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,      // half the width = a circle
    // A translucent white circle. rgba is red/green/blue/alpha, and 0.18 is the
    // opacity - the red card shows through, which is why this one value works
    // no matter what color sits behind it.
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  safetyText: {
    flex: 1,               // pushes the phone icon to the right edge
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.card,
  },
  safetySub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",  // dimmed white, still legible
    marginTop: 1,
  },
});