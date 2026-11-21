// Tiny synthesized sound engine — every sound is generated with WebAudio,
// so the game ships zero audio files and makes zero network requests.
export class SoundEngine {
  constructor() {
    this.context = null;
    this.muted = false;
    this.master = null;
  }

  // Lazily create the AudioContext on the first user gesture (browser autoplay rule).
  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return true;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.35;
  }

  // One oscillator note with a quick attack and a soft decay.
  note(frequency, startAt, duration, type, volume) {
    if (this.muted || !this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    const t0 = this.context.currentTime + startAt;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  // A happy two-note "found it!" chime, pitch rising with the combo.
  found(combo) {
    if (!this.ensure()) return;
    const base = 523 * Math.pow(1.059, Math.min(combo, 8));
    this.note(base, 0, 0.18, 'sine', 0.5);
    this.note(base * 1.5, 0.09, 0.28, 'sine', 0.5);
    this.note(base * 2, 0.18, 0.34, 'triangle', 0.25);
  }

  // A low, dull buzz for a wrong click.
  wrong() {
    if (!this.ensure()) return;
    this.note(140, 0, 0.22, 'sawtooth', 0.22);
    this.note(110, 0.05, 0.22, 'sawtooth', 0.18);
  }

  // A soft sparkle when a hint is spent.
  hint() {
    if (!this.ensure()) return;
    this.note(880, 0, 0.15, 'sine', 0.3);
    this.note(1174, 0.08, 0.2, 'sine', 0.3);
    this.note(1568, 0.16, 0.3, 'sine', 0.25);
  }

  // A short tick when the timer drops under ten seconds.
  tick() {
    if (!this.ensure()) return;
    this.note(980, 0, 0.06, 'square', 0.12);
  }

  // A little fanfare for clearing a level.
  win() {
    if (!this.ensure()) return;
    const notes = [523, 659, 784, 1046, 784, 1046];
    notes.forEach((freq, i) => this.note(freq, i * 0.11, 0.3, 'triangle', 0.4));
  }

  // A sad descending line for running out of time.
  lose() {
    if (!this.ensure()) return;
    const notes = [392, 330, 262, 196];
    notes.forEach((freq, i) => this.note(freq, i * 0.16, 0.32, 'triangle', 0.35));
  }
}
