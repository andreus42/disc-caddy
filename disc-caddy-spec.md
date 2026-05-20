# Disc Caddie — Design Specification

A mobile disc-golf scorecard prototype. Dark-mode, amber-on-black, cyan accents.
This document specifies the visual system, screens, components, data model, and
behaviors needed to build the app cleanly.

---

## 1. Product summary

Disc Caddie tracks a round of disc golf for 1–6 players across 1–27 holes on a
chosen course. The user manages a roster, a set of saved courses, plays rounds
hole-by-hole with +/− steppers, sees a color-coded scorecard at the end, and
reviews historical rounds and per-hole statistics.

The reference HTML prototype is rendered inside a 390 × 820 iPhone bezel; the
production target is iOS + Android native or a responsive web app.

---

## 2. Visual system

### 2.1 Palette

All UI lives on pure black. Two accent families: **amber** for primary content
and **cyan** for borders / structural lines.

| Token         | Hex / value                | Use                                            |
|---            |---                         |---                                             |
| `bg`          | `#000000`                  | Page background                                |
| `amber`       | `#FFA000`                  | Primary text, large numerals, par color        |
| `amberDim`    | `rgba(255,160,0,0.55)`     | Secondary text, labels, captions               |
| `amberFaint`  | `rgba(255,160,0,0.28)`     | Disabled / placeholder content                 |
| `cyan`        | `#1FC8E0`                  | Active borders, dividers, eagle/ace fill       |
| `cyanFaint`   | `rgba(31,200,224,0.22)`    | Inactive borders, dashed outlines              |
| `toneBlue`    | `#1FC8E0`                  | Score fill: Eagle / Ace                        |
| `toneGreen`   | `#3FD17A`                  | Score fill: Birdie                             |
| `toneAmber`   | `#FFA000`                  | Score fill: Par                                |
| `toneOrange`  | `#FF8A1A`                  | Score fill: Bogey                              |
| `toneRed`     | `#B8281F`                  | Score fill: Double bogey or worse              |
| `ink-on-fill` | `#0A0A0A`                  | Text on bright tone fills                      |
| `ink-on-red`  | `#FFFFFF`                  | Text on `toneRed` (better contrast)            |

Large amber numerals (the giant hole numbers, count badges) get a soft glow:
`text-shadow: 0 0 22px rgba(255, 160, 0, 0.35)`.

### 2.2 Typography

| Role                 | Family                                 | Weight | Size       | Letter-spacing |
|---                   |---                                     |---     |---         |---             |
| Display numeral      | Quicksand                              | 700    | 60–110px   | −2             |
| Section title        | Quicksand                              | 700    | 18–20px    | +2 (uppercase) |
| Body / button label  | Quicksand                              | 700    | 17–22px    | +0.2 to +0.5   |
| Caption / metadata   | Quicksand                              | 600    | 10–13px    | +1 to +1.8 (uppercase)   |
| Monospace            | JetBrains Mono *(reserved — not used yet)* | 400–500 | —      | —              |

Always import Quicksand at weights 500/600/700.

### 2.3 Shape, radius, spacing

- **Pill buttons**: `height: 56`, `border-radius: 28`, 2px border.
- **Small pills** (chips, top-bar buttons): `height: ~36–44`, `border-radius: 999`.
- **Cards**: `border-radius: 14`, 1.5px border.
- **Stepper buttons / nav buttons**: 42 × 42 circle, 1.5px border.
- **Dividers**: 1px `cyanFaint`.
- **Section padding**: 18–24px horizontal; 14–18px between major blocks.
- Bottom action bars use a `linear-gradient(to top, #000 60%, rgba(0,0,0,0))` fade to mask scrolled content.

### 2.4 Tone

Dark-arcade calculator aesthetic — terse uppercase labels, big glowing numerals,
minimal chrome. Avoid drop shadows other than the amber glow. No emoji.

---

## 3. Layout & device

- Design canvas: **390 × 820** (iPhone 14 reference).
- Status bar: 54px reserved at the top — top bars sit at `top: 54px`.
- Bottom safe-area: 30px reserved.
- A standard floating action bar sits at `bottom: 30, left: 0, right: 0`,
  padded 18px horizontally, two pills side-by-side with `gap: 10`.
- Body content scrolls vertically; horizontal scroll is only used inside the
  Scorecard grid.

---

## 4. Component library

All components are dark-themed and assume parent provides a black background.

### 4.1 `BackButton`

Pill in the top bar that returns to the previous screen.

- 1.5px `cyan` border, transparent fill, `border-radius: 999`.
- Padding `8px 14px`. Font 13/700, `amber`.
- Chevron `‹` glyph + label (e.g. "Menu", "Courses").
- Min-height 32px to ensure ≥ 44pt tap target including padding.

### 4.2 `HomeButton`

Full-width primary nav pill.

- Width 100% of column, `height: 56`, `border-radius: 28`, 2px `cyan` border.
- Label centered, font 20/700, amber.
- Disabled state: border drops to `cyanFaint`, text to `amberDim`.

### 4.3 `NavPill`

Bottom action pill used for Prev / Next / Finish.

- Same metrics as `HomeButton`.
- `dir: 'left' | 'right'` puts a chevron icon on the matching side.
- `highlight: true` (used for Finish) inverts to amber fill + dark ink.

### 4.4 `Stepper`

Round 42 × 42 increment/decrement.

- 1.5px cyan border, transparent fill, amber glyph (`+` or `−`).
- Pressed state: cyan `rgba(31,200,224,0.12)` background.
- Disabled: `cyanFaint` border, `amberFaint` glyph.

### 4.5 `NavBtn`

Round 42 × 42 chevron used to flip holes from the hole header. Same chrome as
`Stepper` but glyph is a `›`.

### 4.6 `MetaPill`

Compact info pill (e.g. PAR, FT).

- `padding: 8px 18px`, 1.5px cyan border, `border-radius: 999`.
- `label` (11/600, dim, +1.5 letter-spacing) above-baseline of `value` (22/700, amber).

### 4.7 `StatChip`

Square-ish chip used on the Statistics summary row.

- 1.5px cyan border, `border-radius: 12`.
- Two stacked rows: label 9/700 dim + value 20/700 amber.
- Flex-grow to fill the row.

### 4.8 `PickerRow`

Labeled `<select>` styled as a pill.

- 1.5px cyanFaint border, `border-radius: 999`, padding `8px 14px`.
- Label on left (11/700 dim), select fills the rest, custom cyan caret on right.
- Native dropdown appears via `<select>`; inherit the dark scheme on options.

### 4.9 `LegendChip`

Color swatch + uppercase label, used under the stats chart and finish grid.

- 1px cyanFaint border, `border-radius: 999`, padding `4px 8px`.
- Color square 10 × 10 with `border-radius: 2`, except `line: true` renders a 14 × 2 horizontal bar (for the par line).

### 4.10 `HoleParRow`

Course-editor row.

- Left: hole label "H 1".
- Middle: small caption "PAR".
- Right: stepper-value-stepper triple with the value rendered 34/700 amber.
- Par clamped to **2–7**.

### 4.11 `PlayerRow`

Hole-entry row.

- Left: player name, 22/700 amber, ellipsized.
- Right: stepper-value-stepper. Score tinted by tone (see §6).
- Tap the score to toggle between unset (`—`) and par.

### 4.12 `HistoryRow`

Card on the Scorecards list.

- 1.5px cyanFaint border, `border-radius: 14`, padding `14px 16px`.
- Row 1: course name (18/700) + time-of-day (10/700 dim) + cyan chevron.
- Row 2: per-player chips. Each chip shows name + stroke total; the leader's
  chip has an amber border and `rgba(255,160,0,0.08)` fill.

### 4.13 Finish-grid cell

- Background = score tone fill (see §6.2). Black ink on bright tones, white on `toneRed`.
- 1px `rgba(0,0,0,0.25)` right-border between columns for separation.
- Unscored cells: transparent with `amberFaint` dash.

### 4.14 `IOSDevice`

The prototype hosts everything inside a phone bezel. In production, the bezel
is purely a design artifact — ignore in the build.

---

## 5. Screens

All screens share the dark `#000` background and the 54px-reserved top bar.

### 5.1 Home (`home`)

- Header: "Disc Caddie" (52/700 amber, glow) + caption "version 1.0.0" (13/600 dim).
- Stack of `HomeButton`s, gap 12, padding `0 24`:
  1. **Players** → opens `players`
  2. **Courses** → opens `courses`
  3. **New Round** → seeds a fresh round and opens `hole`
  4. **Statistics** → opens `stats`
  5. **Scorecards** → opens `scorecards`
  6. **Resume** → opens `hole` on the in-progress hole. Label changes to `Resume · H{n}` when a round is in progress.

### 5.2 Hole entry (`hole`)

Per-hole score capture, one screen per hole.

Top bar: `‹ Menu`, centered "{course.name} · {tees}" (ellipsize), `Reset` action on the right.

Hole header:
- "HOLE" caption.
- `NavBtn` left, giant 2-digit hole number (110/700 amber, glow), `NavBtn` right.
- "of {totalHoles}" caption.
- Two `MetaPill`s: PAR and FT.
- `HoleStrip` indicator: a row of 18 (or N) ticks below; current hole is amber and wider, past holes are cyan, future are cyanFaint.

Body: list of `PlayerRow`s (one per active player) with dividers.

Bottom bar: Prev pill + Next pill. On hole N (last hole) Next becomes **Finish**
(amber filled). Prev disabled on hole 1.

Auto-behavior: on entering a hole, every player whose score for that hole is
`null` is initialized to that hole's par. Already-entered scores are not
touched. Strokes clamp to `1..15` regardless of input source.

### 5.3 Players (`players`)

Roster editor. 1–6 players.

- Centered count of named players (60/700 amber, glow).
- For each row: a text `<input>` (auto-derived initials, hidden in this version)
  with a bottom border that pulses cyan once a name is typed; a circular `−`
  removes the row (disabled when only 1 player remains).
- "Add player" dashed pill at the bottom (hidden when 6 reached).
- Save bar: a single full-width **Save Roster** pill. Saving keeps only rows
  with non-empty trimmed names and re-derives initials from those names.

### 5.4 Courses list (`courses`)

- Centered count "saved courses" (60/700 amber, glow).
- For each saved course: card with name (18/700 amber), metadata
  "{n} holes · par {totalPar} · {tees}" (11/600 dim, uppercase), and an
  "ACTIVE" amber pill if it matches the active course id. Tapping the card
  selects it as active; tapping the pencil opens the editor.
- New Course pill at the bottom — creates a blank 18-hole course (par 3 default
  on every hole) and drops into the editor with the new id.

### 5.5 Course editor (`courseEdit`)

- Top bar: `‹ Courses`, "Course", optional **Delete** action on the right
  (visible only when more than one course exists).
- Centered editable name `<input>` (28/700 amber, bottom-bordered cyan).
- Row of three pills: HOLES (count), PAR (sum), and a `tees` text input pill.
- List of `HoleParRow`s — one per hole, with +/- stepper to adjust par. Par is
  clamped to **2–7**.
- "Remove" / "Add Hole" dashed pills below the list. Hole count clamps to 1–27.
- Save bar: Cancel (ghost) + Save Course (amber filled). Save is disabled when
  name is empty.

### 5.6 Statistics (`stats`)

- Top bar: `‹ Menu`, "Statistics", spacer.
- Header: "AVG STROKES BY HOLE" + active player's name (38/700 amber, glow).
- Two `PickerRow`s: Player and Course.
- Summary chips: ROUNDS, AVG (per round), vs PAR (rounded), BEST (best ever total).
- **Hole average chart**: bar per hole sized by average strokes. Bars are
  colored by score-tone rules based on `round(avg)` vs that hole's par. A
  semi-transparent amber line is drawn across each bar at the par value. Y axis
  ticks for integer stroke values; X axis labels show hole numbers. Above each
  bar: the numeric average to 1 decimal place.
- Legend below the chart: par line + the 5 tone categories.

Empty state when the selected player has 0 rounds on the selected course.

### 5.7 Scorecards history (`scorecards`)

- Top bar: `‹ Menu`, "Scorecards", spacer.
- Header: total rounds count.
- History grouped by calendar day. Each group has a small uppercase date label
  ("MAY 19, 2026") then a stack of `HistoryRow`s.
- Tapping a row opens `viewCard` with that round's id.
- Empty state if no rounds in history.

### 5.8 Round view (`viewCard`)

Re-uses the **Finish** layout but in read-only mode. Header reads the round's
date label, course name shown as the subtitle. `‹ Scorecards` returns to the
list.

### 5.9 Finish (`finish`)

Shown automatically after pressing Finish on the last hole. Same layout as
`viewCard`:

- Header: "FINAL" if all holes scored else "SCORECARD" + "Round Results".
- Player names along the top of a grid (x-axis), holes down the side.
- Each cell shows strokes, background-tinted by score tone. Unscored cells
  show a dashed `–`. The leader has a green ★ next to their name.
- Totals row at the bottom with stroke total + to-par caption.
- Score legend below the grid: Eagle+, Birdie, Par, Bogey, Double+.
- Bottom bar: **Edit Scores** (back to `hole`) and **Done** (back to home).

---

## 6. Scoring & color semantics

### 6.1 Score labels

Given strokes `s` and par `p`, with `d = s - p`:

| Condition       | Label  | Tone bucket |
|---              |---     |---          |
| `s == 1`        | ACE    | great       |
| `d <= -2`       | EAGLE  | great       |
| `d == -1`       | BIRDIE | good        |
| `d == 0`        | PAR    | par         |
| `d == 1`        | BOGEY  | bad         |
| `d == 2`        | DOUBLE | worse       |
| `d == 3`        | TRIPLE | worse       |
| `d >= 4`        | `+{d}` | worse       |

### 6.2 Tone color map

| Bucket  | Color        | Token         |
|---      |---           |---            |
| great   | `#1FC8E0`    | `toneBlue`    |
| good    | `#3FD17A`    | `toneGreen`   |
| par     | `#FFA000`    | `toneAmber`   |
| bad     | `#FF8A1A`    | `toneOrange`  |
| worse   | `#B8281F`    | `toneRed`     |

Used as **foreground** for the stroke numeral on the hole entry row, and as
**background fill** on the Finish grid and on the Statistics chart bars. When
used as a fill: text is black `#0A0A0A` on every tone except `toneRed`, which
uses white for contrast.

### 6.3 To-par formatting

- `0` → `"E"`
- positive → `"+{n}"`
- negative → `"{n}"` (already has sign)

---

## 7. Data model

```ts
type ID = string;

type Player = {
  id: ID;            // stable across rounds (slug or random)
  name: string;
  initials: string;  // derived from name; recompute on save
};

type Hole = {
  hole: number;      // 1-based
  par: number;       // 2..7
  dist: number;      // feet; 0 if unknown
};

type Course = {
  id: ID;
  name: string;      // required, trimmed, max 28 chars
  tees: string;      // optional label (e.g. "Blue"), max 12 chars
  holes: Hole[];     // 1..27 entries
};

type Round = {
  holeIndex: number;                        // 0-based current hole
  scores: Record<ID, Array<number | null>>; // playerId -> per-hole strokes
};

type HistoryRecord = {
  id: ID;                                // generated on save
  courseId: ID;
  courseName: string;                    // snapshotted name at save time
  date: string;                          // ISO timestamp
  players: Player[];                     // snapshot of who played
  playerScores: Record<ID, Array<number | null>>;
};
```

Strokes are integers clamped to `1..15`. Null = "not entered yet".

---

## 8. Persistence

LocalStorage keys (or platform equivalent). All values are JSON-serialized.

| Key                              | Type                   | Notes                                   |
|---                               |---                     |---                                      |
| `discgolf.players.v1`            | `Player[]`             | Current roster                          |
| `discgolf.courses.v1`            | `Course[]`             | Saved courses                           |
| `discgolf.activeCourse.v1`       | `ID`                   | Selected course for the next round      |
| `discgolf.round.v3`              | `Round`                | The in-progress round                   |
| `discgolf.history.v1`            | `HistoryRecord[]`      | Completed rounds, newest first; cap 200 |

Writes happen on every state change via a debounced effect (idempotent JSON
overwrite). Reads happen once on app boot.

On first boot, seed a Pine Ridge course (18 holes, mixed par 3–5) and 6 sample
history rounds so the Statistics and Scorecards screens aren't empty.

---

## 9. Key behaviors

### 9.1 New round

1. Build `scores`: every player → `new Array(course.holes.length).fill(null)`.
2. `holeIndex` ← 0.
3. Navigate to `hole`.

### 9.2 Reset round

1. Confirm with the user.
2. Clear `scores`; `holeIndex` ← 0.
3. Stay on the hole screen.

### 9.3 Hole navigation

- `Prev` decrements `holeIndex`, clamped at 0.
- `Next` increments `holeIndex`. If the new index is past the last hole:
  1. Snapshot the round into history (see 9.5).
  2. Navigate to `finish`.

### 9.4 Score input

- `+` and `−` steppers adjust the stroke count. Tapping the value toggles
  unset ↔ par.
- On entering a hole, missing scores are auto-filled with par. The user may
  always change them with the steppers.
- Strokes are clamped to `1..15`.

### 9.5 Save to history

When the round transitions to `finish` (either because Finish was tapped, or
during programmatic completion):

1. Build a `HistoryRecord` from `(activeCourse, players, scores, holeCount)`.
2. Snapshot the player roster (names + ids + initials) into the record so
   future roster edits don't change historical names.
3. Prepend to `history`; cap at 200 records.

### 9.6 Statistics math

For each selected `(player, course)`:

- `rounds` = `history.filter(r => r.courseId === course.id && r.playerScores[player.id])`.
- For each hole `i`:
  - `values` = strokes from each round, filtered to non-null.
  - `avg` = `sum(values) / values.length` (null if `values` is empty).
  - Tone color for the bar: `toneFill(round(avg), hole.par)`.
- Summary chips:
  - `n` = count of `rounds`.
  - `avgRound` = `(totalStrokes / totalHolesScored) × course.holes.length`.
  - `avgToPar` = average of per-round `(strokes - par)`.
  - `best` = lowest stroke total amongst rounds that have a value on every hole.

Empty state when `rounds.length === 0`.

### 9.7 Course edit

- A new course defaults to 18 holes, all par 3, dist 0.
- Hole count is mutable via Add Hole / Remove (one-by-one).
- Par is clamped to 2–7.
- Save requires non-empty trimmed name; rebuilds the `holes` array with fresh
  sequential `hole` numbers.
- Delete is shown only when ≥ 2 courses exist; if deleting the active course,
  the next-remaining course becomes active.

---

## 10. Accessibility

- All taps targets ≥ 44 × 44 logical px. Stepper, NavBtn, and BackButton meet
  this when accounting for padding.
- Text contrast: amber on black ≥ 9:1 at the primary tone. The dim and faint
  tokens drop to 4–5:1; do not use them for primary affordances.
- Score-fill cells: black ink on toneAmber / toneOrange / toneGreen / toneBlue
  passes WCAG AA; white ink on toneRed passes AA. Verify ratios when porting.
- Color is not the sole carrier: every tone is also paired with the actual
  stroke numeral or hole average, and the legend explains every color.
- Animations are minimal (a 0.2s transition on the hole strip). Respect
  `prefers-reduced-motion` and disable transitions when set.
- The `<select>` controls on Statistics fall back to platform-native pickers —
  ensure they remain keyboard-/screen-reader-accessible.

---

## 11. Build notes for Claude Code

- Component tree maps 1:1 to the file `scorecard-app.jsx` in the prototype; you
  can keep the same component boundaries or factor `BackButton`,
  `IconChevron`, and other primitives into shared files.
- State lives at the `App` root. The reference uses local React state +
  `useEffect` to persist; you can swap in Zustand, Redux Toolkit, or
  AsyncStorage on native without changing the screen contracts.
- All screen components take the data they render and callbacks (`onBack`,
  `onSave`, `onOpen`) as props. No screen reads global state directly.
- The reference is iPhone-shaped at 390 × 820. Don't hard-code those numbers
  into screen layouts — they all use percentages, flex, and absolute
  positioning relative to the parent. The only fixed pixels are component
  metrics (button heights, stepper sizes) and the 30/54px safe-area insets.
- Fonts: ship Quicksand 500/600/700 (and 700 italic if you want). Avoid system
  font fallbacks visually — they will look subtly different.
- Tests worth writing:
  - `recordRound` produces a record whose `playerScores` length equals
    `holeCount` for every player.
  - `toneFill(strokes, par)` for the boundary cases (ace = blue, eagle = blue,
    par-1 = green, par = amber, par+1 = orange, par+2 = red, par+5 = red).
  - The auto-par effect runs once per hole entry and is idempotent (does not
    mutate scores that already exist).
  - `goHole(+1)` past the last hole snapshots to history exactly once and
    navigates to `finish`.

---

## 12. Out of scope / future

- Multi-device sync, accounts, social features.
- GPS-anchored hole maps and shot tracing.
- Real per-hole distances and tees (the current model carries `dist` but no UI
  yet edits it).
- Handicap math, leagues, tournaments.
- Light mode. The brand is dark-mode only for now.
