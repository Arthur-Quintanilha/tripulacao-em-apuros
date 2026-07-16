const DialogSystem = {
  box: null,
  speakerEl: null,
  textEl: null,
  leftPortrait: null,
  rightPortrait: null,
  leftImg: null,
  rightImg: null,
  lines: [],
  index: 0,
  onComplete: null,
  active: false,

  THEMES: ['dialog-theme-narrator', 'dialog-theme-marujo', 'dialog-theme-marujo-injured', 'dialog-theme-player'],

  SPEAKER_PORTRAITS: {
    Narrador: {
      side: 'left',
      theme: 'narrator',
      label: 'NARRADOR',
      src: 'assets/dialog/narrator.png',
      position: 'center 6%',
      scale: 1.05,
      width: 108
    },
    Você: {
      side: 'right',
      theme: 'player',
      label: 'VOCÊ',
      src: 'assets/dialog/sailor_young.png',
      position: 'center 4%',
      scale: 1.65,
      width: 100
    },
    Marujo: {
      side: 'left',
      theme: 'marujo-injured',
      label: 'MARUJO FERIDO',
      src: 'assets/dialog/sailor_injured.png',
      position: 'center 4%',
      scale: 1.65,
      width: 108
    }
  },

  init() {
    this.box = document.getElementById('dialog-box');
    this.speakerEl = document.getElementById('dialog-speaker');
    this.textEl = document.getElementById('dialog-text');
    this.leftPortrait = document.getElementById('dialog-portrait-left');
    this.rightPortrait = document.getElementById('dialog-portrait-right');
    this.leftImg = document.getElementById('dialog-portrait-left-img');
    this.rightImg = document.getElementById('dialog-portrait-right-img');

    this.box.addEventListener('click', () => this.advance());
    document.addEventListener('keydown', (e) => {
      if (this.active && (e.key === 'e' || e.key === 'E' || e.key === 'Enter')) {
        this.advance();
      }
    });
  },

  show(lines, onComplete) {
    this.lines = lines;
    this.index = 0;
    this.onComplete = onComplete;
    this.active = true;
    this.box.classList.remove('hidden');
    this.renderLine();
  },

  renderLine() {
    const line = this.lines[this.index];
    const config = this.SPEAKER_PORTRAITS[line.speaker];

    this.applyTheme(config?.theme || 'narrator');
    this.speakerEl.textContent = config?.label || line.speaker.toUpperCase();
    this.textEl.textContent = line.text;
    this.updatePortrait(config, line.speaker);
  },

  applyTheme(theme) {
    this.THEMES.forEach((cls) => this.box.classList.remove(cls));
    this.box.classList.add(`dialog-theme-${theme}`);
  },

  updatePortrait(config, speaker) {
    this.leftPortrait.classList.remove('visible');
    this.rightPortrait.classList.remove('visible');
    this.resetPortraitImg(this.leftImg);
    this.resetPortraitImg(this.rightImg);

    if (!config) return;

    const slot = config.side === 'right' ? this.rightPortrait : this.leftPortrait;
    const img = config.side === 'right' ? this.rightImg : this.leftImg;

    slot.classList.add('visible');
    img.alt = speaker;
    img.src = config.src;

    if (config.sheet) {
      this.applySpriteCrop(img, config);
    } else {
      const frameEl = img.parentElement;
      frameEl.classList.remove('portrait-sprite-crop');
      frameEl.style.backgroundImage = '';
      frameEl.style.backgroundSize = '';
      frameEl.style.backgroundPosition = '';
      frameEl.style.backgroundRepeat = '';
      img.style.display = '';
      img.classList.remove('portrait-sprite');
      img.style.objectPosition = config.position || 'center top';
      img.style.transform = config.scale ? `scale(${config.scale})` : '';
      img.style.transformOrigin = 'center top';
      if (config.width) {
        frameEl.style.setProperty('--portrait-width', `${config.width}px`);
      }
    }
  },

  applySpriteCrop(img, config) {
    const frame = config.sheet;
    const sheet = config.sheetSize;
    const displayWidth = config.width || 100;
    const scale = displayWidth / frame.w;
    const frameEl = img.parentElement;

    img.classList.add('portrait-sprite');
    img.style.display = 'none';
    frameEl.classList.add('portrait-sprite-crop');
    frameEl.style.setProperty('--portrait-width', `${displayWidth}px`);
    frameEl.style.backgroundImage = `url('${config.src}')`;
    frameEl.style.backgroundSize = `${Math.round(sheet.w * scale)}px ${Math.round(sheet.h * scale)}px`;
    frameEl.style.backgroundPosition = `${Math.round(-frame.x * scale)}px ${Math.round(-frame.y * scale)}px`;
    frameEl.style.backgroundRepeat = 'no-repeat';
  },

  resetPortraitImg(img) {
    const frameEl = img.parentElement;
    img.removeAttribute('src');
    img.removeAttribute('alt');
    img.classList.remove('portrait-sprite');
    img.style.display = '';
    img.style.width = '';
    img.style.height = '';
    img.style.maxWidth = '';
    img.style.objectFit = '';
    img.style.objectPosition = '';
    img.style.transform = '';
    img.style.transformOrigin = '';
    if (frameEl) {
      frameEl.classList.remove('portrait-sprite-crop');
      frameEl.style.backgroundImage = '';
      frameEl.style.backgroundSize = '';
      frameEl.style.backgroundPosition = '';
      frameEl.style.backgroundRepeat = '';
      frameEl.style.removeProperty('--portrait-width');
    }
  },

  advance() {
    if (!this.active) return;
    this.index++;
    if (this.index >= this.lines.length) {
      this.hide();
      if (this.onComplete) this.onComplete();
    } else {
      this.renderLine();
    }
  },

  hide() {
    this.active = false;
    this.box.classList.add('hidden');
    this.leftPortrait.classList.remove('visible');
    this.rightPortrait.classList.remove('visible');
    this.resetPortraitImg(this.leftImg);
    this.resetPortraitImg(this.rightImg);
  },

  showObjective(text, duration = 5000) {
    if (typeof GameHUD !== 'undefined' && GameHUD.visible) {
      GameHUD.setObjective(text);
      return;
    }

    const banner = document.getElementById('objective-banner');
    const textEl = document.getElementById('objective-text');
    textEl.textContent = text;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), duration);
  },

  showBloodSplash() {
    const splash = document.getElementById('blood-splash');
    splash.classList.remove('hidden');
    setTimeout(() => splash.classList.add('hidden'), 1200);
  }
};
