// Rendering: paints both panels from the level's painter, stamps the
// found-difference markers on both pictures at once, and keeps the HUD
// (counter, score, combo, clock, hints, timer bar) in sync with the state.
import { PANEL_W, PANEL_H } from './scenes.js';

export class Renderer {
  constructor(panelA, panelB, hud) {
    this.ctxA = panelA.getContext('2d');
    this.ctxB = panelB.getContext('2d');
    this.hud = hud;
    this.hintPulse = null; // {x, y, r, until}
  }

  // Draw the level's scene twice: plain on the left, altered on the right.
  paintLevel(level) {
    level.painter(this.ctxA, false);
    level.painter(this.ctxB, true);
  }

  // A satisfying mark: a hand-drawn style ring with a small tick, on both panels.
  stampFound(diff, color) {
    for (const ctx of [this.ctxA, this.ctxB]) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // A slightly wobbly ring, like a felt-tip circle.
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const wobble = 1 + 0.08 * Math.sin(a * 3);
        const px = diff.x + Math.cos(a) * diff.r * wobble;
        const py = diff.y + Math.sin(a) * diff.r * wobble;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // A tick inside the ring.
      ctx.beginPath();
      ctx.moveTo(diff.x - 8, diff.y);
      ctx.lineTo(diff.x - 2, diff.y + 7);
      ctx.lineTo(diff.x + 10, diff.y - 7);
      ctx.stroke();
      ctx.restore();
    }
  }

  // A red X where a wrong click landed, fading on its own.
  stampMiss(x, y, panel) {
    const ctx = panel === 'B' ? this.ctxB : this.ctxA;
    ctx.save();
    ctx.strokeStyle = '#e23b3b';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9);
    ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9);
    ctx.stroke();
    ctx.restore();
    setTimeout(() => this.repaintAfterMiss(), 450);
  }

  // The miss X is drawn on top of the scene; repaint restores the panels.
  repaintAfterMiss() {
    if (this.onRepaint) this.onRepaint();
  }

  // Start a pulsing hint ring around one unfound difference.
  startHint(diff) {
    this.hintPulse = { x: diff.x, y: diff.y, r: diff.r, until: performance.now() + 2600 };
    this.drawHintPulse();
  }

  drawHintPulse() {
    if (!this.hintPulse) return;
    const now = performance.now();
    if (now > this.hintPulse.until) {
      this.hintPulse = null;
      if (this.onRepaint) this.onRepaint();
      return;
    }
    const phase = (now % 600) / 600;
    const radius = this.hintPulse.r + 6 + phase * 14;
    const alpha = 1 - phase;
    for (const ctx of [this.ctxA, this.ctxB]) {
      ctx.save();
      ctx.strokeStyle = `rgba(242, 160, 7, ${alpha})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(this.hintPulse.x, this.hintPulse.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    requestAnimationFrame(() => this.drawHintPulse());
  }

  // ---- HUD -----------------------------------------------------------------
  setLevelName(text) {
    this.hud.levelName.textContent = text;
  }

  setCounts(found, total) {
    this.hud.foundCount.textContent = `${found} / ${total}`;
  }

  setScore(score) {
    this.hud.score.textContent = String(score);
  }

  setCombo(combo) {
    this.hud.combo.textContent = `×${Math.max(1, combo)}`;
  }

  setHints(left) {
    this.hud.hints.textContent = String(left);
  }

  setClock(secondsLeft) {
    const s = Math.max(0, Math.ceil(secondsLeft));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    this.hud.clock.textContent = `${mm}:${ss}`;
  }

  setTimerBar(fraction) {
    this.hud.timerBar.style.width = `${Math.max(0, Math.min(1, fraction)) * 100}%`;
    this.hud.timerBar.classList.toggle('low', fraction < 0.17);
  }

  setMessage(text) {
    this.hud.message.textContent = text;
  }

  setHintEnabled(enabled) {
    this.hud.hintBtn.disabled = !enabled;
  }
}

export function panelPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = PANEL_W / rect.width;
  const scaleY = PANEL_H / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}
