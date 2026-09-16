// DINING — hours and locations.
// EDIT THE DATA: replace these hours with the real ones from Lincoln's
// dining services page. Everything here is placeholder.

import InfoCard from "@/components/info-card";
import ScreenShell from "@/components/screen-shell";

const halls = [
  { id: 1, name: "Main Dining Hall", lines: ["Breakfast 7:30 - 10:00 AM", "Lunch 11:00 AM - 2:00 PM", "Dinner 4:30 - 7:30 PM"] },
  { id: 2, name: "Student Union Grill", lines: ["Mon - Fri 11:00 AM - 8:00 PM", "Sat - Sun 12:00 - 6:00 PM"] },
  { id: 3, name: "Coffee Shop", lines: ["Mon - Fri 8:00 AM - 4:00 PM", "Closed weekends"] },
  { id: 4, name: "Convenience Store", lines: ["Daily 10:00 AM - 10:00 PM"] },
];

export default function DiningScreen() {
  return (
    <ScreenShell eyebrow="Hours may change" title="Dining">
      {halls.map((hall) => (
        <InfoCard key={hall.id} title={hall.name} lines={hall.lines} />
      ))}
    </ScreenShell>
  );
}
