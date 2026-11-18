// The 3D viewer finds its pieces by name: every piece of the core has its offset when
// exploded, and the lit piece exists.
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { parsePreset, pieceInfo } from '@indicator/core';
import { EXPLODE, LIT_PART } from '../src/layout3d.ts';

const parsed = parsePreset(JSON.parse(readFileSync(new URL('../../presets/alarm.json', import.meta.url), 'utf8')));
if (!parsed.ok) throw new Error(parsed.errors.join('\n'));
const preset = parsed.preset;

test('the viewer tables name the pieces of the core', () => {
  const names = pieceInfo(preset).map((p) => p.name);
  expect(Object.keys(EXPLODE).sort()).toEqual([...names].sort());
  expect(names).toContain(LIT_PART);
});
