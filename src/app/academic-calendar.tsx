// ACADEMIC CALENDAR — key dates for the term.
// EDIT THE DATA: get the real dates from the Registrar before you show anyone.

import InfoCard from "@/components/info-card";
import ScreenShell from "@/components/screen-shell";

const dates = [
  { id: 1, date: "Aug 25", title: "Classes Begin", lines: ["Fall semester starts"] },
  { id: 2, date: "Sep 5", title: "Add / Drop Deadline", lines: ["Last day to change your schedule"] },
  { id: 3, date: "Oct 13", title: "Midterm Grades Due", lines: ["Check LU Self-Service"] },
  { id: 4, date: "Nov 25", title: "Thanksgiving Break Begins", lines: ["No classes"] },
  { id: 5, date: "Dec 8", title: "Last Day of Classes", lines: ["Finals week follows"] },
  { id: 6, date: "Dec 12", title: "Final Grades Posted", lines: ["Check LU Self-Service"] },
];

export default function AcademicCalendarScreen() {
  return (
    <ScreenShell eyebrow="Fall 2026" title="Academic Calendar">
      {dates.map((item) => (
        <InfoCard key={item.id} left={item.date} title={item.title} lines={item.lines} />
      ))}
    </ScreenShell>
  );
}
