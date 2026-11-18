# Generator plan (steps 3 to 5)

Updated: 2026-11-18. How to build the generator: order, stack,
breakdown, lots and completion criteria. Roadmap, decisions and
vocabulary: [PLAN.md](../PLAN.md); what the tool does (preset,
checks, page, outputs, command line): [generator.md](generator.md);
skill: [skill.md](skill.md). Steps 3 and 4 done on 2026-10-30, step 5
on 2026-10-31; switch to English: step 6 of [PLAN.md](../PLAN.md).

## Order (decided on 2026-10-30)

First generate indicators from the other projects, the web page next.
The core serves both; the command line is the cheapest
interface, and the Claudemètre tests the preset on a real case before a
page freezes it.

| Step | Deliverable | Done when |
| --- | --- | --- |
| 3 | core `core/`, command line `cli/` | the `alarme` preset gives back the parts of the mock-up (parity); `indicator check` and `generate` work *(done on 2026-10-30)* |
| 4 | global skill `skill/` | the Claudemètre's indicator is generated from its repository *(done on 2026-10-30)* |
| 5 | web page `web/` | settings or opened preset, preview and downloads, offline; for the same preset, the same files as the command line *(done on 2026-10-31)* |

The skill v0 on the Fusion scripts, once considered, is abandoned. So is
`indicator preview` (2026-10-30): the command mainly serves the skill and
the host projects, which do not look at a page; to see an indicator, open
its preset in the web page (or its STEP in Fusion).

**Working prototype first** (decision of 2026-10-30): v1 only sets
what was validated in print; the rest is fixed in the core at the
mock-up's values (list: [generator.md](generator.md), "Preset").
Each setting added later first goes through a test print.

## Architecture

```text
host projects (Claudemètre)                    a human
             │                                   │
   ┌─────────▼────────────┐            ┌─────────▼──────────┐
   │ global skill         │            │ static web page    │
   │ panel-indicator      │            │ settings, preview, │
   └─────────┬────────────┘            │ downloads          │
   ┌─────────▼────────────┐            └─────────┬──────────┘
   │ indicator CLI (Node) │                      │
   │ check · generate     │                      │
   └─────────┬────────────┘                      │
             └─────────────────┬─────────────────┘
          ┌────────────────────▼───────────────────┐
          │ core/ (TypeScript, no I/O)             │
          │ preset → parts, checks, files          │
          │ replicad · opentype.js · fflate        │
          └────────────────────────────────────────┘
```

The core neither reads nor writes any file; it runs in Node as well as in a
Web Worker. Its contract:

```ts
generate(preset: Preset, fonts: FontBytes): {
  checks: Check[]                       // one code per check, same messages everywhere
  parts: Part[]                         // solids and meshes, for the preview
  files: Record<string, Uint8Array>     // 3MF, STL, STEP, template, bill of materials
}
```

| Folder | Content |
| --- | --- |
| `core/` | preset (schema, default values, version migration, published JSON Schema); catalogs (screws, inserts, off-the-shelf lengths, strips, LEDs); legend; parts; orientation for printing; checks; exports |
| `cli/` | command `indicator`: arguments, reading the preset and the fonts, writing the files, `--json` output for the skill |
| `web/` | Vite page: form drawn from the schema, preset opened from a file, core in a Web Worker, three.js preview (exploded or assembled, off or on, drawn from the mock-up's exploded view), zip download, preset in the URL, offline (service worker) |
| `skill/` | `SKILL.md`, short: the computation stays in `indicator` |

A single repository with npm workspaces (`core`, `cli`, then `web`);
`presets/` and `fonts/` are shared. Each folder is created at the start of
its step. The code is TypeScript without a build step: Node 22.18 and
Vite read the `.ts` files directly (erasable syntax only, imports with
`.ts`); `npm test` (vitest) and `npm run typecheck` (tsc) at the root.

## Stack, 100 % free

| Role | Library | License |
| --- | --- | --- |
| language, build | TypeScript, Vite | Apache-2.0, MIT |
| exact solids, STEP | replicad, on OpenCascade in WASM (`replicad-opencascadejs`) | MIT; LGPL-2.1 |
| fonts | opentype.js | MIT |
| preset | zod | MIT |
| 3MF (zip) | fflate | MIT |
| PDF template | pdf-lib | MIT |
| 3D preview | three.js | MIT |
| tests | vitest | MIT |
| engine fallback | manifold-3d (meshes, no STEP) | Apache-2.0 |

OpenCascade's LGPL: the `.wasm` stays a separate file, never merged into
our code, and both the page and the README cite its license with the link to
its sources. Our own code is under WTFPL v2 (2026-10-31), which these
licenses allow: LGPL respected by the separate `.wasm`, fonts under
OFL with their text.

Ruled out: build123d or CadQuery (Python), since the page would need a server
or a second core; OpenSCAD in WASM, without STEP and awkward for the
checks.

## Step 3: core and command line

| Lot | Content | Check |
| --- | --- | --- |
| 3.0 Prototype | throwaway, half a day: 10-letter legend, frame with fillets and countersinks, STEP and mesh export | computation time (Node and browser), WASM size, STEP read back by Fusion; decides replicad or manifold-3d |
| 3.1 Preset v1 *(done on 2026-10-30)* | frozen zod schema, reduced to what was validated in print (text, window, frame, panel, screw head, wire exit, colors of the frame and of the legend background), default values, JSON Schema (`core/src/preset.ts`, `presets/schema.json`) | `core/test/ref/alarme.json` valid; readable errors on a wrong preset (`npm test`) |
| 3.2 Legend *(done on 2026-10-30)* | port of `legende_dxf.py` (mock-up) into `core/src/legend.ts`, without OpenCascade: outlines, `auto` height, letter spacing, islands | outlines identical to the mock-up's DXF, point by point to the µm; areas and centers from its JSON |
| 3.3 Parts *(done on 2026-10-30)* | frame, legend (mask; veil and letters as one body), box, cover, test panel (`core/src/parts.ts`); dimensions and screws taken from `temoin.py` (mock-up) (`core/src/dims.ts`) | parity with the mock-up's STL files: volume within 0.05 % and bounding box within 0.01 mm (measured difference: 0.012 % at most, identical bounding boxes); socket head and wires on the right checked separately |
| 3.4 Checks *(done on 2026-10-30)* | those of the specification, one code each, and the advised frame when mounting fails (`core/src/checks.ts`); lighting uniformity postponed (model to recalibrate) | ALARME: same thin zones as `legende_dxf.py`, no errors; textbook cases: frame too small, window too wide, LEDs outside the window, no screw found |
| 3.5 Exports *(done on 2026-10-30, before 3.4)* | STL and 3MF (port of `orient_stl.py` and `export_3mf.py`), STEP as one named assembly, preset; deterministic files (`core/src/exports.ts`). Template and bill of materials as files: later | STL files laid out like the mock-up's (bounds within 0.01 mm); 3MF read; STEP read back (exact volumes, colors); 2 identical generations. Remaining: 3MF opened by the user in their slicing software |
| 3.6 Command line *(done on 2026-10-30, before 3.4)* | `indicator check`, `generate`, `--json`, exit codes (`cli/bin/indicator.ts`); global installation at step 4 | actually run by the tests: alarm, wrong presets, full generation |

### Engine prototype (lot 3.0, done on 2026-10-30): replicad chosen

Throwaway code, deleted on 2026-10-30 once `core/` was in place (it is
not in the public history): frame and legend of the
`alarme` preset, plus the legend SURCHAUFFE (10 letters), measured under Node
and in headless Chromium (Web Worker), STEP read back by Fusion. For
step 5: `proto/moteur/web/worker.js` starts OpenCascade in a Web
Worker with Vite (`replicad-opencascadejs/wasm?url` passed to `locateFile`,
`worker: { format: 'es' }`).

| Measurement (2nd pass) | Node | Chromium, Web Worker |
| --- | --- | --- |
| OpenCascade startup | 0.2 s | 1.4 s |
| frame (fillets, chamfers, 2 countersinks) | 0.25 s | 0.25 s (1.2 s cold) |
| ALARME legend | 0.18 s | 0.14 s |
| SURCHAUFFE legend | 0.30 s | 0.26 s |
| meshing of the 5 parts | 0.26 s | 0.32 s |
| STEP of the 5 parts | 0.6 s | 0.7 s |

- **Page**: first result about 5.5 s after loading (WASM already
  downloaded), then a legend is recomputed in 0.15 to 0.3 s.
- **Size**: WASM 23 MB, i.e. 5.0 MB with brotli (7.3 with gzip), downloaded
  once then cached; worker code 0.4 MB (0.1 compressed).
  manifold-3d would weigh only 0.2 MB compressed, but without STEP.
- **Parity with the mock-up**: frame 1181.40 mm³ against 1181.39 for Fusion's
  STL; mask 246.02 against 246.03, veil 261.48 against 261.47, with
  the same number of triangles as Fusion.
- **STEP read back by Fusion**: 3 named components (frame, mask, veil),
  closed solids, exact volumes; the mask comes in 4 bodies (mask and
  islands of the A, A, R), as in the mock-up.

Lessons for what follows:

- Legend as polylines (lot 3.2): the layout of `legende_dxf.py`
  (segments of 0.2 mm at most) is 4 times faster than the Bézier
  curves of `drawText` and gives 70 times fewer triangles; the mask
  cut in 2D then extruded once halves the time again.
- STEP colors (lot 3.5): Fusion reads them as linear (#4b5320
  arrives as (148, 155, 99)); convert them from sRGB to linear on export.
- The cold frame (1.2 s) pays for the just-in-time compilation of the WASM: the page
  can start OpenCascade as soon as it loads.
- OpenCascade writes its STEP export statistics to standard output:
  `print` and `printErr` of the WASM module are silenced (otherwise the JSON of the
  command line is broken).
- npm 11.5 removed from the lockfile the native modules of rolldown and
  lightningcss, pulled in by vitest (npm/cli#4828), and vitest would no longer
  start: fixed by npm 11.21.1, installed on 2026-10-30; do not delete
  the lockfile as a workaround.
- Glyph bounding box (lot 3.2): opentype.js's is approximate
  (edge of the A at 13.56 units instead of 13.47), which shifted the scale by
  0.003 %; the core computes the exact extrema of the curves, like
  fontTools.

Parity tolerances (lot 3.3): volume within 0.05 %, bounding box within 0.01 mm.
Parity reached on 2026-10-30: the core becomes the reference; the Fusion
mock-up remains the yardstick of the tests. A check print of an
indicator produced by `indicator`, if the user wants one, closes the step.

## Step 4: skill

- `skill/SKILL.md` based on [skill.md](skill.md); link
  `~/.claude/skills/panel-indicator` set up while writing it *(done on
  2026-10-30, skill seen from the Claudemètre)*.
- `indicator` called as installed by `npm link` *(done, works from
  any folder)*; summary completed with the cutout and the hole spacing
  to drill in the panel, useful for integration.
- Questions drawn from the v1 preset (key table copied into `SKILL.md`).
- First client: the Claudemètre; preset `design/indicator/claude.json` created
  with the user, in its repository *(done on 2026-10-30 by the skill,
  from a session started in the Claudemètre: CLAUDE, 47 × 18 khaki
  frame, 3 mm panel; a single warning, the narrow gap of the mask;
  12 files, identical to a fresh generation)*.
- On request, integration into the host Fusion design (with a Fusion
  360 skill, not provided here).

## Step 5: web page

Branch `etape-5-web`; lots validated on 2026-10-30. Layout and views:
[generator.md](generator.md), section "Web page". The page also opens
the host projects' presets (file chosen or dropped, for example
`design/indicator/claude.json`): it is their preview, in place of `indicator
preview`.

| Lot | Content | Check |
| --- | --- | --- |
| 5.1 Core in the page *(done on 2026-10-30)* | `web/` workspace (Vite); Web Worker that starts OpenCascade as soon as the page loads (recipe from the lot 3.0 prototype); a button generates and downloads the zip of `alarme` | common test: files of the zip identical, byte for byte, to those of `indicator generate`, in headless Chromium (Playwright); times compared with the prototype |
| 5.2 Settings and checks *(done on 2026-10-30)* | form for the 8 keys (types, bounds, defaults and options read from the zod schema, labels in French); checks and mounting (cutout, screws, LEDs) live, without OpenCascade; 2D front view in SVG, off or on | ALARME: same lines as `indicator check`; textbook cases of lot 3.4; a test fails if a schema key has no field |
| 5.3 Presets *(done on 2026-10-30)* | open a `.json` (chosen or dropped), save it, link with the preset in the URL, examples from `presets/`; file names = name of the opened preset, otherwise the "Name" field (by default the text in lowercase) | the Claudemètre's `claude.json`: checks of `indicator check`; reopened link → same preset; wrong preset → "path: message" errors |
| 5.4 3D preview *(done on 2026-10-30)* | meshes of the parts in the indicator frame of reference, added to the core; recomputed in the worker after a typing pause, stale results discarded; viewer drawn from the mock-up's exploded view (three.js from npm): exploded or assembled, off or on, test panel, parts that can be hidden | ALARME and CLAUDE compared with `eclate.html`; legend recomputed in less than 0.5 s; worker memory stable over 50 recomputations |
| 5.5 Offline *(done on 2026-10-31)* | service worker (page, worker, 23 MB WASM, font); interface fonts served by the page; licenses cited (OpenCascade LGPL-2.1 and link to its sources, OFL fonts) | built page, reloaded without network: preview and zip work |

Lot 5.1: the 12 files of `alarme` come out of the page in 3.4 s
(`indicator generate`: 3.25 s), OpenCascade ready 1.1 s after loading
(development server); 0.86 MB worker, 23 MB WASM separate. The
common test (`web/test/parity.test.ts`, in `npm test`) found a defect
in the core: OpenCascade writes the STEP colors in an order that depends
on its memory addresses, hence on what was computed before. The section is
now rewritten in a fixed order (`stableStyles`, `core/src/exports.ts`);
STEP files already generated keep the same content, in another order.

Lot 5.2: form drawn from `presets/schema.json` (`web/src/fields.ts`;
a key without a field makes the page and `fields.test.ts` fail); checks,
mounting and front view in a second worker without OpenCascade
(`web/src/checker.ts`, about 50 ms per input), the main thread without the
core (10 KB). The core now returns dimensions and legend even when
mounting fails (preview of a frame that is too small), and the mounting summary
(`summaryLines`) serves the page as well as `indicator`. Page test: ALARME
and 4 textbook cases give the lines of `indicator check`. To revisit in lot
5.5: the checks worker bundles replicad without using it (0.7 MB).

Lot 5.3: "Open · Examples · Save · Link" bar in the header,
file dropped anywhere on the page. An opened preset (file, example,
link) is checked as is until the first input: the page gives the
lines of `indicator check`, even for a wrong preset (unknown key, version);
then the form takes over, keeps the wrong values of its
fields (color "rouge", unknown option) until they are edited, and drops
the keys it does not have. Save writes the `<name>.json` of `indicator
generate` (`presetJson`, now in the core). The link follows each
input (URL fragment, one key per parameter, `frame.width=47`, plus
`name`): the reloaded page keeps its preset. Checks: the Claudemètre's
`claude.json` gives the 10 lines of `indicator check`, reopened link included;
page tests (`page.test.ts`): preset opened, saved, link copied
then reopened in another page, wrong preset dropped, example;
`link.test.ts` for the link round trip. A single example in
`presets/` (alarm): the menu will take the next ones as they are.

Lot 5.4: preview meshes in the core (`core/src/preview.ts`): the 6
printed parts (triangles, normals and sharp edges from OpenCascade) in
the indicator frame of reference, with a cache per part whose key is made of the
settings it depends on: a text change only redoes the legend, a color
nothing. The veil is shown there as a plate and letters side by side, without the
fuse of the printed part (280 to 550 ms on its own); the files
keep `legend()`. A single OpenCascade worker for the preview and the zip
(`web/src/engine.ts`, client `engine-client.ts`). three.js
0.186 viewer (`web/src/viewer.ts`, 0.56 MB loaded on the first switch to 3D):
exploded or assembled, four viewpoints, off or on (shared with the
front view), parts that can be hidden. Measurements on the built page (headless
Chromium): first 3D view in 2.0 s, legend recomputed in 0.26 to 0.43 s.
Memory: up to replicad 1.2.0, OpenCascade leaked in each
boolean operation (replicad issue
[#282](https://github.com/sgenoud/replicad/issues/282), about 0.2 MB
per operation), fixed in 1.2.1 (2026-11-06). The worker is replaced
when its heap exceeds 512 MB, a safeguard kept because the wasm heap never
shrinks. Over 50 rounds of recomputation (frame height then text,
measured by hand, too long for `npm test`): with 1.2.0, a sawtooth
from 100 to 595 MB and 2 restarts; with 1.2.1, from 100 to 173 MB, no
restart, no error. Compared with `eclate.html` (ALARME): same parts, positions and
viewpoint; the mock-up's hardware (screws, inserts, strip) is
not in the core, hence not in the preview. CLAUDE: same assembly, with its
text and its frame color. Page test: 3D view of the 6 parts,
legend alone redone after an input, part hidden then shown again.

After lot 5.4 (2026-10-30): 3D view by default, and simulated light
(`web/src/light.ts`), shared by both views and outside the preset: off,
steady, breathing or blinking, in a strip color. Letters in
the color, a little whiter at the core; more restrained halo for
light colors (white drowned the letters). Front view: SVG halo,
blur clipped to the window. 3D: halo made of a bloom of the veil alone, the
other parts drawn in black so that they hide it, then added to
the scene, without a brightness threshold. A first attempt, bloom of the whole
scene above a threshold, lit the letters one by one according to their
reflection, and its colors pushed beyond 1 turned white. Page
test: 3D view first, color of the letters and of the halo, light turned off
then turned back on by a color.

Lot 5.5: service worker written by the build (`web/src/sw.js`, completed
by `vite.config.ts` with the list of files and a cache named
after them): it keeps the page, its workers, OpenCascade's `.wasm`
(23 MB), the fonts and the licenses, 25 MB in all; a new
version waits until the page is closed everywhere. Only in the built
page. Interface fonts served by the page: B612 and B612
Mono (`@fontsource` packages, OFL), until then requested from the system, hence
replaced most of the time; wider, they made the label
column shrink (9 em) so that the numeric fields show 6
characters. Licenses: footer (OpenCascade, LGPL 2.1, link to
its sources; OFL fonts) and `licenses.txt`, built from the
dependencies of `web/` and `core/` (each package's license, the note
on OpenCascade's sources, Barlow's OFL), also served in
development; Vite's `build.license` option does not see the
workers. The checks worker no longer bundles replicad (`sideEffects:
false` in `core/package.json`): 443 KB instead of 714. Page
test: loaded, network cut, reloaded, it shows the 3D view of the 6
parts, gives the 12-file zip and its licenses. Numeric fields no longer have arrows (the
up and down keys remain): they hid "10.5".

- STEP and 3MF computed on download only; front view and
  checks right away, 3D next (first result around 5.5 s according to the
  prototype).
- Memory: OpenCascade's leak in boolean operations
  (replicad #282) is fixed in 1.2.1; the page still restarts its
  worker beyond 512 MB (lot 5.4), the wasm heap never shrinking.
- Parity: the files of the zip are compared (the zip itself carries dates).
- Later: 3D section view, thin zones highlighted on the front view (the
  checks only give their position in the message).
- Page in French; the step closes with the page running locally (`npm run web`).
  Public repository, license (WTFPL v2) and hosting (GitHub Pages): see
  the PLAN, "Publication".

## Out of scope

- Phone version of the page in v1 (decision of 2026-10-30): the page
  targets the computer; its stacked layout below 880 px stays as
  it is, neither tested nor touched up. No theme other than the light
  and dark ones already there ("Dark" button in the header).

- Slicing and settings specific to a slicing software, including Snapmaker
  Orca: the 3MF files are generic and the user slices. A host project
  that wants to slice gets its own skill.

## Open points

- [x] Tests run locally only (2026-10-31): the `.githooks/pre-push` hook
      (enabled by `npm install`) runs typecheck and `npm test` before each
      push and blocks it on failure; the GitHub action only does the
      typecheck, the build and the publication. On its runner, the offline
      page test failed: after the
      reload without network, the 3D view was never built, with no
      error in the console (cause not found; it passes locally). Its
      failure message now gives the state of the page and its console.
- [x] Engine: replicad, based on the 2026-10-30 prototype (lot 3.0).
- [x] Parity tolerances: volume within 0.05 %, bounding box within 0.01 mm (lot 3.3).
- [x] `npm link` to call `indicator` from the skill, absolute path as a
      fallback (step 4, 2026-10-30).
