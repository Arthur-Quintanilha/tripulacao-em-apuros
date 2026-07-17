class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.reason = data.reason || 'Você foi detectado pelos piratas.';
  }

  preload() {
    if (!this.textures.exists('menu_bg')) {
      this.load.image('menu_bg', 'assets/menu/menu_bg.png?v=2');
    }
  }

  create() {
    SceneReset.resetCamera(this);
    GameAudio.stopAmbient();
    GameAudio.stopCreepyWhistle();

    this.add.image(480, 270, 'menu_bg').setDisplaySize(960, 540);
    this.createRain();
    this.cameras.main.fadeIn(600);

    GameOverSystem.show(this.reason, {
      onRetry: () => this.retryFromDeck(),
      onMenu: () => this.returnToMenu()
    });
  }

  createRain() {
    if (!this.textures.exists('menu_rain')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x99bbee, 0.45);
      g.fillRect(0, 0, 2, 12);
      g.generateTexture('menu_rain', 2, 12);
      g.destroy();
    }

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
    if (!this.rain) return;
    this.rain.getChildren().forEach((drop) => {
      drop.y += drop.speed * (delta / 1000);
      drop.x += 40 * (delta / 1000);
      if (drop.y > 560) {
        drop.y = Phaser.Math.Between(-30, -5);
        drop.x = Phaser.Math.Between(0, 960);
      }
    });
  }

  retryFromDeck() {
    GameOverSystem.hide();
    DialogSystem.hide();
    PauseSystem.unbindScene(this);
    GameHUD.hide();
    TouchControls.hide();
    InventorySystem.reset();
    InventorySystem.addItem('knife');

    if (this.scene.isActive('DeckScene')) {
      this.scene.stop('DeckScene');
    }

    this.cameras.main.resetFX();
    this.cameras.main.setAlpha(1);
    this.scene.start('DeckScene');
  }

  returnToMenu() {
    SceneReset.returnToMenu(this);
  }
}
