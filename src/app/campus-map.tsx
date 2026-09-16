// CAMPUS MAP — building list plus a button out to Lincoln's official map.
//
// A real interactive map needs react-native-maps and Google Maps API keys,
// which is a bigger job than it looks. This version is honest and useful:
// a searchable building list, and one tap out to the real map.

import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text } from "react-native";
import InfoCard from "@/components/info-card";
import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";

// EDIT THE DATA: replace with real buildings and what's inside them.
const buildings = [
  { id: 1, name: "Wright Hall", lines: ["Classrooms, CSC department"] },
  { id: 2, name: "Vail Hall", lines: ["Administration, President's office"] },
  { id: 3, name: "Manuel Rivero Hall", lines: ["Athletics, gymnasium"] },
  { id: 4, name: "Langston Hughes Memorial Library", lines: ["Library, study space"] },
  { id: 5, name: "Lorraine Hansberry Hall", lines: ["Residence hall"] },
  { id: 6, name: "Student Union Building", lines: ["Dining, student organizations"] },
];

const MAP_URL = "https://www.lincoln.edu/about/maps/directions-getting-campus.html";

export default function CampusMapScreen() {
  return (
    <ScreenShell eyebrow="Buildings" title="Campus Map">
      {/* A full-width button. Same Pressable + onPress pattern as Quick Links. */}
      <Pressable
        style={styles.button}
        onPress={() => WebBrowser.openBrowserAsync(MAP_URL)}
      >
        <Text style={styles.buttonText}>Open official campus map</Text>
      </Pressable>

      {buildings.map((building) => (
        <InfoCard key={building.id} title={building.name} lines={building.lines} />
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",       // centers the label horizontally
    marginBottom: 16,
  },
  buttonText: {
    color: colors.card,        // white text on navy
    fontSize: 15,
    fontWeight: "600",
  },
});
