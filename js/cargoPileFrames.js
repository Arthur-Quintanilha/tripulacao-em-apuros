const PILE_COLS = 4;
const PILE_ROWS = 2;
const PILE_SHEET_W = 910;
const PILE_SHEET_H = 607;
const PILE_FRAME_W = PILE_SHEET_W / PILE_COLS;
const PILE_FRAME_H = PILE_SHEET_H / PILE_ROWS;

function getCargoPileFrameDefs() {
  const defs = [];
  for (let id = 0; id < PILE_COLS * PILE_ROWS; id++) {
    const col = id % PILE_COLS;
    const row = Math.floor(id / PILE_COLS);
    defs.push({
      id,
      x: Math.round(col * PILE_FRAME_W),
      y: Math.round(row * PILE_FRAME_H),
      width: Math.round(PILE_FRAME_W),
      height: Math.round(PILE_FRAME_H)
    });
  }
  return defs;
}

function registerCargoPileFrames(texture) {
  ensureSheetFrames(texture, getCargoPileFrameDefs());
}

function getCargoPileFrame(frameId = 0) {
  const col = frameId % PILE_COLS;
  const row = Math.floor(frameId / PILE_COLS);
  return {
    id: frameId,
    width: Math.round(PILE_FRAME_W),
    height: Math.round(PILE_FRAME_H),
    x: Math.round(col * PILE_FRAME_W),
    y: Math.round(row * PILE_FRAME_H)
  };
}
