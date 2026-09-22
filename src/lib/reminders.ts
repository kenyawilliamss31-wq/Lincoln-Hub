// SAVED EVENTS AND REMINDERS
//
// Saving an event does two things: records it on the phone, and schedules a
// local notification an hour before it starts. "Local" means the phone itself
// fires it - no server, no internet, nothing to pay for. That's why this works
// even though the app has no backend.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

// Tells the OS what to do when a notification fires while the app is open.
// Without this the reminder arrives silently and the user never sees it.
// Set at module level so it runs once when the app loads, not per render.
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

// The minimum an event needs for us to save it. Defining it this way means the
// Events screen can pass its own richer event object and TypeScript is happy -
// extra fields are allowed, missing ones are not.
export type SavableEvent = {
  iso: string;
  time: string;
  title: string;
  place: string;
};

// A STABLE identifier. This deliberately does NOT use event.id, because the
// pipeline renumbers ids from 1 every time it rebuilds - so yesterday's id 40
// could be a different event today, and saved events would silently point at
// the wrong thing. Date plus title survives a rebuild.
export function eventKey(e: SavableEvent) {
  return e.iso + "|" + e.title;
}

// Turns an event's date and time into a real Date object.
function eventStart(e: SavableEvent): Date | null {
  // "All day" events have no clock time, so treat them as 8 AM - early enough
  // to be useful, late enough not to wake anyone.
  if (/all day/i.test(e.time)) {
    // "T08:00:00" with no Z forces LOCAL time. A bare "2026-09-22" is read as
    // UTC by JavaScript, which lands on the wrong day for anyone in the US.
    return new Date(e.iso + "T08:00:00");
  }

  // Pull the pieces out of "7:00 PM". The parentheses are capture groups:
  // 1 = hour, 2 = minutes, 3 = AM or PM.
  const m = e.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;

  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const isPM = m[3].toUpperCase() === "PM";

  // 12-hour to 24-hour conversion, and both edge cases are easy to get wrong:
  // 12 PM is hour 12, but 12 AM is hour 0.
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  const [y, mo, d] = e.iso.split("-").map(Number);
  // Month is zero-based in the Date constructor, so subtract 1.
  return new Date(y, mo - 1, d, hour, minute);
}

// Asks the user for notification permission, once. Returns whether we have it.
async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  // Only actually prompts if the user hasn't answered before. If they said no
  // previously, this returns false without nagging them again.
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export function useSavedEvents() {
  // Maps a stable event key to the scheduled notification's id. We keep the id
  // so unsaving can cancel the right reminder - without it, a canceled event
  // would still buzz an hour before it wasn't happening.
  const [saved, setSaved] = useState<Record<string, string>>({});

  // Loads what was saved the last time the app ran.
  useEffect(() => {
    // An async function declared inside, because useEffect itself cannot be
    // async - React expects it to return a cleanup function, not a Promise.
    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSaved(JSON.parse(raw));
      } catch {
        // A corrupt store isn't worth crashing over. Worst case the user's
        // saved list is empty and they save things again.
      }

      // Android requires a named channel before any notification will display.
      // On iOS this call does nothing, which is why it needs no else branch.
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Event reminders",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }
    load();
  }, []);

  // useCallback keeps this function identity stable across renders, so screens
  // passing it to child components don't re-render them needlessly.
  const toggle = useCallback(
    async (event: SavableEvent) => {
      const key = eventKey(event);

      // Copying the object rather than mutating it is what lets React detect
      // the change. Editing saved[key] directly would leave the same object
      // reference and the screen would not redraw.
      const next = { ...saved };

      if (next[key] !== undefined) {
        // UNSAVE. Cancel the reminder first, then forget the event.
        if (next[key]) {
          // Wrapped because canceling an id the OS already fired throws.
          try {
            await Notifications.cancelScheduledNotificationAsync(next[key]);
          } catch {}
        }
        delete next[key];
      } else {
        // SAVE. Try to schedule a reminder, but save the event either way -
        // someone who declined notifications should still get a saved list.
        let notificationId = "";
        const start = eventStart(event);

        // Only schedule if the reminder time is still in the future. The OS
        // silently drops a past trigger, so this just avoids pointless calls.
        const fireAt = start
          ? new Date(start.getTime() - MINUTES_BEFORE * 60 * 1000)
          : null;

        if (fireAt && fireAt.getTime() > Date.now()) {
          const allowed = await ensurePermission();
          if (allowed) {
            notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: event.title,
                body: `Starts at ${event.time} - ${event.place}`,
              },
              trigger: {
                // A one-off notification at a specific moment, as opposed to a
                // repeating or countdown trigger.
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fireAt,
              },
            });
          }
        }

        next[key] = notificationId;
      }

      setSaved(next);
      // Storage only holds strings, so the object has to be stringified.
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    // saved is in the list because the function reads it. Leaving it out would
    // mean this always sees the FIRST render's value - a stale closure, and one
    // of the most common React bugs there is.
    [saved]
  );

  return {
    // A helper so screens ask a question instead of poking at the object.
    isSaved: (event: SavableEvent) => saved[eventKey(event)] !== undefined,
    toggle,
    savedCount: Object.keys(saved).length,
  };
}