const PauseSystem = {
  gameScene: null,
  sceneKey: null,
  paused: false,
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.btn = document.getElementById('pause-btn');
    this.overlay = document.getElementById('pause-overlay');
    this.resumeBtn = document.getElementById('pause-resume');
    this.optionsBtn = document.getElementById('pause-options');
    this.menuBtn = document.getElementById('pause-menu');
    this.quitBtn = document.getElementById('pause-quit');

    this.btn.addEventListener('click', () => this.toggle());
    this.resumeBtn.addEventListener('click', () => this.resume());
    this.optionsBtn.addEventListener('click', () => MenuSystem.showOptions());
    this.menuBtn.addEventListener('click', () => this.quitToMenu());
    this.quitBtn.addEventListener('click', () => MenuSystem.quit());

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (document.body.classList.contains('menu-active')) return;
      if (!this.gameScene) return;
      if (!document.getElementById('menu-modal').classList.contains('hidden')) {
        MenuSystem.hideModal();
        return;
      }
      e.preventDefault();
      this.toggle();
    });
  },

  bindScene(scene) {
    this.init();
    this.gameScene = scene;
    this.sceneKey = scene.sys.settings.key;
    this.paused = false;
    this.overlay.classList.add('hidden');
    document.body.classList.remove('game-paused');
  },

  unbindScene(scene) {
    if (this.gameScene !== scene) return;
    this.gameScene = null;
    this.sceneKey = null;
    this.paused = false;
    this.overlay.classList.add('hidden');
    document.body.classList.remove('game-paused');
  },

  toggle() {
    if (this.paused) this.resume();
    else this.pause();
  },

  pause() {
    if (!this.gameScene || this.paused) return;

    this.paused = true;
    this.gameScene.scene.pause(this.sceneKey);
    this.overlay.classList.remove('hidden');
    document.body.classList.add('game-paused');
    GameAudio.pauseAmbient();
  },

  resume() {
    if (!this.gameScene || !this.paused) return;

    this.paused = false;
    this.gameScene.scene.resume(this.sceneKey);
    this.overlay.classList.add('hidden');
    document.body.classList.remove('game-paused');
    GameAudio.resumeAmbient();
  },

  quitToMenu() {
    if (!this.gameScene) return;

    const key = this.sceneKey;
    this.paused = false;
    this.overlay.classList.add('hidden');
    document.body.classList.remove('game-paused');

    GameAudio.stopAmbient();
    InventorySystem.reset();
    DialogSystem.hide();
    GameHUD.hide();

    this.gameScene.scene.start('MenuScene');
    this.gameScene.scene.stop(key);

    this.gameScene = null;
    this.sceneKey = null;
  },

  isPaused() {
    return this.paused;
  }
};
