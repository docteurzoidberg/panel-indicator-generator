// Preset v1: the contract between the command line, the skill and the page (settings:
// docs/generator.md). Dimensions in mm. v1 only sets what has been validated in print
// (decision of 30/10/2026); everything else is fixed in the core. Only the text and the
// panel thickness are required; every other key defaults to the value of the example
// presets/alarm.json, with black colors. An unknown key is rejected (typo). Compatible
// additions stay in v1; any change of a key or of a default value moves to v2, with its
// migration. Error messages are in the requested language (messages.ts); descriptions, in
// the published JSON Schema, are in English.
import * as z from 'zod';
import { MESSAGES, type Lang } from './messages.ts';

const BLACK = '#111111';

// Descriptions of the published JSON Schema (editors; English hints of the page).
const d = {
  root: 'Panel indicator preset (v1). Dimensions in mm.',
  title: 'Panel indicator preset, v1',
  schema: 'Path or URL of the JSON Schema, for editors',
  mm: (what: string) => `${what} (mm)`,
  color: (what: string) => `${what} (#rrggbb); black by default`,
  text: 'Legend text, on one line',
  background: 'Color of the legend background (opaque mask)',
  windowWidth: 'Window width (visible part of the legend)',
  windowHeight: 'Window height',
  frameWidth: 'Frame width',
  frameHeight: 'Frame height',
  frameColor: 'Frame color',
  panelThickness: 'Thickness of the host panel (= length of the tube)',
  head: 'M3 screws and heat-set inserts; countersunk: countersunk head, socket: socket head (ISO 4762)',
  wireExit: 'Exit of the strip wires, seen from the front',
};

// The schema with its error messages in one language; shape and descriptions are the same
// in every language.
function buildSchema(lang: Lang) {
  const t = MESSAGES[lang];
  const mm = (what: string) => z.number().positive().describe(d.mm(what));
  const color = (what: string) => z.string()
    .regex(/^#[0-9a-fA-F]{6}$/, t.preset.colorFormat).default(BLACK)
    .describe(d.color(what));

  const legend = z.strictObject({
    text: z.string()
      .regex(/\S/, t.preset.emptyText)
      .refine((s) => !s.includes('\n'), t.preset.oneLine)
      .describe(d.text),
    background: color(d.background),
  });

  const window = z.strictObject({
    width: mm(d.windowWidth).default(27),
    height: mm(d.windowHeight).default(10.5),
  });

  const frame = z.strictObject({
    width: mm(d.frameWidth).default(47),
    height: mm(d.frameHeight).default(18),
    color: color(d.frameColor),
  });

  const panel = z.strictObject({
    thickness: mm(d.panelThickness),
  });

  const mount = z.strictObject({
    head: z.enum(['countersunk', 'socket']).default('countersunk').describe(d.head),
  });

  const light = z.strictObject({
    wireExit: z.enum(['left', 'right']).default('left').describe(d.wireExit),
  });

  return z.strictObject({
    $schema: z.string().optional().describe(d.schema),
    version: z.literal(1, { error: t.preset.version }),
    legend,
    window: window.prefault({}),
    frame: frame.prefault({}),
    panel,
    mount: mount.prefault({}),
    light: light.prefault({}),
  }).describe(d.root);
}

export const presetSchema = buildSchema('en');
const SCHEMAS: Record<Lang, typeof presetSchema> = { en: presetSchema, fr: buildSchema('fr') };

// Messages of zod itself, in the language; a missing key gives "required" (with the
// allowed values) rather than "object expected, undefined received".
const LOCALES = { en: z.locales.en(), fr: z.locales.fr() };
function issueMessage(lang: Lang) {
  const t = MESSAGES[lang].preset;
  return (iss: z.core.$ZodRawIssue) => {
    if (iss.input === undefined && iss.code === 'invalid_type') return t.required;
    if (iss.input === undefined && iss.code === 'invalid_value') return t.requiredAmong(iss.values.map((v) => JSON.stringify(v)).join(' | '));
    return LOCALES[lang].localeError(iss);
  };
}

export type PresetInput = z.input<typeof presetSchema>;
export type Preset = z.output<typeof presetSchema>;

export type ParseResult = { ok: true; preset: Preset } | { ok: false; errors: string[] };

function where(path: PropertyKey[], root: string): string {
  return path.map((p, i) => (typeof p === 'number' ? `[${p}]` : `${i ? '.' : ''}${String(p)}`)).join('') || root;
}

// Validates a preset (JSON already read); errors are "path: message" lines in the language
// ("path : message" in French).
export function parsePreset(data: unknown, lang: Lang = 'en'): ParseResult {
  const r = SCHEMAS[lang].safeParse(data, { error: issueMessage(lang) });
  if (r.success) return { ok: true, preset: r.data };
  const t = MESSAGES[lang].preset;
  return { ok: false, errors: r.error.issues.map((i) => `${where(i.path, t.root)}${t.separator}${i.message}`) };
}

// The preset file as the generator writes it (<name>.json of indicator generate, Save button
// of the page): default values included, without $schema.
export function presetJson(preset: Preset): string {
  const { $schema, ...used } = preset;
  return JSON.stringify(used, null, 2) + '\n';
}

export function presetJsonSchema(): Record<string, unknown> {
  return {
    title: d.title,
    ...z.toJSONSchema(presetSchema, { io: 'input', target: 'draft-2020-12' }),
  };
}
