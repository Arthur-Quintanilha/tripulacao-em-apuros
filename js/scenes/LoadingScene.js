class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    const assets = [
      ['menu_bg', 'assets/menu/menu_bg.png?v=2'],
      ['protagonist', 'assets/player/protagonist.png?v=5'],
      ['protagonist_top', 'assets/player/protagonist_top.png?v=1'],
      ['pirate_top', 'assets/pirate/pirate_top.png?v=3'],
      ['sailor_fallen', 'assets/sailor/sailor_fallen.png'],
      ['knife_item', 'assets/items/knife.png'],
      ['hold_bg', 'assets/hold/hold_bg.png'],
      ['hold_box', 'assets/hold/box.png?v=5'],
      ['hold_stairs', 'assets/hold/stairs.png?v=6'],
      ['lifeboat', 'assets/deck/lifeboat.png?v=1'],
      ['deck_crates', 'assets/deck/crates.png?v=1'],
      ['captain_desk', 'assets/deck/captain_desk.png?v=1'],
      ['deck_barrels', 'assets/deck/barrels.png?v=1'],
      ['deck_mast', 'assets/deck/mast.png?v=1'],
      ['deck_cargo_piles', 'assets/deck/cargo_piles.png?v=1']
    ];

    this.load.on('progress', (value) => LoadingSystem.setProgress(value));

    assets.forEach(([key, url]) => {
      this.load.image(key, url);
    });
  }

  create() {
    LoadingSystem.complete(() => {
      this.scene.start('MenuScene');
    });
  }
}
