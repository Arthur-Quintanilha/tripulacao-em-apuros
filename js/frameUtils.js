function ensureSheetFrames(texture, frameDefs) {
  if (!texture) return false;

  const needsRebuild = frameDefs.some((f) => {
    if (!texture.has(f.id)) return true;
    const frame = texture.get(f.id);
    return !frame || !frame.sourceSize;
  });

  if (needsRebuild) {
    frameDefs.forEach((f) => {
      if (texture.has(f.id)) texture.remove(f.id);
      texture.add(f.id, 0, f.x, f.y, f.width, f.height);
    });
  } else {
    frameDefs.forEach((f) => {
      if (!texture.has(f.id)) {
        texture.add(f.id, 0, f.x, f.y, f.width, f.height);
      }
    });
  }

  return frameDefs.every((f) => {
    const frame = texture.get(f.id);
    return frame && frame.sourceSize;
  });
}
