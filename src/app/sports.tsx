import { StyleSheet, Text, View } from "react-native";

export default function SportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sports</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 48,
    backgroundColor: "#f4f4f7",
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#14213d",
  },
});
