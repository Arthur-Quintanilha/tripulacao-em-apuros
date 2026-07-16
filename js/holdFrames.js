function registerHoldFrame(textureKey, texture) {
  const source = texture.getSourceImage();
  const width = source.width;
  const height = source.height;

  if (texture.has('trimmed')) {
    texture.remove('trimmed');
  }

  texture.add('trimmed', 0, 0, 0, width, height);
}
