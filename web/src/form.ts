// Settings form, built from the rows of fields.ts: fills in and reads back a preset, and
// shows the preset errors under their field ("path: message" lines from the core, "path :
// message" in French). Its texts follow the page's language (relabel). A value
// a field cannot show (color "red", unknown option) is kept as is until that field is
// edited: its error stays, nothing is changed silently.
import type { Field, Row } from './fields.ts';

// Texts of the form in the page's language.
export interface FormTexts { required: string; separator: string; list: string }

type Input = HTMLInputElement | HTMLSelectElement;
interface Entry { field: Field; input: Input; error: HTMLElement; sync?: (shown?: string) => void; kept?: unknown }

const get = (o: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined), o);

// Preset error line: path and message (": " or " : " between them).
const errorLine = (line: string) => line.match(/^(\S+?) ?: ([\s\S]*)$/);

function control(f: Field): Input {
  if (f.kind === 'select') {
    const s = document.createElement('select');
    for (const [value, label] of f.options ?? []) s.append(new Option(label, value));
    return s;
  }
  const i = document.createElement('input');
  i.type = f.kind;
  if (f.kind === 'number') Object.assign(i, { min: '0', step: '0.1', inputMode: 'decimal' });
  if (f.kind === 'text') Object.assign(i, { autocomplete: 'off', spellcheck: false });
  return i;
}

// Texts of a field: label (fields sharing a row), hint, option labels, placeholder.
function labelField(entry: Entry, shared: boolean, t: FormTexts): void {
  const { field: f, input } = entry;
  if (f.hint) input.title = f.hint;
  if (shared) input.setAttribute('aria-label', f.label);
  if (input instanceof HTMLSelectElement) for (const o of input.options) o.text = f.options?.find(([v]) => v === o.value)?.[1] ?? o.value;
  else if (f.required && f.kind === 'text') input.placeholder = t.required;
}

export function createForm(container: HTMLElement, layout: Row[], onInput: () => void, texts: FormTexts) {
  const inputs = new Map<string, Entry>();
  const rowLabels: HTMLElement[] = [];
  let t = texts;
  for (const row of layout) {
    const el = document.createElement('div');
    el.className = 'row';
    const label = document.createElement(row.fields.length > 1 ? 'span' : 'label');
    label.className = 'row-label';
    label.textContent = row.label;
    rowLabels.push(label);
    const controls = document.createElement('div');
    controls.className = 'controls';
    const error = document.createElement('p');
    error.className = 'field-error';
    error.id = `err-${row.fields[0].path}`;
    row.fields.forEach((field, k) => {
      const input = control(field);
      const entry: Entry = { field, input, error };
      input.id = `f-${field.path}`;
      input.name = field.path;
      labelField(entry, row.fields.length > 1, t);
      if (row.fields.length === 1) (label as HTMLLabelElement).htmlFor = input.id;
      input.setAttribute('aria-describedby', error.id);
      input.addEventListener('input', () => { entry.kept = undefined; onInput(); });
      if (k) controls.append(Object.assign(document.createElement('span'), { className: 'times', textContent: '×' }));
      controls.append(input);
      if (field.kind === 'color') {   // hexadecimal value next to the swatch
        const hex = Object.assign(document.createElement('output'), { className: 'hex' });
        hex.htmlFor.add(input.id);
        entry.sync = (shown = input.value) => { hex.value = shown; };
        input.addEventListener('input', () => entry.sync!());
        controls.append(hex);
      }
      inputs.set(field.path, entry);
    });
    if (row.unit) controls.append(Object.assign(document.createElement('span'), { className: 'unit', textContent: row.unit }));
    el.append(label, controls, error);
    container.append(el);
  }

  let lastErrors: string[] = [];

  const form = {
    // Rows of another language: same fields, new texts; values and focus are kept.
    relabel(next: Row[], texts: FormTexts): void {
      t = texts;
      next.forEach((row, i) => {
        rowLabels[i].textContent = row.label;
        for (const field of row.fields) {
          const entry = inputs.get(field.path)!;
          entry.field = field;
          labelField(entry, row.fields.length > 1, t);
        }
      });
      form.errors(lastErrors);
    },
    // Preset read from the form: an empty field is left out (default value, or
    // "required" in the errors).
    read(): Record<string, unknown> {
      const preset: Record<string, Record<string, unknown>> = {};
      for (const [path, { field, input, kept }] of inputs) {
        const [group, key] = path.split('.');
        preset[group] ??= {};
        if (kept !== undefined) { preset[group][key] = kept; continue; }
        const raw = input.value.trim();
        if (raw === '') continue;
        preset[group][key] = field.kind === 'number' ? Number(raw) : raw;
      }
      return { version: 1, ...preset };
    },
    // Fills in the form, without input events: the caller restarts the checks.
    fill(preset: unknown): void {
      for (const [path, entry] of inputs) {
        const value = get(preset, path) ?? entry.field.default ?? '';
        entry.input.value = String(value);
        entry.kept = entry.input.value === String(value) ? undefined : value;
        entry.sync?.(String(value));
      }
    },
    value(path: string): string {
      return inputs.get(path)?.input.value ?? '';
    },
    // Preset errors under their field (those aimed at no field stay in the list of
    // checks).
    errors(lines: string[]): void {
      lastErrors = lines;
      const byRow = new Map<HTMLElement, string[]>();
      for (const { error } of inputs.values()) byRow.set(error, []);
      const invalid = new Set<string>();
      for (const line of lines) {
        const [, path, message] = errorLine(line) ?? [];
        const target = path ? inputs.get(path) : undefined;
        if (!target) continue;
        invalid.add(path);
        byRow.get(target.error)!.push(`${target.field.label}${t.separator}${message}`);
      }
      for (const [error, messages] of byRow) error.textContent = messages.join(t.list);
      for (const [path, { input }] of inputs) input.setAttribute('aria-invalid', String(invalid.has(path)));
    },
  };
  return form;
}
