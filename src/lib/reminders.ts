// SAVED EVENTS AND REMINDERS
//
// Saving an event does two things: records it on the phone, and schedules a
// local notification an hour before it starts. "Local" means the phone itself
// fires it - no server, no internet, nothing to pay for.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

// Tells the OS what to do when a notification fires while the app is open.
// Without this the reminder arrives silently. Module level, so it runs once.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = "lh-saved-events";

// How long before the event the reminder fires.
const MINUTES_BEFORE = 60;

// The minimum an event needs to be saved. Extra fields are allowed, so each
// screen can pass its own richer event object.
export type SavableEvent = {
  iso: string;
  time: string;
  title: string;
  place: string;
};

// A STABLE identifier. Not event.id, because the pipeline renumbers ids every
// rebuild - yesterday's id 40 could be a different event today. Date plus
// title survives a rebuild.
export function eventKey(e: SavableEvent) {
  return e.iso + "|" + e.title;
}

// Turns an event's date and time into a real Date object.
function eventStart(e: SavableEvent): Date | null {
  // "All day" events have no clock time, so treat them as 8 AM.
  if (/all day/i.test(e.time)) {
    // "T08:00:00" with no Z forces LOCAL time. A bare date is read as UTC,
    // which lands on the wrong day for anyone in the US.
    return new Date(e.iso + "T08:00:00");
  }

  // Pull the pieces out of "7:00 PM": group 1 hour, 2 minutes, 3 AM or PM.
  const m = e.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;

  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const isPM = m[3].toUpperCase() === "PM";

  // 12-hour to 24-hour: 12 PM stays 12, but 12 AM becomes 0.
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  const [y, mo, d] = e.iso.split("-").map(Number);
  // Month is zero-based in the Date constructor, so subtract 1.
  return new Date(y, mo - 1, d, hour, minute);
}

// Asks for notification permission once. Returns whether we have it.
async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  // Only prompts if the user hasn't answered before - no nagging.
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export function useSavedEvents() {
  // Maps a stable event key to its scheduled notification id, so unsaving can
  // cancel the right reminder.
  const [saved, setSaved] = useState<Record<string, string>>({});

  // useFocusEffect runs every time this screen comes into view - not just the
  // first time like useEffect. That's what lets the home screen notice an event
  // you saved on the Events screen a moment ago. The inner useCallback with []
  // keeps it from re-running on every render.
  useFocusEffect(
    useCallback(() => {
      // Declared inside, because the effect itself cannot be async.
      async function load() {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          // No saved data yet means an empty object, not a crash.
          setSaved(raw ? JSON.parse(raw) : {});
        } catch {
          // A corrupt store isn't worth crashing over.
        }

        // Android needs a named channel before any notification can display.
        // Creating one that already exists is harmless.
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Event reminders",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
      }
      load();
    }, [])
  );

  const toggle = useCallback(
    async (event: SavableEvent) => {
      const key = eventKey(event);

      // Copy instead of mutating, so React sees a new object and redraws.
      const next = { ...saved };

      if (next[key] !== undefined) {
        // UNSAVE. Cancel the reminder, then forget the event.
        if (next[key]) {
          // Wrapped because canceling an already-fired id throws.
          try {
            await Notifications.cancelScheduledNotificationAsync(next[key]);
          } catch {}
        }
        delete next[key];
      } else {
        // SAVE. Schedule a reminder if possible, but save the event either way.
        let notificationId = "";
        const start = eventStart(event);

        const fireAt = start
          ? new Date(start.getTime() - MINUTES_BEFORE * 60 * 1000)
          : null;

        // Only schedule if the reminder time is still in the future.
        if (fireAt && fireAt.getTime() > Date.now()) {
          const allowed = await ensurePermission();
          if (allowed) {
            notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: event.title,
                body: `Starts at ${event.time} - ${event.place}`,
              },
              trigger: {
                // A one-off notification at a specific moment.
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fireAt,
              },
            });
          }
        }

        next[key] = notificationId;
      }

      setSaved(next);
      // Storage only holds strings, so the object is stringified.
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    // saved is listed because the function reads it - leaving it out would
    // make this see a stale, first-render copy.
    [saved]
  );

  return {
    // Screens ask a question instead of poking at the object.
    isSaved: (event: SavableEvent) => saved[eventKey(event)] !== undefined,
    toggle,
    savedCount: Object.keys(saved).length,
    savedKeys: Object.keys(saved),
  };
}