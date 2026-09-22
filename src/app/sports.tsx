// SPORTS - month calendar of the Lions season. Dots show game days, colored by
// result: green won, red lost, navy scheduled or a cross country meet.
// Tap a day to see the games. Live from the athletics feed.

import ScreenShell from "@/components/screen-shell";
import { colors } from "@/constants/colors";
import { record, sportFilters } from "@/lib/game-helpers";
import { useRemote } from "@/lib/remote";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
// The hardcoded list is now only the offline fallback.
import { games as bundledGames, type Game } from "@/data/sports";

// One icon per sport. A lookup object beats a chain of if-statements: adding a
// sport is one line here, not a new branch. Real team logos are trademarked,
// so sport icons stand in for them.
const SPORT_ICONS: Record<string, string> = {
  "Football": "american-football",
  "Volleyball": "tennisball",
  "Women's Soccer": "football",     // Ionicons calls a soccer ball "football"
  "Cross Country": "walk",
};

// Index 0 is Sunday, matching what Date.getDay() returns, so a weekday number
// can index straight into this array.
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Turns a year, month, and day into "2026-09-22" so it matches the iso strings
// in the data. Months are ZERO-BASED in JavaScript dates - September is month 8,
// not 9 - which is why we add 1. Keeping that correction in one function means
// it can't be forgotten somewhere else.
function makeIso(year: number, month: number, day: number) {
  return (
    year +
    "-" +
    String(month + 1).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0")
  );
}

// The color that represents a game's result. Pulled out of the components
// because both the calendar dots and the cards need the same answer, and two
// copies of this logic would eventually disagree.
function gameColor(game: Game) {
  // Cross country is scored by team placement, not W/L, so red or green would
  // be misleading. Navy is the neutral "this is just an event" color.
  if (game.sport === "Cross Country") return colors.navy;
  // A cancellation isn't a result, so it gets the neutral color too.
  if (game.note === "Canceled") return colors.navy;
  if (game.outcome === "W") return colors.green;
  if (game.outcome === "L") return colors.red;
  if (game.outcome === "T") return colors.grey;
  return colors.navy;               // scheduled, not yet played
}

export default function SportsScreen() {
  const today = new Date();
  const todayIso = makeIso(today.getFullYear(), today.getMonth(), today.getDate());

  // Downloads sports.json, rebuilt every 6 hours from the athletics calendar.
  const { data: games, status, refreshing, refresh, updatedLabel } =
    useRemote<Game[]>("sports.json", bundledGames);

  const [sport, setSport] = useState("All");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(todayIso);

  // Filter first, so everything below - dots, cards, record - agrees.
  // "All" skips the check entirely.
  const filtered = sport === "All" ? games : games.filter((g) => g.sport === sport);

  // How many days this month has. The trick: asking for day 0 of the NEXT month
  // returns the LAST day of this one - new Date(2026, 9, 0) is Sep 30. Leap
  // years handled for free, no lookup table.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Which weekday the 1st lands on: 0 = Sunday through 6 = Saturday. That's how
  // many blank squares to draw before day 1 so the columns line up.
  const firstWeekday = new Date(year, month, 1).getDay();

  // A Map from date to the games on that date. A Map answers "what's on this
  // day?" instantly; the alternative is scanning all 73 games again for each of
  // the 30 squares in the grid.
  const byDay = new Map<string, Game[]>();
  for (const game of filtered) {
    // Start the day's list if this is the first game found for it, then push.
    // || [] is what makes that one line instead of an if-statement.
    const list = byDay.get(game.iso) || [];
    list.push(game);
    byDay.set(game.iso, list);
  }

  const dayGames = byDay.get(selected) || [];

  // The next game on or after today, for when the selected day is empty.
  // find() returns the FIRST match and stops, which works because the data
  // arrives sorted oldest first. Returns undefined once the season ends.
  const nextGame = filtered.find((g) => g.iso >= todayIso && g.note !== "Canceled");

  // The record, counted from played games only.
  const rec = record(filtered.filter((g) => g.iso <= todayIso), sport);
  const played = filtered.filter((g) => g.outcome !== "").length;

  // Moves the calendar one month. step is +1 or -1.
  function changeMonth(step: number) {
    const next = month + step;

    // Rolling past December or before January has to roll the year too.
    if (next > 11) {
      setMonth(0);
      setYear(year + 1);
    } else if (next < 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(next);
    }
  }

  return (
    <ScreenShell
      eyebrow="Lincoln Lions"
      title="Sports"
      sourceUrl="https://lulions.com/calendar"
      sourceLabel="lulions.com"
      updatedLabel={updatedLabel}
      onRefresh={refresh}
      refreshing={refreshing}
    >
      <Text style={styles.status}>
        {status === "live"
          ? "Live from lulions.com"
          : status === "cached"
          ? "Saved on this phone"
          : status === "loading"
          ? "Checking for updates..."
          : "Offline - showing saved data"}
      </Text>

      {/* FILTER CHIPS - wrap onto a second line on narrow phones. */}
      <View style={styles.filterRow}>
        {sportFilters.map((name) => {
          const active = name === sport;

          return (
            <Pressable
              key={name}
              // The arrow function matters: onPress wants a function to call
              // LATER. onPress={setSport(name)} would fire during render and
              // loop forever.
              onPress={() => setSport(name)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* RECORD - only meaningful once games have been played. */}
      {played > 0 && (
        <Text style={styles.record}>
          {rec.wins}-{rec.losses}
          {/* Ties only happen in soccer, so hide the third number instead of
              printing a pointless "-0". */}
          {rec.ties > 0 ? "-" + rec.ties : ""}
          {sport === "All" ? " across all sports" : " this season"}
        </Text>
      )}

      {/* MONTH HEADER */}
      <View style={styles.monthHeader}>
        <Pressable
          onPress={() => changeMonth(-1)}
          style={styles.arrow}
          // Read aloud by a screen reader, which sees an icon as nothing at all.
          accessibilityLabel="Previous month"
        >
          <Ionicons name="chevron-back" size={20} color={colors.navy} />
        </Pressable>

        <Text style={styles.monthName}>
          {MONTH_NAMES[month]} {year}
        </Text>

        <Pressable
          onPress={() => changeMonth(1)}
          style={styles.arrow}
          accessibilityLabel="Next month"
        >
          <Ionicons name="chevron-forward" size={20} color={colors.navy} />
        </Pressable>
      </View>

      <View style={styles.calendar}>
        {/* WEEKDAY HEADER ROW */}
        <View style={styles.week}>
          {DAY_LABELS.map((label, index) => (
            // The key must be unique, and "T" appears twice (Tuesday and
            // Thursday), so combine the letter with its position.
            <Text key={label + index} style={styles.dayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* THE GRID. flexWrap on this parent does the row-breaking: each square
            is 14.28% wide (100 / 7), so exactly seven fit per row and the
            eighth wraps. No manual week-splitting logic anywhere. */}
        <View style={styles.grid}>
          {/* BLANK SQUARES before the 1st. Array.from({ length: n }) builds an
              empty n-item array purely to give .map() something to loop over. */}
          {Array.from({ length: firstWeekday }).map((_unused, index) => (
            <View key={"blank" + index} style={styles.cell} />
          ))}

          {/* ONE SQUARE PER DAY. The array is 0-based but dates start at 1. */}
          {Array.from({ length: daysInMonth }).map((_unused, index) => {
            const day = index + 1;
            const iso = makeIso(year, month, day);

            const isToday = iso === todayIso;
            const isSelected = iso === selected;
            const dayList = byDay.get(iso) || [];

            return (
              <Pressable
                key={iso}
                onPress={() => setSelected(iso)}
                style={styles.cell}
                accessibilityLabel={
                  dayList.length > 0
                    ? `${MONTH_NAMES[month]} ${day}, ${dayList.length} games`
                    : `${MONTH_NAMES[month]} ${day}, no games`
                }
              >
                {/* Style arrays apply in order, so later entries win -
                    selected overrides today. */}
                <View
                  style={[
                    styles.dayCircle,
                    isToday && styles.todayCircle,
                    isSelected && styles.selectedCircle,
                  ]}
                >
                  <Text
                    style={[styles.dayNumber, isSelected && styles.selectedNumber]}
                  >
                    {day}
                  </Text>
                </View>

                {/* DOTS - one per game, colored by result, capped at three so a
                    heavy Saturday doesn't stretch the square. The fixed height
                    reserves the space either way, so rows never shift. */}
                <View style={styles.dotSlot}>
                  {dayList.slice(0, 3).map((game) => (
                    <View
                      key={game.id}
                      style={[
                        styles.dot,
                        {
                          // On a selected day the circle behind is navy, so a
                          // navy dot would vanish into it. Orange stays visible.
                          backgroundColor: isSelected
                            ? colors.orange
                            : gameColor(game),
                        },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SELECTED DAY */}
      <Text style={styles.heading}>
        {/* Building a Date from the selected day's pieces lets us print a
            friendly label like "Tuesday, September 22". slice(8) grabs the day
            digits off the end of the iso string. */}
        {new Date(year, month, Number(selected.slice(8))).toLocaleDateString(
          undefined,
          { weekday: "long", month: "long", day: "numeric" }
        )}
      </Text>

      {dayGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}

      {/* Nothing that day. Rather than a dead end, point at the next game -
          which is what someone opening this screen usually wanted anyway. */}
      {dayGames.length === 0 && (
        <View>
          <Text style={styles.empty}>No games this day.</Text>

          {nextGame && (
            <Pressable
              style={styles.nextCard}
              // Jumping the calendar to that game's month is what makes this
              // a shortcut rather than just a label.
              onPress={() => {
                setSelected(nextGame.iso);
                setYear(Number(nextGame.iso.slice(0, 4)));
                // slice(5, 7) is the month digits; minus 1 because the state
                // holds a zero-based month.
                setMonth(Number(nextGame.iso.slice(5, 7)) - 1);
              }}
            >
              <Text style={styles.nextLabel}>NEXT GAME</Text>
              <Text style={styles.nextTitle}>
                {nextGame.sport} {nextGame.site === "Home" ? "vs" : "at"}{" "}
                {nextGame.opponent}
              </Text>
              <Text style={styles.nextMeta}>
                {nextGame.date} - {nextGame.time}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <Text style={styles.source}>
        Schedules and scores from the official Lincoln Lions athletics calendar.
        Icons stand in for team logos.
      </Text>
    </ScreenShell>
  );
}

// One full-width game card. Its own component so the markup exists once.
// { game }: { game: Game } destructures the props object and tells TypeScript
// the shape, so autocomplete knows game.opponent exists.
function GameCard({ game }: { game: Game }) {
  const color = gameColor(game);
  const isCanceled = game.note === "Canceled";
  const isTrack = game.sport === "Cross Country";

  return (
    // The left spine carries the result color, so a green or red edge reads
    // before any text does.
    <View style={[styles.card, { borderLeftColor: color }]}>
      {/* ICON BADGE */}
      <View style={[styles.iconCircle, { borderColor: color }]}>
        {/* "as any" tells TypeScript to stop checking this one value. Ionicons
            has about 1300 valid names and TypeScript can't confirm a name
            pulled out of a plain object is one of them. */}
        <Ionicons name={SPORT_ICONS[game.sport] as any} size={18} color={color} />
      </View>

      {/* flex: 1 absorbs the leftover width, so a long opponent name wraps
          inside the card instead of pushing the score off the edge. */}
      <View style={styles.cardBody}>
        <Text style={styles.cardSport}>{game.sport}</Text>
        <Text style={styles.cardOpponent}>
          {/* Cross country entries are meet names, so "vs UMES Invitational"
              would read wrong. Track skips the prefix. */}
          {isTrack ? "" : game.site === "Home" ? "vs " : "at "}
          {game.opponent}
        </Text>
        <Text style={styles.cardMeta}>
          {game.time}
          {isTrack ? "" : game.site === "Home" ? " - at home" : " - away"}
        </Text>
      </View>

      {/* Three cases, most specific first. Order matters: a canceled game has
          no outcome, so checking outcome first would fall through and print a
          start time for a game that isn't happening. */}
      {isCanceled ? (
        <Text style={[styles.result, { color }]}>Canceled</Text>
      ) : game.outcome !== "" ? (
        <Text style={[styles.result, { color }]}>
          {game.outcome} {game.score}
        </Text>
      ) : (
        <Text style={styles.resultPending}>Scheduled</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 11,
    color: colors.grey,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",     // lets the chips spill onto a second row
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,    // any number over half the height gives a pill
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  chipText: {
    fontSize: 13,
    color: colors.grey,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  record: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",   // arrows to the edges, name centered
    marginBottom: 10,
  },
  monthName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.navy,
  },
  arrow: {
    padding: 6,         // padding, not margin - it grows the tap target so the
                        // arrows aren't fiddly to hit with a thumb
  },
  calendar: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 8,
    marginBottom: 16,
  },
  week: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayLabel: {
    width: "14.28%",    // 100 / 7, so headers align with the grid columns
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: colors.grey,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",   // this is what breaks the squares into weeks
  },
  cell: {
    width: "14.28%",    // seven per row
    alignItems: "center",
    paddingVertical: 3,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,   // exactly half the width = a perfect circle
    alignItems: "center",
    justifyContent: "center",
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: colors.orange,     // outlined: today, but not selected
  },
  selectedCircle: {
    backgroundColor: colors.navy,   // filled: the day you tapped
  },
  dayNumber: {
    fontSize: 13,
    color: colors.navy,
  },
  selectedNumber: {
    color: "#ffffff",               // white, because the circle behind is navy
    fontWeight: "700",
  },
  dotSlot: {
    flexDirection: "row",
    gap: 2,
    height: 8,          // reserved space, so rows keep the same height whether
                        // or not a day has games
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  heading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.navy,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderLeftWidth: 3,
    // no borderLeftColor here - GameCard passes it so it changes per result
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardBody: {
    flex: 1,            // takes the leftover width, so long names wrap
  },
  cardSport: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.grey,
    letterSpacing: 0.6, // wide spacing makes tiny uppercase legible
    textTransform: "uppercase",
  },
  cardOpponent: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.navy,
    lineHeight: 18,
    marginTop: 1,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 1,
  },
  result: {
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
    // color passed in per game
  },
  resultPending: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.grey,
    marginLeft: 8,
  },
  empty: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 12,
  },
  nextCard: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.orange,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 21,
  },
  nextMeta: {
    fontSize: 12,
    color: "#c9cdd8",   // muted grey-white, readable on navy
    marginTop: 3,
  },
  source: {
    fontSize: 11,
    color: colors.grey,
    lineHeight: 16,
    marginTop: 16,
  },
});