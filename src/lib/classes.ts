// MY CLASSES - the student's own schedule, saved on the phone.
//
// Nothing here comes from Lincoln. The student types their classes in, picks
// the building from the public walking-map list, and it's stored locally with
// AsyncStorage. No login, no server, no student records.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

const STORAGE_KEY = "lh-my-classes";

export type ClassItem = {
  id: string;          // made from the time it was created, so it's unique
  name: string;        // "CS 301"
  room: string;        // "Room 232", or "" if they skip it
  building: string;    // the building's NAME, not its id - ids got renumbered
                       // when the list was sorted, but names never change
  days: number[];      // getDay() numbers: 1 = Monday ... 5 = Friday
  start: number;       // minutes since midnight, same trick as dining hours
};

// Day letters for the picker and labels. Index matches getDay(): 0 = Sunday.
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Turns "10:00 AM", "10am", or "2:30 pm" into minutes since midnight.
// Returns null when it can't read the time, so the form can show an error.
export function parseTime(text: string): number | null {
  // Capture groups: 1 = hour, 2 = minutes (optional), 3 = am or pm.
  // The (?: ... )? part makes ":30" optional, so "10am" works too.
  const m = text.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return null;

  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  if (hour < 1 || hour > 12 || minute > 59) return null;

  const isPM = m[3].toLowerCase() === "pm";
  // 12-hour to 24-hour: 12 PM stays 12, 12 AM becomes 0.
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  return hour * 60 + minute;
}

// Turns 600 back into "10:00 AM" for display.
export function formatTime(minutes: number) {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  // || 12 turns 0 into 12, so noon and midnight don't print as "0".
  const hour12 = hour24 % 12 || 12;
  const suffix = hour24 < 12 ? "AM" : "PM";
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

// Finds the next class from right now. Checks the rest of today first, then
// each following day, up to a full week ahead.
// Returns the class plus a label like "Today" or "Tomorrow" or "Mon".
export function nextClass(classes: ClassItem[]) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // offset 0 = today, 1 = tomorrow, and so on.
  for (let offset = 0; offset < 7; offset++) {
    // % 7 wraps Saturday (6) + 1 back around to Sunday (0).
    const day = (now.getDay() + offset) % 7;

    const candidates = classes
      .filter((c) => c.days.includes(day))
      // Today, only classes that haven't started yet count.
      .filter((c) => offset > 0 || c.start > nowMinutes)
      // Earliest first. a - b sorts numbers smallest to largest.
      .sort((a, b) => a.start - b.start);

    if (candidates.length > 0) {
      const label =
        offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : DAY_SHORT[day];
      return { cls: candidates[0], label };
    }
  }
  // No classes saved at all.
  return null;
}

export function useClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Reloads every time a screen using this comes into view, so the home screen
  // notices a class you just added on the Classes screen.
  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          setClasses(raw ? JSON.parse(raw) : []);
        } catch {
          // Corrupt storage: start empty rather than crash.
        }
      }
      load();
    }, [])
  );

  // Saves the list to state and to the phone in one step, so the two can
  // never disagree.
  async function save(next: ClassItem[]) {
    setClasses(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  // Omit<ClassItem, "id"> means "a ClassItem without the id" - the caller
  // doesn't make the id, this function does.
  async function addClass(item: Omit<ClassItem, "id">) {
    // Date.now() is milliseconds since 1970, so two classes can't share one.
    await save([...classes, { ...item, id: String(Date.now()) }]);
  }

  async function removeClass(id: string) {
    await save(classes.filter((c) => c.id !== id));
  }

  return { classes, addClass, removeClass };
}