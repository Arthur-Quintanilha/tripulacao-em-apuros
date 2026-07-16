const SAILOR_FRAMES = [
  { id: 0, x: 14, y: 30, width: 213, height: 75 },
  { id: 1, x: 13, y: 139, width: 213, height: 74 }
];

function registerSailorFrames(texture) {
  SAILOR_FRAMES.forEach((f) => {
    texture.add(f.id, 0, f.x, f.y, f.width, f.height);
  });
}
