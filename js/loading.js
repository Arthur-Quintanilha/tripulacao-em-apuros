const LoadingSystem = {
  screen: null,
  bar: null,
  percent: null,
  status: null,
  startTime: 0,
  minDisplayMs: 1400,

  init() {
    this.screen = document.getElementById('loading-screen');
    this.bar = document.getElementById('loading-bar-fill');
    this.percent = document.getElementById('loading-percent');
    this.status = document.getElementById('loading-status');
    this.startTime = Date.now();
    document.body.classList.add('loading-active');
  },

  setProgress(value) {
    const pct = Math.min(100, Math.round(value * 100));
    if (this.bar) this.bar.style.width = pct + '%';
    if (this.percent) this.percent.textContent = pct + '%';

    const track = document.querySelector('.loading-bar-track');
    if (track) track.setAttribute('aria-valuenow', String(pct));

    if (this.status) {
      if (pct < 25) this.status.textContent = 'Içando as velas...';
      else if (pct < 50) this.status.textContent = 'Carregando o porão...';
      else if (pct < 75) this.status.textContent = 'Preparando o convés...';
      else if (pct < 100) this.status.textContent = 'Reunindo a tripulação...';
      else this.status.textContent = 'Pronto para zarpar!';
    }
  },

  complete(onDone) {
    this.setProgress(1);
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.minDisplayMs - elapsed);

    setTimeout(() => {
      this.hide();
      if (onDone) onDone();
    }, remaining);
  },

  hide() {
    if (!this.screen) return;
    this.screen.classList.add('loading-fade-out');
    document.body.classList.remove('loading-active');
    this.screen.setAttribute('aria-busy', 'false');

    setTimeout(() => {
      this.screen.classList.add('hidden');
    }, 650);
  }
};

LoadingSystem.init();
