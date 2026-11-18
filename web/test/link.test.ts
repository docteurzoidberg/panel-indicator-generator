// Page link: the preset makes the round trip, and what is not a valid preset comes back as
// is, to give the same errors as indicator check.
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { presetJsonSchema } from '@indicator/core';
import { rows, type SchemaNode } from '../src/fields.ts';
import { fromHash, toHash } from '../src/link.ts';

const layout = rows(presetJsonSchema() as SchemaNode, 'en');
const { $schema, ...alarm } = JSON.parse(readFileSync(new URL('../../presets/alarm.json', import.meta.url), 'utf8'));

test('alarm: same preset and same name after the link, without $schema', () => {
  const hash = toHash({ $schema, ...alarm }, 'alarm');
  expect(hash).not.toContain('schema');
  expect(hash).toContain('frame.width=47&frame.height=18&frame.color=%234b5320');
  expect(fromHash(`#${hash}`, layout)).toEqual({ preset: alarm, name: 'alarm' });
});

test('any text, no name', () => {
  const preset = { ...alarm, legend: { text: 'START & STOP = 1 # 2 % É', background: '#111111' } };
  expect(fromHash(toHash(preset, ''), layout)).toEqual({ preset, name: '' });
});

test('invalid values kept as they are', () => {
  const preset = { version: 2, legend: { text: '42' }, window: { width: 'large' }, frame: { widht: '40' }, panel: { thickness: -2 } };
  expect(fromHash(toHash(preset, ''), layout)?.preset).toEqual(preset);
});

test('fragment without a preset', () => {
  expect(fromHash('', layout)).toBeUndefined();
  expect(fromHash('#name=sample', layout)).toBeUndefined();
});
