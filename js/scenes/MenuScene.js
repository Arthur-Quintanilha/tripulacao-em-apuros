class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    SceneReset.resetCamera(this);
    this.add.image(480, 270, 'menu_bg').setDisplaySize(960, 540);

    this.createRain();
    this.cameras.main.fadeIn(600);

    MenuSystem.init();
    MenuSystem.onPlay = () => this.startGame();
    MenuSystem.show();
    TouchControls.hide();

    this.setupMenuAudio();
  }

  setupMenuAudio() {
    const start = () => {
      GameAudio.init();
      GameAudio.playMenuAmbient();
    };

    start();

    if (this.ctxNeedsInteraction()) {
      const unlock = () => {
        GameAudio.init();
        if (!GameAudio.menuNodes) GameAudio.playMenuAmbient();
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
      };
      document.addEventListener('click', unlock);
      document.addEventListener('keydown', unlock);
    }
  }

  ctxNeedsInteraction() {
    GameAudio.init();
    return GameAudio.ctx && GameAudio.ctx.state === 'suspended';
  }

  createRain() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x99bbee, 0.45);
    g.fillRect(0, 0, 2, 12);
    g.generateTexture('menu_rain', 2, 12);
    g.destroy();

    this.rain = this.add.group();
    for (let i = 0; i < 80; i++) {
      const drop = this.add.image(
        Phaser.Math.Between(0, 960),
        Phaser.Math.Between(-40, 540),
        'menu_rain'
      );
      drop.setAlpha(Phaser.Math.FloatBetween(0.12, 0.4));
      drop.setScale(Phaser.Math.FloatBetween(0.7, 1.4));
      drop.setDepth(5);
      drop.speed = Phaser.Math.Between(300, 560);
      this.rain.add(drop);
    }
  }

  update(time, delta) {
    this.rain.getChildren().forEach((drop) => {
      drop.y += drop.speed * (delta / 1000);
      drop.x += 40 * (delta / 1000);
      if (drop.y > 560) {
        drop.y = Phaser.Math.Between(-30, -5);
        drop.x = Phaser.Math.Between(0, 960);
      }
    });
  }

  startGame() {
    SceneReset.startNewGame(this);
  }
}
