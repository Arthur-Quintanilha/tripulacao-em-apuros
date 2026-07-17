const PLAYER_TOP_FRAMES = [
  { id: 0, x: 89, y: 33, width: 85, height: 120 },
  { id: 1, x: 215, y: 33, width: 87, height: 122 },
  { id: 2, x: 342, y: 35, width: 84, height: 123 },
  { id: 3, x: 465, y: 34, width: 84, height: 124 },
  { id: 4, x: 89, y: 183, width: 72, height: 118 },
  { id: 5, x: 217, y: 185, width: 75, height: 116 },
  { id: 6, x: 346, y: 183, width: 77, height: 118 },
  { id: 7, x: 471, y: 184, width: 74, height: 117 },
  { id: 8, x: 89, y: 338, width: 82, height: 122 },
  { id: 9, x: 214, y: 334, width: 83, height: 125 },
  { id: 10, x: 340, y: 334, width: 84, height: 126 },
  { id: 11, x: 466, y: 338, width: 83, height: 122 },
  { id: 12, x: 98, y: 490, width: 71, height: 114 },
  { id: 13, x: 222, y: 490, width: 72, height: 114 },
  { id: 14, x: 343, y: 487, width: 77, height: 116 },
  { id: 15, x: 475, y: 490, width: 70, height: 114 }
];

function registerPlayerTopFrames(texture) {
  ensureSheetFrames(texture, PLAYER_TOP_FRAMES);
}

function ensurePlayerTopFrames(texture) {
  return ensureSheetFrames(texture, PLAYER_TOP_FRAMES);
}
