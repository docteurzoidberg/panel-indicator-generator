// v1 checks: ALARME (validated print) like the mock-up, frames too small, suggested fix,
// LEDs outside the window.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { checkPreset, type Check } from '../src/generate.ts';
import { LEGEND, parseFont } from '../src/legend.ts';

const file = (p: string) => new URL(`../../${p}`, import.meta.url);
const bytes = readFileSync(file(`fonts/${LEGEND.fontFile}`));
const font = parseFont(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const mockup = JSON.parse(readFileSync(file('core/test/ref/alarme_legende.json'), 'utf8'));

// In French, like the mock-up's messages (ref/alarme_legende.json) they are compared with.
function check(change: (p: any) => void = () => {}, lang: 'en' | 'fr' = 'fr') {
  const p = JSON.parse(readFileSync(file('core/test/ref/alarme.json'), 'utf8'));
  change(p);
  return checkPreset(p, font, lang);
}
const by = (checks: Check[], code: string) => checks.find((c) => c.code === code)!;
const levels = (checks: Check[], level: Check['level']) => checks.filter((c) => c.level === level).map((c) => c.code);

describe('ALARME, validated print', () => {
  const r = check();

  test('no error, a single warning: mask gaps', () => {
    expect(r.ok).toBe(true);
    expect(levels(r.checks, 'error')).toEqual([]);
    expect(levels(r.checks, 'warn')).toEqual(['legend.gaps']);
  });

  test('thin strokes and gaps like legende_dxf.py', () => {
    const msgs: string[] = mockup.checks.map((c: { msg: string }) => c.msg);
    expect(msgs.find((m) => m.startsWith('traits'))).toContain('aucun');
    expect(by(r.checks, 'legend.strokes').message).toContain('aucun');
    // Same areas: area (mm², 2 decimals) and x position.
    const zones = (m: string) => [...m.matchAll(/(\d+[.,]\d+) mm² en x = (-?\d+[.,]\d)/g)].map((z) => `${z[1].replace(',', '.')}@${z[2].replace(',', '.')}`).sort();
    expect(zones(by(r.checks, 'legend.gaps').message)).toEqual(zones(msgs.find((m) => m.startsWith('espaces'))!));
  });

  test('mounting: margins of the mock-up', () => {
    expect(by(r.checks, 'mount.overlap').message).toContain('2,35 mm');
    expect(by(r.checks, 'mount.bridge').message).toContain('1,90 mm');
    expect(by(r.checks, 'mount.head').message).toContain('1,45 mm');
    expect(by(r.checks, 'mount.insert').message).toContain('3,00 mm');
  });
});

describe('frame too small for the window', () => {
  test('window of 40 in a frame of 47: errors and suggested frame', () => {
    const r = check((p) => { p.window.width = 40; });
    expect(r.ok).toBe(false);
    expect(levels(r.checks, 'error')).toEqual(['mount.bridge', 'mount.head', 'mount.insert', 'mount.frame']);
    expect(by(r.checks, 'mount.frame').message).toContain('au moins 58,5 × 16,5 mm');
  });

  test('the suggested frame passes', () => {
    const r = check((p) => { p.window.width = 40; p.frame.width = 58.5; p.frame.height = 16.5; });
    expect(r.ok).toBe(true);
    expect(levels(r.checks, 'warn')).toEqual(['legend.gaps']);
  });

  test('frame too low: the cutout shows', () => {
    const r = check((p) => { p.frame.height = 14; });
    expect(levels(r.checks, 'error')).toEqual(['mount.overlap', 'mount.frame']);
  });
});

test('socket head: fits in the frame', () => {
  const r = check((p) => { p.mount.head = 'socket'; });
  expect(r.ok).toBe(true);
  expect(by(r.checks, 'mount.head').level).toBe('ok');
});

test('end LEDs outside the window: warning', () => {
  // 24.4 / 6.94 = 3.5 → 4 LEDs, whose edges go past the window.
  const r = check((p) => { p.window.width = 24.4; });
  expect(by(r.checks, 'light.leds').level).toBe('warn');
  expect(r.ok).toBe(true);
});

test('English by default: same checks, decimal point', () => {
  const p = JSON.parse(readFileSync(file('core/test/ref/alarme.json'), 'utf8'));
  const en = checkPreset(p, font), fr = check();
  expect(en.checks.map((c) => [c.code, c.level])).toEqual(fr.checks.map((c) => [c.code, c.level]));
  expect(by(en.checks, 'legend.strokes').message).toBe('strokes thinner than the nozzle (0.4 mm): none');
  expect(by(en.checks, 'mount.overlap').message).toBe('the frame overlaps the cutout by 2.35 mm (at least 1.5)');
  expect(by(en.checks, 'screw').message).toBe('M3 × 10 screws (countersunk head, ISO 10642)');
  expect(by(en.checks, 'light.leds').message).toBe('4 LEDs in the window');
});
