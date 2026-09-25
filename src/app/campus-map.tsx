// CAMPUS MAP - campus overview on top, then every building from Lincoln's
// official walking map. Tap any building to get walking directions to it.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { buildings, categories } from "@/data/buildings";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

// The center of campus, used for the overview map at the top.
const CAMPUS_LAT = 39.8071788;
const CAMPUS_LNG = -75.928474;

// Lincoln's own interactive walking map, for anyone who wants the full version.
const OFFICIAL_MAP_URL =
  "https://lionsconnect.lincoln.edu/LionsConnectInfo/LU_google_walking_map/";

// The overview map, wrapped in a tiny web page. Google's embed only loads
// inside an iframe, so we hand the WebView a page containing one rather than
// pointing it at the map URL directly.
const MAP_HTML = `
  <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="margin:0">
      <iframe
        width="100%" height="100%" style="border:0"
        src="https://maps.google.com/maps?q=${CAMPUS_LAT},${CAMPUS_LNG}&z=16&output=embed">
      </iframe>
    </body>
  </html>
`;

// Opens walking directions from wherever the phone is to this spot.
// This URL format is Google's official "directions" link. On a phone it opens
// the Google Maps app if installed, otherwise the browser - either way the
// user gets turn-by-turn walking directions without us building any of it.
function walkTo(lat: number, lng: number) {
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
  );
}

// One icon per category, so the list is scannable before reading any names.
// A lookup object instead of if-statements: adding a category is one line.
const CATEGORY_ICONS: Record<string, string> = {
  "Academic": "school-outline",
  "Offices": "business-outline",
  "Historic": "library-outline",
  "Residence Halls": "bed-outline",
  "Campus Life": "people-outline",
  "Arts": "color-palette-outline",
  "Other Housing": "home-outline",
  "Parking": "car-outline",
};

export default function CampusMapScreen() {
  // Which filter chip is active. "All" shows every building.
  const [filter, setFilter] = useState("All");

  // A building matches if the chip is its main category OR one of its extras.
  // ?. ("optional chaining") stops safely when a building has no also list
  // instead of crashing, and ?? false turns that stopped result into a no.
  const shown =
    filter === "All"
      ? buildings
      : buildings.filter(
          (b) => b.category === filter || (b.also?.includes(filter) ?? false)
        );

  return (
    <ScreenShell
      eyebrow="Find your way"
      title="Campus Map"
      sourceUrl={OFFICIAL_MAP_URL}
      sourceLabel="LU walking map"
    >
      {/* OVERVIEW MAP. The fixed height matters: a WebView inside a scrolling
          screen has no natural height, so without one it collapses to zero. */}
      <View style={styles.mapBox}>
        <WebView
          // baseUrl makes the page look like it comes from google.com, which
          // is what gets Google's embed to agree to load inside the app.
          source={{ html: MAP_HTML, baseUrl: "https://www.google.com" }}
          style={styles.map}
          // Stops the map from stealing the screen's scroll gesture, so a swipe
          // over the map still scrolls the list.
          scrollEnabled={false}
        />
      </View>

      <Pressable
        style={styles.officialBtn}
        onPress={() => WebBrowser.openBrowserAsync(OFFICIAL_MAP_URL)}
      >
        <Ionicons name="map-outline" size={16} color={colors.navy} />
        <Text style={styles.officialText}>Open Lincoln's full walking map</Text>
      </Pressable>

      {/* FILTER CHIPS. ["All", ...categories] builds a new array with "All" in
          front - the ... ("spread") copies every item of categories into it. */}
      <View style={styles.filterRow}>
        {["All", ...categories].map((name) => {
          const active = name === filter;

          return (
            <Pressable
              key={name}
              // An arrow function, so it runs on tap - not during render.
              onPress={() => setFilter(name)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>
        {shown.length} locations. Tap one for walking directions.
      </Text>

      {/* THE BUILDING LIST. Every row is a button. */}
      {shown.map((b) => (
        <Pressable
          key={b.id}
          style={styles.row}
          onPress={() => walkTo(b.lat, b.lng)}
          // The screen reader hears the destination, so it's clear what
          // tapping will do.
          accessibilityLabel={`Walking directions to ${b.name}`}
        >
          <View style={styles.iconCircle}>
            {/* When a chip is active, show that chip's icon - so Wright Hall
                gets the school icon under Academic. "as any" because TypeScript
                can't confirm a name pulled from an object is a valid icon. */}
            <Ionicons
              name={
                CATEGORY_ICONS[filter === "All" ? b.category : filter] as any
              }
              size={17}
              color={colors.orange}
            />
          </View>

          {/* flex: 1 absorbs the leftover width, so long names wrap here
              instead of pushing the walk icon off the edge. */}
          <View style={styles.rowBody}>
            <Text style={styles.name}>{b.name}</Text>
            <Text style={styles.category}>
              {/* Lists every chip the building belongs to, e.g. "Offices,
                  Academic". [b.category, ...(b.also ?? [])] joins the main
                  category with the extras, using an empty list if none. */}
              {[b.category, ...(b.also ?? [])].join(", ")}
            </Text>
          </View>

          <Ionicons name="walk-outline" size={20} color={colors.navy} />
        </Pressable>
      ))}

      <Text style={styles.source}>
        Locations from Lincoln University's official Google walking map.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  mapBox: {
    height: 220,          // required - see the WebView comment above
    borderRadius: 14,
    overflow: "hidden",   // clips the map's square corners to the rounded box
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  officialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: 11,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  officialText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.navy,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",     // chips spill onto a second line on narrow phones
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,    // pill shape
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.grey,
  },
  chipTextActive: {
    color: "#ffffff",
  },
  hint: {
    fontSize: 11,
    color: colors.grey,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,     // half the width = a circle
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowBody: {
    flex: 1,              // pushes the walk icon to the right edge
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },
  category: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 1,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 10,
  },
});