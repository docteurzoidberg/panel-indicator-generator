[Version française](README.fr.md)

# Panel indicator generator

Generates **flush-mount backlit indicators**, 3D-printable, for any
project: a legend that lights up behind a window, in a frame mounted in a
panel cutout, like a warning light or a dashboard annunciator.

**Online page: <https://docteurzoidberg.github.io/panel-indicator-generator/>**
(everything is computed in the browser, without a server; works offline
once loaded; in English or French).

> **Status (2026-11-18): v1 usable.** The page, the `indicator` command and
> the Claude Code skill produce the same files from a preset. The pieces
> are those of validated test prints, with M3 screws; v1 only sets what has
> been proven. Roadmap: [PLAN.md](PLAN.md).

## The indicator

```text
Section, seen from above: front on the left, wall on the right

         frame  panel        light box + flange
        ┌──────┬────────┬───────────────────────────┐
screw ══╪══════╪════════╪══▓▓ insert                │
        │      ├────────┤                           │
        │   ┌──┴────────┴──────────────────────┐    │
        │   █                                ● │    │
        │   █ legend         light           ● │    │  LEDs
        │   █                                ● │    │
        │   └──┬────────┬──────────────────────┘    │
        │      ├────────┤                           │
screw ══╪══════╪════════╪══▓▓ insert                │
        └──────┴────────┴───────────────────────────┘
          ▲        ▲
          │        └ panel cutout, crossed by the tube
          └ lip of the frame: the legend rests on it
```

| Piece | Role |
| --- | --- |
| **Frame** | collar seen from the front; its lip borders the window and holds the legend |
| **Legend** | thin multi-filament plate: opaque mask, translucent letters, diffusing veil behind. The only piece to reprint to change the text |
| **Light box** | tube that crosses the panel and presses the legend against the lip, flange that clamps the panel from behind, housing of the LED strip |
| **Cover** | closes the housing at the back of the box and carries the strip, clipped in; press-fitted, it comes off with a screwdriver; slot for the wire ribbon |

You also need 2 M3 screws, 2 heat-set inserts and a piece of WS2812B strip
at 144 LEDs/m. The panel only needs a cutout and 2 holes. The tube is as
long as the panel is thick: the only setting that depends on the panel,
whether printed, sheet metal or wood. A printable test panel lets you
mount the indicator before drilling the real one.

## The page

- **Settings** of the preset, checked on every input: what will not print
  or will not hold is flagged, along with the mounting (cutout, screws,
  LEDs).
- **Preview** in 3D (pieces exploded or assembled, can be hidden) or from
  the front, with simulated light: off, steady, breathing or blinking, in
  the color of your choice.
- **Presets**: open a file (or drop it on the page), save it, start from an
  example; the page link carries the preset.
- **Download** the zip of the print files, the files of
  `indicator generate`.
- **Language**: the browser's (English or French, else English), or the
  one chosen in the header, kept by the page.

## The preset

An indicator is described by a JSON file, for example
[`presets/alarm.json`](presets/alarm.json):

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

Only `legend.text` and `panel.thickness` are required; dimensions in mm.
All the keys, their default values and the checks:
[docs/generator.md](docs/generator.md). JSON Schema:
[`presets/schema.json`](presets/schema.json).

## What the generator produces

| File | Content |
| --- | --- |
| `<name>_<print>.3mf` | one per print (`legend`, `frame`, `box_cover`, `test_panel`); pieces oriented, one per color, to slice in the software of your choice |
| `<name>_<piece>.stl` | one per piece, oriented as in the 3MF |
| `<name>.step` | named and colored assembly, to integrate the indicator in a project (Fusion, FreeCAD) |
| `<name>.json` | the preset used, default values included |

The hardware (screw length, inserts, LEDs) and the dimensions of the
cutout are in the summary of the page and of the command. Files identical
from one generation to the next.

## Locally

Node 22.18 or later.

```bash
git clone https://github.com/docteurzoidberg/panel-indicator-generator.git
cd panel-indicator-generator
npm install
npm run web          # the page, served by Vite (http://localhost:5173)
```

```bash
npm run typecheck
npx playwright-core install --only-shell chromium   # headless Chromium of the page tests
npm test
npm run build -w @indicator/web                     # page built in web/dist
```

`npm install` also enables a git hook (`.githooks/pre-push`): before each
push, it checks that the French docs follow their English version, runs
the typecheck and all the tests, and blocks the push if they fail. The
GitHub action only builds and publishes the page.

### Command line

```bash
(cd cli && npm link)                         # installs the indicator command
indicator check presets/alarm.json           # checks only, nothing is written
indicator generate presets/alarm.json        # files in presets/export/
```

```text
Indicator “alarm” (presets/alarm.json)
✓ legend “ALARM”: 6.47 mm capitals, 1.50 mm from the window edge
⚠ mask gaps thinner than the nozzle: 0.05 mm² at x = -0.4, …
✓ M3 × 10 screws (countersunk head, ISO 10642)
✓ 4 LEDs in the window
  …
  panel: cutout 29.8 × 13.3, 2 holes Ø 3.4, 37 mm apart, centered on the window
```

`--json` gives the same result for a script; exit code 0 if the preset is
good (warnings possible), 1 if it is rejected.

### Claude Code skill

The `panel-indicator` skill does the same from any project, which keeps its
preset in `design/indicator/<name>.json`: “generate the indicator”, “check
the indicator”, “make an ARMED indicator, 3 mm panel”.

```bash
ln -s "$PWD/skill" ~/.claude/skills/panel-indicator   # from the cloned repository, after npm link
```

How to use it: [docs/skill.md](docs/skill.md).

## Later

Each setting will come after a test print: legend on 2 lines, other fonts,
negative mode (lit background), M2 and M2.5 screws, captive nuts, other
strips and LEDs, partitions and zones, printer settings (nozzle, layer).
And also: printable cutout template, bill of materials as a file, 3D
section in the page, estimate of the lighting uniformity. Details:
[PLAN.md](PLAN.md) and [docs/generator.md](docs/generator.md).

## Out of scope

- **Visors, hoods, covers, brackets**: they depend on each object and stay
  in the host project, drawn around the indicator's STEP.
- **Electronics and firmware**: the generator gives the LEDs and the path
  of the wires, it drives nothing.
- **Parametric model in a CAD software**: it receives generated STEP files;
  the settings live in the preset.
- **Slicing**: the 3MF files are generic, everyone slices with their own
  software.

## Repository layout

```text
PLAN.md     roadmap, decisions, vocabulary
docs/       generator plan and specification, skill guide (French version in docs/fr/)
core/       core (TypeScript): preset, legend, pieces, checks, exports, messages in English and French
cli/        indicator command line (check, generate)
skill/      panel-indicator Claude Code skill
web/        web page (Vite): the core in Web Workers, without a server
presets/    example presets and JSON Schema of the preset
fonts/      free fonts provided (OFL)
.github/    action that builds and publishes the page (GitHub Pages)
```

## Licenses

This repository (code, docs, presets, reference files of the tests), © 2026
DrZoid: **WTFPL**, version 2 ([LICENSE](LICENSE)). It comes without any
warranty, to the extent permitted by applicable law; anyone may
redistribute and modify it under the terms of the Do What The Fuck You
Want To Public License, version 2 (<https://www.wtfpl.net/>).

It does not apply to what comes from elsewhere: its dependencies, all
free, and its fonts keep their license, which the page cites in its footer
and in `licenses.txt`, with the text of each. They allow this license for
our code: OpenCascade (LGPL) stays a separate, replaceable file, with its
sources cited; the fonts stay under the OFL, with their text
(`fonts/OFL-Barlow.txt`).

- **OpenCascade** (Open CASCADE Technology, through
  `replicad-opencascadejs`): LGPL 2.1. Compiled to WebAssembly, it stays a
  separate `.wasm` file. Sources:
  [OCCT](https://github.com/Open-Cascade-SAS/OCCT) and
  [replicad-opencascadejs](https://github.com/sgenoud/replicad/tree/main/packages/replicad-opencascadejs).
- **Barlow Condensed** (`fonts/`) and **B612** fonts: SIL Open Font
  License 1.1.
- three.js, replicad, opentype.js, zod, fflate: MIT; flatbush: ISC;
  clipper-lib: Boost.

## Origin

It is the V5 “annunciator” light of the Claudemètre, made generic. The
Claudemètre is its first user, but the tool does not depend on it. The
dimensions come from a Fusion 360 mock-up, kept in a separate repository;
its reference outputs (STL, legend outlines) are in `core/test/ref/`,
where the core tests compare them with its pieces.

An earlier, French-only version of this generator stays available for a
while: [generateur-temoin-lumineux](https://github.com/docteurzoidberg/generateur-temoin-lumineux).
