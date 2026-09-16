// EVENTS — a list of campus events.
// Pattern: array of data at the top, ScreenShell wrapper, .map() into InfoCards.
// Every screen in this app is this same pattern with different data.

import InfoCard from "@/components/info-card";
import ScreenShell from "@/components/screen-shell";

const events = [
  { id: 1, date: "Sep 20", title: "Dorm Clean Up", lines: ["Ashmun and Lorraine Hansberry Hall"] },
  { id: 2, date: "Sep 21", title: "Brother Circle", lines: ["LLC"] },
  { id: 3, date: "Sep 22", title: "Study Abroad 101", lines: ["Location TBD"] },
  { id: 4, date: "Sep 25", title: "Career Readiness Workshop", lines: ["Career Fair Prep Part 1", "Wright Hall 314"] },
  { id: 5, date: "Sep 28", title: "Meet President Allen", lines: ["Open Office Hours", "Vail Hall 201"] },
];

export default function EventsScreen() {
  return (
    <ScreenShell eyebrow="This Month" title="Events">
      {events.map((event) => (
        <InfoCard
          key={event.id}
          left={event.date}
          title={event.title}
          lines={event.lines}
        />
      ))}
    </ScreenShell>
  );
}
