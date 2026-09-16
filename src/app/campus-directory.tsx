// CAMPUS DIRECTORY — offices, phone numbers, hours.
// EDIT THE DATA: every number below is a placeholder. Get the real ones from
// lincoln.edu before this goes anywhere near another student.

import InfoCard from "@/components/info-card";
import ScreenShell from "@/components/screen-shell";

const offices = [
  { id: 1, name: "ITS Help Desk", lines: ["Placeholder phone", "Mon - Fri 8:00 AM - 5:00 PM"] },
  { id: 2, name: "Registrar", lines: ["Placeholder phone", "Mon - Fri 9:00 AM - 4:00 PM"] },
  { id: 3, name: "Financial Aid", lines: ["Placeholder phone", "Mon - Fri 9:00 AM - 4:00 PM"] },
  { id: 4, name: "Health Center", lines: ["Placeholder phone", "Mon - Fri 8:30 AM - 4:30 PM"] },
  { id: 5, name: "Campus Safety", lines: ["Placeholder phone", "24 hours"] },
  { id: 6, name: "Residence Life", lines: ["Placeholder phone", "Mon - Fri 9:00 AM - 5:00 PM"] },
];

export default function CampusDirectoryScreen() {
  return (
    <ScreenShell eyebrow="Offices and contacts" title="Campus Directory">
      {offices.map((office) => (
        <InfoCard key={office.id} title={office.name} lines={office.lines} />
      ))}
    </ScreenShell>
  );
}
