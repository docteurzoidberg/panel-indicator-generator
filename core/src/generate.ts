// Core entry point for the command line and the page: checks of a preset (checks.ts),
// summary (hardware, legend), generation of the files.
import type { Font } from 'opentype.js/dist/opentype.mjs';
import { parsePreset, type Preset } from './preset.ts';
import { dimensions, M3, screwLength, STRIP, type Dimensions } from './dims.ts';
import { layoutLegend, LegendError, type LegendLayout } from './legend.ts';
import { decimal, MESSAGES, short, type Lang } from './messages.ts';
import { buildParts } from './parts.ts';
import { exportFiles } from './exports.ts';
import { legendChecks, lightChecks, mountChecks, type Check } from './checks.ts';

export type { Check };

export interface Summary {
  text: string;
  capHeight: number;                 // mm
  margin: number;                    // mm, between the text and the window edge
  window: [number, number];
  frame: [number, number];
  panel: number;
  cutout: { size: [number, number]; holes: { count: 2; diameter: number; spacing: number } };   // to drill in the panel, centered on the window
  screws: { count: 2; size: 'M3'; length: number; head: Preset['mount']['head'] };
  inserts: { count: 2; size: 'M3'; hole: [number, number] };   // hole Ø and depth
  leds: { count: number; stripLength: number; ledsPerMeter: number; wireExit: Preset['light']['wireExit'] };
}

export interface CheckResult {
  ok: boolean;                       // no error
  checks: Check[];
  preset?: Preset;
  summary?: Summary;
}

const um = (v: number) => Math.round(v * 1000) / 1000;   // summary dimensions, to the µm

// Checks a preset (JSON already read), messages in the language; stops at the first family
// of errors. Dimensions and legend are returned as soon as the preset is valid, even if
// mounting fails (preview).
export function checkPreset(data: unknown, font: Font, lang: Lang = 'en'): CheckResult & { dims?: Dimensions; layout?: LegendLayout } {
  const t = MESSAGES[lang], mm = (v: number, digits = 2) => decimal(lang, v, digits);
  const r = parsePreset(data, lang);
  if (!r.ok) return { ok: false, checks: r.errors.map((message) => ({ level: 'error', code: 'preset', message })) };
  const preset = r.preset, d = dimensions(preset);
  const checks: Check[] = [];
  let layout: LegendLayout | undefined;
  try {
    layout = layoutLegend(preset.legend.text, font, { width: d.windowW, height: d.windowH });
    checks.push({ level: 'ok', code: 'legend', message: t.legend(preset.legend.text, mm(layout.capHeight), mm(layout.room)) });
    checks.push(...legendChecks(d, layout, lang));
  } catch (e) {
    if (!(e instanceof LegendError)) throw e;
    const why = e.reason === 'missingGlyphs' ? t.missingGlyphs(e.chars.join(' ')) : t.noInk;
    checks.push({ level: 'error', code: 'legend', message: t.legendError(why) });
  }
  checks.push(...mountChecks(d, lang));
  const length = screwLength(d);
  checks.push(length === null
    ? { level: 'error', code: 'screw', message: t.noScrew(mm(d.panelT, 1)) }
    : { level: 'ok', code: 'screw', message: t.screw(length, preset.mount.head) });
  checks.push(...lightChecks(d, lang));
  const ok = checks.every((c) => c.level !== 'error');
  if (!ok || !layout || length === null) return { ok, checks, preset, dims: d, layout };
  const summary: Summary = {
    text: preset.legend.text, capHeight: um(layout.capHeight), margin: um(layout.room),
    window: [d.windowW, d.windowH], frame: [d.frameW, d.frameH], panel: d.panelT,
    cutout: { size: [um(d.cutW), um(d.cutH)], holes: { count: 2, diameter: M3.holeD, spacing: um(d.screwSpacing) } },
    screws: { count: 2, size: 'M3', length, head: preset.mount.head },
    inserts: { count: 2, size: 'M3', hole: [4, d.insertHoleL] },
    leds: { count: d.ledCount, stripLength: um(d.stripL), ledsPerMeter: STRIP.ledsPerMeter, wireExit: preset.light.wireExit },
  };
  return { ok, checks, preset, summary, dims: d, layout };
}

// Files of the indicator <name> (file name, bytes); OpenCascade must be started.
export async function generate(name: string, data: unknown, font: Font, lang: Lang = 'en'): Promise<CheckResult & { files?: Record<string, Uint8Array> }> {
  const { dims, layout, ...result } = checkPreset(data, font, lang);
  if (!result.ok || !dims || !layout || !result.preset) return result;
  return { ...result, files: await exportFiles(name, result.preset, buildParts(dims, layout)) };
}

// Summary as lines (label, text), the same in the command line and the page.
export function summaryLines(s: Summary, lang: Lang = 'en'): [string, string][] {
  const t = MESSAGES[lang].summary, n = (v: number) => short(lang, v);
  return [
    t.screws(s.screws.count, s.screws.size, s.screws.length, s.screws.head, s.inserts.count, [n(s.inserts.hole[0]), n(s.inserts.hole[1])]),
    t.lighting(s.leds.count, s.leds.ledsPerMeter, n(s.leds.stripLength), s.leds.wireExit),
    t.dimensions([n(s.window[0]), n(s.window[1])], [n(s.frame[0]), n(s.frame[1])], n(s.panel)),
    t.panel([n(s.cutout.size[0]), n(s.cutout.size[1])], s.cutout.holes.count, n(s.cutout.holes.diameter), n(s.cutout.holes.spacing)),
  ];
}
