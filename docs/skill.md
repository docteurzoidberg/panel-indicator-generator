[Version française](fr/skill.md)

# `panel-indicator` skill: guide

Updated: 2026-11-18. **Written on 2026-10-30**:
[`skill/SKILL.md`](../skill/SKILL.md) (step 4 of the [PLAN](../PLAN.md);
plan: [generator-plan.md](generator-plan.md)). This document tells how to
use it from another project and what it returns. For humans, host projects
and their agents. Tool it calls, the `indicator` command:
[generator.md](generator.md).

From a host project, you ask for a custom backlit indicator; the skill
describes it in a preset of the project, checks it, produces the print and
mounting files, and on request integrates it in the Fusion design of the
project.

## Making it available

**Global** skill (decision of 2026-10-30): available in every project,
without any option when starting Claude Code. The source stays in this
repository (`skill/`, with `SKILL.md`); `~/.claude/skills/panel-indicator`
is a link to it, made once from the cloned repository, with the command:

```bash
cd panel-indicator-generator   # the cloned repository
ln -s "$PWD/skill" ~/.claude/skills/panel-indicator
(cd cli && npm link)            # the indicator command
```

The link follows the repository: an update of the skill applies at once
everywhere. From a host project, you then just start Claude Code:

```bash
cd my-project   # the host project, with its preset in design/indicator/
claude
```

The skill is self-sufficient: the host agent does not have to read the
rest of this repository.

## In the host project

```text
<host project>/
└── design/indicator/   convention; any other folder if named
    ├── <name>.json     preset, versioned with the host project
    └── export/         written by the skill, can be regenerated
```

One preset per indicator; `<name>` prefixes all the files produced.

## Asking for it

| Request | What happens |
| --- | --- |
| “generate the claudemètre indicator” | preset found, checks, files in `export/`, summary |
| “make an ARMED indicator, 3 mm panel, red frame” | new preset from the example, questions about what is missing, then generation |
| “check the indicator” | checks only, nothing is written |
| “show the indicator” | preset to open in the generator's web page; STEP to open in Fusion |
| “integrate the indicator in the Fusion design” | STEP imported, cutout and holes in the host panel |

## Steps

1. **Preset**: the project's (`design/indicator/*.json` or the given
   path). Else, a new preset: the text (one line) and the panel thickness
   are asked, the only required keys of the v1 preset; the screw head
   (countersunk or socket), the wire exit (left or right) and the colors of
   the frame and of the legend background are asked too, with their
   default value suggested. The default values used are listed in the
   summary.
2. **Checks** (`indicator check --json`): an error stops everything, with
   the fix of the preset suggested (for example the recommended frame of
   the `mount.frame` check), applied only after agreement; a warning does
   not stop and appears in the summary. The command speaks English; the
   agent gives the summary in the user's language.
3. **Generation** (`indicator generate`) to `export/`, all formats.
4. **Summary**: checks, bill of materials, files written, default values
   used.
5. **On request**: integration (below).

## Expected result

In `export/`:

The files of v1 ([generator.md](generator.md), “Outputs”):

| File | Content |
| --- | --- |
| `<name>_<print>.3mf` | generic 3MF, one per print (`legend`, `frame`, `box_cover`, `test_panel`) |
| `<name>_<piece>.stl` | one per piece, oriented for printing |
| `<name>.step` | named assembly, in the indicator's frame of reference |
| `<name>.json` | the preset used |

Pieces: frame, legend (mask, letters, veil, to load together), light box,
cover. Summary given to the user, for example:

```text
Indicator “alarm” (design/indicator/alarm.json)
Checks: ⚠ mask gaps thinner than the nozzle (4), the rest ✓
Bill of materials: 2 M3 × 10 countersunk screws, 2 M3 heat-set inserts (hole Ø 4 × 5.5),
  4 WS2812B strip LEDs at 144 LEDs/m (27.8 mm piece), 4-wire ribbon at 1.27 pitch
Panel: cutout 29.8 × 13.3, 2 holes Ø 3.4, 37 mm apart, centered on the window
Files: design/indicator/export/ (12: 3MF, STL, STEP, preset)
Default values used: window 27 × 10.5, countersunk screws, wires on the left
```

## Integration in a Fusion design

Fusion open on the host design; a Fusion 360 skill (not provided here)
does the operations.

- STEP imported in an “indicator `<name>`” component. Frame of reference:
  origin at the center of the window, on the panel plane (back of the
  frame), X to the right, Z up, +Y towards the back; without rotation if
  the host panel follows this frame of reference, else the skill asks
  where to place it.
- Cutout and 2 screw holes cut in the body of the panel from the cutout
  and the spacing of the summary (the template will come later), then an
  interference check.
- New version of the design saved only with agreement.

## What it does not do

- Visors, covers, brackets and accessories: they stay in the host project.
- Electronics and firmware; physical cutting of the panel (it gives the
  template).
- Slicing: the 3MF files are generic. A host project that wants to slice
  (for example with Snapmaker Orca) gets a dedicated skill.
- Changing this repository: it only writes in the host project.

## Rules for an agent

- The preset is the only source: to change the indicator, change the
  preset and generate again; never touch up the STL, STEP or 3MF files.
- Fasteners fixed in v1 (M3 screws and heat-set inserts); the screw length
  is computed, never chosen by hand.
- A defect of the generator: report it to the user, do not fix it from the
  host project.

## Version

A single one: the skill relies on `indicator` (Node), without Fusion;
Fusion is only used for integration. The v0 on the mock-up's scripts,
considered, was dropped (2026-10-30): the command line comes before the
skill.

## Open points

- [x] Loading a skill through a symbolic link: checked on 2026-10-30, the
      skill is listed by a session started in the Claudemètre.
- [x] Calling the tool from the global skill: `indicator` installed by
      `npm link` (2026-10-30), absolute path of the repository as a
      fallback.
- [x] `design/indicator/` convention (2026-11-18, instead of
      `design/temoin/`).
- [x] Questions of the skill taken from the v1 preset
      (`presets/schema.json`, frozen on 2026-10-30): the table of keys is
      copied into `SKILL.md`, which is self-sufficient; to update if the
      preset changes.
