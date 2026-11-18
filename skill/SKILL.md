---
name: panel-indicator
description: 3D-printed flush-mount backlit indicators (legend lit by a WS2812B strip, in a frame screwed onto a panel cutout) for any project — témoins lumineux encastrables. Describes the indicator in a JSON preset of the project (design/indicator/<name>.json), checks it, produces the print and mounting files (generic 3MF, STL, STEP, bill of materials) with the `indicator` command, and on request integrates it in the project's Fusion design. Load for “make / generate / check a backlit indicator, an indicator light, a lit legend, an annunciator” or « fais / génère / vérifie un témoin lumineux, un voyant, une légende éclairée », or as soon as an indicator preset is involved.
---

# Panel indicator

The computation is in the generator's `indicator` command: the repository whose `skill/` is
the target of the link `~/.claude/skills/panel-indicator`.
This skill drives it from the host project and only writes in that project. Speak to the
user in their language; the command's output is in English.

## Command

```bash
indicator check <preset.json> --json                  # checks only, nothing is written
indicator generate <preset.json> [-o <dir>] --json    # checks then files
```

- Without `-o`: files in `export/` next to the preset; `<name>` of the preset file prefixes everything.
- Exit code: 0 good (warnings possible), 1 preset rejected (error), 2 bad usage.
- JSON: `{ name, ok, checks: [{ level: ok|warn|error, code, message }], summary, out, files }`;
  `summary`: `capHeight`, `window`, `frame`, `panel`, `cutout` (cutout and holes of the panel),
  `screws`, `inserts`, `leds`.
- `indicator` not found: `cd "$(realpath ~/.claude/skills/panel-indicator)/../cli" && npm link`
  (Node 22.18 or later); else `node "$(realpath ~/.claude/skills/panel-indicator)/../cli/bin/indicator.ts" …`.

## Preset (version 1)

One file per indicator, versioned with the host project: `design/indicator/<name>.json` by
default, or the path the user gives. Dimensions in mm. Any unknown key is rejected.

```json
{
  "version": 1,
  "legend": { "text": "ALARM", "background": "#111111" },
  "window": { "width": 27, "height": 10.5 },
  "frame": { "width": 47, "height": 18, "color": "#4b5320" },
  "panel": { "thickness": 3 },
  "mount": { "head": "countersunk" },
  "light": { "wireExit": "left" }
}
```

| Key | Setting | Default |
| --- | --- | --- |
| `legend.text` | one-line text (capitals advised) | **required** |
| `panel.thickness` | thickness of the host panel | **required** |
| `legend.background` | color of the legend background | `#111111` |
| `window.width`, `window.height` | visible lit part | 27 × 10.5 |
| `frame.width`, `frame.height` | frame, on the front | 47 × 18 |
| `frame.color` | color of the frame | `#111111` |
| `mount.head` | `countersunk` screws (flush) or `socket` (socket head, sticks out by 3; never printed) | `countersunk` |
| `light.wireExit` | exit of the wires, seen from the front: `left` or `right` | `left` |

Fixed in v1 (validated in print): Barlow Condensed SemiBold font, automatic letter height,
lit letters; 2 M3 screws and 2 M3 heat-set inserts, length and spacing computed; WS2812B
5 V strip at 144 LEDs/m (number of LEDs from the window). Outside v1: 2 lines, another
font, M2 or M2.5, nuts, another strip, round frame, etc. Say so, suggest the closest in
v1, never work around it (invented key, touched-up file).

## Steps

1. **Preset.** The project's (`design/indicator/*.json`, or the given path). Else, create
   one: ask for the text and the panel thickness, then suggest for the rest the default
   value or the one the project suggests (its documentation, its dimensions); write it
   after agreement.
2. **Checks**: `indicator check <preset> --json`.
   - `error`: stop, explain, suggest the fix of the preset (`mount.frame` gives the
     smallest frame that passes); apply it only after agreement, then check again.
   - `warn`: go on; mention it in the summary (mask gaps thinner than the nozzle are
     common and did not hinder printing).
3. **Generation**: `indicator generate <preset> --json`.
4. **Summary** to the user, for example:

   ```text
   Indicator “alarm” (design/indicator/alarm.json)
   Checks: ⚠ mask gaps thinner than the nozzle (4), the rest ✓
   Bill of materials: 2 M3 × 10 countersunk screws, 2 M3 heat-set inserts (hole Ø 4 × 5.5),
     4 WS2812B strip LEDs at 144 LEDs/m (27.8 mm piece), 4-wire ribbon at 1.27 pitch
   Panel: cutout 29.8 × 13.3, 2 holes Ø 3.4, 37 mm apart, centered on the window
   Files: design/indicator/export/ (12: 3MF, STL, STEP, preset)
   Default values used: window 27 × 10.5, countersunk screws, wires on the left
   ```

Files of `export/` (can be regenerated, never touched up by hand):

| File | Content |
| --- | --- |
| `<name>_legend.3mf` | legend: mask and veil in one object of 2 colors, to print together |
| `<name>_frame.3mf`, `<name>_box_cover.3mf` | frame; light box and cover |
| `<name>_test_panel.3mf` | piece of drilled panel, to try the mounting |
| `<name>_<piece>.stl` | one per piece, oriented for printing |
| `<name>.step` | named assembly (frame, mask, veil, box, cover) in the indicator's frame of reference |
| `<name>.json` | preset used, default values included |

The 3MF files are generic (one part per color, no setting): the user slices them; do not
offer to slice.

## Integration in a Fusion design (on request)

With a Fusion 360 skill (not provided by this repository), Fusion open on the host design.

- Frame of reference of the indicator: origin at the center of the window, on the front
  face of the panel (back of the frame), X to the right, Z up, +Y towards the back of the
  panel. Ask where to place the indicator if the host panel does not follow it.
- Import `<name>.step` in an “indicator `<name>`” component.
- Drill the panel from `summary.cutout`: rectangular cutout centered on the origin, 2 holes
  on the X axis at ±spacing/2; then check interferences.
- Save a new version of the design only after agreement.

To see the indicator: open the preset in the generator's web page
(<https://docteurzoidberg.github.io/panel-indicator-generator/>, Open button or drop the
file), or `<name>.step` in Fusion.

## Rules

- The preset is the only source: to change the indicator, change the preset and generate
  again.
- Visors, covers and accessories stay in the host project (drawn around the STEP).
- Never change the generator's repository. A defect of the generator (wrong check, wrong
  piece, crash): report it to the user with the command and its output.
