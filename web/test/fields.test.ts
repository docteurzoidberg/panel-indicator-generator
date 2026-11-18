// Form built from the preset schema: every setting has its field, and nothing else.
import { expect, test } from 'vitest';
import { presetJsonSchema } from '@indicator/core';
import { leaves, rows, type SchemaNode } from '../src/fields.ts';

const schema = presetJsonSchema() as SchemaNode;

test('every schema key has its field, exactly once', () => {
  const paths = rows(schema, 'en').flatMap((r) => r.fields.map((f) => f.path));
  expect(paths.sort()).toEqual([...leaves(schema).keys()].sort());
});

test('a key added to the schema without a field makes the page fail', () => {
  const more = structuredClone(schema);
  more.properties!.frame.properties!.radius = { type: 'number' };
  expect(() => rows(more, 'en')).toThrow(/without a row frame\.radius/);
});

test('types, default values and options read from the schema', () => {
  const f = Object.fromEntries(rows(schema, 'en').flatMap((r) => r.fields).map((x) => [x.path, x]));
  expect(f['legend.text']).toMatchObject({ kind: 'text', required: true });
  expect(f['panel.thickness']).toMatchObject({ kind: 'number', required: true, default: undefined });
  expect(f['window.width']).toMatchObject({ kind: 'number', required: false, default: 27 });
  expect(f['frame.color']).toMatchObject({ kind: 'color', default: '#111111' });
  expect(f['mount.head'].options).toEqual([['countersunk', 'countersunk'], ['socket', 'socket head']]);
  expect(f['window.width']).toMatchObject({ label: 'Window width', hint: 'Window width (visible part of the legend) (mm)' });
});

test('the same fields in French, with their own labels and hints', () => {
  const en = rows(schema, 'en'), fr = rows(schema, 'fr');
  expect(fr.map((r) => r.fields.map((f) => f.path))).toEqual(en.map((r) => r.fields.map((f) => f.path)));
  const f = Object.fromEntries(fr.flatMap((r) => r.fields).map((x) => [x.path, x]));
  expect(f['mount.head'].options).toEqual([['countersunk', 'fraisée'], ['socket', 'cylindrique']]);
  expect(f['window.width']).toMatchObject({ label: 'Largeur de la fenêtre', hint: 'Largeur de la fenêtre (partie visible de la légende) (mm)' });
  for (const field of fr.flatMap((r) => r.fields)) expect(field.hint, field.path).toBeTruthy();
});
