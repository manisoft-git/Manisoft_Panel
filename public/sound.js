// Mathematical Web Audio & Haptics Synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.profile = 'Cyberpunk NOC'; // 'Cyberpunk NOC', 'Mechanical Terminal', 'Stealth Silent'
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (this.profile === 'Stealth Silent') return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  tap() {
    this.playTone(800, 'sine', 0.03, 0.02);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  success() {
    // Pentatonic chord
    this.playTone(523.25, 'triangle', 0.1, 0.04);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.04), 60);
    setTimeout(() => this.playTone(783.99, 'triangle', 0.18, 0.05), 120);
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
  }

  error() {
    // Descending dissonance
    this.playTone(280, 'sawtooth', 0.15, 0.06);
    setTimeout(() => this.playTone(240, 'sawtooth', 0.2, 0.07), 80);
    if (navigator.vibrate) navigator.vibrate([40, 50, 60]);
  }

  panic() {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

export const sound = new SoundEngine();
