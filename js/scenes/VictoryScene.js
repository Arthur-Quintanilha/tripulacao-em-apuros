class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  preload() {
    if (!this.textures.exists('menu_bg')) {
      this.load.image('menu_bg', 'assets/menu/menu_bg.png?v=2');
    }
  }

  create() {
    GameAudio.stopAmbient();
    GameAudio.stopCreepyWhistle();

    this.add.image(480, 270, 'menu_bg').setDisplaySize(960, 540);
    this.createRain();
    this.createStars();
    this.cameras.main.fadeIn(800);

    VictorySystem.show({
      onPlayAgain: () => this.playAgain()
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
    for (let i = 0; i < 70; i++) {
      const drop = this.add.image(
        Phaser.Math.Between(0, 960),
        Phaser.Math.Between(-40, 540),
        'menu_rain'
      );
      drop.setAlpha(Phaser.Math.FloatBetween(0.1, 0.35));
      drop.setScale(Phaser.Math.FloatBetween(0.7, 1.3));
      drop.setDepth(5);
      drop.speed = Phaser.Math.Between(280, 520);
      this.rain.add(drop);
    }
  }

  createStars() {
    for (let i = 0; i < 24; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(40, 920),
        Phaser.Math.Between(20, 180),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.15, 0.55)
      );
      star.setDepth(4);
      this.tweens.add({
        targets: star,
        alpha: 0.08,
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1
      });
    }
  }

  update(time, delta) {
    if (!this.rain) return;
    this.rain.getChildren().forEach((drop) => {
      drop.y += drop.speed * (delta / 1000);
      drop.x += 36 * (delta / 1000);
      if (drop.y > 560) {
        drop.y = Phaser.Math.Between(-30, -5);
        drop.x = Phaser.Math.Between(0, 960);
      }
    });
  }

  playAgain() {
    VictorySystem.hide();
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      InventorySystem.reset();
      DialogSystem.hide();
      GameHUD.hide();
      GameAudio.stopAmbient();
      this.scene.start('MenuScene');
    });
  }
}
