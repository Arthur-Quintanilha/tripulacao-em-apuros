const PLAYER_FRAMES = [
  { id: 0, x: 214, y: 26, width: 105, height: 260 },
  { id: 1, x: 359, y: 26, width: 76, height: 260 },
  { id: 2, x: 490, y: 26, width: 77, height: 259 },
  { id: 3, x: 627, y: 26, width: 85, height: 260 },
  { id: 4, x: 29, y: 520, width: 140, height: 218 },
  { id: 5, x: 218, y: 520, width: 137, height: 219 }
];

function registerPlayerFrames(texture) {
  ensureSheetFrames(texture, PLAYER_FRAMES);
}

function ensurePlayerFrames(texture) {
  return ensureSheetFrames(texture, PLAYER_FRAMES);
}
