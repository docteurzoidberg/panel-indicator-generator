// Texts the core shows to the user (preset errors, checks, summary), in each supported
// language (the preset descriptions, in the published JSON Schema, are in English only). English is the default; the command line speaks English, the
// page picks its language. Numbers follow the language (decimal point or comma).
export type Lang = 'en' | 'fr';
export const LANGS: readonly Lang[] = ['en', 'fr'];

// Number to the given digits, in the language's notation.
export function decimal(lang: Lang, v: number, digits = 2): string {
  const s = v.toFixed(digits);
  return lang === 'fr' ? s.replace('.', ',') : s;
}

// Summary dimension: one digit, trailing zero dropped.
export function short(lang: Lang, v: number): string {
  return decimal(lang, v, 1).replace(/[.,]0+$/, '');
}

type Head = 'countersunk' | 'socket';
type Side = 'left' | 'right';

export interface Messages {
  // Preset: errors, as "path<sep>message" lines.
  preset: {
    separator: string; root: string; colorFormat: string; emptyText: string; oneLine: string; version: string;
    required: string; requiredAmong: (values: string) => string;
  };
  // Checks.
  spot: (area: string, x: string) => string;
  spotsMore: (shown: string, more: number) => string;
  none: string;
  strokes: (nozzle: string, spots: string) => string;
  gaps: (spots: string) => string;
  islands: (n: number) => string;
  overlap: (v: string, min: string) => string;
  bridge: (v: string, min: string) => string;
  headRoom: (head: Head, v: string, min: string) => string;
  insertWall: (v: string, min: string) => string;
  bossOut: (v: string) => string;
  minimalFrame: (window: [string, string], min: [string, string], current: [string, string]) => string;
  ledsOut: (v: string) => string;
  ledsIn: (n: number) => string;
  legend: (text: string, cap: string, room: string) => string;
  legendError: (message: string) => string;
  missingGlyphs: (chars: string) => string;
  noInk: string;
  noScrew: (panel: string) => string;
  screw: (length: number, head: Head) => string;
  // Summary lines: [label, text].
  summary: {
    screws: (count: number, size: string, length: number, head: Head, inserts: number, hole: [string, string]) => [string, string];
    lighting: (count: number, perMeter: number, strip: string, exit: Side) => [string, string];
    dimensions: (window: [string, string], frame: [string, string], panel: string) => [string, string];
    panel: (cutout: [string, string], holes: number, diameter: string, spacing: string) => [string, string];
  };
}

const en: Messages = {
  preset: {
    separator: ': ',
    root: '(preset)',
    colorFormat: 'color expected as #rrggbb',
    emptyText: 'empty text',
    oneLine: 'a single line in v1',
    version: 'unsupported preset version: this generator reads v1',
    required: 'required',
    requiredAmong: (values) => `required, one of ${values}`,
  },
  spot: (area, x) => `${area} mm² at x = ${x}`,
  spotsMore: (shown, more) => `${shown} and ${more} more`,
  none: 'none',
  strokes: (nozzle, spots) => `strokes thinner than the nozzle (${nozzle} mm): ${spots}`,
  gaps: (spots) => `mask gaps thinner than the nozzle: ${spots}`,
  islands: (n) => `${n} mask island${n > 1 ? 's' : ''}, held by the veil`,
  overlap: (v, min) => `the frame overlaps the cutout by ${v} mm (at least ${min})`,
  bridge: (v, min) => `${v} mm of panel between the cutout and each screw hole (at least ${min})`,
  headRoom: (head, v, min) => `${head === 'countersunk' ? 'countersink' : 'screw head'} ${v} mm from the edge of the frame or of the window (at least ${min})`,
  insertWall: (v, min) => `${v} mm wall between the insert and the box cavity (at least ${min})`,
  bossOut: (v) => `insert bosses ${v} mm outside the frame, behind the panel`,
  minimalFrame: (w, min, cur) => `recommended frame for a ${w[0]} × ${w[1]} window: at least ${min[0]} × ${min[1]} mm (currently ${cur[0]} × ${cur[1]})`,
  ledsOut: (v) => `outermost LEDs ${v} mm behind the frame, outside the window`,
  ledsIn: (n) => `${n} LED${n > 1 ? 's' : ''} in the window`,
  legend: (text, cap, room) => `legend “${text}”: ${cap} mm capitals, ${room} mm from the window edge`,
  legendError: (message) => `legend: ${message}`,
  missingGlyphs: (chars) => `characters missing from the font: ${chars}`,
  noInk: 'text without ink',
  noScrew: (panel) => `no standard M3 screw fits a ${panel} mm panel`,
  screw: (length, head) => `M3 × ${length} screws (${head === 'countersunk' ? 'countersunk head, ISO 10642' : 'socket head, ISO 4762'})`,
  summary: {
    screws: (count, size, length, head, inserts, hole) => ['screws', `${count} ${size} × ${length} ${head === 'countersunk' ? 'countersunk screws (ISO 10642)' : 'socket head screws (ISO 4762)'}, ${inserts} ${size} heat-set inserts (hole Ø ${hole[0]} × ${hole[1]})`],
    lighting: (count, perMeter, strip, exit) => ['lighting', `${count} WS2812B strip LEDs at ${perMeter} LEDs/m (${strip} mm piece), wires on the ${exit}, 4-wire ribbon at 1.27 pitch`],
    dimensions: (w, f, panel) => ['dimensions', `window ${w[0]} × ${w[1]}, frame ${f[0]} × ${f[1]}, panel ${panel} mm`],
    panel: (cut, holes, d, spacing) => ['panel', `cutout ${cut[0]} × ${cut[1]}, ${holes} holes Ø ${d}, ${spacing} mm apart, centered on the window`],
  },
};

const fr: Messages = {
  preset: {
    separator: ' : ',
    root: '(preset)',
    colorFormat: 'couleur attendue au format #rrggbb',
    emptyText: 'texte vide',
    oneLine: 'une seule ligne en v1',
    version: 'version de preset non prise en charge : ce générateur lit la v1',
    required: 'obligatoire',
    requiredAmong: (values) => `obligatoire, parmi ${values}`,
  },
  spot: (area, x) => `${area} mm² en x = ${x}`,
  spotsMore: (shown, more) => `${shown} et ${more} autre(s)`,
  none: 'aucun',
  strokes: (nozzle, spots) => `traits plus fins que la buse (${nozzle} mm) : ${spots}`,
  gaps: (spots) => `espaces du masque plus fins que la buse : ${spots}`,
  islands: (n) => `${n} îlot(s) de masque, tenus par le voile`,
  overlap: (v, min) => `le cadre déborde la découpe de ${v} mm (au moins ${min})`,
  bridge: (v, min) => `${v} mm de panneau entre la découpe et chaque trou de vis (au moins ${min})`,
  headRoom: (head, v, min) => `${head === 'countersunk' ? 'fraisure' : 'tête de vis'} à ${v} mm du bord du cadre ou de la fenêtre (au moins ${min})`,
  insertWall: (v, min) => `paroi de ${v} mm entre l'insert et la cavité de la boîte (au moins ${min})`,
  bossOut: (v) => `bossages des inserts hors du cadre de ${v} mm, derrière le panneau`,
  minimalFrame: (w, min, cur) => `cadre conseillé pour une fenêtre de ${w[0]} × ${w[1]} : au moins ${min[0]} × ${min[1]} mm (actuel ${cur[0]} × ${cur[1]})`,
  ledsOut: (v) => `LED extrêmes à ${v} mm derrière le cadre, hors de la fenêtre`,
  ledsIn: (n) => `${n} LED dans la fenêtre`,
  legend: (text, cap, room) => `légende « ${text} » : capitales de ${cap} mm, à ${room} mm du bord de la fenêtre`,
  legendError: (message) => `légende : ${message}`,
  missingGlyphs: (chars) => `caractères absents de la police : ${chars}`,
  noInk: 'texte sans encre',
  noScrew: (panel) => `aucune vis M3 du commerce ne convient pour un panneau de ${panel} mm`,
  screw: (length, head) => `vis M3 × ${length} (${head === 'countersunk' ? 'tête fraisée, ISO 10642' : 'tête cylindrique, ISO 4762'})`,
  summary: {
    screws: (count, size, length, head, inserts, hole) => ['vis', `${count} vis ${size} × ${length} ${head === 'countersunk' ? 'fraisées (ISO 10642)' : 'à tête cylindrique (ISO 4762)'}, ${inserts} inserts à chaud ${size} (perçage Ø ${hole[0]} × ${hole[1]})`],
    lighting: (count, perMeter, strip, exit) => ['éclairage', `${count} LED de ruban WS2812B à ${perMeter} LED/m (tronçon de ${strip} mm), fils à ${exit === 'left' ? 'gauche' : 'droite'}, nappe de 4 fils au pas de 1,27`],
    dimensions: (w, f, panel) => ['cotes', `fenêtre ${w[0]} × ${w[1]}, cadre ${f[0]} × ${f[1]}, panneau de ${panel} mm`],
    panel: (cut, holes, d, spacing) => ['panneau', `découpe ${cut[0]} × ${cut[1]}, ${holes} trous Ø ${d} à ${spacing} d'entraxe, centrés sur la fenêtre`],
  },
};

export const MESSAGES: Record<Lang, Messages> = { en, fr };
