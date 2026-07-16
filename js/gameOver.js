const GameOverSystem = {
  initialized: false,
  onRetry: null,
  onMenu: null,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.overlay = document.getElementById('game-over-overlay');
    this.reasonEl = document.getElementById('game-over-reason');
    this.retryBtn = document.getElementById('game-over-retry');
    this.menuBtn = document.getElementById('game-over-menu');

    this.retryBtn.addEventListener('click', () => {
      if (this.onRetry) this.onRetry();
    });
    this.menuBtn.addEventListener('click', () => {
      if (this.onMenu) this.onMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (this.overlay.classList.contains('hidden')) return;
      if (e.key === 'Enter' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (this.onRetry) this.onRetry();
      }
    });
  },

  show(reason, callbacks = {}) {
    this.init();
    this.onRetry = callbacks.onRetry || null;
    this.onMenu = callbacks.onMenu || null;
    this.reasonEl.textContent = reason || 'Você foi detectado pelos piratas.';
    this.overlay.classList.remove('hidden');
    document.body.classList.add('game-over-active');
    GameHUD.hide();
    InventorySystem.hideTooltip();
  },

  hide() {
    if (!this.initialized) return;
    this.overlay.classList.add('hidden');
    document.body.classList.remove('game-over-active');
    this.onRetry = null;
    this.onMenu = null;
  }
};
