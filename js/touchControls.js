const TouchControls = {
  root: null,
  enabled: false,
  mode: 'none',
  state: {
    left: false,
    right: false,
    up: false,
    down: false,
    stealth: false
  },
  analog: { x: 0, y: 0 },
  _jumpQueued: false,
  _attackQueued: false,
  _attackAvailable: false,
  _joystickBound: false,
  _joystickActive: false,
  _joystickPointerId: null,
  _joystickMaxRadius: 42,

  init() {
    if (this.root) return;
    this.root = document.getElementById('touch-controls');
    if (!this.root) return;

    this.joystickZone = document.getElementById('touch-joystick');
    this.joystickStick = document.getElementById('touch-joystick-stick');
    this.attackBtn = document.getElementById('touch-attack');

    this.bindHoldButton('touch-crouch', 'stealth');
    this.bindPulseButton('touch-jump', '_jumpQueued');
    this.bindPulseButton('touch-attack', '_attackQueued');
    this.setupJoystick();

    window.addEventListener('resize', () => {
      this.updateJoystickMaxRadius();
      this.updateVisibility();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateJoystickMaxRadius();
        this.updateVisibility();
      }, 150);
    });
  },

  updateJoystickMaxRadius() {
    const base = this.joystickZone?.querySelector('.touch-joystick-base');
    if (!base) return;
    const size = base.getBoundingClientRect().width;
    if (size < 2) return;
    this._joystickMaxRadius = Math.max(30, size * 0.36);
  },

  setupJoystick() {
    if (this._joystickBound || !this.joystickZone) return;
    this._joystickBound = true;

    const onStart = (clientX, clientY, pointerId) => {
      if (this._joystickActive) return;
      this.updateJoystickMaxRadius();
      this._joystickActive = true;
      this._joystickPointerId = pointerId;
      this.joystickZone.classList.add('is-active');
      this.updateJoystick(clientX, clientY);
    };

    const onMove = (clientX, clientY, pointerId) => {
      if (!this._joystickActive || pointerId !== this._joystickPointerId) return;
      this.updateJoystick(clientX, clientY);
    };

    const onEnd = (pointerId) => {
      if (pointerId !== this._joystickPointerId) return;
      this.resetJoystick();
    };

    this.joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      onStart(t.clientX, t.clientY, t.identifier);
    }, { passive: false });

    this.joystickZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this._joystickPointerId) {
          onMove(t.clientX, t.clientY, t.identifier);
          break;
        }
      }
    }, { passive: false });

    this.joystickZone.addEventListener('touchend', (e) => {
      for (const t of e.changedTouches) onEnd(t.identifier);
    });

    this.joystickZone.addEventListener('touchcancel', (e) => {
      for (const t of e.changedTouches) onEnd(t.identifier);
    });

    this.joystickZone.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e.clientX, e.clientY, 'mouse');
    });

    window.addEventListener('mousemove', (e) => {
      if (this._joystickPointerId === 'mouse') onMove(e.clientX, e.clientY, 'mouse');
    });

    window.addEventListener('mouseup', () => {
      if (this._joystickPointerId === 'mouse') onEnd('mouse');
    });
  },

  getJoystickCenter() {
    const base = this.joystickZone.querySelector('.touch-joystick-base');
    const rect = base.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  },

  updateJoystick(clientX, clientY) {
    const center = this.getJoystickCenter();
    let dx = clientX - center.x;
    let dy = clientY - center.y;
    const dist = Math.hypot(dx, dy);
    const maxR = this._joystickMaxRadius;

    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    if (this.joystickStick) {
      this.joystickStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }

    const nx = dx / maxR;
    const ny = dy / maxR;
    this.analog.x = nx;
    this.analog.y = ny;

    const t = 0.22;
    this.state.left = nx < -t;
    this.state.right = nx > t;
    this.state.up = ny < -t;
    this.state.down = ny > t;
  },

  resetJoystick() {
    this._joystickActive = false;
    this._joystickPointerId = null;
    this.analog.x = 0;
    this.analog.y = 0;
    this.state.left = false;
    this.state.right = false;
    this.state.up = false;
    this.state.down = false;
    if (this.joystickZone) this.joystickZone.classList.remove('is-active');
    if (this.joystickStick) {
      this.joystickStick.style.transform = 'translate(-50%, -50%)';
    }
  },

  bindHoldButton(id, key) {
    const el = document.getElementById(id);
    if (!el) return;

    const press = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.state[key] = true;
      el.classList.add('is-pressed');
    };
    const release = () => {
      this.state[key] = false;
      el.classList.remove('is-pressed');
    };

    el.addEventListener('touchstart', press, { passive: false });
    el.addEventListener('touchend', release);
    el.addEventListener('touchcancel', release);
    el.addEventListener('mousedown', press);
    window.addEventListener('mouseup', release);
    el.addEventListener('mouseleave', release);
  },

  bindPulseButton(id, queueKey) {
    const el = document.getElementById(id);
    if (!el) return;

    const pulse = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this[queueKey] = true;
    };

    el.addEventListener('touchstart', pulse, { passive: false });
    el.addEventListener('mousedown', pulse);
  },

  shouldShow() {
    return this.enabled
      && this.mode !== 'none'
      && GameScale.isMobile()
      && GameScale.isLandscape()
      && !document.body.classList.contains('orientation-lock');
  },

  setMode(mode) {
    this.mode = mode;
    if (!this.root) return;
    this.root.classList.toggle('mode-hold', mode === 'hold');
    this.root.classList.toggle('mode-deck', mode === 'deck');
    if (mode !== 'deck') this.setAttackAvailable(false);
    this.updateVisibility();
  },

  setAttackAvailable(available) {
    this._attackAvailable = !!available;
    if (!this.attackBtn) this.attackBtn = document.getElementById('touch-attack');
    if (this.attackBtn) {
      this.attackBtn.classList.toggle('is-available', this._attackAvailable);
      this.attackBtn.classList.toggle('hidden', !this._attackAvailable);
    }
  },

  show() {
    this.init();
    this.enabled = true;
    this.updateVisibility();
  },

  hide() {
    this.enabled = false;
    this.resetState();
    this.updateVisibility();
  },

  resetState() {
    this.resetJoystick();
    this.state.stealth = false;
    this._jumpQueued = false;
    this._attackQueued = false;
    this.setAttackAvailable(false);
    ['touch-crouch'].forEach((id) => {
      document.getElementById(id)?.classList.remove('is-pressed');
    });
  },

  updateVisibility() {
    if (!this.root) return;
    const visible = this.shouldShow();
    this.root.classList.toggle('hidden', !visible);
    document.body.classList.toggle('touch-controls-active', visible);
    if (visible) this.updateJoystickMaxRadius();
    if (!visible) this.resetState();
  },

  isDown(key) {
    return this.shouldShow() && !!this.state[key];
  },

  isMoving() {
    return this.isDown('left') || this.isDown('right') || this.isDown('up') || this.isDown('down');
  },

  getDeckSpeed(isStealth) {
    if (isStealth) return 75;
    return 170;
  },

  consumeJump() {
    if (!this._jumpQueued) return false;
    this._jumpQueued = false;
    return true;
  },

  consumeAttack() {
    if (!this._attackQueued) return false;
    this._attackQueued = false;
    return true;
  }
};
