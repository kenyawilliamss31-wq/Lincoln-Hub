import { StyleSheet, Text, View } from "react-native";

const events = [
  { id: 1, title: "Dorm Clean up", date: "Sep 20", location: "Ashmun and Lorraine Hansberry Hall" },
  { id: 2, title: "Brother Circle", date: "Sep 21", location: "LLC" },
  { id: 3, title: "Study Abroad 101", date: "Sep 22", location: "TBD" },
  { id: 4, title: "Career Readiness Workshop - Career Fair Prep Part 1", date: "Sep 25", location: "Wright Hall 314" },
  { id: 5, title: "Meet President Allen - Open Office Hours", date: "Sep 28", location: "Vail Hall 201" }
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Events</Text>

      {events.map((event) => (
        <View key={event.id} style={styles.card}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>{event.date}</Text>
          <Text style={styles.location}>{event.location}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#eeedf6",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fdfdfd",
    borderRadius: 11,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    fontWeight: "thin",
    color: "#666666",
  },
});