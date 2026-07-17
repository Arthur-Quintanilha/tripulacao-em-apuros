const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game-container',
  backgroundColor: '#0a0a12',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: [LoadingScene, MenuScene, BootScene, HoldScene, DeckScene, GameOverScene, VictoryScene]
};

const game = new Phaser.Game(config);
GameScale.init(game);
TouchControls.init();

document.addEventListener('click', () => GameAudio.init(), { once: true });
document.addEventListener('keydown', () => GameAudio.init(), { once: true });
