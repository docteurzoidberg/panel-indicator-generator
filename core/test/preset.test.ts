import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { parsePreset, presetJsonSchema, type Preset } from '../src/preset.ts';

const read = (p: string) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const alarm = () => read('../../presets/alarm.json');

function errors(change: (p: any) => void, lang: 'en' | 'fr' = 'en'): string[] {
  const p = alarm();
  change(p);
  const r = parsePreset(p, lang);
  if (r.ok) throw new Error('preset wrongly accepted');
  return r.errors;
}

function ok(data: unknown): Preset {
  const r = parsePreset(data);
  if (!r.ok) throw new Error(r.errors.join('\n'));
  return r.preset;
}

describe('valid preset', () => {
  test('the alarm example passes as is', () => {
    const p = ok(alarm());
    expect(p.frame).toEqual({ width: 47, height: 18, color: '#4b5320' });
  });

  test('only the text and the panel thickness are required', () => {
    const p = ok({ version: 1, legend: { text: 'ALARM' }, panel: { thickness: 3 } });
    expect(p).toEqual({
      ...ok(alarm()),
      $schema: undefined,
      frame: { width: 47, height: 18, color: '#111111' },
    });
  });

  test('socket head, wires on the right, colors', () => {
    const p = ok({ ...alarm(), mount: { head: 'socket' }, light: { wireExit: 'right' }, legend: { text: 'CAFÉ', background: '#ffffff' } });
    expect(p.mount.head).toBe('socket');
    expect(p.light.wireExit).toBe('right');
    expect(p.legend.background).toBe('#ffffff');
  });
});

describe('invalid preset: one "path: message" line per error', () => {
  test.each([
    ['key outside v1', (p: any) => { p.mount.screw = 'M2.5'; }, 'mount: Unrecognized key: "screw"'],
    ['misspelt key', (p: any) => { p.light.wireExits = 'left'; }, 'light: Unrecognized key: "wireExits"'],
    ['unknown head', (p: any) => { p.mount.head = 'button'; }, 'mount.head: Invalid option: expected one of "countersunk"|"socket"'],
    ['unknown wire exit', (p: any) => { p.light.wireExit = 'back'; }, 'light.wireExit: Invalid option: expected one of "left"|"right"'],
    ['missing panel thickness', (p: any) => { delete p.panel.thickness; }, 'panel.thickness: required'],
    ['missing text', (p: any) => { delete p.legend; }, 'legend: required'],
    ['negative thickness', (p: any) => { p.panel.thickness = -3; }, 'panel.thickness: Too small: expected number to be >0'],
    ['malformed color', (p: any) => { p.frame.color = 'kaki'; }, 'frame.color: color expected as #rrggbb'],
    ['2 lines', (p: any) => { p.legend.text = 'READY\nARMED'; }, 'legend.text: a single line in v1'],
    ['empty text', (p: any) => { p.legend.text = '  '; }, 'legend.text: empty text'],
    ['other version', (p: any) => { p.version = 2; }, 'version: unsupported preset version: this generator reads v1'],
  ])('%s', (_, change, message) => {
    expect(errors(change)).toContain(message);
  });

  test.each([
    ['key outside v1', (p: any) => { p.mount.screw = 'M2.5'; }, 'mount : Clé non reconnue : "screw"'],
    ['unknown head', (p: any) => { p.mount.head = 'button'; }, 'mount.head : Option invalide : une valeur parmi "countersunk"|"socket" attendue'],
    ['missing panel thickness', (p: any) => { delete p.panel.thickness; }, 'panel.thickness : obligatoire'],
    ['negative thickness', (p: any) => { p.panel.thickness = -3; }, 'panel.thickness : Trop petit : nombre doit être >0'],
    ['malformed color', (p: any) => { p.frame.color = 'kaki'; }, 'frame.color : couleur attendue au format #rrggbb'],
    ['2 lines', (p: any) => { p.legend.text = 'READY\nARMED'; }, 'legend.text : une seule ligne en v1'],
    ['empty text', (p: any) => { p.legend.text = '  '; }, 'legend.text : texte vide'],
    ['other version', (p: any) => { p.version = 2; }, 'version : version de preset non prise en charge : ce générateur lit la v1'],
  ])('in French, %s', (_, change, message) => {
    expect(errors(change, 'fr')).toContain(message);
  });

  test('not an object', () => {
    expect(parsePreset([]).ok).toBe(false);
  });
});

test('presets/schema.json is up to date (npm run schema)', () => {
  expect(read('../../presets/schema.json')).toEqual(presetJsonSchema());
});
