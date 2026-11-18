// OpenCascade worker: starts OpenCascade and the font as soon as the page loads, then
// computes on request the 3D preview of a preset (meshes cached per piece) or its files,
// delivered as a zip. Every reply carries the heap size, which never shrinks: engine-client.ts
// replaces a worker grown too big.
// OpenCascade's .wasm stays a separately served file (LGPL license).
import opencascade from 'replicad-opencascadejs';
import wasmUrl from 'replicad-opencascadejs/wasm?url';
import { getOC, setOC } from 'replicad';
import { zipSync, type Zippable } from 'fflate';
import { dimensions, generate, layoutLegend, LegendError, MESSAGES, parseFont, parsePreset, previewParts, type PreviewCache } from '@indicator/core';
import fontUrl from '../../fonts/BarlowCondensed-SemiBold.ttf?url';   // LEGEND.fontFile
import { LANG } from './lang.ts';
import type { EngineReply, FromEngine, ToEngine } from './protocol.ts';

const ZIP_DATE = new Date(1980, 0, 1);   // fixed date, like the core's 3MF: same zip for the same preset

const post = (message: FromEngine, transfer: Transferable[] = []) => self.postMessage(message, { transfer });
const heap = () => (getOC() as unknown as { wasmMemory: WebAssembly.Memory }).wasmMemory.buffer.byteLength;

const started = performance.now();
const quiet = () => {};   // OpenCascade's STEP export statistics, of no use here
const ready = Promise.all([
  opencascade({ locateFile: () => wasmUrl, print: quiet, printErr: quiet } as Parameters<typeof opencascade>[0]).then(setOC),
  fetch(fontUrl).then((r) => r.arrayBuffer()).then(parseFont),
]).then(([, font]) => font);

ready.then(
  () => post({ type: 'ready', ms: performance.now() - started }),
  (e) => post({ type: 'failed', message: String(e) }),
);

const cache: PreviewCache = new Map();

// Why a preview cannot be built, in the page's language when it is the legend's fault.
function reason(e: unknown): string {
  if (!(e instanceof LegendError)) return (e as Error).message;
  const t = MESSAGES[LANG];
  return t.legendError(e.reason === 'missingGlyphs' ? t.missingGlyphs(e.chars.join(' ')) : t.noInk);
}

type Reply = EngineReply extends infer R ? R extends unknown ? Omit<R, 'id' | 'heap'> : never : never;

async function handle(data: ToEngine): Promise<[Reply, Transferable[]]> {
  const font = await ready;
  const t0 = performance.now();
  if (data.type === 'preview') {
    const r = parsePreset(data.preset, LANG);
    if (!r.ok) return [{ type: 'preview', ok: false, message: r.errors.join('\n') }, []];
    const d = dimensions(r.preset);
    const layout = layoutLegend(r.preset.legend.text, font, { width: d.windowW, height: d.windowH });
    const { parts, built } = previewParts(r.preset, d, layout, cache);
    return [{ type: 'preview', ok: true, parts, built, ms: performance.now() - t0 }, []];
  }
  const r = await generate(data.name, data.preset, font, LANG);
  const files = r.files ?? {}, names = Object.keys(files).sort();
  const zip = r.files && zipSync(Object.fromEntries(names.map((n) => [n, [files[n], { mtime: ZIP_DATE }]])) as Zippable) as Uint8Array<ArrayBuffer>;
  return [{ type: 'generated', ok: r.ok, checks: r.checks, files: names, zip, ms: performance.now() - t0 }, zip ? [zip.buffer] : []];
}

self.onmessage = async ({ data }: MessageEvent<ToEngine>) => {
  let out: [Reply, Transferable[]];
  try {
    out = await handle(data);
  } catch (e) {
    // A preview that cannot be built (legend without ink, OpenCascade failure) says why.
    out = [data.type === 'preview' ? { type: 'preview', ok: false, message: reason(e) } : { type: 'error', message: String(e) }, []];
  }
  post({ ...out[0], id: data.id, heap: heap() } as EngineReply, out[1]);
};
