const BARREL_COLS = 4;
const BARREL_ROWS = 4;
const BARREL_FRAME_W = 227;
const BARREL_FRAME_H = 151;

function registerBarrelFrames(texture) {
  for (let id = 0; id < BARREL_COLS * BARREL_ROWS; id++) {
    const col = id % BARREL_COLS;
    const row = Math.floor(id / BARREL_COLS);
    if (!texture.has(id)) {
      texture.add(id, 0, col * BARREL_FRAME_W, row * BARREL_FRAME_H, BARREL_FRAME_W, BARREL_FRAME_H);
    }
  }
}

function isHorizontalBarrel(frameId) {
  return frameId >= 8;
}
