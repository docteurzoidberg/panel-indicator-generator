// v1 checks (docs/generateur.md, checks section): ok, warning or error; an error prevents
// generation. Thresholds come from the specification; walls and strokes of at least 2
// nozzle widths. Lighting uniformity awaits a model fitted on photos (later). Messages are
// in the requested language (messages.ts).
import { M3, NOZZLE, STRIP, type Dimensions } from './dims.ts';
import type { LegendLayout } from './legend.ts';
import { decimal, MESSAGES, type Lang } from './messages.ts';
import { area, centroid, difference, intersection, rectangle, thin } from './polygons.ts';

export interface Check { level: 'ok' | 'warn' | 'error'; code: string; message: string }

const WALL = 2 * NOZZLE;

// Error threshold and recommended threshold: below error, an error; below good, a warning.
function graded(code: string, value: number, error: number, good: number, message: string): Check {
  return { level: value < error ? 'error' : value < good ? 'warn' : 'ok', code, message };
}

export function legendChecks(d: Dimensions, layout: LegendLayout, lang: Lang = 'en'): Check[] {
  const t = MESSAGES[lang], mm = (v: number, digits = 2) => decimal(lang, v, digits);
  // The 4 largest areas, then their count.
  const spots = (r: ReturnType<typeof thin>) => {
    const big = [...r].sort((a, b) => area(b) - area(a));
    const shown = big.slice(0, 4).map((p) => t.spot(mm(area(p)), mm(centroid(p)[0], 1))).join(', ');
    return big.length > 4 ? t.spotsMore(shown, big.length - 4) : shown;
  };
  const strokes = thin(layout.ink, NOZZLE);
  const window = rectangle(d.windowW, d.windowH);
  const gaps = thin(difference(rectangle(d.legendW, d.legendH), layout.ink), NOZZLE).filter((p) => intersection([p], window).length);
  const checks: Check[] = [
    { level: strokes.length ? 'warn' : 'ok', code: 'legend.strokes', message: t.strokes(mm(NOZZLE, 1), strokes.length ? spots(strokes) : t.none) },
    { level: gaps.length ? 'warn' : 'ok', code: 'legend.gaps', message: t.gaps(gaps.length ? spots(gaps) : t.none) },
  ];
  if (layout.islands.length) {
    checks.push({ level: 'ok', code: 'legend.islands', message: t.islands(layout.islands.length) });
  }
  return checks;
}

function mountRules(d: Dimensions, lang: Lang): Check[] {
  const t = MESSAGES[lang], mm = (v: number, digits = 2) => decimal(lang, v, digits);
  const x = d.screwSpacing / 2;
  const overlap = Math.min(d.frameW - d.cutW, d.frameH - d.cutH) / 2;
  const bridge = x - M3.holeD / 2 - d.cutW / 2;
  const headR = (d.head === 'countersunk' ? M3.cskD : M3.socketHeadD) / 2;
  const headRoom = Math.min(d.frameW / 2 - (x + headR), d.frameH / 2 - headR, x - headR - (d.windowW / 2 + d.windowCh));
  const insertWall = x - M3.insertD / 2 - d.windowW / 2;
  const bossOut = x + d.bossD / 2 - d.frameW / 2;
  const checks = [
    graded('mount.overlap', overlap, WALL, 1.5, t.overlap(mm(overlap), mm(1.5, 1))),
    graded('mount.bridge', bridge, 0, 1.5, t.bridge(mm(bridge), mm(1.5, 1))),
    graded('mount.head', headRoom, 0, WALL, t.headRoom(d.head, mm(headRoom), mm(WALL, 1))),
    graded('mount.insert', insertWall, WALL, WALL, t.insertWall(mm(insertWall), mm(WALL, 1))),
  ];
  if (bossOut > 0) checks.push({ level: 'warn', code: 'mount.boss', message: t.bossOut(mm(bossOut)) });
  return checks;
}

// Frame (and screw spacing, centered between the window and the edge) of w × h.
const withFrame = (d: Dimensions, w: number, h: number): Dimensions => ({ ...d, frameW: w, frameH: h, screwSpacing: (d.windowW + w) / 2 });

// Smallest frame, to the half millimeter, for which the mounting rules pass without a
// warning: the fix suggested when one of them fails.
function minimalFrame(d: Dimensions): [number, number] {
  const fine = (w: number, h: number) => mountRules(withFrame(d, w, h), 'en').every((c) => c.level === 'ok');
  let w = d.windowW, h = d.windowH;
  while (!fine(w, 1000) && w < d.windowW + 100) w += 0.5;
  while (!fine(w, h) && h < d.windowH + 100) h += 0.5;
  return [w, h];
}

export function mountChecks(d: Dimensions, lang: Lang = 'en'): Check[] {
  const t = MESSAGES[lang], mm = (v: number) => decimal(lang, v, 1);
  const checks = mountRules(d, lang);
  const worst = checks.some((c) => c.level === 'error') ? 'error' : checks.some((c) => c.level === 'warn') ? 'warn' : 'ok';
  if (worst !== 'ok') {
    const [w, h] = minimalFrame(d);
    checks.push({ level: worst, code: 'mount.frame', message: t.minimalFrame([mm(d.windowW), mm(d.windowH)], [mm(w), mm(h)], [mm(d.frameW), mm(d.frameH)]) });
  }
  return checks;
}

export function lightChecks(d: Dimensions, lang: Lang = 'en'): Check[] {
  const t = MESSAGES[lang];
  const out = d.clipX + STRIP.ledSize / 2 - d.windowW / 2;
  return [out > 0
    ? { level: 'warn', code: 'light.leds', message: t.ledsOut(decimal(lang, out)) }
    : { level: 'ok', code: 'light.leds', message: t.ledsIn(d.ledCount) }];
}
