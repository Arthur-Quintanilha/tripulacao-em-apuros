class DeckScene extends Phaser.Scene {
  constructor() {
    super('DeckScene');
    this.PLAYER_TOP_SCALE = 0.38;
    this.PIRATE_TOP_SCALE = 0.36;
  }

  init() {
    this.pirate1Dead = false;
    this.playerControl = false;
    this.isStealth = false;
    this.stepTimer = 0;
    this.gameOver = false;
    this.deckDoorOpen = false;
    this.inCaptainRoom = false;
    this.wasInCaptainRoom = false;
    this.captainAlerted = false;
    this.wasOnDeck = false;
  }

  preload() {
    if (!this.textures.exists('protagonist_top')) {
      this.load.image('protagonist_top', 'assets/player/protagonist_top.png?v=1');
    }
    if (!this.textures.exists('pirate_top')) {
      this.load.image('pirate_top', 'assets/pirate/pirate_top.png?v=3');
    }
    if (!this.textures.exists('lifeboat')) {
      this.load.image('lifeboat', 'assets/deck/lifeboat.png?v=1');
    }
    if (!this.textures.exists('deck_crates')) {
      this.load.image('deck_crates', 'assets/deck/crates.png?v=1');
    }
    if (!this.textures.exists('captain_desk')) {
      this.load.image('captain_desk', 'assets/deck/captain_desk.png?v=1');
    }
    if (!this.textures.exists('deck_barrels')) {
      this.load.image('deck_barrels', 'assets/deck/barrels.png?v=1');
    }
    if (!this.textures.exists('deck_mast')) {
      this.load.image('deck_mast', 'assets/deck/mast.png?v=1');
    }
    if (!this.textures.exists('deck_cargo_piles')) {
      this.load.image('deck_cargo_piles', 'assets/deck/cargo_piles.png?v=1');
    }
  }

  create() {
    this.cameras.main.resetFX();
    this.cameras.main.setAlpha(1);
    this.cameras.main.setBackgroundColor('#0b1e38');

    this.prepareDeckTextures();
    this.createPirateTopAnims();

    this.physics.world.gravity.y = 0;

    InventorySystem.init();

    this.createTextures();
    this.createWorld();
    this.createDeckRain();
    this.createPlayer();
    this.setupCamera();
    this.createPirates();
    this.createKeys();
    this.createLifeboat();
    this.setupInput();

    this.events.off('postupdate', this.clampActorsToHull, this);
    this.events.on('postupdate', this.clampActorsToHull, this);

    this.cameras.main.fadeIn(500);

    this.time.delayedCall(500, () => {
      this.playerControl = true;
    });

    GameHUD.bindScene(this, {
      area: 'CORREDOR DO NAVIO',
      objective: 'Entre na sala do capitão (à direita) e pegue as chaves dos botes de emergência.',
      objectiveLayout: 'bottom-right'
    });
    GameHUD.showDeckControlsHint(5000);
    PauseSystem.bindScene(this);
    TouchControls.setMode('deck');
    TouchControls.show();

    this.events.once('shutdown', () => {
      this.cleanupDeckScene();
    });
  }

  prepareDeckTextures() {
    const sheets = [
      ['protagonist_top', ensurePlayerTopFrames, Phaser.Textures.FilterMode.NEAREST],
      ['pirate_top', ensurePirateTopFrames, Phaser.Textures.FilterMode.NEAREST],
      ['deck_crates', registerCrateFrames, Phaser.Textures.FilterMode.LINEAR],
      ['deck_barrels', registerBarrelFrames, Phaser.Textures.FilterMode.NEAREST],
      ['deck_cargo_piles', registerCargoPileFrames, Phaser.Textures.FilterMode.LINEAR]
    ];

    sheets.forEach(([key, registerFn, filter]) => {
      if (!this.textures.exists(key)) return;
      const tex = this.textures.get(key);
      registerFn(tex);
      tex.setFilter(filter);
    });

    if (this.textures.exists('deck_mast')) {
      this.textures.get('deck_mast').setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }

  cleanupDeckScene() {
    this._goToGameOverTimer?.remove(false);
    this._goToGameOverTimer = null;
    this._goToVictoryTimer?.remove(false);
    this._goToVictoryTimer = null;
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.events.off('postupdate', this.clampActorsToHull, this);
    GameAudio.stopCreepyWhistle();
    if (this._attackClickHandler && this.gameWrapper) {
      this.gameWrapper.removeEventListener('mousedown', this._attackClickHandler, true);
      this._attackClickHandler = null;
    }
    GameHUD.hideDeckControlsHint();
    PauseSystem.unbindScene(this);
    GameHUD.unbindScene(this);
    TouchControls.hide();
  }

  createTextures() {
    if (this.textures.exists('sea_tile')) return;

    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0xffd700);
    g.fillCircle(14, 10, 10);
    g.fillStyle(0xc9a84c);
    g.fillRect(20, 4, 18, 6);
    g.fillRect(34, 4, 4, 14);
    g.fillRect(30, 16, 8, 4);
    g.lineStyle(2, 0xb8860b);
    g.strokeCircle(14, 10, 10);
    g.generateTexture('keys', 40, 24);
    g.clear();

    g.fillStyle(0x99bbee, 0.45);
    g.fillRect(0, 0, 2, 12);
    g.generateTexture('deck_rain', 2, 12);
    g.clear();

    g.fillStyle(0x3a3028);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x2a2218);
    for (let i = 0; i < 64; i += 8) {
      g.fillRect(0, i, 64, 1);
    }
    g.lineStyle(2, 0x1a140e);
    g.strokeRect(0, 0, 64, 64);
    g.generateTexture('deck_hatch', 64, 64);
    g.clear();

    g.fillStyle(0x0b1e38);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x143352, 0.35);
    g.fillEllipse(20, 28, 36, 14);
    g.fillEllipse(48, 44, 28, 10);
    g.generateTexture('sea_tile', 64, 64);
    g.clear();

    this.createShipWoodTexture(g);
    this.createWallTextures(g);
    g.destroy();
  }

  createShipWoodTexture(g) {
    const w = 128;
    const h = 32;
    const plankH = 10;
    const colors = [0x261810, 0x2a1c14, 0x231710, 0x2e1e15];

    for (let row = 0; row < h / plankH; row++) {
      const py = row * plankH;
      g.fillStyle(colors[row % colors.length], 1);
      g.fillRect(0, py, w, plankH - 1);

      g.fillStyle(0x080504, 1);
      g.fillRect(0, py + plankH - 1, w, 1);

      g.lineStyle(1, 0x000000, 0.07);
      g.beginPath();
      g.moveTo(0, py + 5);
      g.lineTo(w, py + 5);
      g.strokePath();
    }

    g.generateTexture('ship_wood_floor', w, h);
  }

  createWallTextures(g) {
    g.fillStyle(0x4a3528);
    g.fillRect(0, 0, 32, 10);
    g.fillStyle(0x5c4634);
    g.fillRect(0, 0, 32, 3);
    g.lineStyle(1, 0x2a1a10, 0.45);
    g.strokeRect(0, 0, 32, 10);
    g.generateTexture('wall_cap', 32, 10);
    g.clear();

    g.fillStyle(0x161008);
    g.fillRect(0, 0, 32, 24);
    for (let y = 0; y < 24; y += 5) {
      g.fillStyle(0x0e0804);
      g.fillRect(0, y, 32, 1);
    }
    g.fillStyle(0x241810, 0.35);
    g.fillRect(0, 0, 5, 24);
    g.fillStyle(0x0a0604, 0.25);
    g.fillRect(27, 0, 5, 24);
    g.generateTexture('wall_face', 32, 24);
    g.clear();

    g.fillStyle(0x3d3024);
    g.fillRect(0, 0, 8, 28);
    g.fillStyle(0x2a2016);
    g.fillRect(2, 0, 4, 28);
    g.fillStyle(0x524032);
    g.fillRect(0, 0, 8, 4);
    g.generateTexture('wall_post', 8, 28);
  }

  addWall(x, y, w, h, visible = true, facing = null) {
    const body = this.add.rectangle(x, y, w, h, 0x000000, 0);
    body.setDepth(3);
    this.physics.add.existing(body, true);
    this.walls.add(body);

    if (!visible) return body;

    const CAP = 10;
    const FACE = 22;
    const isHorizontal = w >= h;
    const dir = facing || (isHorizontal ? 'south' : 'east');
    const visuals = [];

    const addCap = (cx, cy, cw, ch) => {
      const cap = this.add.tileSprite(cx, cy, cw, CAP, 'wall_cap');
      cap.setDepth(4);
      visuals.push(cap);
    };

    const addFace = (cx, cy, fw, fh, flipX = false) => {
      const face = this.add.tileSprite(cx, cy, fw, fh, 'wall_face');
      face.setDepth(3);
      if (flipX) face.setFlipX(true);
      visuals.push(face);
    };

    const addShadow = (cx, cy, sw, sh) => {
      const shadow = this.add.rectangle(cx, cy, sw, sh, 0x000000, 0.22);
      shadow.setDepth(2);
      visuals.push(shadow);
    };

    switch (dir) {
      case 'north':
        addCap(x, y - h / 2 + CAP / 2, w, CAP);
        addFace(x, y - h / 2 + CAP + FACE / 2, w, FACE);
        addShadow(x, y - h / 2 + CAP + FACE + 3, w, 5);
        break;
      case 'south':
        addCap(x, y + h / 2 - CAP / 2, w, CAP);
        addFace(x, y + h / 2 - CAP - FACE / 2, w, FACE, true);
        addShadow(x, y + h / 2 - CAP - FACE - 3, w, 5);
        break;
      case 'west': {
        const cap = this.add.tileSprite(x - w / 2 + CAP / 2, y, h, CAP, 'wall_cap');
        cap.setAngle(90);
        cap.setDepth(4);
        visuals.push(cap);
        const face = this.add.tileSprite(x - w / 2 + CAP + FACE / 2, y, h, FACE, 'wall_face');
        face.setAngle(90);
        face.setDepth(3);
        visuals.push(face);
        addShadow(x - w / 2 + CAP + FACE + 3, y, 5, h);
        break;
      }
      case 'east': {
        const cap = this.add.tileSprite(x + w / 2 - CAP / 2, y, h, CAP, 'wall_cap');
        cap.setAngle(-90);
        cap.setDepth(4);
        visuals.push(cap);
        const face = this.add.tileSprite(x + w / 2 - CAP - FACE / 2, y, h, FACE, 'wall_face');
        face.setAngle(-90);
        face.setFlipX(true);
        face.setDepth(3);
        visuals.push(face);
        addShadow(x + w / 2 - CAP - FACE - 3, y, 5, h);
        break;
      }
      default:
        break;
    }

    body.wallVisuals = visuals;
    const destroyBody = body.destroy.bind(body);
    body.destroy = () => {
      visuals.forEach((v) => v.destroy());
      destroyBody();
    };

    return body;
  }

  addRailing(x, y, length, horizontal = true) {
    const POST = 28;
    const segments = Math.max(2, Math.floor(length / 70));
    const visuals = [];

    if (horizontal) {
      const cap = this.add.tileSprite(x, y - 6, length, 8, 'wall_cap');
      cap.setDepth(4);
      cap.setTint(0x665544);
      visuals.push(cap);

      for (let i = 0; i <= segments; i++) {
        const px = x - length / 2 + (length / segments) * i;
        const post = this.add.image(px, y + 4, 'wall_post');
        post.setDepth(4);
        post.setTint(0x554433);
        visuals.push(post);
      }

      const shadow = this.add.rectangle(x, y + 14, length, 4, 0x000000, 0.18);
      shadow.setDepth(2);
      visuals.push(shadow);
    } else {
      for (let i = 0; i <= segments; i++) {
        const py = y - length / 2 + (length / segments) * i;
        const post = this.add.image(x, py, 'wall_post');
        post.setDepth(4);
        post.setTint(0x554433);
        visuals.push(post);
      }
    }

    return visuals;
  }

  createWorld() {
    const L = DECK_LAYOUT;
    this.WORLD_W = L.worldW;
    this.WORLD_H = L.worldH;
    this.walls = this.physics.add.staticGroup();

    this.createOcean(L);
    this.createShipHullFloor(L);

    this.buildDeckWalls(L);
    this.createDeckDecorations(L);

    this.captainRoomZone = deckRect(L.captainRoom);
    this.openDeckZone = deckRect(L.openDeck);
    this.corridorZone = deckRect(L.corridor);
    this.bowZone = deckRect(L.bow);

    this.captainDoorPos = { ...L.captainDoor };
    this.keysPos = { ...L.keys };
    this.bowGateY = L.bowGate.y;

    const deskX = L.captainDesk.x;
    const deskY = L.captainDesk.y;
    this.captainDesk = this.add.image(deskX, deskY, 'captain_desk');
    this.captainDesk.setScale(0.20);
    this.captainDesk.setOrigin(0.5, 0.58);
    this.captainDesk.setDepth(deskY);

    this.covers = [];
    this.createCoverObjects();
    this.createCargoPileDecorations();
    this.createBarrelDecorations();
    this.createStorageDecorations();
  }

  createOcean(L) {
    this.add.tileSprite(L.worldW / 2, L.worldH / 2, L.worldW, L.worldH, 'sea_tile').setDepth(0);
  }

  createShipHullFloor(L) {
    const step = 32;

    for (let y = 0; y < L.worldH; y += step) {
      const cy = y + step / 2;
      const hw = getHullHalfWidth(cy);
      if (hw < 24) continue;

      const floor = this.add.tileSprite(L.hullCx, cy, hw * 2, step, 'ship_wood_floor');
      floor.setDepth(1);
    }
  }

  createDeckDecorations(L) {
    const cr = L.corridor;
    const bow = L.bow;

    this.add.text(cr.x + cr.w / 2, cr.y + cr.h - 36, 'CORREDOR', {
      fontSize: '11px', color: '#888', fontFamily: 'Segoe UI'
    }).setOrigin(0.5).setDepth(4);

    this.add.image(L.holdAccess.x, L.holdAccess.y, 'deck_hatch')
      .setScale(1.1)
      .setDepth(L.holdAccess.y);

    this.add.text(L.holdAccess.x, L.holdAccess.y - 38, 'Acesso ao Porão', {
      fontSize: '10px', color: '#aaa', fontFamily: 'Segoe UI'
    }).setOrigin(0.5).setDepth(4);

    this.addMast(L.mast);

    this.addRailing(bow.x + bow.w / 2, bow.y + 24, bow.w - 36, true);
    this.addHullRailings(L);
  }

  addMast({ x, y, scale }) {
    const sprite = this.add.image(x, y, 'deck_mast');
    sprite.setScale(scale);
    sprite.setOrigin(0.5, 0.92);
    sprite.setDepth(y);

    const bodyW = Math.round(sprite.displayWidth * 0.42);
    const bodyH = Math.round(sprite.displayHeight * 0.14);
    const bodyY = y - Math.round(sprite.displayHeight * 0.04);

    const body = this.add.rectangle(x, bodyY, bodyW, bodyH, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.walls.add(body);
  }

  addHullRailings(L) {
    const step = 90;
    const cx = L.hullCx;

    for (let y = 280; y < 980; y += step) {
      const hw = getHullHalfWidth(y);
      this.addRailing(cx - hw + 18, y, step * 0.7, false);
      this.addRailing(cx + hw - 18, y, step * 0.7, false);
    }
  }

  buildDeckWalls(L) {
    const doorHalf = 48;
    this.buildRightColumnRooms(L, doorHalf);
  }

  buildRightColumnRooms(L, doorHalf) {
    const cap = L.captainRoom;
    const s1 = L.storage1;
    const s2 = L.storage2;
    const colH = (s2.y + s2.h) - cap.y;

    this.addWall(cap.x + cap.w / 2, cap.y - 8, cap.w, 16, true, 'north');
    this.addWall(s2.x + s2.w / 2, s2.y + s2.h + 8, s2.w, 16, true, 'south');
    this.addWall(cap.x + cap.w + 8, cap.y + colH / 2, 16, colH, true, 'east');
    this.addWall(cap.x + cap.w / 2, cap.y + cap.h + 8, cap.w, 16, true, 'south');
    this.addWall(s1.x + s1.w / 2, s1.y + s1.h + 8, s1.w, 16, true, 'south');

    this.addRoomWestDoor(cap, L.captainDoor.y, doorHalf);
    this.addRoomWestDoor(s1, s1.y + s1.h / 2, doorHalf);
    this.addRoomWestDoor(s2, s2.y + s2.h / 2, doorHalf);
  }

  addRoomWestDoor(room, doorY, doorHalf) {
    this.addWall(
      room.x - 8,
      room.y + (doorY - room.y - doorHalf) / 2,
      16,
      Math.max(0, doorY - room.y - doorHalf),
      true,
      'west'
    );
    this.addWall(
      room.x - 8,
      doorY + doorHalf + (room.y + room.h - doorY - doorHalf) / 2,
      16,
      Math.max(0, room.y + room.h - doorY - doorHalf),
      true,
      'west'
    );
  }

  clampActorsToHull() {
    if (this.player && this.player.active) {
      clampSpriteToHull(this.player);
      this.physics.world.collide(this.player, this.walls);
    }
    if (this.pirates) {
      this.pirates.forEach((pirate) => {
        if (pirate.active && !pirate.isDead) {
          clampSpriteToHull(pirate, { margin: PATROL_HULL_MARGIN });
          this.physics.world.collide(pirate, this.walls);
        }
      });
    }
  }

  createCargoPileDecorations() {
    DECK_LAYOUT.pileSpots.forEach(({ x, y, frame }) => this.addCargoPile(x, y, frame));
  }

  addCargoPile(x, y, frameId = 0) {
    const frame = getCargoPileFrame(frameId);
    const targetW = 92;
    const scale = targetW / frame.width;
    const displayW = Math.round(frame.width * scale);
    const displayH = Math.round(frame.height * scale);
    const bodyW = Math.round(displayW * 0.78);
    const bodyH = Math.round(displayH * 0.38);
    const originY = 0.9;
    const bodyY = y - Math.round(displayH * (originY - 0.5) - bodyH / 2);

    const sprite = this.add.sprite(x, y, 'deck_cargo_piles', frameId);
    sprite.setScale(scale);
    sprite.setOrigin(0.5, originY);
    sprite.setDepth(bodyY);

    const body = this.add.rectangle(x, bodyY, bodyW, bodyH, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.walls.add(body);
  }

  createBarrelDecorations() {
    DECK_LAYOUT.barrelSpots.forEach(({ x, y, frame }) => this.addBarrel(x, y, frame));
  }

  addBarrel(x, y, frameId = 0) {
    const horizontal = isHorizontalBarrel(frameId);
    const targetW = horizontal ? 38 : 28;
    const scale = targetW / BARREL_FRAME_W;
    const displayW = Math.round(BARREL_FRAME_W * scale);
    const displayH = Math.round(BARREL_FRAME_H * scale);
    const bodyW = Math.round(displayW * (horizontal ? 0.88 : 0.62));
    const bodyH = Math.round(displayH * (horizontal ? 0.55 : 0.42));
    const originY = horizontal ? 0.52 : 0.58;
    const bodyY = y + Math.round(displayH * (originY - 0.5));

    const sprite = this.add.sprite(x, y, 'deck_barrels', frameId);
    sprite.setScale(scale);
    sprite.setOrigin(0.5, originY);
    sprite.setDepth(bodyY);

    const body = this.add.rectangle(x, bodyY, bodyW, bodyH, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.walls.add(body);
  }

  createCoverObjects() {
    DECK_LAYOUT.coverSpots.forEach(({ x, y, frame }) => this.addCover(x, y, frame));
  }

  createStorageDecorations() {
    (DECK_LAYOUT.storageDecorations || []).forEach((item) => {
      const pos = storageSpot(item.room, item.nx, item.ny);
      if (item.type === 'cover') this.addCover(pos.x, pos.y, item.frame);
      else if (item.type === 'barrel') this.addBarrel(pos.x, pos.y, item.frame);
      else if (item.type === 'pile') this.addCargoPile(pos.x, pos.y, item.frame);
    });
  }

  addCover(x, y, frameId = 0) {
    const frame = getCrateFrame(frameId);
    const targetW = 52;
    const scale = targetW / frame.width;
    const displayW = Math.round(frame.width * scale);
    const displayH = Math.round(frame.height * scale);
    const bodyW = Math.round(displayW * 0.95);
    const bodyH = Math.round(displayH * 0.78);
    const bodyY = y + Math.round(displayH * 0.04);

    const cover = {
      x,
      y: bodyY,
      w: bodyW,
      h: bodyH,
      hideRadius: Math.max(44, Math.round(displayW * 0.9))
    };
    cover.rect = new Phaser.Geom.Rectangle(
      x - bodyW / 2,
      bodyY - bodyH / 2,
      bodyW,
      bodyH
    );

    const sprite = this.add.sprite(x, y, 'deck_crates', frameId);
    sprite.setScale(scale);
    sprite.setOrigin(0.5, 0.55);
    sprite.setDepth(bodyY);

    const body = this.add.rectangle(x, bodyY, bodyW, bodyH, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.walls.add(body);

    this.covers.push(cover);
  }

  moveWithWallSlide(sprite, stepX, stepY) {
    if (!sprite.body) {
      sprite.x += stepX;
      sprite.y += stepY;
      return;
    }

    if (stepX !== 0) {
      sprite.x += stepX;
      this.physics.world.collide(sprite, this.walls);
    }
    if (stepY !== 0) {
      sprite.y += stepY;
      this.physics.world.collide(sprite, this.walls);
    }
  }

  setFeetDepth(sprite, offset = 0) {
    sprite.setDepth(Math.floor(sprite.y) + offset);
  }

  setupCamera() {
    this.physics.world.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.setBounds(0, 0, this.WORLD_W, this.WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setScroll(0, this.WORLD_H - 540);
  }

  createDeckRain() {
    this.rain = this.add.group();
    for (let i = 0; i < 70; i++) {
      const drop = this.add.image(
        Phaser.Math.Between(DECK_LAYOUT.openDeck.x, DECK_LAYOUT.openDeck.x + DECK_LAYOUT.openDeck.w),
        Phaser.Math.Between(DECK_LAYOUT.openDeck.y, DECK_LAYOUT.openDeck.y + DECK_LAYOUT.openDeck.h),
        'deck_rain'
      );
      drop.setAlpha(Phaser.Math.FloatBetween(0.1, 0.35));
      drop.setScale(Phaser.Math.FloatBetween(0.7, 1.3));
      drop.setDepth(12);
      drop.speed = Phaser.Math.Between(280, 520);
      this.rain.add(drop);
    }
  }

  createPlayer() {
    this.playerFacing = 'up';
    this.createPlayerTopAnims();

    const playerTex = this.textures.get('protagonist_top');
    const startFrame = playerTex?.has(8) ? 8 : 0;
    this.player = this.physics.add.sprite(
      DECK_LAYOUT.playerStart.x,
      DECK_LAYOUT.playerStart.y,
      'protagonist_top',
      startFrame
    );
    this.player.setScale(this.PLAYER_TOP_SCALE);
    this.player.setOrigin(0.5, 0.85);
    this.player.setCollideWorldBounds(false);
    this.player.body.allowGravity = false;
    this.player.body.setSize(22, 14);
    this.player.body.setOffset(30, 88);
    this.physics.add.collider(this.player, this.walls);
    this.setFeetDepth(this.player);

    this.stealthIndicator = this.add.circle(this.player.x, this.player.y, 14, 0x00ff00, 0.15).setDepth(16);
    this.stealthIndicator.setVisible(false);
  }

  createPlayerTopAnims() {
    const dirs = [
      { key: 'player-top-down', frames: [0, 1, 2, 3] },
      { key: 'player-top-left', frames: [4, 5, 6, 7] },
      { key: 'player-top-up', frames: [8, 9, 10, 11] },
      { key: 'player-top-right', frames: [12, 13, 14, 15] }
    ];

    dirs.forEach(({ key, frames }) => {
      if (this.anims.exists(key)) this.anims.remove(key);
      this.anims.create({
        key,
        frames: frames.map((frame) => ({ key: 'protagonist_top', frame })),
        frameRate: 8,
        repeat: -1
      });
    });
  }

  updatePlayerTopAnim(moving, vx, vy) {
    const idleFrames = { down: 0, left: 4, up: 8, right: 12 };

    if (moving) {
      if (Math.abs(vy) >= Math.abs(vx)) {
        this.playerFacing = vy < 0 ? 'up' : 'down';
      } else {
        this.playerFacing = vx < 0 ? 'left' : 'right';
      }

      const animKey = `player-top-${this.playerFacing}`;
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== animKey) {
        this.player.play(animKey, true);
      }
      return;
    }

    this.player.anims.stop();
    this.player.setFrame(idleFrames[this.playerFacing]);
  }

  createPirateTopAnims() {
    const dirs = [
      { key: 'pirate-top-down', frames: [0, 1, 2, 3] },
      { key: 'pirate-top-left', frames: [4, 5] },
      { key: 'pirate-top-right', frames: [6, 7] },
      { key: 'pirate-top-up', frames: [8, 9, 10, 11] }
    ];

    dirs.forEach(({ key, frames }) => {
      if (this.anims.exists(key)) this.anims.remove(key);
      this.anims.create({
        key,
        frames: frames.map((frame) => ({ key: 'pirate_top', frame })),
        frameRate: 7,
        repeat: -1
      });
    });
  }

  setupPirateBody(pirate) {
    if (!pirate?.frame?.sourceSize) return;

    const fw = pirate.frame.width;
    const fh = pirate.frame.height;
    const bw = Math.round(fw * 0.28);
    const bh = Math.round(fh * 0.12);
    pirate.body.setSize(bw, bh);
    pirate.body.setOffset(
      Math.round((fw - bw) / 2),
      Math.round(fh * 0.85 - bh)
    );
  }

  updatePirateTopAnim(pirate, moving, dx = 0, dy = 0) {
    const idleFrames = { down: 0, left: 4, right: 6, up: 8 };

    if (moving || dx !== 0 || dy !== 0) {
      if (Math.abs(dy) >= Math.abs(dx)) {
        pirate.facingDir = dy > 0 ? 'down' : 'up';
      } else {
        pirate.facingDir = dx > 0 ? 'right' : 'left';
      }
    }

    const dir = pirate.facingDir || 'down';
    pirate.setFlipX(false);

    if (moving) {
      const animKey = `pirate-top-${dir}`;
      if (!pirate.anims.isPlaying || pirate.anims.currentAnim?.key !== animKey) {
        pirate.play(animKey, true);
      }
      if (pirate._animDir !== dir) {
        pirate._animDir = dir;
        this.setupPirateBody(pirate);
      }
      return;
    }

    pirate.anims.stop();
    pirate.setFrame(idleFrames[dir]);
    if (pirate._animDir !== dir) {
      pirate._animDir = dir;
      this.setupPirateBody(pirate);
    }
  }

  createPatrolPirate(x, y, waypoints, label, range = 100, startActive = false) {
    const pirate = this.physics.add.sprite(x, y, 'pirate_top', 0);
    pirate.setScale(this.PIRATE_TOP_SCALE);
    pirate.setOrigin(0.5, 0.85);
    pirate.setImmovable(false);
    pirate.body.allowGravity = false;
    this.setupPirateBody(pirate);
    pirate.setVisible(startActive);
    pirate.isDead = false;
    pirate.label = label;
    pirate.detectionRange = range;
    pirate.visionAngle = Math.PI / 1.6;
    pirate.waypoints = waypoints;
    pirate.wpIndex = 0;
    pirate.patrolSpeed = 58;
    pirate.patrolWait = 0;
    pirate._waitTimer = 0;
    pirate.facingAngle = 0;
    pirate.facingDir = 'down';
    pirate._animDir = null;
    pirate.active = startActive;
    pirate.stepTimer = 0;
    pirate._stuckTimer = 0;
    pirate._lastPatrolDist = null;

    this.drawVisionCone(pirate);
    if (pirate.visionGfx) pirate.visionGfx.setVisible(startActive);
    this.setFeetDepth(pirate);

    return pirate;
  }

  createPirates() {
    const L = DECK_LAYOUT;

    this.pirate1 = this.createPatrolPirate(
      L.captainPatrol[0].x,
      L.captainPatrol[0].y,
      L.captainPatrol,
      'guard',
      100,
      true
    );
    this.pirate1.patrolSpeed = 46;
    this.pirate1.visionAngle = Math.PI / 1.5;

    this.pirate1Label = this.add.text(L.captainPatrol[0].x, L.captainPatrol[0].y - 33, '☠ Pirata', {
      fontSize: '12px', color: '#ff4444', fontFamily: 'Segoe UI',
      fontStyle: 'bold', backgroundColor: '#00000088', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(16);

    this.deckPirates = L.deckPatrols.map((route, index) => {
      const waypoints = route.reverse ? [...route.wp].reverse() : route.wp;
      const wpStart = Phaser.Math.Wrap(route.wpStart ?? 0, 0, waypoints.length);
      const spawn = waypoints[wpStart];

      const pirate = this.createPatrolPirate(
        spawn?.x ?? route.x,
        spawn?.y ?? route.y,
        waypoints,
        `patrol-${route.zone ?? index}`,
        92,
        true
      );

      pirate.wpIndex = wpStart;
      pirate.patrolSpeed = route.speed ?? 58;
      pirate.patrolWait = route.waitMs ?? 0;
      pirate.patrolZone = route.zone;

      return pirate;
    });

    this.pirates = [this.pirate1, ...this.deckPirates];
    this.pirates.forEach((pirate) => {
      this.physics.add.collider(pirate, this.walls);
    });
    this.drawVisionCone(this.pirate1);
    GameAudio.startCreepyWhistle();
    this._whistleVolTimer = 0;
    GameAudio.setCreepyWhistleVolume(this.getWhistleVolume());
  }

  getLivingPirates() {
    if (!this.pirates) return [];
    return this.pirates.filter((p) => p.active && !p.isDead);
  }

  getWhistleVolume() {
    const pirates = this.getLivingPirates();
    const minVol = 0.06;
    const maxVol = 1;
    const maxDist = 480;

    if (!pirates.length) return 0;

    const nearest = Math.min(...pirates.map((p) =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y)
    ));
    const t = Math.min(1, nearest / maxDist);
    const falloff = Math.pow(1 - t, 2.4);
    return minVol + falloff * (maxVol - minVol);
  }

  updateCreepyWhistle(delta) {
    if (this.gameOver) {
      GameAudio.setCreepyWhistleVolume(0);
      return;
    }

    if (!this.getLivingPirates().length) {
      GameAudio.stopCreepyWhistle();
      return;
    }

    GameAudio.startCreepyWhistle();
    this._whistleVolTimer += delta;
    if (this._whistleVolTimer > 100) {
      this._whistleVolTimer = 0;
      GameAudio.setCreepyWhistleVolume(this.getWhistleVolume());
    }
  }

  getPirateStepVolume(pirate) {
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, pirate.x, pirate.y
    );
    if (dist > 300) return 0;
    return Math.max(0.15, 1 - dist / 300);
  }

  drawVisionCone(pirate) {
    if (pirate.visionGfx) pirate.visionGfx.destroy();

    const gfx = this.add.graphics();
    const range = pirate.detectionRange;
    const halfAngle = pirate.visionAngle / 2;
    const angle = pirate.facingAngle;

    gfx.fillStyle(0xff0000, 0.1);
    gfx.beginPath();
    gfx.moveTo(pirate.x, pirate.y);
    gfx.arc(pirate.x, pirate.y, range, angle - halfAngle, angle + halfAngle, false);
    gfx.closePath();
    gfx.fillPath();

    gfx.lineStyle(1, 0xff4444, 0.25);
    gfx.beginPath();
    gfx.moveTo(pirate.x, pirate.y);
    gfx.arc(pirate.x, pirate.y, range, angle - halfAngle, angle + halfAngle, false);
    gfx.closePath();
    gfx.strokePath();

    pirate.visionGfx = gfx;
    gfx.setDepth(8);
    if (!pirate.active || pirate.isDead) gfx.setVisible(false);
  }

  createKeys() {
    this.keysSprite = this.add.image(this.keysPos.x, this.keysPos.y, 'keys').setDepth(20).setScale(1.2);
    this.keysGlow = this.add.circle(this.keysPos.x, this.keysPos.y, 18, 0xffd700, 0.35).setDepth(19);
    this.tweens.add({
      targets: this.keysGlow,
      scaleX: 1.4, scaleY: 1.4, alpha: 0.15,
      duration: 800, yoyo: true, repeat: -1
    });
    this.keysLabel = this.add.text(this.keysPos.x, this.keysPos.y - 27, '🔑 Chaves', {
      fontSize: '12px', color: '#ffd700', fontFamily: 'Segoe UI', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(21);
  }

  createLifeboat() {
    const { x, y } = DECK_LAYOUT.lifeboat;
    const scale = 0.15;

    this.lifeboat = this.add.image(x, y, 'lifeboat');
    this.lifeboat.setScale(scale);
    this.lifeboat.setOrigin(0.5, 0.5);
    this.lifeboat.setDepth(6);

    const glowW = Math.round(this.lifeboat.displayWidth * 1.15);
    const glowH = Math.round(this.lifeboat.displayHeight * 1.1);
    this.lifeboatGlow = this.add.rectangle(x, y, glowW, glowH, 0x00ff66, 0);
    this.lifeboatGlow.setStrokeStyle(3, 0x44ff88, 0.85);
    this.lifeboatGlow.setDepth(5);
    this.tweens.add({
      targets: this.lifeboatGlow,
      alpha: 0.25,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    this.add.text(x, y - glowH / 2 - 14, 'Bote Salva-vidas', {
      fontSize: '11px', color: '#66ff99', fontFamily: 'Segoe UI'
    }).setOrigin(0.5).setDepth(6);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      E: Phaser.Input.Keyboard.KeyCodes.E
    });

    this._attackClickHandler = (e) => {
      if (e.button !== 0) return;
      if (DialogSystem.active || PauseSystem.isPaused()) return;
      if (e.target.closest(
        '#inventory-panel, #pause-btn, #pause-overlay, #dialog-box, #main-menu, #menu-modal, #touch-controls, button, a'
      )) return;
      if (!this.playerControl || this.gameOver) return;
      this.tryAttack();
    };

    this.gameWrapper = document.getElementById('game-wrapper');
    if (this.gameWrapper) {
      this.gameWrapper.addEventListener('mousedown', this._attackClickHandler, true);
    }
  }

  isInZone(zone) {
    return zone.contains(this.player.x, this.player.y);
  }

  isInPatrolZone() {
    return this.isInZone(this.openDeckZone) || this.isInZone(this.corridorZone);
  }

  isNearCover() {
    return !!this.getPlayerCover();
  }

  getPlayerCover() {
    if (!this.isStealth) return null;

    let nearest = null;
    let nearestDist = Infinity;

    for (const cover of this.covers) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, cover.x, cover.y);
      if (dist <= cover.hideRadius && dist < nearestDist) {
        nearest = cover;
        nearestDist = dist;
      }
    }

    return nearest;
  }

  isLineBlockedByWalls(x1, y1, x2, y2, endMargin = 12) {
    const totalDist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    if (totalDist < endMargin) return false;

    const steps = Math.max(4, Math.ceil(totalDist / 10));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const sampleDist = t * totalDist;
      if (totalDist - sampleDist < endMargin) break;

      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;

      for (const wall of this.walls.getChildren()) {
        if (!wall.active) continue;
        if (wall.getBounds().contains(px, py)) return true;
      }
    }

    return false;
  }

  hasLineOfSightToPlayer(pirate) {
    return !this.isLineBlockedByWalls(pirate.x, pirate.y, this.player.x, this.player.y);
  }

  isPlayerHiddenByCover(pirate) {
    const cover = this.getPlayerCover();
    if (!cover) return false;

    const px = this.player.x - cover.x;
    const py = this.player.y - cover.y;
    const kx = pirate.x - cover.x;
    const ky = pirate.y - cover.y;
    const lenP = Math.hypot(px, py) || 1;
    const lenK = Math.hypot(kx, ky) || 1;
    const dot = (px * kx + py * ky) / (lenP * lenK);

    // Pirata do mesmo lado que o jogador (por trás / nas costas)
    if (dot > 0.25) return false;

    // Flanco lateral — enxerga pela lateral da caixa
    if (Math.abs(dot) < 0.45) return false;

    const sightLine = new Phaser.Geom.Line(
      pirate.x, pirate.y, this.player.x, this.player.y
    );

    return Phaser.Geom.Intersects.LineToRectangle(sightLine, cover.rect);
  }

  isHidingBehindCover(pirate) {
    return this.isPlayerHiddenByCover(pirate);
  }

  isBehindPirate(pirate) {
    const dx = this.player.x - pirate.x;
    const dy = this.player.y - pirate.y;
    const angleToPlayer = Math.atan2(dy, dx);
    let angleDiff = angleToPlayer - pirate.facingAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    return Math.abs(angleDiff) >= Math.PI / 2;
  }

  isInVisionCone(pirate) {
    if (pirate.isDead || !pirate.active) return false;

    const dx = this.player.x - pirate.x;
    const dy = this.player.y - pirate.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > pirate.detectionRange) return false;

    const angleToPlayer = Math.atan2(dy, dx);
    let angleDiff = angleToPlayer - pirate.facingAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    return Math.abs(angleDiff) <= pirate.visionAngle / 2;
  }

  canDetectPlayer(pirate) {
    if (pirate.isDead || !pirate.active) return false;
    if (!this.isInVisionCone(pirate)) return false;
    if (!this.hasLineOfSightToPlayer(pirate)) return false;
    if (this.isPlayerHiddenByCover(pirate)) return false;
    return true;
  }

  findStealthAttackTarget() {
    let target = null;
    let bestDist = 72;

    for (const pirate of this.pirates) {
      if (pirate.isDead || !pirate.active) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, pirate.x, pirate.y
      );
      if (dist > 72 || this.canDetectPlayer(pirate)) continue;
      if (dist < bestDist) {
        target = pirate;
        bestDist = dist;
      }
    }

    return target;
  }

  findFrontalAttackPirate() {
    for (const pirate of this.pirates) {
      if (pirate.isDead || !pirate.active) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, pirate.x, pirate.y
      );
      if (dist <= 72 && this.canDetectPlayer(pirate)) {
        return pirate;
      }
    }
    return null;
  }

  updateTouchAttackButton() {
    if (!InventorySystem.has('knife')) {
      TouchControls.setAttackAvailable(false);
      return;
    }

    let nearPirate = false;
    for (const pirate of this.pirates) {
      if (pirate.isDead || !pirate.active) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, pirate.x, pirate.y
      );
      if (dist <= 95 && !this.canDetectPlayer(pirate)) {
        nearPirate = true;
        break;
      }
    }
    TouchControls.setAttackAvailable(nearPirate);
  }

  tryAttack() {
    if (!InventorySystem.has('knife')) return;

    if (!InventorySystem.isEquipped('knife')) {
      InventorySystem.equipped = 'knife';
      InventorySystem.render();
      InventorySystem._notifyEquipChange();
    }

    const target = this.findStealthAttackTarget();
    if (target) {
      this.executeStealthKill(target);
      return;
    }

    if (this.findFrontalAttackPirate()) {
      this.triggerGameOver('O pirata te viu antes que você pudesse atacar!');
    }
  }

  executeStealthKill(pirate) {
    if (!pirate || pirate.isDead) return;

    this.playerControl = false;
    GameAudio.playStab();
    DialogSystem.showBloodSplash();

    this.tweens.add({
      targets: pirate,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        pirate.anims.stop();
        pirate.setTint(0x442222);
        pirate.setAlpha(0.75);
        pirate.isDead = true;
        pirate.setVelocity(0, 0);
        if (pirate.label === 'guard') {
          this.pirate1Dead = true;
          if (this.pirate1Label) this.pirate1Label.setVisible(false);
        }
        if (pirate.visionGfx) pirate.visionGfx.setVisible(false);

        if (!this.getLivingPirates().length) {
          GameAudio.stopCreepyWhistle();
        }

        this.time.delayedCall(800, () => {
          this.playerControl = true;
        });
      }
    });
  }

  collectKeys() {
    if (InventorySystem.has('keys')) return;

    this.tweens.add({
      targets: [this.keysSprite, this.keysGlow, this.keysLabel],
      x: this.player.x, y: this.player.y, alpha: 0,
      duration: 400,
      onComplete: () => {
        this.keysSprite.setVisible(false);
        this.keysGlow.setVisible(false);
        this.keysLabel.setVisible(false);
        InventorySystem.addItem('keys');
        GameHUD.setObjective('Alcance o bote salva-vidas na proa.');
        GameHUD.setArea('CONVÉS ABERTO');
        this.openDeckDoor();
      }
    });
  }

  openDeckDoor() {
    this.deckDoorOpen = true;
  }

  updatePatrolPirate(pirate, delta) {
    if (!pirate.active || pirate.isDead || !pirate.waypoints) {
      pirate.setVelocity(0, 0);
      return;
    }
    if (pirate.label === 'guard' && this.captainAlerted) {
      pirate.setVelocity(0, 0);
      return;
    }

    const target = pirate.waypoints[pirate.wpIndex];
    const dx = target.x - pirate.x;
    const dy = target.y - pirate.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const arrivalDist = pirate.patrolArrival ?? 12;

    if (dist < arrivalDist) {
      pirate.setVelocity(0, 0);
      this.updatePirateTopAnim(pirate, false);

      if (pirate.patrolWait > 0) {
        pirate._waitTimer = (pirate._waitTimer || 0) + delta;
        if (pirate._waitTimer < pirate.patrolWait) return;
      }

      pirate._waitTimer = 0;
      pirate.wpIndex = (pirate.wpIndex + 1) % pirate.waypoints.length;
      pirate._stuckTimer = 0;
      pirate._lastPatrolDist = null;
    } else {
      const move = pirate.patrolSpeed * (delta / 1000);
      pirate.setVelocity(0, 0);
      this.moveWithWallSlide(
        pirate,
        (dx / dist) * move,
        (dy / dist) * move
      );
      pirate.facingAngle = Math.atan2(dy, dx);
      this.updatePirateTopAnim(pirate, true, dx, dy);

      if (pirate._lastPatrolDist != null && dist >= pirate._lastPatrolDist - 0.4) {
        pirate._stuckTimer = (pirate._stuckTimer || 0) + delta;
      } else {
        pirate._stuckTimer = 0;
      }
      pirate._lastPatrolDist = dist;

      if ((pirate._stuckTimer || 0) > 850) {
        pirate.wpIndex = (pirate.wpIndex + 1) % pirate.waypoints.length;
        pirate._stuckTimer = 0;
        pirate._lastPatrolDist = null;
      }

      pirate.stepTimer += delta;
      if (pirate.stepTimer > 440) {
        const vol = this.getPirateStepVolume(pirate);
        if (vol > 0) {
          GameAudio.playPirateStep(vol);
        }
        pirate.stepTimer = 0;
      }
    }

    this.drawVisionCone(pirate);
  }

  pirateSpotsIntruder() {
    if (this.gameOver || this.pirate1.isDead || this.captainAlerted) return;
    this.captainAlerted = true;
    this.playerControl = false;
    this.player.setVelocity(0, 0);

    const door = this.captainDoorPos;
    const dx = door.x - this.pirate1.x;
    const dy = door.y - this.pirate1.y;
    this.pirate1.facingAngle = Math.atan2(dy, dx);
    this.updatePirateTopAnim(this.pirate1, false, dx, dy);
    this.drawVisionCone(this.pirate1);

    this.triggerGameOver('O pirata ouviu você entrar e te pegou na porta!');
  }

  triggerGameOver(reason) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.playerControl = false;

    GameAudio.stopCreepyWhistle();
    GameAudio.playGameOver();
    GameHUD.hideDeckControlsHint();
    PauseSystem.unbindScene(this);

    this.cameras.main.resetFX();
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(300, 200, 0, 0);

    this._goToGameOverTimer?.remove(false);
    this._goToGameOverTimer = this.time.delayedCall(400, () => {
      this._goToGameOverTimer = null;
      if (!this.sys.isActive()) return;
      this.cameras.main.resetFX();
      this.scene.start('GameOverScene', { reason });
    });
  }

  triggerVictory() {
    this.gameOver = true;
    this.playerControl = false;
    GameAudio.stopCreepyWhistle();
    GameAudio.playVictory();
    GameHUD.hideDeckControlsHint();
    PauseSystem.unbindScene(this);
    this._goToVictoryTimer?.remove(false);
    this._goToVictoryTimer = this.time.delayedCall(500, () => {
      this._goToVictoryTimer = null;
      if (!this.sys.isActive()) return;
      this.cameras.main.resetFX();
      this.scene.start('VictoryScene');
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.updateCreepyWhistle(delta);

    this.isStealth = this.keys.SHIFT.isDown || TouchControls.isDown('stealth');
    this.isHidden = this.isStealth && this.isNearCover();
    this.stealthIndicator.setVisible(this.isHidden);
    this.stealthIndicator.setPosition(this.player.x, this.player.y);
    this.inCaptainRoom = this.isInZone(this.captainRoomZone);

    if (this.inCaptainRoom && !this.wasInCaptainRoom && !this.pirate1.isDead) {
      if (this.canDetectPlayer(this.pirate1)) {
        this.pirateSpotsIntruder();
      }
    }

    if (this.playerControl) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.E) || TouchControls.consumeAttack()) this.tryAttack();
      this.updateTouchAttackButton();

      const speed = TouchControls.getDeckSpeed(this.isStealth);
      let moving = false;
      let vx = 0, vy = 0;

      if (this.cursors.left.isDown || this.keys.A.isDown || TouchControls.isDown('left')) { vx = -speed; moving = true; }
      if (this.cursors.right.isDown || this.keys.D.isDown || TouchControls.isDown('right')) { vx = speed; moving = true; }
      if (this.cursors.up.isDown || this.keys.W.isDown || TouchControls.isDown('up')) { vy = -speed; moving = true; }
      if (this.cursors.down.isDown || this.keys.S.isDown || TouchControls.isDown('down')) { vy = speed; moving = true; }

      if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

      this.player.setVelocity(vx, vy);
      this.player.setAlpha(this.isStealth ? 0.55 : 1);
      this.player.setScale(this.PLAYER_TOP_SCALE * (this.isStealth ? 0.85 : 1));
      this.updatePlayerTopAnim(moving, vx, vy);

      if (moving) {
        this.stepTimer += delta;
        const interval = this.isStealth ? 500 : 300;
        if (this.stepTimer > interval) {
          GameAudio.playStep(this.isStealth);
          this.stepTimer = 0;
        }
      }
    } else {
      this.player.setVelocity(0, 0);
    }

    this.pirates.forEach(p => {
      if (p.waypoints) this.updatePatrolPirate(p, delta);
    });

    this.setFeetDepth(this.player);
    this.stealthIndicator.setDepth(Math.floor(this.player.y) - 1);
    this.pirates.forEach((pirate) => {
      if (!pirate.isDead) this.setFeetDepth(pirate);
    });

    this.pirates.forEach(pirate => {
      if (pirate.label === 'guard' && (!this.inCaptainRoom || this.captainAlerted)) return;
      if (pirate.label !== 'guard' && !this.isInPatrolZone()) return;
      if (!pirate.isDead && pirate.active && this.canDetectPlayer(pirate)) {
        const msg = pirate.label === 'guard'
          ? 'O pirata na sala do capitão te avistou!'
          : 'Um pirata patrulhando te avistou!';
        this.triggerGameOver(msg);
      }
    });

    if (!this.pirate1Dead && this.inCaptainRoom) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.pirate1.x, this.pirate1.y
      );
      if (this.pirate1Label) {
        this.pirate1Label.setPosition(this.pirate1.x, this.pirate1.y - 35);
        this.pirate1Label.setDepth(Math.floor(this.pirate1.y) + 1);
      }

      if (dist < 65 && !this.canDetectPlayer(this.pirate1) && InventorySystem.isEquipped('knife')) {
        this.showAttackHint();
        this.hideStealthWarning();
      } else if (this.canDetectPlayer(this.pirate1)) {
        this.showStealthWarning();
        this.hideAttackHint();
      } else {
        this.hideAttackHint();
        this.hideStealthWarning();
      }
    } else {
      this.hideAttackHint();
      this.hideStealthWarning();
    }

    if (!InventorySystem.has('keys') && this.inCaptainRoom) {
      const distToKeys = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.keysPos.x, this.keysPos.y
      );
      if (distToKeys < 55) this.collectKeys();
    }

    if (!this.deckDoorOpen && !InventorySystem.has('keys')
      && this.player.y < this.bowGateY + 50
      && this.player.y > this.bowGateY - 60
      && Math.abs(this.player.x - DECK_LAYOUT.bowGate.x) < getHullHalfWidth(this.bowGateY) - 30) {
      this.showDeckLockedHint();
    } else {
      this.hideDeckLockedHint();
    }

    const nearBoat = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.lifeboat.x, this.lifeboat.y
    ) < 95;

    if (nearBoat && !InventorySystem.has('keys')) {
      GameHUD.setObjective('Você precisa das chaves na sala do capitão (à direita) para usar o bote!');
    }

    const onDeck = this.isInZone(this.openDeckZone) || this.isInZone(this.bowZone);
    if (onDeck && !this.wasOnDeck && InventorySystem.has('keys')) {
      GameHUD.setArea('CONVÉS / PROA');
      GameHUD.setObjective('Alcance o bote salva-vidas na proa.');
    }
    this.wasOnDeck = onDeck;

    if (InventorySystem.has('keys')) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.lifeboat.x, this.lifeboat.y
      );
      if (dist < 72) this.triggerVictory();
    }

    this.wasInCaptainRoom = this.inCaptainRoom;

    if (this.rain) {
      this.rain.getChildren().forEach((drop) => {
        drop.y += drop.speed * (delta / 1000);
        drop.x += 36 * (delta / 1000);
        if (drop.y > 480) {
          drop.y = Phaser.Math.Between(20, 60);
          drop.x = Phaser.Math.Between(180, 940);
        }
      });
    }
  }

  showAttackHint() {}

  hideAttackHint() {}

  showStealthWarning() {}

  hideStealthWarning() {}

  showKeysHint() {}

  showDeckLockedHint() {}

  hideDeckLockedHint() {}
}
