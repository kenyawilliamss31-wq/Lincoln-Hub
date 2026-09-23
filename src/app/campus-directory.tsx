// CAMPUS DIRECTORY - real offices in a two-column grid.
// Source: lincoln.edu/directory/index.html

// One import per package. Having "react-native" listed twice is a syntax
// error - JavaScript won't let you declare the name Linking twice in one file.
import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

// Lincoln's own directory page. Kept in a named constant instead of inline
// so there's one obvious place to update if the URL ever changes.
const FULL_DIRECTORY_URL = "https://www.lincoln.edu/directory/index.html";

const offices = [
  { id: 1,  name: "Public Safety",          phone: "484-365-7211", email: "lupublicsafetydepartment@lincoln.edu", place: "International Cultural Center, 1st Fl" },
  { id: 2,  name: "Information Technology", phone: "484-365-4357", email: "support@lincoln.edu",                   place: "Dickey Hall, Suite 151" },
  { id: 3,  name: "Registrar",              phone: "484-365-8087", email: "registrar@lincoln.edu",                 place: "Lincoln Hall, 1st Fl" },
  { id: 4,  name: "Financial Aid",          phone: "484-365-5300", email: "financialaid@lincoln.edu",              place: "Student Union, 2nd Fl" },
  { id: 5,  name: "Bursar",                 phone: "484-365-8080", email: "bursar@lincoln.edu",                    place: "Lincoln Hall, 2nd Fl" },
  { id: 6,  name: "Health Services",        phone: "484-365-7338", email: "healthservices@lincoln.edu",            place: "Wellness Center, Rm 100" },
  { id: 7,  name: "Counseling Services",    phone: "484-365-7244", email: "",                                      place: "Wellness Center, 2nd Fl" },
  { id: 8,  name: "Residence Life",         phone: "484-365-7226", email: "ResidenceLife@lincoln.edu",             place: "Student Union, Rm 225" },
  { id: 9,  name: "Student Success",        phone: "484-365-7222", email: "",                                      place: "Wright Hall, 3rd Fl" },
  { id: 10, name: "Career Development",     phone: "484-365-7102", email: "careerdevelopment@lincoln.edu",         place: "Wright Hall, Rm 316" },
  { id: 11, name: "Computer Science",       phone: "484-365-7445", email: "",                                      place: "Science Center, Rm 232" },
  { id: 12, name: "Library",                phone: "484-365-7367", email: "library@lincoln.edu",                   place: "Langston Hughes Library" },
  { id: 13, name: "Internship Services",    phone: "484-365-7696", email: "internshipserviceslu@lincoln.edu",      place: "Wright Hall, Rm 121" },
  { id: 14, name: "Admissions",             phone: "484-365-8081", email: "admissions@lincoln.edu",                place: "Cannon House" },
];

export default function CampusDirectoryScreen() {
  // Two tiny helper functions, defined once and reused by every card.
  // tel: and mailto: are URL schemes the phone's OS recognizes - the OS opens
  // the dialer or mail app instead of a web page.
  // .replace(/-/g, "") strips the dashes, because the dialer wants digits only.
  // The /g means "global" - replace every dash, not just the first one.
  const call = (phone: string) => Linking.openURL("tel:" + phone.replace(/-/g, ""));
  const mail = (email: string) => Linking.openURL("mailto:" + email);

  return (
    <ScreenShell sourceUrl="https://www.lincoln.edu/directory/index.html" sourceLabel="lincoln.edu directory" eyebrow="Tap to call or email" title="Campus Directory">
      {/* HEADER CARD - the escape hatch. This app only carries the offices
          students actually call, so anyone looking for a specific professor
          gets sent to Lincoln's full searchable directory. */}
      <Pressable
        style={styles.linkCard}
        // openBrowserAsync opens an in-app browser sheet that slides over the
        // app, so they can swipe it away and land right back here.
        // Linking.openURL would kick them out to Chrome and lose their place.
        onPress={() => WebBrowser.openBrowserAsync(FULL_DIRECTORY_URL)}
      >
        <View style={styles.linkText}>
          <Text style={styles.linkTitle}>Faculty and Staff Directory</Text>
          <Text style={styles.linkSub}>Search every department on lincoln.edu</Text>
        </View>

        {/* The icon is the signal that this card goes somewhere. Without it,
            a card reads as plain text and nobody thinks to tap it. */}
        <Ionicons name="open-outline" size={20} color={colors.orange} />
      </Pressable>

      {/* This wrapper is what makes the grid work. The row + wrap rules have
          to live on the PARENT of the cards, not on the cards themselves. */}
      <View style={styles.grid}>
        {offices.map((office) => (
          <View key={office.id} style={styles.card}>
            {/* flex: 1 on this block pushes the buttons to the bottom, so
                buttons line up across cards even when one office name wraps
                to two lines and its neighbor doesn't. */}
            <View style={styles.top}>
              <Text style={styles.name}>{office.name}</Text>
              <Text style={styles.place}>{office.place}</Text>
            </View>

                        <Pressable
              style={styles.action}
              onPress={() => call(office.phone)}
              // Names the office, so VoiceOver says "Call Registrar" instead of
              // reading out a bare phone number with no context.
              accessibilityLabel={`Call ${office.name}`}
            >
              <Ionicons name="call-outline" size={12} color={colors.navy} />
              <Text style={styles.actionText}>{office.phone}</Text>
            </Pressable>

            {/* Some offices have no email listed, so only draw this button
                when the string isn't empty. An empty string "" is FALSY in
                JavaScript, which is why a plain && check is enough here. */}
            {office.email !== "" && (
                            <Pressable
                style={styles.action}
                onPress={() => mail(office.email)}
                // Without the office name, every email button just says "Email".
                accessibilityLabel={`Email ${office.name}`}
              >
                <Ionicons name="mail-outline" size={12} color={colors.navy} />
                <Text style={styles.actionText}>Email</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.source}>
        Source: Lincoln University online directory. Verify before relying on
        any number.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  linkCard: {
    flexDirection: "row",
    alignItems: "center",         // vertically centers the icon against the text
    justifyContent: "space-between", // pushes text left, icon right
    backgroundColor: colors.navy,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  linkText: {
    flex: 1,                      // takes all leftover width, so long text
                                  // wraps instead of shoving the icon off
    paddingRight: 10,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",             // white, because the card behind it is navy
    marginBottom: 2,
  },
  linkSub: {
    fontSize: 12,
    color: "#c9cdd8",            // muted grey-white: readable on navy without
                                 // competing with the title above it
    lineHeight: 16,
  },
  grid: {
    flexDirection: "row",        // lay cards left-to-right
    flexWrap: "wrap",            // drop to a new line when the row is full
    gap: 10,                     // spacing between cards, both directions
  },
  card: {
    width: "48%",                // two per row; the leftover 4% covers the gap
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
  },
  top: {
    flex: 1,                     // grows to fill leftover height so the
                                 // buttons sit at the bottom of every card
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    marginBottom: 2,
  },
  place: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 15,              // keeps two-line locations from running together
  },
  action: {
    flexDirection: "row",        // icon and label side by side
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.bg,  // light grey pill against the white card
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 5,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.navy,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 14,
  },
});
