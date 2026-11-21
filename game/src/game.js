// Game state machine: title → playing → level clear → next level … →
// game complete (or time up). Owns the score, the combo, the countdown and
// the hints; the Renderer owns all drawing.
import { LEVELS, TOTAL_DIFFERENCES } from './levels.js';
import { SoundEngine } from './audio.js';

export const FOUND_COLOR = '#2f9e44';
export const WRONG_PENALTY_SECONDS = 5;
export const HINTS_PER_LEVEL = 3;
export const POINTS_PER_FIND = 100;

export class SpotGame {
  constructor(renderer, overlay) {
    this.renderer = renderer;
    this.overlay = overlay;
    this.sound = new SoundEngine();
    this.screen = 'title';
    this.levelIndex = 0;
    this.found = new Set();
    this.score = 0;
    this.combo = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = 0;
    this.timerId = null;
    this.totalFound = 0;
    this.lastTickSecond = -1;

    // When the renderer repaints (after a fading miss X), re-stamp the finds.
    this.renderer.onRepaint = () => {
      const level = LEVELS[this.levelIndex];
      this.renderer.paintLevel(level);
      for (const index of this.found) {
        this.renderer.stampFound(level.differences[index], FOUND_COLOR);
      }
    };
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  // ---- flow ----------------------------------------------------------------
  showTitle() {
    this.screen = 'title';
    this.levelIndex = 0;
    this.totalFound = 0;
    this.score = 0;
    this.showOverlay({
      title: 'Spot the Difference',
      body: 'Two pictures hang side by side — but they are <b>not</b> identical. '
        + 'Somewhere between them hide <b>22 differences</b> across three hand-painted scenes: '
        + 'a Sunny Garden, a Harbour at Dusk, and a buzzing Night Market. '
        + 'Click a difference on either picture to circle it. Wrong clicks cost 5 seconds, '
        + 'and the clock is always running. Hints are limited — spend them wisely.',
      big: 'Can you find all 22?',
      button: '▶ Start hunting',
      onButton: () => this.startLevel(0),
    });
    this.renderer.paintLevel(this.level);
    this.renderer.setLevelName(this.level.name);
    this.renderer.setCounts(0, this.level.differences.length);
    this.renderer.setScore(0);
    this.renderer.setCombo(1);
    this.renderer.setHints(HINTS_PER_LEVEL);
    this.renderer.setClock(this.level.timeLimit);
    this.renderer.setTimerBar(1);
    this.renderer.setMessage('Press Start — or click a picture to begin.');
  }

  startLevel(index) {
    this.hideOverlay();
    this.levelIndex = index;
    this.found = new Set();
    this.combo = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = this.level.timeLimit;
    this.lastTickSecond = -1;
    this.screen = 'playing';
    this.renderer.paintLevel(this.level);
    this.renderer.setLevelName(this.level.name);
    this.renderer.setCounts(0, this.level.differences.length);
    this.renderer.setScore(this.score);
    this.renderer.setCombo(1);
    this.renderer.setHints(this.hintsLeft);
    this.renderer.setClock(this.timeLeft);
    this.renderer.setTimerBar(1);
    this.renderer.setHintEnabled(true);
    this.renderer.setMessage(this.level.blurb);
    this.updateDots();
    this.startTimer();
  }

  startTimer() {
    this.stopTimer();
    this.timerId = setInterval(() => this.tick(), 100);
  }

  stopTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  tick() {
    if (this.screen !== 'playing') return;
    this.timeLeft -= 0.1;
    this.renderer.setClock(this.timeLeft);
    this.renderer.setTimerBar(this.timeLeft / this.level.timeLimit);
    const whole = Math.ceil(this.timeLeft);
    if (whole <= 10 && whole !== this.lastTickSecond && whole > 0) {
      this.lastTickSecond = whole;
      this.sound.tick();
    }
    if (this.timeLeft <= 0) this.timeUp();
  }

  // ---- clicking ------------------------------------------------------------
  clickAt(panel, x, y) {
    if (this.screen === 'title') {
      this.startLevel(0);
      return;
    }
    if (this.screen !== 'playing') return;
    this.sound.ensure();
    const level = this.level;
    for (let i = 0; i < level.differences.length; i++) {
      if (this.found.has(i)) continue;
      const d = level.differences[i];
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        this.registerFind(i);
        return;
      }
    }
    this.registerMiss(panel, x, y);
  }

  registerFind(index) {
    const level = this.level;
    this.found.add(index);
    this.totalFound += 1;
    this.combo += 1;
    const points = POINTS_PER_FIND * this.combo;
    this.score += points;
    this.sound.found(this.combo);
    this.renderer.stampFound(level.differences[index], FOUND_COLOR);
    this.renderer.setCounts(this.found.size, level.differences.length);
    this.renderer.setScore(this.score);
    this.renderer.setCombo(this.combo);
    const remaining = level.differences.length - this.found.size;
    const label = level.differences[index].label;
    if (remaining === 0) {
      this.levelClear();
    } else {
      this.renderer.setMessage(`✓ ${label} — ${points} points! ${remaining} to go in this scene.`);
    }
  }

  registerMiss(panel, x, y) {
    this.combo = 0;
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_PENALTY_SECONDS);
    this.sound.wrong();
    this.renderer.stampMiss(x, y, panel);
    this.renderer.setCombo(1);
    this.renderer.setClock(this.timeLeft);
    this.renderer.setTimerBar(this.timeLeft / this.level.timeLimit);
    this.renderer.setMessage(`✗ Not a difference — minus ${WRONG_PENALTY_SECONDS} seconds! Look closer…`);
    const board = panel === 'B'
      ? document.querySelectorAll('.board')[1]
      : document.querySelectorAll('.board')[0];
    const canvas = board.querySelector('canvas');
    canvas.classList.remove('shake');
    void canvas.offsetWidth;
    canvas.classList.add('shake');
  }

  // ---- hints ---------------------------------------------------------------
  useHint() {
    if (this.screen !== 'playing') return;
    if (this.hintsLeft <= 0) {
      this.renderer.setMessage('No hints left in this scene — trust your eyes!');
      return;
    }
    const level = this.level;
    const remaining = level.differences
      .map((d, i) => ({ d, i }))
      .filter(({ i }) => !this.found.has(i));
    if (remaining.length === 0) return;
    // Hint the difference nearest the centre of the picture — the fairest one.
    remaining.sort((a, b) => {
      const da = Math.hypot(a.d.x - 290, a.d.y - 186);
      const db = Math.hypot(b.d.x - 290, b.d.y - 186);
      return da - db;
    });
    const target = remaining[0].d;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - 15);
    this.sound.hint();
    this.renderer.startHint(target);
    this.renderer.setHints(this.hintsLeft);
    this.renderer.setScore(this.score);
    this.renderer.setMessage('💡 Hint: look near the golden ring — it fades in a few seconds!');
  }

  // ---- endings -------------------------------------------------------------
  levelClear() {
    this.stopTimer();
    const timeBonus = Math.round(this.timeLeft) * 5;
    this.score += timeBonus;
    this.sound.win();
    this.renderer.setScore(this.score);
    this.renderer.setHintEnabled(false);
    const last = this.levelIndex === LEVELS.length - 1;
    this.screen = last ? 'complete' : 'levelClear';
    const foundAll = this.totalFound;
    if (last) {
      this.showOverlay({
        title: '🏆 You found them all!',
        body: `All <b>${TOTAL_DIFFERENCES} differences</b> across three scenes — every last one. `
          + `Time bonus: <b>+${timeBonus}</b> points.`,
        big: `Final score: ${this.score}`,
        button: '↻ Play again',
        onButton: () => this.startLevel(0),
      });
      this.renderer.setMessage(`🏆 Complete! ${foundAll} / ${TOTAL_DIFFERENCES} differences found. Final score ${this.score}.`);
    } else {
      this.showOverlay({
        title: `Scene clear — ${this.level.short}!`,
        body: `You found all <b>${this.level.differences.length}</b> differences. `
          + `Time bonus: <b>+${timeBonus}</b> points. The next scene hides more, and hides them better.`,
        big: `Score so far: ${this.score} · ${foundAll} / ${TOTAL_DIFFERENCES} found`,
        button: `▶ Next scene: ${LEVELS[this.levelIndex + 1].short}`,
        onButton: () => this.startLevel(this.levelIndex + 1),
      });
      this.renderer.setMessage(`Scene clear! Time bonus +${timeBonus}. Ready for the next one?`);
    }
  }

  timeUp() {
    this.stopTimer();
    this.screen = 'timeUp';
    this.sound.lose();
    this.renderer.setHintEnabled(false);
    const remaining = this.level.differences.length - this.found.size;
    this.showOverlay({
      title: '⏱ Out of time!',
      body: `The clock ran out with <b>${remaining}</b> difference${remaining === 1 ? '' : 's'} `
        + `still hiding in ${this.level.short}. Your score stays — try the scene again and beat it.`,
      big: `Score: ${this.score} · ${this.totalFound} / ${TOTAL_DIFFERENCES} found overall`,
      button: '↻ Retry this scene',
      onButton: () => this.startLevel(this.levelIndex),
    });
    this.renderer.setMessage('⏱ Time up! Retry the scene and find them faster.');
  }

  // ---- overlay + dots ------------------------------------------------------
  showOverlay({ title, body, big, button, onButton }) {
    const card = this.overlay.querySelector('#card');
    card.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = title;
    const p = document.createElement('p');
    p.innerHTML = body;
    const bigEl = document.createElement('p');
    bigEl.className = 'big';
    bigEl.textContent = big;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = button;
    btn.addEventListener('click', () => {
      this.sound.ensure();
      onButton();
    });
    const keys = document.createElement('p');
    keys.className = 'keys';
    keys.textContent = 'Mouse: click a difference · H: hint · R: restart · 1/2/3: jump to a scene · M: sound';
    card.append(h, p, bigEl, btn, keys);
    this.overlay.classList.add('show');
    this.overlayButton = btn;
  }

  hideOverlay() {
    this.overlay.classList.remove('show');
  }

  updateDots() {
    const dots = document.querySelectorAll('#levelDots i');
    dots.forEach((dot, i) => {
      dot.classList.toggle('done', i < this.levelIndex);
      dot.classList.toggle('now', i === this.levelIndex);
    });
  }

  // ---- keyboard ------------------------------------------------------------
  handleKey(key) {
    const k = key.toLowerCase();
    if (k === 'm') {
      this.sound.setMuted(!this.sound.muted);
      this.renderer.setMessage(this.sound.muted ? '🔇 Sound off.' : '🔊 Sound on.');
      return;
    }
    if (k === 'r') {
      if (this.screen !== 'title') this.startLevel(this.levelIndex);
      return;
    }
    if (k === 'h') {
      this.useHint();
      return;
    }
    if (k === '1' || k === '2' || k === '3') {
      const index = Number(k) - 1;
      if (index < LEVELS.length) this.startLevel(index);
      return;
    }
    if (k === 'enter' && this.overlayButton) {
      this.overlayButton.click();
    }
  }
}

