// SPORTS — upcoming games.
// EDIT THE DATA: replace with real dates and opponents from Lincoln athletics.

import InfoCard from "@/components/info-card";
import ScreenShell from "@/components/screen-shell";

const games = [
  { id: 1, date: "Sep 19", title: "Football vs Opponent", lines: ["1:00 PM", "Home"] },
  { id: 2, date: "Sep 23", title: "Volleyball vs Opponent", lines: ["6:00 PM", "Away"] },
  { id: 3, date: "Sep 26", title: "Cross Country Invitational", lines: ["9:00 AM", "Away"] },
  { id: 4, date: "Oct 2", title: "Basketball Scrimmage", lines: ["7:00 PM", "Home"] },
];

export default function SportsScreen() {
  return (
    <ScreenShell eyebrow="Upcoming" title="Sports">
      {games.map((game) => (
        <InfoCard key={game.id} left={game.date} title={game.title} lines={game.lines} />
      ))}
    </ScreenShell>
  );
}
