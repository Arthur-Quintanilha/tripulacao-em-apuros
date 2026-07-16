const MenuSystem = {
  panel: null,
  buttons: [],
  selectedIndex: 0,
  active: false,
  initialized: false,
  onPlay: null,

  init() {
    if (this.initialized) {
      this.show();
      return;
    }
    this.initialized = true;

    this.panel = document.getElementById('main-menu');
    this.buttons = Array.from(this.panel.querySelectorAll('.menu-btn:not(.menu-btn-disabled)'));
    this.modal = document.getElementById('menu-modal');
    this.modalTitle = document.getElementById('menu-modal-title');
    this.modalBody = document.getElementById('menu-modal-body');
    this.modalClose = document.getElementById('menu-modal-close');

    this.panel.querySelector('[data-action="play"]').addEventListener('click', () => this.play());
    this.panel.querySelector('[data-action="options"]').addEventListener('click', () => this.showOptions());
    this.panel.querySelector('[data-action="credits"]').addEventListener('click', () => this.showCredits());
    this.panel.querySelector('[data-action="quit"]').addEventListener('click', () => this.quit());

    this.modalClose.addEventListener('click', () => this.hideModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hideModal();
    });

    document.addEventListener('keydown', (e) => this.onKeyDown(e));

    this.buttons.forEach((btn, i) => {
      btn.addEventListener('mouseenter', () => {
        this.selectedIndex = i;
        this.updateSelection();
      });
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'play') this.play();
        else if (action === 'options') this.showOptions();
        else if (action === 'credits') this.showCredits();
        else if (action === 'quit') this.quit();
      });
    });
  },

  show() {
    this.active = true;
    this.selectedIndex = 0;
    this.panel.classList.remove('hidden');
    document.body.classList.add('menu-active');
    this.updateSelection();
  },

  hide() {
    this.active = false;
    this.panel.classList.add('hidden');
    document.body.classList.remove('menu-active');
    this.hideModal();
  },

  updateSelection() {
    this.buttons.forEach((btn, i) => {
      btn.classList.toggle('menu-btn-selected', i === this.selectedIndex);
    });
  },

  onKeyDown(e) {
    if (!this.active || !this.modal.classList.contains('hidden')) return;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateSelection();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.buttons[this.selectedIndex].click();
    }
  },

  play() {
    if (!this.onPlay) return;
    GameAudio.init();
    this.hide();
    this.onPlay();
  },

  showOptions() {
    this.modalTitle.textContent = 'Opções';
    this.modalBody.innerHTML = `
      <label class="menu-option">
        <span>Volume geral</span>
        <input type="range" id="menu-volume" min="0" max="100" value="85">
      </label>
    `;
    this.modal.classList.remove('hidden');

    const slider = document.getElementById('menu-volume');
    const saved = localStorage.getItem('tea_volume');
    if (saved !== null) slider.value = saved;

    slider.addEventListener('input', () => {
      const vol = slider.value / 100;
      localStorage.setItem('tea_volume', slider.value);
      GameAudio.init();
      if (GameAudio.masterGain) {
        GameAudio.masterGain.gain.value = vol;
      }
    });
  },

  showCredits() {
    this.modalTitle.textContent = 'Créditos';
    this.modalBody.innerHTML = `
      <p><strong>Tripulação em Apuros</strong></p>
      <p>Projeto acadêmico — UFOP</p>
      <p>Desenvolvido com Phaser 3</p>
      <p class="menu-credits-muted">Arte, design e programação pela equipe do projeto.</p>
    `;
    this.modal.classList.remove('hidden');
  },

  hideModal() {
    this.modal.classList.add('hidden');
  },

  quit() {
    this.modalTitle.textContent = 'Sair';
    this.modalBody.innerHTML = '<p>Obrigado por jogar. Você pode fechar esta aba do navegador.</p>';
    this.modal.classList.remove('hidden');
  }
};
