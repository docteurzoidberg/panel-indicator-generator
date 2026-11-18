// The indicator command, run for real: exit codes, messages, written files.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const BIN = new URL('../bin/indicator.ts', import.meta.url).pathname;
const ALARM = new URL('../../presets/alarm.json', import.meta.url).pathname;
const run = (...args: string[]) => spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8' });

function presetFile(change: (p: any) => void): string {
  const p = JSON.parse(readFileSync(ALARM, 'utf8'));
  delete p.$schema;
  change(p);
  const f = join(mkdtempSync(join(tmpdir(), 'indicator-')), 'sample.json');
  writeFileSync(f, JSON.stringify(p));
  return f;
}

describe('indicator check', () => {
  test('alarm: valid, hardware summary', () => {
    const r = run('check', ALARM);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('Indicator “alarm”');
    expect(r.stdout).toContain('✓ M3 × 10 screws (countersunk head, ISO 10642)');
    expect(r.stdout).toContain('  lighting: 4 WS2812B strip LEDs at 144 LEDs/m');
    expect(r.stdout).toContain('  panel: cutout 29.8 × 13.3, 2 holes Ø 3.4, 37 mm apart');
  });

  test('--json for the skill', () => {
    const out = JSON.parse(run('check', ALARM, '--json').stdout);
    expect(out).toMatchObject({ name: 'alarm', ok: true, summary: { screws: { length: 10 }, leds: { count: 4 }, cutout: { size: [29.8, 13.3], holes: { spacing: 37 } } } });
  });

  test.each([
    ['invalid preset', (p: any) => { p.mount.screw = 'M2.5'; }, '✗ mount: Unrecognized key: "screw"'],
    ['missing character', (p: any) => { p.legend.text = 'A☃B'; }, '✗ legend: characters missing from the font: ☃'],
    ['panel too thick', (p: any) => { p.panel.thickness = 30; }, '✗ no standard M3 screw fits a 30.0 mm panel'],
  ])('%s: exit code 1', (_, change, message) => {
    const r = run('check', presetFile(change));
    expect(r.status).toBe(1);
    expect(r.stdout).toContain(message);
  });

  test('missing file: exit code 1; bad usage: exit code 2', () => {
    expect(run('check', '/nulle/part.json').status).toBe(1);
    expect(run('frobnicate', ALARM).status).toBe(2);
    expect(run('check').status).toBe(2);
  });
});

test('indicator generate: 12 files in export/ next to the preset', () => {
  const f = presetFile((p) => { p.legend.text = 'CAFÉ'; });
  const r = run('generate', f);
  expect(r.status, r.stderr).toBe(0);
  const dir = join(f, '..', 'export');
  expect(readdirSync(dir)).toHaveLength(12);
  expect(readdirSync(dir)).toContain('sample_legend.3mf');
}, 60000);
