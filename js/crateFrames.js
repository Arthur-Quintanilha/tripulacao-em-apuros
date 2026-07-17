const CRATE_FRAMES = [
  { id: 0, x: 54, y: 41, width: 142, height: 155 },
  { id: 1, x: 225, y: 38, width: 205, height: 155 },
  { id: 2, x: 457, y: 38, width: 226, height: 154 },
  { id: 3, x: 679, y: 38, width: 153, height: 153 },
  { id: 4, x: 54, y: 215, width: 143, height: 175 },
  { id: 5, x: 231, y: 215, width: 203, height: 167 },
  { id: 6, x: 471, y: 215, width: 212, height: 175 },
  { id: 7, x: 679, y: 215, width: 164, height: 183 },
  { id: 8, x: 48, y: 406, width: 156, height: 162 },
  { id: 9, x: 244, y: 407, width: 171, height: 163 },
  { id: 10, x: 465, y: 404, width: 163, height: 167 },
  { id: 11, x: 679, y: 430, width: 135, height: 133 }
];

function registerCrateFrames(texture) {
  ensureSheetFrames(texture, CRATE_FRAMES);
}

function getCrateFrame(frameId = 0) {
  return CRATE_FRAMES.find((f) => f.id === frameId) || CRATE_FRAMES[0];
}
