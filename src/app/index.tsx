// HOME - saved-event banner, greeting, fun fact, sections, then your saved
// events today, next game, and Public Safety at the bottom.

import { colors } from "@/constants/colors";
import { events as bundledEvents } from "@/data/events";
import { factOfTheDay } from "@/data/facts";
import { games as bundledGames, type Game } from "@/data/sports";
import { formatTime, nextClass, useClasses } from "@/lib/classes";
import { useSavedEvents } from "@/lib/reminders";
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
  { id: 2, title: "My Classes", href: "/classes", icon: "book-outline" },
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
  // the phone, so the home screen can never disagree with the other screens.
  const { data: events } = useRemote<CampusEvent[]>(
    "events.json",
    bundledEvents as CampusEvent[]
  );
  const { data: games } = useRemote<Game[]>("sports.json", bundledGames);

  // Which events you bookmarked. The home screen only surfaces saved ones, so
  // it stays quiet unless you asked to be reminded about something.
  const { isSaved } = useSavedEvents();
    // Your own schedule, and whichever class comes next from right now.
  const { classes } = useClasses();
  const upNext = nextClass(classes);

  const today = todayIso();

  // Every saved event from today onward. Filtering the LIVE data rather than
  // stored copies means a moved event shows its current time here.
  // iso strings compare correctly as plain text, so >= is all "upcoming" needs.
  const savedUpcoming = events.filter((e) => e.iso >= today && isSaved(e));

  // The banner shows the soonest one. [0] is the first item, or undefined when
  // the list is empty - which the && guard in the JSX below handles.
  const nextSaved = savedUpcoming[0];

  // Saved events happening today, capped at three. slice() never errors on a
  // short array - asking for three from a one-item list just returns the one.
  const savedToday = savedUpcoming.filter((e) => e.iso === today).slice(0, 3);

  const nextGame = games.find((g) => g.iso >= today && g.note !== "Canceled");

  // Fact of the day reads the real clock, so it rotates on its own - no server,
  // no internet.
  const fact = factOfTheDay();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ---------- Saved event banner ---------- */}
      {/* Only shows when you have a saved event coming up. Nothing saved means
          nextSaved is undefined, and && renders nothing at all - no banner, no
          empty gap at the top. */}
      {nextSaved && (
        <Pressable style={styles.banner} onPress={() => router.push("/events" as any)}>
          <Ionicons name="bookmark" size={18} color={colors.card} />
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerLabel}>YOUR NEXT SAVED EVENT</Text>
            {/* numberOfLines={1} truncates with "..." instead of letting a long
                event name wrap and break the banner's height. */}
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {nextSaved.title}
            </Text>
          </View>
          <Text style={styles.bannerDate}>{nextSaved.date}</Text>
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

      {/* ---------- Next class ---------- */}
      {/* Only shows once you've added classes. Tapping the card opens your
          schedule; the walk icon goes straight to directions. */}
      {upNext && (
        <Pressable
          style={styles.classCard}
          onPress={() => router.push("/classes" as any)}
        >
          <View style={styles.classInfo}>
            <Text style={styles.classLabel}>
              NEXT CLASS - {upNext.label.toUpperCase()}
            </Text>
            <Text style={styles.className}>
              {upNext.cls.name} at {formatTime(upNext.cls.start)}
            </Text>
            <Text style={styles.classPlace} numberOfLines={1}>
              {upNext.cls.building}
              {upNext.cls.room !== "" ? `, ${upNext.cls.room}` : ""}
            </Text>
          </View>
          <Ionicons name="book-outline" size={22} color={colors.orange} />
        </Pressable>
      )}

      {/* ---------- Your saved events today ---------- */}
      {/* Only drawn when you saved something for today. No saved events means
          no heading and no cards - the section simply doesn't exist. */}
      {savedToday.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Your events today</Text>

          {savedToday.map((event) => (
            <Pressable
              key={event.id}
              style={styles.eventRow}
              // Goes to the Events screen rather than the RSVP page, so the home
              // screen stays a map of the app rather than a place you leave from.
              onPress={() => router.push("/events" as any)}
            >
              {/* A fixed-width time column lines up every title, whether the
                  time reads "9:00 AM" or "All day". */}
              <Text style={styles.eventTime}>{event.time}</Text>

              <View style={styles.eventBody}>
                {/* numberOfLines={1} keeps each row exactly one line tall. */}
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.eventHost} numberOfLines={1}>
                  {event.place}
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
        <Pressable style={styles.gameCard} onPress={() => router.push("/sports" as any)}>
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
        // call - the user still has to press call, so an accidental tap is
        // harmless. Linking is React Native's way to open something outside
        // the app.
        onPress={() => Linking.openURL(`tel:${SAFETY_PHONE}`)}
        // Read aloud by a screen reader so the button is usable without sight.
        accessibilityLabel="Call Public Safety, available 24 hours"
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
    classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.navy,
  },
  classInfo: {
    flex: 1,               // pushes the icon to the right edge
  },
  classLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.grey,
    letterSpacing: 1,
    marginBottom: 3,
  },
  className: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy,
  },
  classPlace: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingTop: 36,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 480,          // keeps it phone-width on a laptop browser
    alignSelf: "center",
  },

  banner: { // the saved-event banner at the top of the screen
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.navy,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  bannerInfo: {
    flex: 1,                // takes the middle, pushing the date to the right
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
    lineHeight: 20,         // extra line spacing keeps multi-line text readable
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
    flexWrap: "wrap",       // two per row, wrapping onto new rows
    gap: 12,
    marginBottom: 28,
  },
  card: {
    width: "48%",           // two fit side by side with the gap between
    height: 96,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    justifyContent: "space-between",   // icon top, title bottom
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },

  section: {
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
    width: 62,              // fixed, so every title starts at the same x
    fontSize: 11,
    fontWeight: "700",
    color: colors.orange,
  },
  eventBody: {
    flex: 1,                // takes the rest, so long titles truncate instead of
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
    letterSpacing: 1.2,     // wide spacing makes tiny uppercase legible
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
    color: "#c9cdd8",       // muted grey-white, readable on navy
    marginTop: 3,
  },

  safety: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.red,
    borderRadius: 14,
    padding: 13,
    marginBottom: 24,
  },
  safetyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,       // half the width = a circle
    // Translucent white: rgba is red/green/blue/alpha, and 0.18 is the opacity,
    // so the red card shows through behind it.
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  safetyText: {
    flex: 1,                // pushes the phone icon to the right edge
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.card,
  },
  safetySub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",   // dimmed white, still legible
    marginTop: 1,
  },
});