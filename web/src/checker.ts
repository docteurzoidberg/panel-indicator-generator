// Checks worker: the core without OpenCascade (preset, legend, checks, summary), in a few
// tens of milliseconds, enough to keep up with typing; also returns the drawing of the
// front view.
import { checkPreset, parseFont, presetJson, summaryLines } from '@indicator/core';
import fontUrl from '../../fonts/BarlowCondensed-SemiBold.ttf?url';   // LEGEND.fontFile
import { faceModel } from './face-model.ts';
import type { FromChecker, ToChecker } from './protocol.ts';
import { TEXTS } from './texts.ts';

const font = fetch(fontUrl).then((r) => r.arrayBuffer()).then(parseFont);

self.onmessage = async ({ data }: MessageEvent<ToChecker>) => {
  let reply: FromChecker;
  try {
    const r = checkPreset(data.preset, await font, data.lang);
    reply = {
      id: data.id, ok: r.ok, checks: r.checks,
      summary: r.summary && summaryLines(r.summary, data.lang),
      face: r.preset && r.dims && faceModel(r.preset, r.dims, r.layout),
      json: r.preset && presetJson(r.preset),
    };
  } catch (e) {
    reply = { id: data.id, ok: false, checks: [{ level: 'error', code: 'page', message: TEXTS[data.lang].checksFailed(String(e)) }] };
  }
  self.postMessage(reply);
};
