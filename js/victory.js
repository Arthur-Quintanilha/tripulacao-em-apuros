const VictorySystem = {
  initialized: false,
  onPlayAgain: null,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.overlay = document.getElementById('victory-overlay');
    this.playAgainBtn = document.getElementById('victory-play-again');

    this.playAgainBtn.addEventListener('click', () => {
      if (this.onPlayAgain) this.onPlayAgain();
    });

    document.addEventListener('keydown', (e) => {
      if (this.overlay.classList.contains('hidden')) return;
      if (e.key === 'Enter' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (this.onPlayAgain) this.onPlayAgain();
      }
    });
  },

  show(callbacks = {}) {
    this.init();
    this.onPlayAgain = callbacks.onPlayAgain || null;
    this.overlay.classList.remove('hidden');
    document.body.classList.add('victory-active');
    GameHUD.hide();
    InventorySystem.hideTooltip();
  },

  hide() {
    if (!this.initialized) return;
    this.overlay.classList.add('hidden');
    document.body.classList.remove('victory-active');
    this.onPlayAgain = null;
  }
};
