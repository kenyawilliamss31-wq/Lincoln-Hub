// A reusable page wrapper.
//
// Every screen needs the same frame: a scrollable container, an eyebrow label,
// a heading, a link to the data source, and pull-to-refresh. Written once here,
// so adding a feature to this file adds it to all eight screens at once.

import { colors } from "@/constants/colors";
import * as WebBrowser from "expo-web-browser";
import { ReactNode } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// The "?" marks a prop as optional. Screens with no data source and no refresh
// simply don't pass those, and the extra UI isn't drawn.
type Props = {
  eyebrow?: string;
  title: string;
  sourceUrl?: string;       // the page this screen's data comes from
  sourceLabel?: string;     // what to call it, e.g. "lulions.com"
  updatedLabel?: string;    // "3h ago", from useRemote
  onRefresh?: () => void;   // a function to call on pull-to-refresh
  refreshing?: boolean;     // whether the spinner should be showing
  children: ReactNode;
};

export default function ScreenShell({
  eyebrow,
  title,
  sourceUrl,
  sourceLabel,
  updatedLabel,
  onRefresh,
  refreshing,
  children,
}: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      // PULL TO REFRESH. Only attached when a screen passes onRefresh -
      // undefined turns the gesture off entirely, so static screens like the
      // Digital ID don't show a spinner that does nothing.
      refreshControl={
        onRefresh ? (
          <RefreshControl
            // refreshing controls the spinner. If a screen forgets to set this
            // back to false, the spinner stays on screen forever.
            refreshing={refreshing === true}
            onRefresh={onRefresh}
            colors={[colors.navy]}      // Android
            tintColor={colors.navy}     // iOS
          />
        ) : undefined
      }
    >
      {/* && means "only render this if eyebrow has a value". Without it,
          screens with no eyebrow would render an empty gap. */}
      {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}

      <Text style={styles.heading}>{title}</Text>

      {/* SOURCE ROW - the link out, and how fresh the data is. Only drawn when
          a screen names a source, so a screen with no external data doesn't
          show an empty row. This is honesty as a feature: anyone can check
          where the information came from. */}
      {sourceUrl && (
        <View style={styles.sourceRow}>
          <Pressable
            style={styles.sourcePill}
            // The arrow function matters: onPress wants a function to call
            // LATER. Without it the browser would open during render.
            onPress={() => WebBrowser.openBrowserAsync(sourceUrl)}
          >
            <Text style={styles.sourceText}>
              {/* || means "use the left side unless it's empty" - so a screen
                  can pass a url with no label and still read sensibly. */}
              Source: {sourceLabel || sourceUrl}
            </Text>

            {/* \u2197 is the north-east arrow, written as a unicode escape so
                no editor encoding can mangle the character. */}
            <Text style={styles.sourceArrow}>{"\u2197"}</Text>
          </Pressable>

          {/* Only shown once data has actually been fetched. */}
          {updatedLabel !== undefined && updatedLabel !== "" && (
            <Text style={styles.updated}>Updated {updatedLabel}</Text>
          )}
        </View>
      )}

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
    // On a ScrollView, padding goes in contentContainerStyle, not style -
    // otherwise it pads the scroll frame instead of the content inside it.
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,            // breathing room at the end of the scroll
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
    marginBottom: 10,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",             // long source names drop the age to line two
    gap: 8,
    marginBottom: 18,
  },
  sourcePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",      // shrink to fit the text rather than
                                  // stretching, so only the words are tappable
    backgroundColor: colors.card,
    borderRadius: 999,            // pill shape
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.navy,
  },
  sourceArrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.orange,
    marginLeft: 5,
  },
  updated: {
    fontSize: 11,
    color: colors.grey,
  },
});