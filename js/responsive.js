const GameScale = {
  BASE_W: 960,
  BASE_H: 540,
  game: null,
  _syncing: false,
  _raf: 0,
  _refreshTimer: 0,

  init(game) {
    this.game = game;

    const scheduleSync = () => {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => this.sync());
    };

    this.updateLayout();
    game.events.once('ready', () => {
      this.refreshPhaser();
      scheduleSync();
    });

    game.scale.on('resize', scheduleSync);

    const onViewportChange = () => {
      this.updateLayout();
    };

    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', () => {
      setTimeout(onViewportChange, 100);
      setTimeout(onViewportChange, 350);
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportChange);
    }
  },

  sync() {
    if (this._syncing || !this.game?.canvas) return;
    this._syncing = true;

    try {
      const canvas = this.game.canvas;
      const wrapper = document.getElementById('game-wrapper');
      const overlay = document.getElementById('ui-overlay');
      const touch = document.getElementById('touch-controls');
      if (!wrapper || !overlay) return;

      const canvasRect = canvas.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      if (canvasRect.width < 2 || canvasRect.height < 2) return;

      const scale = canvasRect.width / this.BASE_W;

      overlay.style.left = `${canvasRect.left - wrapperRect.left}px`;
      overlay.style.top = `${canvasRect.top - wrapperRect.top}px`;
      overlay.style.width = `${this.BASE_W}px`;
      overlay.style.height = `${this.BASE_H}px`;
      overlay.style.transform = `scale(${scale})`;
      overlay.style.transformOrigin = 'top left';

      if (touch) {
        touch.style.left = `${canvasRect.left - wrapperRect.left}px`;
        touch.style.top = `${canvasRect.top - wrapperRect.top}px`;
        touch.style.width = `${canvasRect.width}px`;
        touch.style.height = `${canvasRect.height}px`;
      }

      document.documentElement.style.setProperty('--game-scale', String(scale));

      if (typeof TouchControls !== 'undefined') {
        TouchControls.updateVisibility();
      }
    } finally {
      this._syncing = false;
    }
  },

  getViewportSize() {
    if (window.visualViewport) {
      return {
        width: Math.round(window.visualViewport.width),
        height: Math.round(window.visualViewport.height)
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  },

  updateLayout() {
    const mobileLandscape = this.isMobileLandscape();
    document.body.classList.toggle('mobile-fullscreen', mobileLandscape);
    this.updateOrientationHint();

    const wrapper = document.getElementById('game-wrapper');
    const container = document.getElementById('game-container');
    if (!wrapper || !container) return;

    if (mobileLandscape) {
      const { width, height } = this.getViewportSize();
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
    } else {
      wrapper.style.width = '';
      wrapper.style.height = '';
      container.style.width = '';
      container.style.height = '';
    }

    this.refreshPhaser();
  },

  refreshPhaser() {
    if (!this.game?.scale) return;

    clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(() => {
      const container = document.getElementById('game-container');
      if (!container) return;

      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 2 || h < 2) return;

      this.game.scale.refresh();
      requestAnimationFrame(() => this.sync());
    }, 80);
  },

  isMobileLandscape() {
    return this.isMobile() && this.isLandscape();
  },

  isMobile() {
    return window.matchMedia('(pointer: coarse) and (hover: none)').matches;
  },

  isLandscape() {
    return window.innerWidth > window.innerHeight;
  },

  updateOrientationHint() {
    const hint = document.getElementById('orientation-hint');
    if (!hint) return;

    const show = this.isMobile() && !this.isLandscape()
      && !document.body.classList.contains('loading-active');
    hint.classList.toggle('hidden', !show);
    document.body.classList.toggle('orientation-lock', show);
  }
};
