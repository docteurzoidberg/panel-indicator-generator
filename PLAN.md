# Plan — panel indicator generator

Updated: 2026-11-18. Generator plan (steps 3 to 5: order, stack,
lots): [docs/generator-plan.md](docs/generator-plan.md); specification
(preset, checks, page, outputs, command line):
[docs/generator.md](docs/generator.md); skill: [docs/skill.md](docs/skill.md).

## Roadmap (the user's plan, 2026-10-29; steps 3 to 5 reordered on 2026-10-30)

Steps are started one at a time, at the user's request.

1. **Mock-up in Fusion**: done and validated on 2026-10-29; separate
   repository since 2026-10-31, with its points to review; its reference
   outputs for the tests are in `core/test/ref/`.
2. **Test prints** *(done and validated, noted on 2026-11-16)*: the user prints and gives
   feedback; back to step 1 if needed. The mock-up must stay easy to
   regenerate from the Fusion design (STL, images, exploded view): these
   operations are currently several scripts, to be reduced to a single
   command. Useful tests: clearances (rebate, cutout, cover), legends
   (veil, fonts, sizes), light bench, clipped strip. Mock-up
   regenerated on 2026-10-30: WS2812B strip at 144 LED/m (see Principles)
   clipped on the cover without adhesive, LEDs 10 mm from the legend, 47 mm frame.
   1st test (2026-10-30): all good (M3 validated) except the cover, which had
   side play and came out too easily; cover alone fixed (rail ends
   rounded for a press fit, bigger ribs) and 2nd test on a
   series of 3 press fits: 0.3 mm chosen. M2.5 test postponed until after v1
   (M3 screws only in v1).
3. **Core and command line** *(done on 2026-10-30, branch
   `etape-3-noyau`)*: parts, checks and exports (3MF, STL,
   STEP, template, bill of materials) built from the preset, command
   `indicator`; first a prototype of the geometry engine, then parity
   with the Fusion mock-up.
4. **Global Claude Code skill** *(done on 2026-10-30, branch `etape-4-skill`)* (link
   from `~/.claude/skills`, source in `skill/`): request an indicator from a host project, generate it from
   its preset, integrate it on request into its Fusion design; first
   client, the Claudemètre.
5. **Web page** *(done on 2026-10-31, branch `etape-5-web`)*: settings or opened preset (a host project's, for
   example), real-time preview (exploded or assembled, off
   or on) and downloads, in the browser, without a server.
6. **English by default, new repository** *(decided on 2026-11-18; lots 6.1 to 6.5
   done on 2026-11-18, 6.6 to do)*: the project moves to a new repository
   `panel-indicator-generator`, in US English, which becomes the
   reference; the French repository, `generateur-temoin-lumineux`, is kept
   for a while, then frozen. What stays in French: a version of the docs
   and the page, multilingual. Lots:
   1. *New repository*: public history carried over, messages of the 6 commits
      not in US English rewritten (trees, authors and
      dates unchanged, checked before the push); page published on GitHub
      Pages at its own address.
   2. *Names*: English term "indicator"; packages `@indicator/*`,
      command `indicator`, skill `panel-indicator`, offline cache
      prefix; US spelling everywhere (`color`, `license`,
      `center`, `licenses.txt`), except external API identifiers
      (replicad's `organiseBlueprints`).
   3. *Core and command*: messages in the requested language (English by
      default), en/fr catalog in `core/src/messages.ts` (checks,
      summary, preset errors); numbers formatted per language; the
      page stays in French until lot 6.4 (part labels and field
      help moved to the page side); JSON Schema in English; names of the
      produced files in English, fixed whatever the language; command
      output in English; the test reference (the mock-up's
      ALARME preset) separated from the example preset, which switches to
      English (`presets/alarm.json`, ALARM). Preset keys unchanged: it
      stays at v1. Page zip and command files: identical preset and
      STEP, STL and 3MF of the same geometry (OpenCascade may
      split a flat quadrilateral along the other diagonal in the browser;
      seen with ALARM, decided on 2026-11-18).
   4. *Multilingual page*: the browser's language if it is English or
      French, otherwise English; EN / FR choice in the header, remembered by
      the page (browser) and applied in place, without reloading;
      page texts in `web/src/texts.ts`; `licenses.txt` in
      English; share link format unchanged; page tests in
      English and in French.
   5. *Docs*: English in place; French version of the README, of
      `generator.md` and of `skill.md` (`README.fr.md`, `docs/fr/`); the
      journals (`PLAN.md`, `generator-plan.md`) in English only;
      host project presets in `design/indicator/` (instead of
      `design/temoin/`, decided on 2026-11-18); produced file names and
      example preset of lot 6.3 carried into the docs and the skill;
      a hook flags French docs behind their English
      version.
   6. *Switch*: the French repository frozen, with a banner on its page that opens
      the same preset in the new one; host projects move to the
      new repository at their own pace; the French repository archived afterwards.

Details of steps 3 to 5: [docs/generator-plan.md](docs/generator-plan.md).

Next, to be replanned: cutout template, bill of materials, recalibration of the
uniformity model on photos, variants (round frame, 2 lines, SVG pictograms,
partitions and zones, clips, screws from the back, legend on printed film,
"dead front" face, other LEDs).

## Decisions to make

- [x] Geometry engine (2026-10-30): replicad, based on the lot 3.0
      prototype (times, size, parity, STEP read back by Fusion: see
      [docs/generator-plan.md](docs/generator-plan.md)).
- [x] Interface language (2026-10-30): French for v1; later,
      multilingual page with i18n labels. Code in English (2026-10-30):
      comments, identifiers, files and tests of `core/`, `cli/`, `web/`.
      English by default (2026-11-18): new repository
      `panel-indicator-generator` in US English (code, commands,
      docs, history), page in English and in French, French version
      of the docs; the French repository kept for a while (step 6).
- [x] Publication: public repository started from a single commit (2026-10-31;
      the working history stays private); page on GitHub Pages,
      built and published by `.github/workflows/page.yml` on each push
      to `main`; WTFPL v2 license for the repository's code (2026-10-31),
      dependencies and fonts keeping their own.
- [x] Order (2026-10-30): command line and skill before the web page.
- [x] Stack (2026-10-30): TypeScript, 100 % free libraries, a single
      core for the command line, the skill and the page.
- [x] Generic 3MF (2026-10-30): nothing specific to a slicer; one part
      per color in the same 3MF. Slicing is left to the user;
      Snapmaker Orca out of scope (a host project that wants to slice has its
      own skill).
- [x] Example preset in M3: frame widened from 44 to 47 mm (2026-10-30), screws
      centered between the window and the edge.
- [x] v1 preset reduced to what was validated in print (2026-10-30):
      text (one line), window, frame, panel, countersunk or socket
      screw head, wire exit on the left or on the right, colors of the frame and
      of the legend background (black by default). M3 screws and heat-set inserts
      only, spacing computed; no nuts or gluing; no filament
      types (chosen at slicing). M2, M2.5 and the rest will each come
      after a test print.
- [x] Box cover (4th part, carries the clipped strip): held by a
      0.3 mm press fit (ribs and rail ends), chosen by test on
      2026-10-30; no through screws.

## Principles

- **Generic**: nothing specific to a host project; its presets live in
  its repository (e.g. the Claudemètre: `design/indicator/claude.json`).
- **The preset is the contract**, versioned; **a single core** (geometry,
  checks, exports) for the command line, the skill and the page.
- **100 % free**: open source libraries only (licenses:
  [docs/generator-plan.md](docs/generator-plan.md)).
- **Static page**, without a server, usable offline.
- **Manufacturing**: FDM, multi-filament up to 4 toolheads, single filament
  possible; common hardware (M2 to M3, heat-set inserts, nuts); in
  v1, M3 screws and heat-set inserts only.
- **Reference strip**: WS2812B 5 V at 144 LED/m (pitch 6.94; board
  12 × 0.5; 5050 LEDs), cuttable after each LED: the segment fits the
  window, as close as possible to the rule count = window width / pitch,
  rounded (4 LEDs for 27 mm).
- **3MF made here**, slicing left to the user.

## Anatomy and vocabulary

| Term | Definition |
| --- | --- |
| frame | front bezel, in front of the panel |
| lip | edge of the frame around the window, against which the legend rests |
| rebate | recess for the legend at the back of the frame |
| window | visible part of the legend |
| legend | multi-filament plate: opaque **mask**, translucent **letters**, continuous diffusing **veil** behind (it carries the islands of the A, D, O, R); letters and veil of the same filament form a single body |
| light box | **tube** (inside = window) that goes through the cutout and presses the legend against the lip; **flange** behind the panel, with the inserts; **pocket** for the strip; optional **partitions** |
| cover | closes the pocket at the back of the box; carries the strip, clipped between two **rails** that go into the box; its **tab** closes the ribbon cable slot, cut in the box wall |
| cutout | hole in the panel: tube + clearance, plus 2 screw holes |

Mask, letters and veil are printed together, in the same material family
(PETG with PETG, PLA with PLA). Frame, box and cover are separate parts;
box and cover opaque, preferably black.

## Out of scope

- Visors, peaks, housings, supports and accessories specific to an object:
  they stay in the host project.
- Electronics and firmware; cutting the host panel (the tool gives the template).
- Slicing and slicer settings, including Snapmaker Orca.
- Fusion parametric model in the generator (Fusion receives STEP files),
  photorealistic rendering.

## Ideas for later

- Indicative ESPHome or WLED configuration snippet (LEDs, state effects).
- Row of indicators aligned on the same panel, with a common template.
