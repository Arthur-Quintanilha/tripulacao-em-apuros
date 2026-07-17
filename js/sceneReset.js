const SceneReset = {
  GAME_SCENES: ['VictoryScene', 'GameOverScene', 'DeckScene', 'HoldScene', 'BootScene'],

  stopGameScenes(scene) {
    const currentKey = scene.scene.key;
    this.GAME_SCENES.forEach((key) => {
      if (key === currentKey) return;
      if (scene.scene.isActive(key)) {
        scene.scene.stop(key);
      }
    });
  },

  resetCamera(scene) {
    const cam = scene.cameras?.main;
    if (!cam) return;
    cam.resetFX();
    cam.setAlpha(1);
  },

  clearGameUi(scene) {
    VictorySystem.hide();
    GameOverSystem.hide();
    DialogSystem.hide();
    GameHUD.hide();
    TouchControls.hide();
    PauseSystem.unbindScene(scene);
    InventorySystem.reset();
    MenuSystem.hide();
    document.body.classList.remove('game-paused', 'game-active', 'game-over-active', 'victory-active');
  },

  returnToMenu(scene) {
    this.clearGameUi(scene);
    GameAudio.stopAmbient();
    GameAudio.stopCreepyWhistle();
    this.stopGameScenes(scene);
    this.resetCamera(scene);
    scene.scene.start('MenuScene');
  },

  startNewGame(scene) {
    MenuSystem.hide();
    TouchControls.hide();
    GameAudio.stopMenuAmbient();
    this.stopGameScenes(scene);
    this.resetCamera(scene);
    scene.scene.start('BootScene');
  }
};
