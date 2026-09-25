// MY CLASSES - add your schedule once, see it by day, tap a class to walk there.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { buildings } from "@/data/buildings";
import {
    DAY_SHORT,
    formatTime,
    parseTime,
    useClasses,
    type ClassItem,
} from "@/lib/classes";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

// Weekdays only, in getDay() numbers. Most Lincoln classes are M-F.
const WEEKDAYS = [1, 2, 3, 4, 5];

// Opens walking directions to a building, found by its name.
function walkTo(buildingName: string) {
  const b = buildings.find((x) => x.name === buildingName);
  // Guard: if the building somehow isn't in the list, do nothing.
  if (!b) return;
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}&travelmode=walking`
  );
}

export default function ClassesScreen() {
  const { classes, addClass, removeClass } = useClasses();

  // FORM STATE. Each input gets its own piece of state - that's how React
  // "controls" an input: the screen shows whatever is stored here.
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [timeText, setTimeText] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [building, setBuilding] = useState("");
  const [buildingSearch, setBuildingSearch] = useState("");
  const [error, setError] = useState("");

  // Building matches for the search box. Only searched once they type
  // something, and capped at 5 so the form doesn't turn into a long list.
  const matches =
    buildingSearch.trim() === ""
      ? []
      : buildings
          .filter((b) =>
            // toLowerCase on both sides makes the search ignore capitals.
            b.name.toLowerCase().includes(buildingSearch.toLowerCase())
          )
          .slice(0, 5);

  // Tapping a day adds it, tapping again removes it.
  function toggleDay(day: number) {
    setDays(
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
    );
  }

  // Clears the form back to empty.
  function resetForm() {
    setName("");
    setRoom("");
    setTimeText("");
    setDays([]);
    setBuilding("");
    setBuildingSearch("");
    setError("");
  }

  async function handleSave() {
    // VALIDATION. Checks every field before saving, and says exactly what's
    // wrong - "invalid input" alone teaches the user nothing.
    const start = parseTime(timeText);
    if (name.trim() === "") return setError("Add a class name, like CS 301.");
    if (days.length === 0) return setError("Pick at least one day.");
    if (start === null) return setError("Enter a time like 10:00 AM.");
    if (building === "") return setError("Pick a building from the list.");

    await addClass({
      name: name.trim(),
      room: room.trim(),
      building,
      // sort so "M W F" is stored in order no matter the tap order.
      days: [...days].sort(),
      start,
    });
    resetForm();
    setFormOpen(false);
  }

  // Asks before deleting, since there's no undo.
  function confirmDelete(item: ClassItem) {
    Alert.alert("Remove class?", `${item.name} will be deleted.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeClass(item.id) },
    ]);
  }

  const today = new Date().getDay();

  return (
    <ScreenShell eyebrow="Your schedule" title="My Classes">
      <Text style={styles.privacy}>
        Saved only on this phone. Nothing is sent to Lincoln or anyone else.
      </Text>

      {/* ADD BUTTON / FORM. The button and the form swap places. */}
      {!formOpen ? (
        <Pressable style={styles.addButton} onPress={() => setFormOpen(true)}>
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.addText}>Add a class</Text>
        </Pressable>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Class</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="CS 301"
            placeholderTextColor={colors.grey}
          />

          <Text style={styles.label}>Days</Text>
          <View style={styles.dayRow}>
            {WEEKDAYS.map((d) => {
              const on = days.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => toggleDay(d)}
                  style={[styles.dayChip, on && styles.dayChipOn]}
                  // Tells a screen reader this is a toggle and whether it's on.
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                >
                  <Text style={[styles.dayChipText, on && styles.dayChipTextOn]}>
                    {DAY_SHORT[d]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Start time</Text>
          <TextInput
            style={styles.input}
            value={timeText}
            onChangeText={setTimeText}
            placeholder="10:00 AM"
            placeholderTextColor={colors.grey}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Building</Text>
          {building !== "" ? (
            // Once chosen, show the pick with a way to change it.
            <Pressable
              style={styles.chosen}
              onPress={() => {
                setBuilding("");
                setBuildingSearch("");
              }}
            >
              <Text style={styles.chosenText}>{building}</Text>
              <Text style={styles.change}>Change</Text>
            </Pressable>
          ) : (
            <View>
              <TextInput
                style={styles.input}
                value={buildingSearch}
                onChangeText={setBuildingSearch}
                placeholder="Search, e.g. Wright"
                placeholderTextColor={colors.grey}
              />
              {matches.map((b) => (
                <Pressable
                  key={b.id}
                  style={styles.match}
                  onPress={() => setBuilding(b.name)}
                >
                  <Text style={styles.matchText}>{b.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.label}>Room (optional)</Text>
          <TextInput
            style={styles.input}
            value={room}
            onChangeText={setRoom}
            placeholder="Room 232"
            placeholderTextColor={colors.grey}
          />

          {error !== "" && <Text style={styles.error}>{error}</Text>}

          <View style={styles.formButtons}>
            <Pressable
              style={styles.cancel}
              onPress={() => {
                resetForm();
                setFormOpen(false);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.save} onPress={handleSave}>
              <Text style={styles.saveText}>Save class</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* EMPTY STATE */}
      {classes.length === 0 && !formOpen && (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={28} color={colors.grey} />
          <Text style={styles.emptyTitle}>No classes yet</Text>
          <Text style={styles.emptyBody}>
            Add your schedule once. The home screen will show your next class,
            and tapping it gives walking directions.
          </Text>
        </View>
      )}

      {/* THE WEEK. One section per weekday that has classes. */}
      {WEEKDAYS.map((d) => {
        const dayClasses = classes
          .filter((c) => c.days.includes(d))
          .sort((a, b) => a.start - b.start);
        // Skip days with nothing - no empty "Thursday" headings.
        if (dayClasses.length === 0) return null;

        return (
          <View key={d}>
            <Text style={[styles.dayHeading, d === today && styles.dayToday]}>
              {DAY_SHORT[d]}
              {d === today ? " - Today" : ""}
            </Text>

            {dayClasses.map((c) => (
              <View key={c.id + d} style={styles.card}>
                <Text style={styles.time}>{formatTime(c.start)}</Text>

                {/* flex: 1 takes the middle, pushing the buttons right. */}
                <View style={styles.cardBody}>
                  <Text style={styles.className}>{c.name}</Text>
                  <Text style={styles.place}>
                    {c.building}
                    {c.room !== "" ? `, ${c.room}` : ""}
                  </Text>
                </View>

                <Pressable
                  style={styles.iconBtn}
                  onPress={() => walkTo(c.building)}
                  accessibilityLabel={`Walking directions to ${c.building}`}
                >
                  <Ionicons name="walk-outline" size={20} color={colors.navy} />
                </Pressable>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => confirmDelete(c)}
                  accessibilityLabel={`Remove ${c.name}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.grey} />
                </Pressable>
              </View>
            ))}
          </View>
        );
      })}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  privacy: {
    fontSize: 11,
    color: colors.grey,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 0.5,
    marginBottom: 5,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.bg,
  },
  dayRow: {
    flexDirection: "row",
    gap: 6,
  },
  dayChip: {
    flex: 1,             // five equal-width chips across the row
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayChipOn: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.grey,
  },
  dayChipTextOn: {
    color: "#ffffff",
  },
  chosen: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: 10,
    padding: 12,
  },
  chosenText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
  },
  change: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.orange,
  },
  match: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  matchText: {
    fontSize: 14,
    color: colors.navy,
  },
  error: {
    fontSize: 12,
    color: colors.red,
    marginTop: 10,
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  cancel: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.grey,
  },
  save: {
    flex: 2,             // twice as wide as Cancel - the main action
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: colors.orange,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.navy,
    marginTop: 10,
  },
  emptyBody: {
    fontSize: 12,
    color: colors.grey,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 5,
  },
  dayHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.grey,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 8,
  },
  dayToday: {
    color: colors.orange,  // today's heading stands out
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  time: {
    width: 68,             // fixed, so every class name lines up
    fontSize: 12,
    fontWeight: "700",
    color: colors.orange,
  },
  cardBody: {
    flex: 1,
  },
  className: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },
  place: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 1,
  },
  iconBtn: {
    padding: 6,            // grows the tap target around a small icon
  },
});