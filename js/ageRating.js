const AgeRatingSystem = {
  screen: null,
  onContinue: null,
  initialized: false,
  dismissing: false,
  autoTimer: null,
  displayMs: 3000,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.screen = document.getElementById('age-rating-screen');
    if (!this.screen) return;

    const continueGame = (e) => {
      if (this.dismissing) return;
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      if (e.type === 'keydown' || e.type === 'click' || e.type === 'touchstart') {
        e.preventDefault();
      }
      this.hide();
    };

    this.screen.addEventListener('click', continueGame);
    this.screen.addEventListener('touchstart', continueGame, { passive: false });
    this._continueHandler = continueGame;
    document.addEventListener('keydown', continueGame);
  },

  show(onContinue) {
    this.init();
    this.onContinue = onContinue || null;
    this.dismissing = false;
    clearTimeout(this.autoTimer);

    if (!this.screen) {
      if (this.onContinue) this.onContinue();
      return;
    }

    this.screen.classList.remove('hidden', 'age-rating-fade-out');
    document.body.classList.add('age-rating-active');

    this.autoTimer = setTimeout(() => this.hide(), this.displayMs);
  },

  hide() {
    if (!this.screen || this.dismissing) return;
    this.dismissing = true;
    clearTimeout(this.autoTimer);
    this.autoTimer = null;

    this.screen.classList.add('age-rating-fade-out');
    document.body.classList.remove('age-rating-active');

    setTimeout(() => {
      this.screen.classList.add('hidden');
      this.screen.classList.remove('age-rating-fade-out');
      const cb = this.onContinue;
      this.onContinue = null;
      this.dismissing = false;
      if (cb) cb();
    }, 550);
  }
};
