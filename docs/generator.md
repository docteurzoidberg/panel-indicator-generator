[Version française](fr/generator.md)

# Generator specification (steps 3 to 5)

What the tool does. How it is built (order, stack, folders, lots):
[generator-plan.md](generator-plan.md); vocabulary of the pieces:
[PLAN.md](../PLAN.md). Coded: the preset (`core/src/preset.ts`), the layout
of the legend (`core/src/legend.ts`), the dimensions (`core/src/dims.ts`),
the pieces (`core/src/parts.ts`), the exports (`core/src/exports.ts`), the
checks (`core/src/checks.ts`, `core/src/generate.ts`), their messages in
English and French (`core/src/messages.ts`) and the command line (`cli/`).

## Preset (v1 settings)

The contract between the command line, the skill and the page, versioned
(`"version": 1`), frozen on 2026-10-30: zod schema in
[`core/src/preset.ts`](../core/src/preset.ts), JSON Schema in
[`presets/schema.json`](../presets/schema.json) (`npm run schema`, English
descriptions). Full example: [`presets/alarm.json`](../presets/alarm.json).
Dimensions in mm.

**v1 only sets what has been validated in print** (decision of
2026-10-30): a working prototype, fast, without any unproven feature.

| Key | Setting | Default |
| --- | --- | --- |
| `legend.text` | text, on one line | required |
| `legend.background` | color of the legend background (mask) | black `#111111` |
| `window.width`, `window.height` | window, visible part of the legend | 27 × 10.5 |
| `frame.width`, `frame.height` | frame | 47 × 18 |
| `frame.color` | color of the frame | black `#111111` |
| `panel.thickness` | thickness of the host panel (= length of the tube) | required |
| `mount.head` | `countersunk` or `socket` (socket head) | `countersunk` |
| `light.wireExit` | exit of the wires, seen from the front: `left` or `right` | `left` |

- **Unknown key rejected** (typo, or setting outside v1); errors as
  “path: message” lines, for example `mount.head: Invalid option: expected
  one of "countersunk"|"socket"` (“path : message” in French, in the
  page).
- **Evolution**: compatible additions stay in v1; changing a key or a
  default value moves to v2, with a migration.
- **Colors**: they are used by the preview and the 3MF; the real filament
  (material, color) is chosen when slicing, outside the generator.

Fixed in the core in v1 (values of the validated prints, taken from the
preset and from the `temoin.py` script of the Fusion mock-up):

| Subject | Value |
| --- | --- |
| Legend | Barlow Condensed SemiBold font; “auto” capitals (the largest at 1.5 mm from the window edge); tracking 0.12 of the capital; lit letters (positive mode); mask and letters 0.8, veil 0.6 |
| Window and frame | sharp window corners; rectangular frame, thickness 2.5, radius 1.5, lip 1, chamfers 0.3 (edge) and 0.4 (window) |
| Clearances | 0.2 per side (cutout, rebate, housing); cover held by a 0.3 press fit |
| Fastening | 2 M3 screws (ISO 10642 or ISO 4762) and 2 M3 heat-set inserts (hole Ø 4, length 4); screws centered between the window and the frame edge; screw length computed; socket head (not printed yet): straight hole, head resting on the front |
| Light | WS2812B 5 V strip at 144 LEDs/m (pitch 6.94, circuit 12 × 0.5, 5050 LEDs), cut after each LED; count = window width / pitch, rounded (4 for 27); LED faces 10 mm from the legend; strip clipped onto the cover |
| Colors | black box and cover; translucent white letters and veil |
| Test panel | 60 × 40 with its cutout and its 2 holes, enlarged with the frame (margins of 6.5 and 11) |
| Checks | 0.4 nozzle |

Later, each after a test print: 2 lines, other fonts and TTF/OTF import,
adjustable cap height and tracking, negative mode; rounded window corners,
round frame, thickness and lip; M2 and M2.5 screws, nuts, gluing, chosen
screw spacing; other strips, single LEDs, zones, depth; filaments and
number of print heads; states and effects of the preview (step 5).

## Checks (computed live)

Coded in [`core/src/checks.ts`](../core/src/checks.ts), with
`core/src/generate.ts`: ✓, warning (⚠, does not prevent generation) or
error (✗, nothing is written), in the command line as in the page; each
one has a stable code for the skill. Messages in English, or in French
for the page in French. 0.4 nozzle; walls of at least 2 nozzle widths
(0.8).

| Code | Check | ⚠ below | ✗ below |
| --- | --- | --- | --- |
| `preset` | valid preset (one line per error) | | any error |
| `legend` | characters present in the font; capitals and margin | | missing character |
| `legend.strokes` | strokes thinner than the nozzle (morphological opening, like `legende_dxf.py`) | one zone | |
| `legend.gaps` | mask gaps thinner than the nozzle, in the window | one zone | |
| `legend.islands` | islands of the mask (A, D, O, R…), held by the veil | | |
| `mount.overlap` | overlap of the frame around the cutout | 1.5 | 0.8 |
| `mount.bridge` | panel between the cutout and each screw hole | 1.5 | 0 |
| `mount.head` | countersink or screw head: distance to the frame edge and to the window | 0.8 | 0 |
| `mount.insert` | wall between the insert and the cavity of the box | | 0.8 |
| `mount.boss` | insert bosses outside the frame | overhang | |
| `mount.frame` | if a mounting check fails: smallest frame that passes, to the half millimeter (the fix to suggest) | | |
| `screw` | a standard M3 screw fits (tip 0.3 mm from the bottom of the hole, at least 60 % of the insert engaged) | | none |
| `light.leds` | outermost LEDs in the window | overhang | |

ALARME (validated print, the mock-up's preset, test fixture
`core/test/ref/alarme.json`): a single warning, `legend.gaps`, with the
same 4 zones as the mock-up; they did not hinder the print.

Later: estimated lighting uniformity (Lambertian LEDs at the depth of the
box); the simple model gives 39 % for ALARME, which lights well: it must
first be fitted on photos.

## Web page

Layout set on the v1 preset (2026-10-30); values of ALARM. Lots:
[generator-plan.md](generator-plan.md), “Step 5”.

```text
┌─ Panel indicator ───────────── Open · Examples · Save · Link · EN FR ─┐
│ ┌─ Settings ─────────────┐ ┌─ Preview ─────────────────────────────┐  │
│ │ Name       alarm       │ │    ┌─────────────────────────────┐    │  │
│ │ Text       ALARM       │ │    │ ○  ┌───────────────────┐  ○ │    │  │
│ │ Background ■ #111111   │ │    │    │       ALARM       │    │    │  │
│ │ Window     27 × 10.5   │ │    │    └───────────────────┘    │    │  │
│ │ Frame      47 × 18     │ │    └─────────────────────────────┘    │  │
│ │ Color      ■ #4b5320   │ │                                       │  │
│ │ Panel      3 mm        │ │ 3D · front view   light: steady·amber │  │
│ │ Head       countersunk │ │ assembled ─────●───── exploded        │  │
│ │ Wires      on the left │ ├─ Checks ──────────────────────────────┤  │
│ └────────────────────────┘ │ ✓ legend: 6.47 mm capitals            │  │
│ ┌─ Mounting ─────────────┐ │ ⚠ 4 mask gaps < nozzle                │  │
│ │ cutout 29.8 × 13.3     │ │ ✓ mounting, M3 × 10 screws, 4 LEDs    │  │
│ │ 2 holes Ø 3.4, 37 apart│ ├─ Download ────────────────────────────┤  │
│ │ 2 M3 × 10 countersunk  │ │ zip (12 files) · 3MF · STL · STEP     │  │
│ │ 2 M3 inserts, Ø 4      │ └───────────────────────────────────────┘  │
│ │ 4 LEDs, 27.8 mm strip  │                                            │
│ └────────────────────────┘                                            │
└───────────────────────────────────────────────────────────────────────┘
```

- **Settings**: the 8 keys of the v1 preset, and the name of the files
  (that of the opened preset, as with `indicator`, else the text in lower
  case). Checks and mounting computed again on every input, with the lines
  of `indicator check`; a preset error is also shown under its field, and
  blocks the download.
- **3D**, default view (computed again after a pause in typing, each piece
  only if its settings change): the 6 printed pieces, exploded or
  assembled, four viewpoints, pieces that can be hidden, the test panel
  among them. Viewer taken from the exploded view of the mock-up, without
  its hardware (screws, inserts, strip), absent from the core.
- **Front view** (2D, immediate): frame, window, letters and screws in the
  colors of the preset.
- **Light** simulated, common to both views: off, steady, breathing (3 s)
  or blinking (1 Hz), in a color of the strip (white, amber, red, green,
  blue, or any). Letters in the color of the light, a little whiter at the
  core, with a halo, held back for bright colors; off, the white of the
  veil. A page setting, not in the preset: the host project drives its
  LEDs. Even glow on all the letters, without a lighting model; still
  effects if the system reduces animations.
- **Presets**: open a JSON (picked or dropped on the page, for example the
  preset of a host project, to see its preview), save it, preset in the
  URL, examples. No `indicator preview`: the page is the viewer. An opened
  preset is checked as is, as by `indicator check`, until the first input;
  the form then keeps the wrong values of its fields until they are typed
  in and drops the unknown keys. Name of the files: that of the opened
  file or of the link; an example starts again from the text. Save gives
  the `<name>.json` of `indicator generate` (default values included,
  without `$schema`), and only for a valid preset. The link carries the
  preset in the fragment of the URL, never sent to the server:
  `#name=claude&version=1&legend.text=CLAUDE&…&light.wireExit=left`, kept
  up to date on every input.
- **Download**: the files of `indicator generate` (see “Outputs”), in one
  zip; computed on click. Preset and STEP identical to those of the
  command; STL and 3MF of the same geometry (OpenCascade may split a flat
  quadrilateral along the other diagonal in the browser).
- **Language**: English or French. The browser's language if it is one of
  them, else English; EN / FR switch in the header, the choice kept in the
  browser and applied in place, without reloading. Page texts in
  `web/src/texts.ts`; the checks and the summary come from the core in the
  same language; `licenses.txt` and the produced files stay in English.
- **Theme** light or dark: the system's by default, switch in the header
  to change it, choice kept in the browser.
- **Offline** once loaded (service worker of the built page, not in
  development).
- **Licenses** in the footer: OpenCascade (LGPL 2.1, separate `.wasm`
  file, link to its sources), Barlow Condensed and B612 fonts (OFL), and
  `licenses.txt` with the text of each license.
- Later: section view, thin zones highlighted, glow following the
  uniformity model, and the settings outside v1.

## Outputs

Names of files and pieces in English, whatever the language of the page.

| File | Content |
| --- | --- |
| `<name>_<print>.3mf` | generic 3MF, one per print: `legend` (one object of 2 parts, mask and veil, to load together), `frame`, `box_cover`, `test_panel`; pieces oriented, one per color; to slice in the software of your choice |
| `<name>_<piece>.stl` | `frame`, `legend_mask`, `legend_veil`, `box`, `cover`, `test_panel`, oriented and placed like the 3MF |
| `<name>.step` | named and colored assembly (frame, mask, veil, box, cover), exact solids in the indicator's frame of reference |
| `<name>.json` | the preset used, default values included |

Files identical from one generation to the next. Later, each after
validation: cutout template (SVG, DXF, PDF at scale 1), bill of materials
as a file; in v1, the hardware is in the summary of the command.

Frame of reference of the STEP: origin at the center of the window, on
the panel plane (back of the frame), X to the right, Z up, +Y towards the
back; a host project places the indicator without rotation.

Slicing out of scope: no setting specific to a slicer (Snapmaker Orca
included); a host project that wants to slice has its own skill.

## Command line (step 3) and skill (step 4)

Coded in `cli/bin/indicator.ts`; installed for every project by
`cd cli && npm link` (to redo after a change of Node version); else, from
this repository: `node cli/bin/indicator.ts …` or `npm run indicator -- …`.
Output in English.

```bash
indicator check presets/alarm.json             # checks and summary, nothing is written
indicator check presets/alarm.json --json      # the same in JSON, for the skill
indicator generate presets/alarm.json          # files in export/, next to the preset
indicator generate presets/alarm.json -o out/  # elsewhere
```

- `<name>` = name of the preset file without `.json`; exit code 0 (good),
  1 (wrong preset or check in error, nothing is written), 2 (bad usage).
- Summary: checks (✓, ⚠, ✗), screws (computed length) and inserts, strip
  (number of LEDs, piece), dimensions, cutout and holes to drill in the
  panel (spacing), files written; about 3.5 s. In JSON:
  `{ name, ok, checks, summary, out, files }`, summary dimensions rounded
  to the µm.

Global `panel-indicator` skill (source in `skill/`, linked from
`~/.claude/skills/panel-indicator`; guide: [skill.md](skill.md)), short,
the computation staying in the tool:

1. find the preset of the current project, or create one from an example
   by asking the missing questions;
2. `indicator check --json`, then `indicator generate` to the export
   folder of the project;
3. summarize checks, bill of materials and files written;
4. on request: integrate the indicator in the host design (import of the
   STEP with a Fusion 360 skill, cutout and holes from the template).

Example: from the Claudemètre, “generate the claudemètre indicator” →
preset `design/indicator/claude.json`, files in `design/indicator/export/`.
