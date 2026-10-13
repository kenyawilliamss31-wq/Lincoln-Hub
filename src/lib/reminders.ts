// Saving an event records it on the phone and schedules a local
// notification an hour before it starts.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

// Tells the OS what to do when a notification fires while the app is open.
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

export type SavableEvent = {
  iso: string;
  time: string;
  title: string;
  place: string;
};

// Stable identifier. Not event.id - the pipeline renumbers ids on every
// rebuild. Date + title survives a rebuild.
export function eventKey(e: SavableEvent) {
  return e.iso + "|" + e.title;
}

function eventStart(e: SavableEvent): Date | null {
  // "All day" events have no clock time, so treat them as 8 AM.
  // "T08:00:00" with no Z forces local time.
  if (/all day/i.test(e.time)) {
    return new Date(e.iso + "T08:00:00");
  }

  // "7:00 PM": group 1 hour, 2 minutes, 3 AM or PM.
  const m = e.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;

  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const isPM = m[3].toUpperCase() === "PM";

  // 12 PM stays 12, but 12 AM becomes 0.
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  const [y, mo, d] = e.iso.split("-").map(Number);
  return new Date(y, mo - 1, d, hour, minute);
}

async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export function useSavedEvents() {
  // Maps a stable event key to its scheduled notification id, so unsaving can
  // cancel the right reminder.
  const [saved, setSaved] = useState<Record<string, string>>({});

  // useFocusEffect runs every time this screen comes into view, not just the
  // first time - lets Home see an event saved on the Events screen.
  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          setSaved(raw ? JSON.parse(raw) : {});
        } catch {}

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

        if (fireAt && fireAt.getTime() > Date.now()) {
          const allowed = await ensurePermission();
          if (allowed) {
            notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: event.title,
                body: `Starts at ${event.time} - ${event.place}`,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fireAt,
              },
            });
          }
        }

        next[key] = notificationId;
      }

      setSaved(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    [saved]
  );

  return {
    isSaved: (event: SavableEvent) => saved[eventKey(event)] !== undefined,
    toggle,
    savedCount: Object.keys(saved).length,
    savedKeys: Object.keys(saved),
  };
}