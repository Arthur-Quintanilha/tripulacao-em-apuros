class HoldScene extends Phaser.Scene {
  constructor() {
    super('HoldScene');
  }

  create() {
    SceneReset.resetCamera(this);
    this.physics.world.gravity.y = 720;
    this.cameras.main.setBackgroundColor('#1a0f05');

    GameAudio.playAmbient();
    DialogSystem.init();
    InventorySystem.init();

    this.PLAYER_SCALE = 0.38;
    this.SAILOR_SCALE = 0.52;
    this.FLOOR_TOP = 460;
    this.BOX_SCALE = 0.124;
    this.STAIRS_SCALE = 0.42;

    this.playerControl = false;
    this.dialogDone = false;
    this.sailorTalked = false;
    this.playerStanding = false;
    this.facing = 'right';
    this.stepTimer = 0;
    this.coyoteTimer = 0;
    this.JUMP_VELOCITY = -378;

    this.prepareHoldTextures();
    this.createTextures();
    this.createAnimations();
    this.createWorld();
    this.createPlayer();
    this.createSailor();
    this.setupInput();
    this.showIntro();

    this.events.once('shutdown', () => {
      PauseSystem.unbindScene(this);
      GameHUD.unbindScene(this);
      TouchControls.hide();
    });

    PauseSystem.bindScene(this);
    GameHUD.bindScene(this, {
      area: 'PORÃO DO NAVIO'
    });
    TouchControls.setMode('hold');
    TouchControls.show();
  }

  prepareHoldTextures() {
    ['hold_box', 'hold_stairs'].forEach((key) => {
      if (!this.textures.exists(key)) return;
      const tex = this.textures.get(key);
      const frame = tex.has('trimmed') ? tex.get('trimmed') : null;
      if (!frame || !frame.sourceSize) {
        registerHoldFrame(key, tex);
      }
      tex.setFilter(
        key === 'hold_box'
          ? Phaser.Textures.FilterMode.NEAREST
          : Phaser.Textures.FilterMode.LINEAR
      );
    });

    if (this.textures.exists('protagonist')) {
      const tex = this.textures.get('protagonist');
      ensurePlayerFrames(tex);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    if (this.textures.exists('sailor_fallen')) {
      const tex = this.textures.get('sailor_fallen');
      if (tex.frameTotal <= 1 || !tex.get(0)?.sourceSize) {
        registerSailorFrames(tex);
      }
    }
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x6b4c30);
    g.fillRect(0, 0, 56, 20);
    g.lineStyle(2, 0x4a3728);
    g.strokeRect(0, 0, 56, 20);
    g.generateTexture('step', 56, 20);
    g.clear();

    g.fillStyle(0x2a1a0a);
    g.fillRect(0, 0, 960, 80);
    g.generateTexture('floor', 960, 80);
    g.clear();

    g.destroy();
  }

  createAnimations() {
    ['player-idle', 'player-down', 'player-walk', 'player-walk-left', 'player-walk-right'].forEach((key) => {
      if (this.anims.exists(key)) this.anims.remove(key);
    });

    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'protagonist', frame: 0 }],
      frameRate: 1
    });

    this.anims.create({
      key: 'player-walk',
      frames: [
        { key: 'protagonist', frame: 1 },
        { key: 'protagonist', frame: 2 },
        { key: 'protagonist', frame: 3 }
      ],
      frameRate: 7,
      repeat: -1
    });

    this.anims.create({
      key: 'player-down',
      frames: [{ key: 'protagonist', frame: 4 }],
      frameRate: 1
    });
  }

  createWorld() {
    this.add.image(480, 270, 'hold_bg')
      .setDisplaySize(960, 540)
      .setDepth(0);

    this.platforms = this.physics.add.staticGroup();

    const floor = this.platforms.create(480, this.FLOOR_TOP + 40, 'floor');
    floor.setScale(1).refreshBody();
    floor.setAlpha(0);
    floor.body.setSize(960, 80);

    const boxFrame = this.textures.getFrame('hold_box', 'trimmed');
    const stairsFrame = this.textures.getFrame('hold_stairs', 'trimmed');
    const boxHeight = Math.round(boxFrame.height * this.BOX_SCALE);
    const stairsHeight = Math.round(stairsFrame.height * this.STAIRS_SCALE);

    const BOX_X = 725;
    const BOX_Y = this.FLOOR_TOP + 22;
    const STAIRS_X = 1060;
    const stairsWidth = Math.round(stairsFrame.width * this.STAIRS_SCALE);
    const STAIR_BASE_Y = this.FLOOR_TOP - 65;

    const boxWidth = Math.round(boxFrame.width * this.BOX_SCALE);

    this.boxTopY = BOX_Y - Math.round(boxHeight * 0.72);

    this.boxX = BOX_X;
    this.rampStartX = BOX_X + Math.round(boxWidth * 0.38);
    this.rampEndX = STAIRS_X - Math.round(stairsWidth * 0.12);
    this.stairTopX = STAIRS_X - Math.round(stairsWidth * 0.26);
    this.stairTopY = STAIR_BASE_Y - Math.round(stairsHeight * 0.93);
    this.STAIR_RAMP_OFFSET = 54;
    this.STAIR_FOOT_LIFT = 112;
    // Mantém os primeiros degraus como antes; reduz a inclinação no trecho final.
    this.STAIR_LIFT_BREAK_T = 0.42;
    this.STAIR_LIFT_TAIL_SCALE = 0.48;

    this.box = this.add.image(BOX_X, BOX_Y, 'hold_box', 'trimmed');
    this.box.setScale(this.BOX_SCALE);
    this.box.setOrigin(0.5, 1);
    this.box.setDepth(BOX_Y);

    this.createStepPlatform(BOX_X, this.boxTopY, Math.round(boxWidth * 0.82));

    this.physics.world.setBounds(0, 0, 1100, 540);

    this.stairsSprite = this.add.image(STAIRS_X, STAIR_BASE_Y, 'hold_stairs', 'trimmed');
    this.stairsSprite.setScale(this.STAIRS_SCALE);
    this.stairsSprite.setOrigin(1, 1);
    this.stairsSprite.setDepth(STAIR_BASE_Y - 120);

    this.exitZone = this.add.zone(this.stairTopX, this.getRampY(this.stairTopX) - 20, 90, 72);
    this.physics.add.existing(this.exitZone, true);
  }

  getRampY(x) {
    const t = Phaser.Math.Clamp(
      (x - this.rampStartX) / (this.rampEndX - this.rampStartX),
      0,
      1
    );

    if (t <= 0.01) return this.boxTopY;

    const baseY = Phaser.Math.Linear(this.boxTopY, this.stairTopY, t);
    const liftT = t <= this.STAIR_LIFT_BREAK_T
      ? t
      : this.STAIR_LIFT_BREAK_T + (t - this.STAIR_LIFT_BREAK_T) * this.STAIR_LIFT_TAIL_SCALE;
    const lift = Math.round(this.STAIR_RAMP_OFFSET + this.STAIR_FOOT_LIFT * liftT);
    return baseY - lift;
  }

  applyStairRamp() {
    const px = this.player.x;
    if (px < this.rampStartX - 8 || px > this.rampEndX + 20) return false;

    const vy = this.player.body.velocity.y;
    const py = this.player.y;
    const rampY = this.getRampY(px);

    if (py > this.boxTopY + 14 && px < this.rampStartX) return false;

    if (vy < -70) return false;

    if (py >= rampY - 36 && py <= rampY + 44) {
      this.player.y = rampY;
      if (vy > 0) {
        this.player.setVelocityY(0);
      }
      return true;
    }

    return false;
  }

  createStepPlatform(x, y, width) {
    const step = this.platforms.create(x, y, 'step');
    step.setAlpha(0);
    step.setOrigin(0.5, 1);
    step.body.setSize(width, 10);
    step.body.setOffset((56 - width) / 2, 10);
    step.refreshBody();
    return step;
  }

  setupPlayerBody() {
    const frame = this.player.frame;
    if (!frame?.sourceSize) return;
    const fw = frame.width;
    const fh = frame.height;
    const bw = Math.round(fw * 0.45);
    const bh = Math.round(fh * 0.85);
    this.player.body.setSize(bw, bh);
    this.player.body.setOffset(
      Math.round((fw - bw) / 2),
      Math.round(fh - bh)
    );
  }

  createPlayer() {
    this.player = this.physics.add.sprite(120, this.FLOOR_TOP - 25, 'protagonist', 4);
    this.player.setScale(this.PLAYER_SCALE);
    this.player.setOrigin(0.5, 0.5);
    this.player.setAngle(-90);
    this.player.setCollideWorldBounds(true);
    this.player.body.allowGravity = false;
    this.player.body.setMaxVelocity(200, 480);
    this.setupPlayerBody();
    this.physics.add.collider(this.player, this.platforms);
    this.player.play('player-down');
    this._lastFrame = 4;
  }

  createSailor() {
    this.sailor = this.add.sprite(310, this.FLOOR_TOP - 2, 'sailor_fallen', 0);
    this.sailor.setScale(this.SAILOR_SCALE);
    this.sailor.setOrigin(0.5, 0.95);
    this.sailor.setFlipX(false);
    this.sailor.setDepth(this.FLOOR_TOP);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
  }

  showIntro() {
    this.playerControl = false;
    DialogSystem.show([
      { speaker: 'Narrador', text: 'O navio está sob ataque. Você acorda no porão, caído entre destroços e silêncio.' },
      { speaker: 'Narrador', text: 'Com esforço, você se levanta. Um marujo jaz caído à sua frente...' }
    ], () => {
      this.standUp(() => {
        GameHUD.setObjective('Aproxime-se do marujo caído e veja se ainda há esperança.');
        this.playerControl = true;
      });
    });
  }

  standUp(onComplete) {
    if (this.playerStanding) {
      if (onComplete) onComplete();
      return;
    }

    this.playerControl = false;
    this.player.body.allowGravity = false;

    this.tweens.add({
      targets: this.player,
      angle: -45,
      y: this.FLOOR_TOP - 30,
      duration: 400,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.player.setAngle(0);
        this.player.setOrigin(0.5, 1);
        this.player.setFrame(5);
        this.player.y = this.FLOOR_TOP + 20;
        this.player.setScale(this.PLAYER_SCALE, this.PLAYER_SCALE * 0.75);
        this.setupPlayerBody();

        this.tweens.add({
          targets: this.player,
          y: this.FLOOR_TOP,
          scaleY: this.PLAYER_SCALE,
          duration: 500,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.player.setBounce(0);
            this.player.body.allowGravity = true;
            this.setupPlayerBody();
            this.player.setFrame(0);
            this.facing = 'right';
            this.updateFlip(false);
            this.player.play('player-idle');
            this.playerStanding = true;
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  updateFlip(walking) {
    if (walking) {
      this.player.setFlipX(this.facing === 'left');
    } else {
      this.player.setFlipX(this.facing === 'right');
    }
  }

  playWalkAnim() {
    if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'player-walk') {
      this.player.play('player-walk', true);
    }
  }

  startSailorDialog() {
    if (this.sailorTalked) return;
    this.sailorTalked = true;
    this.playerControl = false;
    this.sailor.setFrame(1);

    DialogSystem.show([
      { speaker: 'Você', text: 'Você está bem? Consigo ajudar!' },
      { speaker: 'Marujo', text: 'Não... não há mais salvação para mim. Leve isto — talvez ainda haja esperança para você.' },
      { speaker: 'Narrador', text: 'O marujo entrega um canivete enferrujado. Seus olhos se fecham para sempre.' }
    ], () => {
      InventorySystem.addItem('knife');
      GameAudio.playItemStash();
      this.dialogDone = true;
      this.playerControl = true;

      this.sailor.setAlpha(0.45);
      this.sailor.setTint(0x888888);

      DialogSystem.show([
        { speaker: 'Narrador', text: 'Encontre a saída do porão. Uma escada quebrada bloqueia o caminho — talvez a caixa ajude.' }
      ], () => {});
      GameHUD.setObjective('Encontre a saída do porão. Suba na caixa e use os degraus para alcançar o convés.');
    });
  }

  update(time, delta) {
    if (!this.playerControl || !this.playerStanding) {
      this.player.setVelocity(0, 0);
      return;
    }

    const speed = 160;
    let moving = false;

    if (this.cursors.left.isDown || this.keys.A.isDown || TouchControls.isDown('left')) {
      this.player.setVelocityX(-speed);
      this.facing = 'left';
      moving = true;
    } else if (this.cursors.right.isDown || this.keys.D.isDown || TouchControls.isDown('right')) {
      this.player.setVelocityX(speed);
      this.facing = 'right';
      moving = true;
    } else {
      this.player.setVelocityX(0);
    }

    const onFloor = this.player.body.blocked.down || this.player.body.touching.down;
    const onRamp = this.applyStairRamp();
    const ascending = this.player.body.velocity.y < -65;
    const grounded = onFloor || onRamp;

    if (grounded) {
      this.coyoteTimer = 100;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    if (onRamp && !ascending) {
      this.player.body.setAllowGravity(false);
      if (this.player.body.velocity.y > 0) {
        this.player.setVelocityY(0);
      }
    } else {
      this.player.body.setAllowGravity(true);
    }

    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.keys.W)
      || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)
      || TouchControls.consumeJump();

    if (jumpPressed && this.coyoteTimer > 0) {
      this.player.setVelocityY(this.JUMP_VELOCITY);
      this.coyoteTimer = 0;
    }

    if (moving && grounded) {
      this.updateFlip(true);
      this.playWalkAnim();
      this.stepTimer += delta;
      if (this.stepTimer > 380) {
        GameAudio.playStep(false);
        this.stepTimer = 0;
      }
    } else if (grounded) {
      this.updateFlip(false);
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'player-idle') {
        this.player.play('player-idle', true);
      }
    }

    if (this.player.frame.name !== this._lastFrame) {
      this._lastFrame = this.player.frame.name;
      this.setupPlayerBody();
    }

    this.player.setDepth(
      this.player.x >= this.rampStartX - 16
        ? this.player.y + 260
        : this.player.y + 1
    );

    if (!this.sailorTalked) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.sailor.x, this.sailor.y);
      if (dist < 90) {
        this.startSailorDialog();
      }
    }

    if (this.dialogDone) {
      const reachedExit = this.physics.overlap(this.player, this.exitZone);
      const onTopSteps = this.player.x > this.stairTopX - 48
        && this.player.y <= this.getRampY(this.rampEndX) + 10;
      if (reachedExit || onTopSteps) {
        this.transitionToDeck();
      }
    }
  }

  transitionToDeck() {
    this.playerControl = false;
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DeckScene');
    });
  }
}
