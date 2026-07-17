const BARREL_COLS = 4;
const BARREL_ROWS = 4;
const BARREL_FRAME_W = 227;
const BARREL_FRAME_H = 151;

function getBarrelFrameDefs() {
  const defs = [];
  for (let id = 0; id < BARREL_COLS * BARREL_ROWS; id++) {
    const col = id % BARREL_COLS;
    const row = Math.floor(id / BARREL_COLS);
    defs.push({
      id,
      x: col * BARREL_FRAME_W,
      y: row * BARREL_FRAME_H,
      width: BARREL_FRAME_W,
      height: BARREL_FRAME_H
    });
  }
  return defs;
}

function registerBarrelFrames(texture) {
  ensureSheetFrames(texture, getBarrelFrameDefs());
}

function isHorizontalBarrel(frameId) {
  return frameId >= 8;
}
