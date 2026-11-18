// Texts of the page, in English (default) and French; the core's messages (checks, summary,
// preset errors) come from the core in the same language. The language is the one chosen
// with the header switch (kept in this browser), else the browser's first English or French
// one, else English.
import type { Lang } from '@indicator/core';

export type { Lang };

// The page's main script stays without the core: its own number notation, like the core's.
const decimal = (lang: Lang, v: number, digits: number) => (lang === 'fr' ? v.toFixed(digits).replace('.', ',') : v.toFixed(digits));

const KEY = 'lang';

export function initialLang(): Lang {
  try {
    const kept = localStorage.getItem(KEY);
    if (kept === 'en' || kept === 'fr') return kept;
  } catch { /* storage unavailable: the browser's language */ }
  for (const l of navigator.languages ?? [navigator.language]) {
    const base = l.toLowerCase().split('-')[0];
    if (base === 'en' || base === 'fr') return base;
  }
  return 'en';
}

export function keepLang(lang: Lang): void {
  try { localStorage.setItem(KEY, lang); } catch { /* private window: this page only */ }
}

// Texts of index.html, by data-i18n key (text), data-i18n-html (markup), data-i18n-title
// and data-i18n-label (aria-label).
const en = {
  title: 'Panel indicator',
  description: 'Generator of 3D-printed flush-mount backlit indicators: settings, checks, preview and print files, in the browser.',
  eyebrow: 'Generator · preset v1',
  lead: 'A backlit legend, in a frame screwed onto a panel cutout. Settings are checked on every input; the print files are computed in the browser.',
  language: 'Language',
  darkTheme: 'Dark theme',
  themeTitle: 'Dark or light theme (the system’s by default)',
  open: 'Open',
  openTitle: 'Open a .json preset (or drop it on the page)',
  examples: 'Examples',
  save: 'Save',
  saveTitle: 'Save the preset (the .json of indicator generate)',
  link: 'Link',
  linkTitle: 'Copy the page link, which carries the preset',
  settings: 'Settings',
  fileName: 'File name',
  fileNameHint: 'Empty: taken from the text.',
  mounting: 'Mounting',
  preview: 'Preview',
  view: 'View',
  front: 'Front view',
  frontView: 'Front view of the indicator',
  hint3d: 'Drag: rotate · wheel: zoom · right click: pan',
  light: 'Light',
  legendLight: 'Light of the legend',
  off: 'Off',
  steady: 'Steady',
  breathe: 'Breathing',
  blink: 'Blinking',
  lightColor: 'Light color (simulation, not in the preset)',
  white: 'White',
  amber: 'Amber',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  otherColor: 'Other color',
  assembled: 'assembled',
  exploded: 'exploded',
  spacing: 'Spacing of the pieces',
  viewpoint: 'Viewpoint',
  iso: 'Three-quarter',
  frontSide: 'Front',
  side: 'Side',
  back: 'Back',
  piecesShown: 'Pieces shown',
  checks: 'Checks',
  download: 'Download',
  downloadText: 'Slicable 3MF, STL, STEP for integration and the preset: the files of <code>indicator generate</code>, in one zip.',
  downloadZip: 'Download the zip',
  engineStarting: 'Starting the engine…',
  signature: 'vibe coded with the <span class="emoji">🍑</span> by DrZoid',
  sources: '<a href="https://github.com/docteurzoidberg/panel-indicator-generator">Sources on GitHub</a> · code under <a href="https://www.wtfpl.net/">WTFPL</a>, without warranty',
  offline: 'Offline',
  offlineText: 'Once loaded, the page works without network: everything is computed in the browser.',
  licenses: 'Licenses',
  licenseOcc: 'Computation of the pieces: <a href="https://github.com/Open-Cascade-SAS/OCCT">Open CASCADE</a>, LGPL 2.1, in WebAssembly in a separate file (<a href="https://github.com/sgenoud/replicad/tree/main/packages/replicad-opencascadejs">sources</a>)',
  licenseFonts: 'Barlow Condensed and B612 fonts: SIL Open Font License 1.1',
  licenseAll: 'All the libraries and their texts: <a href="licenses.txt">licenses.txt</a>',
  drop: 'Drop the preset (.json)',
};
type Static = typeof en;

const fr: Static = {
  title: 'Témoin lumineux',
  description: 'Générateur de témoins lumineux encastrables imprimés en 3D : réglages, contrôles, aperçu et fichiers d’impression, dans le navigateur.',
  eyebrow: 'Générateur · preset v1',
  lead: 'Une légende éclairée par l’arrière, dans un cadre vissé sur la découpe d’un panneau. Les réglages se contrôlent à chaque saisie ; les fichiers d’impression sont calculés dans le navigateur.',
  language: 'Langue',
  darkTheme: 'Thème sombre',
  themeTitle: 'Thème sombre ou clair (par défaut, celui du système)',
  open: 'Ouvrir',
  openTitle: 'Ouvrir un preset .json (ou le glisser sur la page)',
  examples: 'Exemples',
  save: 'Enregistrer',
  saveTitle: 'Enregistrer le preset (le .json de indicator generate)',
  link: 'Lien',
  linkTitle: 'Copier le lien de la page, qui porte le preset',
  settings: 'Réglages',
  fileName: 'Nom des fichiers',
  fileNameHint: 'Vide : tiré du texte.',
  mounting: 'Montage',
  preview: 'Aperçu',
  view: 'Vue',
  front: 'Face',
  frontView: 'Vue de face du témoin',
  hint3d: 'Glisser : tourner · molette : zoom · clic droit : déplacer',
  light: 'Lumière',
  legendLight: 'Lumière de la légende',
  off: 'Éteinte',
  steady: 'Fixe',
  breathe: 'Respiration',
  blink: 'Clignotement',
  lightColor: 'Couleur de la lumière (simulation, hors preset)',
  white: 'Blanc',
  amber: 'Ambre',
  red: 'Rouge',
  green: 'Vert',
  blue: 'Bleu',
  otherColor: 'Autre couleur',
  assembled: 'assemblé',
  exploded: 'éclaté',
  spacing: 'Écartement des pièces',
  viewpoint: 'Point de vue',
  iso: 'Trois-quarts',
  frontSide: 'De face',
  side: 'Profil',
  back: 'Dos',
  piecesShown: 'Pièces affichées',
  checks: 'Contrôles',
  download: 'Télécharger',
  downloadText: '3MF à trancher, STL, STEP pour l’intégration et le preset : les fichiers de <code>indicator generate</code>, en un zip.',
  downloadZip: 'Télécharger le zip',
  engineStarting: 'Démarrage du moteur…',
  signature: 'vibe codé avec le <span class="emoji">🍑</span> par DrZoid',
  sources: '<a href="https://github.com/docteurzoidberg/panel-indicator-generator">Sources sur GitHub</a> · code sous <a href="https://www.wtfpl.net/">WTFPL</a>, sans garantie',
  offline: 'Hors ligne',
  offlineText: 'Une fois chargée, la page marche sans réseau : tout se calcule dans le navigateur.',
  licenses: 'Licences',
  licenseOcc: 'Calcul des pièces : <a href="https://github.com/Open-Cascade-SAS/OCCT">Open CASCADE</a>, LGPL 2.1, en WebAssembly dans un fichier à part (<a href="https://github.com/sgenoud/replicad/tree/main/packages/replicad-opencascadejs">sources</a>)',
  licenseFonts: 'Polices Barlow Condensed et B612 : SIL Open Font License 1.1',
  licenseAll: 'Toutes les bibliothèques et leurs textes : <a href="licenses.txt">licenses.txt</a>',
  drop: 'Déposer le preset (.json)',
};

// Texts written by the scripts of the page.
interface Dynamic {
  seconds: (ms: number) => string;
  separator: string;   // between a label and its text: ": " or " : "
  list: string;        // between the items of a list: "; " or " ; "
  required: string;
  mountingPending: string;
  faceShown: string; faceStale: string; faceNone: string;
  computing3d: string; view3d: (recomputed?: string) => string; view3dStale: string; view3dNone: string; view3dUnavailable: (why: string) => string;
  engineReady: (s: string) => string; engineFailed: (why: string) => string;
  generating: string; generated: (zip: string, files: number, s: string) => string; nothingGenerated: string; error: (why: string) => string;
  notOpened: (file: string, why: string) => string; objectExpected: string; opened: (file: string) => string;
  example: (name: string) => string; saved: (file: string) => string; linkCopied: string; linkInBar: string; linkPreset: string;
  checksFailed: (why: string) => string;
  // Form: rows (label, preset keys, unit), labels of the fields sharing a row, options.
  rows: [string, string[], string?][];
  labels: Record<string, string>;
  options: Record<string, string>;
  hints?: Record<string, string>;   // else the schema's descriptions (English)
  pieces: Record<string, string>;   // printed pieces, by the core's name
}

const enDynamic: Dynamic = {
  seconds: (ms) => `${decimal('en', ms / 1000, 1)} s`,
  separator: ': ',
  list: '; ',
  required: 'required',
  mountingPending: 'Mounting shows once the checks pass.',
  faceShown: 'Front view, to scale.',
  faceStale: 'Last valid preview: fix the flagged settings.',
  faceNone: 'No preview: fix the flagged settings.',
  computing3d: 'Computing the 3D view…',
  view3d: (s) => (s ? `3D view, recomputed in ${s}.` : '3D view.'),
  view3dStale: 'Last valid 3D view: fix the flagged settings.',
  view3dNone: 'No 3D view: fix the flagged settings.',
  view3dUnavailable: (why) => `3D view unavailable: ${why}`,
  engineReady: (s) => `Engine ready (${s}).`,
  engineFailed: (why) => `The engine did not start: ${why}`,
  generating: 'Generating the files…',
  generated: (zip, n, s) => `${zip}: ${n} files in ${s}.`,
  nothingGenerated: 'Nothing generated: the preset has errors.',
  error: (why) => `Error: ${why}`,
  notOpened: (file, why) => `${file} not opened: ${why}`,
  objectExpected: 'JSON object expected',
  opened: (file) => `Opened: ${file}`,
  example: (name) => `Example: ${name}`,
  saved: (file) => `Saved: ${file}, in the downloads.`,
  linkCopied: 'Link copied: it reopens this preset.',
  linkInBar: 'Link in the address bar: copy it to reopen this preset.',
  linkPreset: 'Preset from the link',
  checksFailed: (why) => `checks impossible: ${why}`,
  rows: [
    ['Text', ['legend.text']],
    ['Legend background', ['legend.background']],
    ['Window', ['window.width', 'window.height'], 'mm'],
    ['Frame', ['frame.width', 'frame.height'], 'mm'],
    ['Frame color', ['frame.color']],
    ['Panel', ['panel.thickness'], 'mm'],
    ['Screw head', ['mount.head']],
    ['Wire exit', ['light.wireExit']],
  ],
  labels: {
    'window.width': 'Window width', 'window.height': 'Window height',
    'frame.width': 'Frame width', 'frame.height': 'Frame height',
    'panel.thickness': 'Panel thickness',
  },
  options: { countersunk: 'countersunk', socket: 'socket head', left: 'on the left', right: 'on the right' },
  pieces: {
    frame: 'frame', legend_mask: 'mask', legend_veil: 'letters and veil', box: 'box', cover: 'cover',
    test_panel: 'test panel (optional)',
  },
};

const frDynamic: Dynamic = {
  seconds: (ms) => `${decimal('fr', ms / 1000, 1)} s`,
  separator: ' : ',
  list: ' ; ',
  required: 'obligatoire',
  mountingPending: 'Le montage s’affiche quand les contrôles passent.',
  faceShown: 'Vue de face, à l’échelle.',
  faceStale: 'Dernier aperçu valide : corriger les réglages signalés.',
  faceNone: 'Pas d’aperçu : corriger les réglages signalés.',
  computing3d: 'Calcul de la vue 3D…',
  view3d: (s) => (s ? `Vue 3D, recalculée en ${s}.` : 'Vue 3D.'),
  view3dStale: 'Dernière vue 3D valide : corriger les réglages signalés.',
  view3dNone: 'Pas de vue 3D : corriger les réglages signalés.',
  view3dUnavailable: (why) => `Vue 3D indisponible : ${why}`,
  engineReady: (s) => `Moteur prêt (${s}).`,
  engineFailed: (why) => `Le moteur n’a pas démarré : ${why}`,
  generating: 'Génération des fichiers…',
  generated: (zip, n, s) => `${zip} : ${n} fichiers en ${s}.`,
  nothingGenerated: 'Rien n’est généré : le preset a des erreurs.',
  error: (why) => `Erreur : ${why}`,
  notOpened: (file, why) => `${file} non ouvert : ${why}`,
  objectExpected: 'objet JSON attendu',
  opened: (file) => `Ouvert : ${file}`,
  example: (name) => `Exemple : ${name}`,
  saved: (file) => `Enregistré : ${file}, dans les téléchargements.`,
  linkCopied: 'Lien copié : il rouvre ce preset.',
  linkInBar: 'Lien dans la barre d’adresse : le copier pour rouvrir ce preset.',
  linkPreset: 'Preset du lien',
  checksFailed: (why) => `contrôles impossibles : ${why}`,
  rows: [
    ['Texte', ['legend.text']],
    ['Fond de la légende', ['legend.background']],
    ['Fenêtre', ['window.width', 'window.height'], 'mm'],
    ['Cadre', ['frame.width', 'frame.height'], 'mm'],
    ['Couleur du cadre', ['frame.color']],
    ['Panneau', ['panel.thickness'], 'mm'],
    ['Tête des vis', ['mount.head']],
    ['Sortie des fils', ['light.wireExit']],
  ],
  labels: {
    'window.width': 'Largeur de la fenêtre', 'window.height': 'Hauteur de la fenêtre',
    'frame.width': 'Largeur du cadre', 'frame.height': 'Hauteur du cadre',
    'panel.thickness': 'Épaisseur du panneau',
  },
  options: { countersunk: 'fraisée', socket: 'cylindrique', left: 'à gauche', right: 'à droite' },
  hints: {
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
  },
  pieces: {
    frame: 'cadre', legend_mask: 'masque', legend_veil: 'lettres et voile', box: 'boîte', cover: 'fond',
    test_panel: 'panneau d’essai (au choix)',
  },
};

export type Texts = Static & Dynamic;
export const TEXTS: Record<Lang, Texts> = { en: { ...en, ...enDynamic }, fr: { ...fr, ...frDynamic } };

// Static texts of the page (index.html) in the language.
export function applyTexts(lang: Lang): void {
  const t = TEXTS[lang] as unknown as Record<string, string>;
  document.documentElement.lang = lang;
  document.title = t.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.description);
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) el.textContent = t[el.dataset.i18n!];
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-html]')) el.innerHTML = t[el.dataset.i18nHtml!];
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-title]')) el.title = t[el.dataset.i18nTitle!];
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-label]')) el.setAttribute('aria-label', t[el.dataset.i18nLabel!]);
}
