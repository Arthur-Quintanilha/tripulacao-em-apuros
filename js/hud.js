const GameHUD = {
  initialized: false,
  visible: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.panel = document.getElementById('game-hud');
    this.areaName = document.getElementById('hud-area-name');
    this.objectiveText = document.getElementById('hud-objective-text');
  },

  show() {
    this.init();
    this.visible = true;
    this.panel.classList.remove('hidden');
    document.body.classList.add('game-active');
    InventorySystem.init();
    InventorySystem.render();
  },

  hide() {
    if (!this.initialized) return;
    this.visible = false;
    this.panel.classList.add('hidden');
    document.body.classList.remove('game-active');
    InventorySystem.hideTooltip();
  },

  bindScene(scene, config = {}) {
    this.show();
    if (config.area) this.setArea(config.area);
    if (config.objective) {
      this.setObjective(config.objective);
    } else {
      this.hideObjective();
    }
    this.setObjectiveLayout(config.objectiveLayout || 'top-left');
    scene._hudBound = true;
  },

  unbindScene(scene) {
    if (scene && !scene._hudBound) return;
    if (scene) scene._hudBound = false;
    this.setObjectiveLayout('top-left');
    this.hide();
  },

  setArea(name) {
    this.init();
    this.areaName.textContent = name;
  },

  setObjective(text) {
    this.init();
    this.objectivePanel = this.objectivePanel || document.getElementById('hud-objective');
    this.objectiveText.textContent = text;
    this.objectivePanel.classList.remove('hidden');
  },

  hideObjective() {
    this.init();
    this.objectivePanel = this.objectivePanel || document.getElementById('hud-objective');
    this.objectiveText.textContent = '';
    this.objectivePanel.classList.add('hidden');
  },

  setObjectiveLayout(layout) {
    this.init();
    this.objectivePanel = this.objectivePanel || document.getElementById('hud-objective');
    this.objectivePanel.classList.toggle('objective-bottom-right', layout === 'bottom-right');
  },

  showDeckControlsHint(durationMs = 5000) {
    this.init();
    this.deckHint = this.deckHint || document.getElementById('deck-controls-hint');
    if (!this.deckHint) return;

    clearTimeout(this._deckHintTimer);
    this.deckHint.classList.remove('hidden', 'fade-out');
    this._deckHintTimer = setTimeout(() => this.hideDeckControlsHint(), durationMs);
  },

  hideDeckControlsHint() {
    clearTimeout(this._deckHintTimer);
    this.deckHint = this.deckHint || document.getElementById('deck-controls-hint');
    if (!this.deckHint || this.deckHint.classList.contains('hidden')) return;

    this.deckHint.classList.add('fade-out');
    setTimeout(() => {
      if (!this.deckHint) return;
      this.deckHint.classList.add('hidden');
      this.deckHint.classList.remove('fade-out');
    }, 500);
  }
};
