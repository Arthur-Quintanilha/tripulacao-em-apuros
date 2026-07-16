const GameAudio = {
  ctx: null,
  masterGain: null,
  ambientNodes: null,
  menuNodes: null,
  creepyWhistleGain: null,
  _creepyWhistleRunning: false,
  _creepyWhistleTimeout: null,
  _creepyWhistleNoteIndex: 0,

  CREEPY_WHISTLE_MELODY: [
    { f: 784, d: 0.13, g: 0.05 },
    { f: 659, d: 0.13, g: 0.05 },
    { f: 784, d: 0.13, g: 0.05 },
    { f: 659, d: 0.13, g: 0.05 },
    { f: 784, d: 0.13, g: 0.05 },
    { f: 659, d: 0.13, g: 0.05 },
    { f: 784, d: 0.38, g: 0.16 },
    { f: 880, d: 0.14, g: 0.05 },
    { f: 784, d: 0.13, g: 0.05 },
    { f: 659, d: 0.13, g: 0.05 },
    { f: 784, d: 0.13, g: 0.05 },
    { f: 659, d: 0.42, g: 0.22 }
  ],

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      const saved = localStorage.getItem('tea_volume');
      this.masterGain.gain.value = saved !== null ? saved / 100 : 0.85;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  getMaster() {
    this.init();
    return this.masterGain;
  },

  createNoiseBuffer(duration = 1) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  },

  playTone(freq, duration, type = 'sine', volume = 0.15, dest = null) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(dest || this.getMaster());
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playStab() {
    this.init();
    this.playTone(200, 0.08, 'sawtooth', 0.25);
    setTimeout(() => this.playTone(80, 0.15, 'square', 0.2), 50);
    setTimeout(() => this.playTone(60, 0.3, 'sine', 0.1), 100);
  },

  playItemStash() {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();

    const rustle = this.ctx.createBufferSource();
    rustle.buffer = this.createNoiseBuffer(0.22);
    const rustleFilter = this.ctx.createBiquadFilter();
    rustleFilter.type = 'bandpass';
    rustleFilter.frequency.setValueAtTime(520, t);
    rustleFilter.frequency.exponentialRampToValueAtTime(280, t + 0.18);
    rustleFilter.Q.value = 0.9;
    const rustleGain = this.ctx.createGain();
    rustleGain.gain.setValueAtTime(0.001, t);
    rustleGain.gain.linearRampToValueAtTime(0.07, t + 0.03);
    rustleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    rustle.connect(rustleFilter);
    rustleFilter.connect(rustleGain);
    rustleGain.connect(dest);
    rustle.start(t);
    rustle.stop(t + 0.24);

    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(95, t + 0.06);
    thud.frequency.exponentialRampToValueAtTime(55, t + 0.14);
    thudGain.gain.setValueAtTime(0.001, t + 0.06);
    thudGain.gain.linearRampToValueAtTime(0.09, t + 0.07);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    thud.connect(thudGain);
    thudGain.connect(dest);
    thud.start(t + 0.06);
    thud.stop(t + 0.18);

    const clink = this.ctx.createOscillator();
    const clinkGain = this.ctx.createGain();
    clink.type = 'triangle';
    clink.frequency.setValueAtTime(920 + Math.random() * 80, t + 0.04);
    clink.frequency.exponentialRampToValueAtTime(640, t + 0.1);
    clinkGain.gain.setValueAtTime(0.001, t + 0.04);
    clinkGain.gain.linearRampToValueAtTime(0.045, t + 0.045);
    clinkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    clink.connect(clinkGain);
    clinkGain.connect(dest);
    clink.start(t + 0.04);
    clink.stop(t + 0.12);
  },

  playPirateStep(volumeMul = 1) {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();
    const decay = 0.13;
    const mul = Math.max(0, Math.min(1, volumeMul));

    const thud = this.ctx.createBufferSource();
    thud.buffer = this.createNoiseBuffer(0.2);
    const thudFilter = this.ctx.createBiquadFilter();
    thudFilter.type = 'lowpass';
    thudFilter.frequency.value = 170 + Math.random() * 50;
    const thudGain = this.ctx.createGain();
    const thudVol = (0.09 + Math.random() * 0.04) * mul;
    thudGain.gain.setValueAtTime(thudVol, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + decay);
    thud.connect(thudFilter);
    thudFilter.connect(thudGain);
    thudGain.connect(dest);
    thud.start(t);
    thud.stop(t + 0.2);

    const plank = this.ctx.createOscillator();
    const plankGain = this.ctx.createGain();
    plank.type = 'triangle';
    plank.frequency.setValueAtTime(85 + Math.random() * 25, t);
    plankGain.gain.setValueAtTime(0.04 * mul, t);
    plankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    plank.connect(plankGain);
    plankGain.connect(dest);
    plank.start(t);
    plank.stop(t + 0.08);

    const creak = this.ctx.createBufferSource();
    creak.buffer = this.createNoiseBuffer(0.1);
    const creakFilter = this.ctx.createBiquadFilter();
    creakFilter.type = 'bandpass';
    creakFilter.frequency.value = 210 + Math.random() * 70;
    creakFilter.Q.value = 1.6;
    const creakGain = this.ctx.createGain();
    creakGain.gain.setValueAtTime(0.018 * mul, t);
    creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    creak.connect(creakFilter);
    creakFilter.connect(creakGain);
    creakGain.connect(dest);
    creak.start(t);
    creak.stop(t + 0.1);
  },

  startCreepyWhistle() {
    this.init();
    if (this._creepyWhistleRunning) return;

    if (!this.creepyWhistleGain) {
      this.creepyWhistleGain = this.ctx.createGain();
      this.creepyWhistleGain.gain.value = 0;
      this.creepyWhistleGain.connect(this.getMaster());
    }

    this._creepyWhistleRunning = true;
    this._creepyWhistleNoteIndex = 0;
    this._scheduleCreepyWhistleNote();
  },

  _scheduleCreepyWhistleNote() {
    if (!this._creepyWhistleRunning) return;

    const note = this.CREEPY_WHISTLE_MELODY[this._creepyWhistleNoteIndex];
    this._playCreepyWhistleNote(note.f, note.d);
    this._creepyWhistleNoteIndex = (this._creepyWhistleNoteIndex + 1) % this.CREEPY_WHISTLE_MELODY.length;

    this._creepyWhistleTimeout = setTimeout(() => {
      this._scheduleCreepyWhistleNote();
    }, (note.d + note.g) * 1000);
  },

  _playCreepyWhistleNote(freq, dur) {
    if (!this._creepyWhistleRunning || !this.creepyWhistleGain) return;

    const t = this.ctx.currentTime;
    const dest = this.creepyWhistleGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    lfo.type = 'sine';
    lfo.frequency.value = 4.8;
    lfoGain.gain.value = 5.5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.85, t + 0.025);
    gain.gain.setValueAtTime(0.78, t + dur * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);

    const breath = this.ctx.createBufferSource();
    breath.buffer = this.createNoiseBuffer(dur * 0.6);
    const breathFilter = this.ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.value = 1800;
    breathFilter.Q.value = 0.6;
    const breathGain = this.ctx.createGain();
    breathGain.gain.setValueAtTime(0.012, t);
    breathGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.5);
    breath.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(dest);
    breath.start(t);
    breath.stop(t + dur * 0.6);
  },

  setCreepyWhistleVolume(volumeMul = 1) {
    this.init();
    if (!this.creepyWhistleGain) return;
    const vol = 0.052 * Math.max(0, Math.min(1, volumeMul));
    this.creepyWhistleGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.35);
  },

  stopCreepyWhistle() {
    this._creepyWhistleRunning = false;
    if (this._creepyWhistleTimeout) {
      clearTimeout(this._creepyWhistleTimeout);
      this._creepyWhistleTimeout = null;
    }
    if (this.creepyWhistleGain) {
      this.creepyWhistleGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    }
  },

  playStep(stealth = false) {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();
    const decay = stealth ? 0.1 : 0.14;

    const thud = this.ctx.createBufferSource();
    thud.buffer = this.createNoiseBuffer(0.18);

    const thudFilter = this.ctx.createBiquadFilter();
    thudFilter.type = 'lowpass';
    thudFilter.frequency.value = stealth ? 140 + Math.random() * 40 : 200 + Math.random() * 60;
    thudFilter.Q.value = 0.5;

    const thudGain = this.ctx.createGain();
    const thudVol = stealth ? 0.05 + Math.random() * 0.02 : 0.11 + Math.random() * 0.04;
    thudGain.gain.setValueAtTime(thudVol, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + decay);

    thud.connect(thudFilter);
    thudFilter.connect(thudGain);
    thudGain.connect(dest);
    thud.start(t);
    thud.stop(t + 0.18);

    const body = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(stealth ? 55 + Math.random() * 15 : 70 + Math.random() * 25, t);
    body.frequency.exponentialRampToValueAtTime(40, t + decay);
    bodyGain.gain.setValueAtTime(stealth ? 0.04 : 0.09, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + decay);
    body.connect(bodyGain);
    bodyGain.connect(dest);
    body.start(t);
    body.stop(t + decay + 0.02);

    const plank = this.ctx.createOscillator();
    const plankGain = this.ctx.createGain();
    plank.type = 'triangle';
    plank.frequency.setValueAtTime(stealth ? 90 + Math.random() * 20 : 110 + Math.random() * 35, t);
    plankGain.gain.setValueAtTime(stealth ? 0.015 : 0.035, t);
    plankGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    plank.connect(plankGain);
    plankGain.connect(dest);
    plank.start(t);
    plank.stop(t + 0.08);

    const creak = this.ctx.createBufferSource();
    creak.buffer = this.createNoiseBuffer(0.08);
    const creakFilter = this.ctx.createBiquadFilter();
    creakFilter.type = 'bandpass';
    creakFilter.frequency.value = 250 + Math.random() * 80;
    creakFilter.Q.value = 2;
    const creakGain = this.ctx.createGain();
    creakGain.gain.setValueAtTime(stealth ? 0.006 : 0.014, t);
    creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    creak.connect(creakFilter);
    creakFilter.connect(creakGain);
    creakGain.connect(dest);
    creak.start(t);
    creak.stop(t + 0.08);
  },

  playWaveCrash(intensity = 1) {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();

    const crash = this.ctx.createBufferSource();
    crash.buffer = this.createNoiseBuffer(2.5);

    const lowPass = this.ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(400 + intensity * 200, t);
    lowPass.frequency.exponentialRampToValueAtTime(120, t + 1.8);

    const highShelf = this.ctx.createBiquadFilter();
    highShelf.type = 'highpass';
    highShelf.frequency.value = 80;

    const crashGain = this.ctx.createGain();
    const peak = 0.08 + intensity * 0.06;
    crashGain.gain.setValueAtTime(0.001, t);
    crashGain.gain.linearRampToValueAtTime(peak, t + 0.3);
    crashGain.gain.linearRampToValueAtTime(peak * 0.7, t + 0.9);
    crashGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    crash.connect(highShelf);
    highShelf.connect(lowPass);
    lowPass.connect(crashGain);
    crashGain.connect(dest);
    crash.start(t);
    crash.stop(t + 2.5);

    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(55 + Math.random() * 15, t);
    rumble.frequency.exponentialRampToValueAtTime(35, t + 1.5);
    rumbleGain.gain.setValueAtTime(0.001, t);
    rumbleGain.gain.linearRampToValueAtTime(0.06 * intensity, t + 0.4);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 2);
    rumble.connect(rumbleGain);
    rumbleGain.connect(dest);
    rumble.start(t);
    rumble.stop(t + 2.2);
  },

  playAmbient() {
    this.init();
    if (this.ambientNodes) return;

    const dest = this.getMaster();
    const t = this.ctx.currentTime;

    const oceanLoop = this.ctx.createBufferSource();
    oceanLoop.buffer = this.createNoiseBuffer(4);
    oceanLoop.loop = true;

    const oceanFilter = this.ctx.createBiquadFilter();
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.value = 350;

    const oceanGain = this.ctx.createGain();
    oceanGain.gain.value = 0.035;

    oceanLoop.connect(oceanFilter);
    oceanFilter.connect(oceanGain);
    oceanGain.connect(dest);
    oceanLoop.start(t);

    this.ambientNodes = { oceanLoop, oceanGain };
    this._ambientPaused = false;
    this._scheduleWaves();
  },

  _scheduleWaves() {
    if (this._ambientPaused || !this.ambientNodes) return;

    const delay = 2200 + Math.random() * 2800;
    this._waveTimeout = setTimeout(() => {
      if (!this._ambientPaused && this.ambientNodes) {
        const intensity = 0.6 + Math.random() * 0.8;
        this.playWaveCrash(intensity);
      }
      this._scheduleWaves();
    }, delay);
  },

  pauseAmbient() {
    this._ambientPaused = true;
    if (this.ambientNodes) {
      this.ambientNodes.oceanGain.gain.value = 0;
    }
  },

  resumeAmbient() {
    this._ambientPaused = false;
    if (this.ambientNodes) {
      this.ambientNodes.oceanGain.gain.value = 0.035;
    }
  },

  playShipCreak() {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();

    const creak = this.ctx.createOscillator();
    const creakGain = this.ctx.createGain();
    creak.type = 'sawtooth';
    creak.frequency.setValueAtTime(180 + Math.random() * 80, t);
    creak.frequency.linearRampToValueAtTime(220 + Math.random() * 60, t + 0.4);

    creakGain.gain.setValueAtTime(0.001, t);
    creakGain.gain.linearRampToValueAtTime(0.012, t + 0.15);
    creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    creak.connect(creakGain);
    creakGain.connect(dest);
    creak.start(t);
    creak.stop(t + 0.55);
  },

  stopAmbient() {
    this._ambientPaused = false;
    if (this._waveTimeout) {
      clearTimeout(this._waveTimeout);
      this._waveTimeout = null;
    }
    if (this.ambientNodes) {
      try {
        this.ambientNodes.oceanLoop.stop();
      } catch (e) { /* já parado */ }
      this.ambientNodes = null;
    }
  },

  playMenuAmbient() {
    this.init();
    if (this.menuNodes) return;

    const dest = this.getMaster();
    const t = this.ctx.currentTime;

    const wind = this.ctx.createBufferSource();
    wind.buffer = this.createNoiseBuffer(6);
    wind.loop = true;
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 160;
    windFilter.Q.value = 0.35;
    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.06;

    const windLfo = this.ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.12;
    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.value = 0.028;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windGain.gain);

    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(dest);
    wind.start(t);
    windLfo.start(t);

    const ocean = this.ctx.createBufferSource();
    ocean.buffer = this.createNoiseBuffer(4);
    ocean.loop = true;
    const oceanFilter = this.ctx.createBiquadFilter();
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.value = 260;
    const oceanGain = this.ctx.createGain();
    oceanGain.gain.value = 0.045;
    ocean.connect(oceanFilter);
    oceanFilter.connect(oceanGain);
    oceanGain.connect(dest);
    ocean.start(t);

    this.menuNodes = {
      wind, windLfo, ocean,
      windGain, oceanGain
    };

    this._scheduleMenuThunder();
    this._scheduleMenuWaves();
  },

  _scheduleMenuThunder() {
    if (!this.menuNodes) return;

    const delay = 7000 + Math.random() * 14000;
    this._menuThunderTimeout = setTimeout(() => {
      if (this.menuNodes) this.playThunder();
      this._scheduleMenuThunder();
    }, delay);
  },

  _scheduleMenuWaves() {
    if (!this.menuNodes) return;

    const delay = 1800 + Math.random() * 2200;
    this._menuWaveTimeout = setTimeout(() => {
      if (this.menuNodes) {
        this.playWaveCrash(0.9 + Math.random() * 0.7);
      }
      this._scheduleMenuWaves();
    }, delay);
  },

  _schedulePirateScreams() {
    if (!this.menuNodes) return;

    const delay = 3500 + Math.random() * 7000;
    this._menuScreamTimeout = setTimeout(() => {
      if (this.menuNodes) {
        this.playPirateScream();
        if (Math.random() > 0.55) {
          setTimeout(() => this.playPirateScream(0.75), 250 + Math.random() * 600);
        }
        if (Math.random() > 0.7) {
          setTimeout(() => this.playDistantCannon(), 400 + Math.random() * 800);
        }
      }
      this._schedulePirateScreams();
    }, delay);
  },

  playThunder() {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();
    const intensity = 0.8 + Math.random() * 0.5;

    const crack = this.ctx.createBufferSource();
    crack.buffer = this.createNoiseBuffer(1.2);
    const crackFilter = this.ctx.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 200;
    const crackGain = this.ctx.createGain();
    crackGain.gain.setValueAtTime(0.001, t);
    crackGain.gain.linearRampToValueAtTime(0.12 * intensity, t + 0.02);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    crack.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(dest);
    crack.start(t);
    crack.stop(t + 0.4);

    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(42 + Math.random() * 18, t);
    rumble.frequency.exponentialRampToValueAtTime(28, t + 2.5);
    rumbleGain.gain.setValueAtTime(0.001, t);
    rumbleGain.gain.linearRampToValueAtTime(0.09 * intensity, t + 0.15);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 3);
    rumble.connect(rumbleGain);
    rumbleGain.connect(dest);
    rumble.start(t);
    rumble.stop(t + 3.2);

    const tail = this.ctx.createBufferSource();
    tail.buffer = this.createNoiseBuffer(2.5);
    const tailFilter = this.ctx.createBiquadFilter();
    tailFilter.type = 'lowpass';
    tailFilter.frequency.value = 180;
    const tailGain = this.ctx.createGain();
    tailGain.gain.setValueAtTime(0.001, t + 0.1);
    tailGain.gain.linearRampToValueAtTime(0.05 * intensity, t + 0.4);
    tailGain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
    tail.connect(tailFilter);
    tailFilter.connect(tailGain);
    tailGain.connect(dest);
    tail.start(t + 0.1);
    tail.stop(t + 3);
  },

  playPirateScream(volumeMul = 1) {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();
    const duration = 0.45 + Math.random() * 0.75;
    const vol = (0.035 + Math.random() * 0.045) * volumeMul;

    const yell = this.ctx.createOscillator();
    const yellGain = this.ctx.createGain();
    yell.type = 'sawtooth';
    const startF = 160 + Math.random() * 100;
    const peakF = 320 + Math.random() * 280;
    yell.frequency.setValueAtTime(startF, t);
    yell.frequency.linearRampToValueAtTime(peakF, t + duration * 0.2);
    yell.frequency.exponentialRampToValueAtTime(startF * 0.7, t + duration);

    yellGain.gain.setValueAtTime(0.001, t);
    yellGain.gain.linearRampToValueAtTime(vol, t + 0.06);
    yellGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    const yellFilter = this.ctx.createBiquadFilter();
    yellFilter.type = 'bandpass';
    yellFilter.frequency.value = 380 + Math.random() * 320;
    yellFilter.Q.value = 1.8;

    yell.connect(yellFilter);
    yellFilter.connect(yellGain);
    yellGain.connect(dest);
    yell.start(t);
    yell.stop(t + duration + 0.05);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(duration);
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 500 + Math.random() * 400;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(t);
    noise.stop(t + duration);

    if (Math.random() > 0.45) {
      setTimeout(() => {
        this.playTone(700 + Math.random() * 500, 0.06, 'square', vol * 0.5);
      }, 80 + Math.random() * 120);
    }
  },

  playDistantCannon() {
    this.init();
    const t = this.ctx.currentTime;
    const dest = this.getMaster();

    const boom = this.ctx.createBufferSource();
    boom.buffer = this.createNoiseBuffer(1.5);
    const boomFilter = this.ctx.createBiquadFilter();
    boomFilter.type = 'lowpass';
    boomFilter.frequency.setValueAtTime(220, t);
    boomFilter.frequency.exponentialRampToValueAtTime(60, t + 1.2);
    const boomGain = this.ctx.createGain();
    boomGain.gain.setValueAtTime(0.001, t);
    boomGain.gain.linearRampToValueAtTime(0.1, t + 0.04);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    boom.connect(boomFilter);
    boomFilter.connect(boomGain);
    boomGain.connect(dest);
    boom.start(t);
    boom.stop(t + 1.5);

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(55, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 1);
    subGain.gain.setValueAtTime(0.08, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    sub.connect(subGain);
    subGain.connect(dest);
    sub.start(t);
    sub.stop(t + 1.3);
  },

  stopMenuAmbient() {
    if (this._menuThunderTimeout) {
      clearTimeout(this._menuThunderTimeout);
      this._menuThunderTimeout = null;
    }
    if (this._menuWaveTimeout) {
      clearTimeout(this._menuWaveTimeout);
      this._menuWaveTimeout = null;
    }
    if (this._menuScreamTimeout) {
      clearTimeout(this._menuScreamTimeout);
      this._menuScreamTimeout = null;
    }

    if (!this.menuNodes) return;

    const stop = (node) => {
      try { node.stop(); } catch (e) { /* já parado */ }
    };

    stop(this.menuNodes.wind);
    stop(this.menuNodes.windLfo);
    stop(this.menuNodes.ocean);
    this.menuNodes = null;
  },

  playVictory() {
    this.init();
    [440, 554, 659, 880].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.3, 'sine', 0.12), i * 150);
    });
  },

  playGameOver() {
    this.init();
    [300, 250, 200, 150].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.4, 'sawtooth', 0.15), i * 200);
    });
  }
};
