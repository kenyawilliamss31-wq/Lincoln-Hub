// CAMPUS DIRECTORY — real offices in a two-column grid.
// Source: lincoln.edu/directory/index.html

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

const offices = [
  { id: 1,  name: "Public Safety", phone: "484-365-7211", email: "lupublicsafetydepartment@lincoln.edu", place: "International Cultural Center, 1st Fl" },
  { id: 2,  name: "Information Technology", phone: "484-365-4357", email: "support@lincoln.edu", place: "Dickey Hall, Suite 151" },
  { id: 3,  name: "Registrar", phone: "484-365-8087", email: "registrar@lincoln.edu", place: "Lincoln Hall, 1st Fl" },
  { id: 4,  name: "Financial Aid", phone: "484-365-5300", email: "financialaid@lincoln.edu", place: "Student Union, 2nd Fl" },
  { id: 5,  name: "Bursar", phone: "484-365-8080", email: "bursar@lincoln.edu", place: "Lincoln Hall, 2nd Fl" },
  { id: 6,  name: "Health Services", phone: "484-365-7338", email: "healthservices@lincoln.edu", place: "Wellness Center, Rm 100" },
  { id: 7,  name: "Counseling Services", phone: "484-365-7244", email: "", place: "Wellness Center, 2nd Fl" },
  { id: 8,  name: "Residence Life", phone: "484-365-7226", email: "ResidenceLife@lincoln.edu", place: "Student Union, Rm 225" },
  { id: 9,  name: "Student Success", phone: "484-365-7222", email: "", place: "Wright Hall, 3rd Fl" },
  { id: 10, name: "Career Development", phone: "484-365-7102", email: "careerdevelopment@lincoln.edu", place: "Wright Hall, Rm 316" },
  { id: 11, name: "Computer Science", phone: "484-365-7445", email: "", place: "Science Center, Rm 232" },
  { id: 12, name: "Library", phone: "484-365-7367", email: "library@lincoln.edu", place: "Langston Hughes Library" },
  { id: 13, name: "Internship Services", phone: "484-365-7696", email: "internshipserviceslu@lincoln.edu", place: "Wright Hall, Rm 121" },
  { id: 14, name: "Admissions", phone: "484-365-8081", email: "admissions@lincoln.edu", place: "Cannon House" },
];

export default function CampusDirectoryScreen() { // this is the default export for the page, so it must be a function component

  const call = (phone: string) => Linking.openURL("tel:" + phone.replace(/-/g, ""));
  const mail = (email: string) => Linking.openURL("mailto:" + email);

  return (
    <ScreenShell eyebrow="Tap to call or email" title="Campus Directory">
      {/* This wrapper is what makes the grid work. The row + wrap rules have
          to live on the PARENT of the cards, not on the cards themselves. */}
      <View style={styles.grid}>
        {offices.map((office) => (
          <View key={office.id} style={styles.card}>
            {/* Office name and location. flex: 1 on this block pushes the
                buttons to the bottom, so buttons line up across cards even
                when one name wraps to two lines and another doesn't. */}
            <View style={styles.top}>
              <Text style={styles.name}>{office.name}</Text>
              <Text style={styles.place}>{office.place}</Text>
            </View>

            <Pressable style={styles.action} onPress={() => call(office.phone)}>
              <Ionicons name="call-outline" size={12} color={colors.navy} />
              <Text style={styles.actionText}>{office.phone}</Text>
            </Pressable>

            {/* Some offices have no email listed, so only draw this button
                when the string isn't empty. An empty string "" is FALSY in
                JavaScript, which is why a plain && check is enough here. */}
            {office.email !== "" && (
              <Pressable style={styles.action} onPress={() => mail(office.email)}>
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
  grid: {
    flexDirection: "row",        // lay cards left-to-right
    flexWrap: "wrap",            // drop to a new line when the row is full
    gap: 10,                     // spacing between cards, both directions
  },
  card: {
    width: "48%",                // two per row; the leftover 4% covers the gap
    backgroundColor: colors.card, // white card on light grey background
    borderRadius: 17, // rounded corners
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
    lineHeight: 15,
  },
  action: {
    flexDirection: "row",        // icon beside label
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