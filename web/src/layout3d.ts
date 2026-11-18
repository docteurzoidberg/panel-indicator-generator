// Layout of the pieces in the 3D viewer, by piece name (core pieceInfo): offset of each
// piece along the depth when exploded (mm, towards the wall), as in the mock-up's
// eclate.html, and the piece lit by the simulated light.
export const EXPLODE: Record<string, number> = {
  frame: -14, legend_mask: -7.5, legend_veil: -4.5, test_panel: 0, box: 16, cover: 36,
};
export const LIT_PART = 'legend_veil';
