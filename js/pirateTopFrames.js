const PIRATE_TOP_FRAMES = [
  { id: 0, x: 65, y: 44, width: 91, height: 110 },
  { id: 1, x: 203, y: 44, width: 89, height: 116 },
  { id: 2, x: 342, y: 44, width: 90, height: 116 },
  { id: 3, x: 480, y: 44, width: 94, height: 116 },
  { id: 4, x: 71, y: 169, width: 71, height: 122 },
  { id: 5, x: 210, y: 169, width: 68, height: 122 },
  { id: 6, x: 352, y: 169, width: 69, height: 122 },
  { id: 7, x: 490, y: 169, width: 71, height: 122 },
  { id: 8, x: 62, y: 321, width: 91, height: 161 },
  { id: 9, x: 201, y: 321, width: 88, height: 161 },
  { id: 10, x: 340, y: 321, width: 90, height: 161 },
  { id: 11, x: 479, y: 321, width: 91, height: 161 },
  { id: 12, x: 76, y: 466, width: 68, height: 108 },
  { id: 13, x: 211, y: 466, width: 72, height: 111 },
  { id: 14, x: 353, y: 466, width: 70, height: 108 },
  { id: 15, x: 490, y: 466, width: 70, height: 108 }
];

function registerPirateTopFrames(texture) {
  ensureSheetFrames(texture, PIRATE_TOP_FRAMES);
}

function ensurePirateTopFrames(texture) {
  return ensureSheetFrames(texture, PIRATE_TOP_FRAMES);
}
