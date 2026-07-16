class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('protagonist', 'assets/player/protagonist.png?v=5');
    this.load.image('protagonist_top', 'assets/player/protagonist_top.png?v=1');
    this.load.image('pirate_top', 'assets/pirate/pirate_top.png?v=3');
    this.load.image('sailor_fallen', 'assets/sailor/sailor_fallen.png');
    this.load.image('knife_item', 'assets/items/knife.png');
    this.load.image('hold_bg', 'assets/hold/hold_bg.png');
    this.load.image('hold_box', 'assets/hold/box.png?v=5');
    this.load.image('hold_stairs', 'assets/hold/stairs.png?v=6');
    this.load.image('lifeboat', 'assets/deck/lifeboat.png?v=1');
    this.load.image('deck_crates', 'assets/deck/crates.png?v=1');
    this.load.image('captain_desk', 'assets/deck/captain_desk.png?v=1');
    this.load.image('deck_barrels', 'assets/deck/barrels.png?v=1');
    this.load.image('deck_mast', 'assets/deck/mast.png?v=1');
    this.load.image('deck_cargo_piles', 'assets/deck/cargo_piles.png?v=1');
  }

  create() {
    InventorySystem.reset();

    ['hold_box', 'hold_stairs'].forEach((key) => {
      if (this.textures.exists(key)) {
        const tex = this.textures.get(key);
        if (!tex.has('trimmed')) {
          registerHoldFrame(key, tex);
        }
        tex.setFilter(
          key === 'hold_box'
            ? Phaser.Textures.FilterMode.NEAREST
            : Phaser.Textures.FilterMode.LINEAR
        );
      }
    });

    if (this.textures.exists('protagonist')) {
      const tex = this.textures.get('protagonist');
      registerPlayerFrames(tex);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists('protagonist_top')) {
      const tex = this.textures.get('protagonist_top');
      registerPlayerTopFrames(tex);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists('pirate_top')) {
      const tex = this.textures.get('pirate_top');
      registerPirateTopFrames(tex);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists('lifeboat')) {
      this.textures.get('lifeboat').setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    if (this.textures.exists('deck_crates')) {
      const tex = this.textures.get('deck_crates');
      registerCrateFrames(tex);
      tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    if (this.textures.exists('captain_desk')) {
      this.textures.get('captain_desk').setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    if (this.textures.exists('deck_barrels')) {
      const tex = this.textures.get('deck_barrels');
      registerBarrelFrames(tex);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists('deck_mast')) {
      this.textures.get('deck_mast').setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    if (this.textures.exists('deck_cargo_piles')) {
      const tex = this.textures.get('deck_cargo_piles');
      registerCargoPileFrames(tex);
      tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    if (this.textures.exists('sailor_fallen')) {
      const tex = this.textures.get('sailor_fallen');
      if (tex.frameTotal <= 1) {
        registerSailorFrames(tex);
      }
    }
    this.scene.start('HoldScene');
  }
}
