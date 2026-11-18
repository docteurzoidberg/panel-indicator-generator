// Form fields: labels and hints (shown to the user, in French) and rows of the page; type,
// default value, required flag and options come from the published JSON Schema of the
// preset (presets/schema.json, kept up to date by the core tests), whose descriptions are in
// English. A schema key without a row, or
// the reverse, makes rows() fail: a setting added to the preset cannot be missing from the
// page.
export type Kind = 'text' | 'number' | 'color' | 'select';
export interface Field { path: string; label: string; kind: Kind; required: boolean; default?: string | number; options?: [string, string][]; hint?: string }
export interface Row { label: string; unit?: string; fields: Field[] }

const ROWS: [string, string[], string?][] = [
  ['Texte', ['legend.text']],
  ['Fond de la légende', ['legend.background']],
  ['Fenêtre', ['window.width', 'window.height'], 'mm'],
  ['Cadre', ['frame.width', 'frame.height'], 'mm'],
  ['Couleur du cadre', ['frame.color']],
  ['Panneau', ['panel.thickness'], 'mm'],
  ['Tête des vis', ['mount.head']],
  ['Sortie des fils', ['light.wireExit']],
];
// Fields sharing a row: their own label (screen readers).
const LABELS: Record<string, string> = {
  'window.width': 'Largeur de la fenêtre', 'window.height': 'Hauteur de la fenêtre',
  'frame.width': 'Largeur du cadre', 'frame.height': 'Hauteur du cadre',
  'panel.thickness': 'Épaisseur du panneau',
};
const OPTIONS: Record<string, string> = {
  countersunk: 'fraisée', socket: 'cylindrique', left: 'à gauche', right: 'à droite',
};
// Hints of the fields (the schema's descriptions, in French).
const HINTS: Record<string, string> = {
  'legend.text': 'Texte de la légende, sur une ligne',
  'legend.background': 'Couleur du fond de la légende (masque opaque) (#rrggbb) ; noir par défaut',
  'window.width': 'Largeur de la fenêtre (partie visible de la légende) (mm)',
  'window.height': 'Hauteur de la fenêtre (mm)',
  'frame.width': 'Largeur du cadre (mm)',
  'frame.height': 'Hauteur du cadre (mm)',
  'frame.color': 'Couleur du cadre (#rrggbb) ; noir par défaut',
  'panel.thickness': 'Épaisseur du panneau hôte (= longueur du tube) (mm)',
  'mount.head': 'Vis M3 et inserts à chaud ; countersunk : tête fraisée, socket : tête cylindrique (ISO 4762)',
  'light.wireExit': 'Sortie des fils du ruban, vue de face',
};
// Printed pieces, by the core's name (pieceInfo).
export const PIECES: Record<string, string> = {
  frame: 'cadre', legend_mask: 'masque', legend_veil: 'lettres et voile', box: 'boîte', cover: 'fond',
  test_panel: "panneau d'essai (au choix)",
};
const SKIP = new Set(['$schema', 'version']);   // set by the page

export interface SchemaNode {
  type?: string; enum?: string[]; default?: unknown; pattern?: string; description?: string;
  properties?: Record<string, SchemaNode>; required?: string[];
}

// Leaves of the schema, as "group.key" paths.
type Leaf = Omit<SchemaNode, 'required'> & { required: boolean };

export function leaves(schema: SchemaNode): Map<string, Leaf> {
  const out = new Map<string, Leaf>();
  for (const [group, node] of Object.entries(schema.properties ?? {})) {
    if (SKIP.has(group)) continue;
    for (const [key, leaf] of Object.entries(node.properties ?? {})) {
      out.set(`${group}.${key}`, { ...leaf, required: (node.required ?? []).includes(key) });
    }
  }
  return out;
}

const kind = (n: Leaf): Kind =>
  n.enum ? 'select' : n.type === 'number' ? 'number' : n.pattern?.includes('[0-9a-fA-F]{6}') ? 'color' : 'text';

export function rows(schema: SchemaNode): Row[] {
  const all = leaves(schema);
  const placed = ROWS.flatMap(([, paths]) => paths);
  const missing = [...all.keys()].filter((p) => !placed.includes(p));
  const unknown = placed.filter((p) => !all.has(p));
  if (missing.length || unknown.length) throw new Error(`form fields to review: without a row ${missing.join(', ') || '—'}; outside the schema ${unknown.join(', ') || '—'}`);
  return ROWS.map(([label, paths, unit]) => ({
    label, unit,
    fields: paths.map((path) => {
      const n = all.get(path)!;
      return {
        path, label: LABELS[path] ?? label, kind: kind(n), required: n.required,
        default: n.default as string | number | undefined,
        options: n.enum?.map((v) => [v, OPTIONS[v] ?? v] as [string, string]),
        hint: HINTS[path] ?? n.description,
      };
    }),
  }));
}
