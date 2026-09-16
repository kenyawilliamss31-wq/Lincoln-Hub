// DIGITAL ID — a student ID card mockup.


import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

// EDIT THIS with your own details.
const student = {
  name: "Kenya Williams",
  idNumber: "0000000",
  standing: "Junior",
  major: "Computer Science",
  expires: "05 / 2027",
};

export default function DigitalIdScreen() {
  return (
    <ScreenShell eyebrow="Sample — not a valid ID" title="Digital ID">
      <View style={styles.card}>
        {/* Navy header band across the top of the card. */}
        <View style={styles.band}>
          <Text style={styles.bandText}>LINCOLN UNIVERSITY</Text>
        </View>

        <View style={styles.body}>
          {/* Initials circle standing in for a photo. */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>KW</Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.meta}>{student.standing}</Text>
            <Text style={styles.meta}>{student.major}</Text>
          </View>
        </View>

        {/* Footer row: two blocks pushed to opposite ends. */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>ID NUMBER</Text>
            <Text style={styles.value}>{student.idNumber}</Text>
          </View>
          <View>
            <Text style={styles.label}>EXPIRES</Text>
            <Text style={styles.value}>{student.expires}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        This is a student project mockup and is not an official Lincoln
        University credential.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",          // clips the navy band to the rounded corners.
                                 // Without this, the band's square corners
                                 // poke out past the card's rounded ones.
  },
  band: {
    backgroundColor: colors.navy,
    paddingVertical: 10,
    alignItems: "center",
  },
  bandText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,            // half the width = a perfect circle
    backgroundColor: colors.bg,
    alignItems: "center",        // centers the initials horizontally
    justifyContent: "center",    // and vertically
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.navy,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 3,
  },
  meta: {
    fontSize: 13,
    color: colors.grey,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",  // pushes the two blocks to the edges
    borderTopWidth: 1,
    borderTopColor: colors.line,
    padding: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.grey,
    lineHeight: 17,
    marginTop: 14,
  },
});
