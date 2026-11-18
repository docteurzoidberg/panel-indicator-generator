# Panel indicator generator

3D-printed flush-mount backlit indicators (lit legend in a frame mounted in
a panel cutout): a JSON preset describes the indicator, the generator
derives the print files from it (`indicator` command line, Claude Code
skill, web page).

- **v1 = working prototype**: only what has been validated in print
  (settings: `docs/generator.md`, “Preset”); no unproven feature.
- Layout: `presets/`, `fonts/` (OFL), `docs/` (`generator-plan.md` to read
  first, then `generator.md` and `skill.md`; French version of the last two
  in `docs/fr/`, of the README in `README.fr.md`); `core/` (TypeScript,
  `npm test`, `npm run typecheck`), `cli/` (`indicator generate <preset>`,
  installed by `npm link`), `skill/` (linked from
  `~/.claude/skills/panel-indicator`), `web/` (Vite page, `npm run web`).
  Roadmap, decisions, vocabulary: `PLAN.md`. The dimensions come from a
  Fusion mock-up, in a separate repository; its reference outputs for the
  tests are in `core/test/ref/`.
- Exchanges with the user in French. Everything in the repository in US
  English: code of `core/`, `cli/` and `web/` (comments, identifiers, file
  and test names, internal errors), hooks, docs, commit messages. Texts
  shown to the user: English by default; the page and the core's messages
  also exist in French (`web/src/texts.ts`, `core/src/messages.ts`);
  `indicator` output, names of the produced files and schema descriptions
  in English only.
- French docs: `README.fr.md`, `docs/fr/generator.md`, `docs/fr/skill.md`
  follow their English version; the pre-push hook refuses a push where an
  English doc changed without its French version
  (`.githooks/docs-fr-behind`). The journals (`PLAN.md`,
  `docs/generator-plan.md`) are in English only.
- Generic: nothing specific to a host project, whose presets stay in its
  repository (`design/indicator/<name>.json` by convention). Visors and
  accessories of an object: out of scope.
- Fasteners: v1 = M3 screws and heat-set inserts (countersunk or socket
  head), spacing and length computed; M2 and M2.5 later, chosen by the
  user. No filament types: chosen when slicing.
- Generic 3MF (one part per color), made here; slicing stays with the
  user, in the software of their choice.
- Local tests: the `.githooks/pre-push` hook (enabled by `npm install`)
  runs the French docs check, the typecheck and `npm test` before each
  push, on a committed tree; the GitHub action
  (`.github/workflows/page.yml`) only typechecks, builds and publishes the
  page on GitHub Pages.
