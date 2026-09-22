// CAMPUS MAP - embedded Google Map, directions, and building list.

import InfoCard from "@/components/info-card";
import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { createElement } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

// Lincoln's coordinates, taken from the campus Google Maps URL.
// Latitude first, then longitude - the order every mapping API expects.
const CAMPUS_LAT = 39.8071788;
const CAMPUS_LNG = -75.928474;

// output=embed is the important part. A normal Google Maps URL refuses to load
// inside a frame; this is Google's official embeddable version and it needs no
// API key. z=16 is the zoom level - higher numbers are closer in.
const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=" +
  CAMPUS_LAT + "," + CAMPUS_LNG +
  "&z=16&output=embed";

// Google's embed refuses to load as a top-level page - it insists on being
// inside an iframe. So rather than pointing WebView at Google, we hand WebView
// a tiny HTML page of our own that HAS an iframe in it. WebView renders our
// page, our page frames Google, and Google is satisfied.
//
// The backticks make a template literal, which can span multiple lines.
// Regular "quotes" cannot, which is why URLs elsewhere in this file are glued
// together with + instead.
const MAP_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <!-- Without this the map renders zoomed-way-out and tiny on a phone. -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* height: 100% has to be set on html and body too, not just the iframe.
         A percentage height means "of my parent" - and if the parent has no
         height, 100% of nothing is nothing, so the map collapses to zero. */
      html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
      iframe { border: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <!-- \${...} is string interpolation: inside backticks it drops the value of
         that variable straight into the text. Only works in template literals. -->
    <iframe src="${MAP_EMBED_URL}" loading="lazy"></iframe>
  </body>
</html>
`;

// api=1 is Google's format for launching turn-by-turn navigation. On a phone
// this opens the actual Google Maps app, not the website.
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  CAMPUS_LAT + "," + CAMPUS_LNG;

// Lincoln's own directions and parking page - things Google can't tell you,
// like which lots students are allowed to park in.
const OFFICIAL_MAP_URL =
  "https://www.lincoln.edu/about/maps/directions-getting-campus.html";

const buildings = [
  { id: 1,  name: "Wright Hall",                      lines: ["Career Development, Internship Services, classrooms"] },
  { id: 2,  name: "Vail Hall",                        lines: ["Administration, President's office"] },
  { id: 3,  name: "Manuel Rivero Hall",               lines: ["Athletics, gymnasium"] },
  { id: 4,  name: "Langston Hughes Memorial Library", lines: ["Library, study space"] },
  { id: 5,  name: "Science Center",                   lines: ["Computer Science department, labs"] },
  { id: 6,  name: "Student Union Building",           lines: ["Dining, Financial Aid, Residence Life"] },
  { id: 7,  name: "Dickey Hall",                      lines: ["Information Technology, auditorium"] },
  { id: 8,  name: "Lincoln Hall",                     lines: ["Registrar, Bursar"] },
  { id: 9,  name: "Wellness Center",                  lines: ["Health Services, Counseling, Chick-fil-A"] },
  { id: 10, name: "International Cultural Center",    lines: ["Public Safety, events"] },
];

export default function CampusMapScreen() {
  return (
    <ScreenShell sourceUrl="https://www.lincoln.edu/about/maps/directions-getting-campus.html" sourceLabel="lincoln.edu maps" eyebrow="Buildings and directions" title="Campus Map">
      {/* EMBEDDED MAP - two versions, because WebView is a NATIVE component
          and doesn't exist in a browser. Platform.OS tells us where the app is
          running right now: "ios", "android", or "web".

          The box needs a fixed height either way. Neither an iframe nor a
          WebView has a natural size, so with no height they collapse to zero
          pixels and you get blank space with no error to explain it. */}
      <View style={styles.mapBox}>
        {Platform.OS === "web" ? (
          // In a browser we already have a real iframe available, so no HTML
          // wrapper is needed. React Native has no iframe component, so we
          // build the DOM element by hand with createElement(tag, props).
          // This branch only ever runs on web, where iframe is a real thing.
          createElement("iframe", {
            src: MAP_EMBED_URL,
            style: { border: "none", width: "100%", height: "100%" },
            title: "Lincoln University campus map",
          })
        ) : (
          <WebView
            // html instead of uri: we hand WebView the page content directly
            // rather than an address for it to go fetch.
            // baseUrl makes WebView treat our page as if it came from
            // google.com, which the iframe needs in order to be allowed to load.
            source={{ html: MAP_HTML, baseUrl: "https://www.google.com" }}
            style={styles.map}
            scrollEnabled={true}        // allows pinching and dragging the map
            startInLoadingState={true}  // hides the white flash while loading
          />
        )}
      </View>

      {/* The embed is for looking at. This is for actually going somewhere -
          it hands off to Google Maps, which has GPS and live traffic. */}
      <Pressable
        style={styles.primaryBtn}
        onPress={() => WebBrowser.openBrowserAsync(DIRECTIONS_URL)}
      >
        <Ionicons name="navigate-outline" size={16} color="#ffffff" />
        <Text style={styles.primaryText}>Get Directions</Text>
      </Pressable>

      {/* Secondary button, styled quieter on purpose. Two navy buttons stacked
          would compete for attention; an outlined one reads as the lesser
          option without needing a label to say so. */}
      <Pressable
        style={styles.secondaryBtn}
        onPress={() => WebBrowser.openBrowserAsync(OFFICIAL_MAP_URL)}
      >
        <Ionicons name="map-outline" size={16} color={colors.navy} />
        <Text style={styles.secondaryText}>Official map and parking</Text>
      </Pressable>

      <Text style={styles.heading}>Buildings</Text>

      {/* InfoCard is our own reusable component. It takes a title and an array
          of lines and handles all the card styling, so this screen never has
          to think about padding or fonts for these rows. */}
      {buildings.map((building) => (
        <InfoCard key={building.id} title={building.name} lines={building.lines} />
      ))}

      <Text style={styles.source}>
        Map data from Google. Building contents from the Lincoln University
        campus directory.
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  mapBox: {
    height: 220,                  // required - the map has no intrinsic height
    borderRadius: 14,
    overflow: "hidden",           // clips the map's square corners to the
                                  // radius. Without this the map bleeds past
                                  // the rounding and the corners look broken.
    marginBottom: 10,
    backgroundColor: colors.line, // grey placeholder visible while it loads
  },
  map: {
    flex: 1,                      // fills the 220px box completely
  },
  primaryBtn: {
    flexDirection: "row",         // icon and label side by side
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 8,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.card, // white, not navy
    borderWidth: 1,
    borderColor: colors.line,     // thin outline instead of a solid fill
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },
  heading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 14,
  },
});
