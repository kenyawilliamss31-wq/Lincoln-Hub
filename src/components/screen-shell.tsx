// A reusable page wrapper.
//
// Every screen needs the same things: a scrollable container, a small grey
// eyebrow label, and a big heading. Instead of retyping that eight times,
// we write it once here and each screen just uses it.
//
// This is the single most important idea in React: a component that takes
// PROPS (values passed in from outside) and renders them.

import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "@/constants/colors";

// This block describes what this component accepts.
// The "?" on eyebrow means it's optional. "ReactNode" means "any JSX".
type Props = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

// { eyebrow, title, children } pulls those three values out of the props
// object. "children" is special — it's whatever you put BETWEEN the opening
// and closing tags when you use this component.
export default function ScreenShell({ eyebrow, title, children }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* && means "only render this if eyebrow has a value".
          Without it, screens with no eyebrow would render an empty gap. */}
      {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}

      <Text style={styles.heading}>{title}</Text>

      {/* Whatever the screen passes in gets dropped here. */}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                      // fill the screen height
    backgroundColor: colors.bg,
  },
  content: {
    // On a ScrollView, padding goes in contentContainerStyle, not style.
    // Putting it in style would pad the scroll frame instead of the content.
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,            // breathing room at the bottom of the scroll
    width: "100%",
    maxWidth: 480,                // stop stretching on a wide desktop browser
    alignSelf: "center",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.grey,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 20,
  },
});
