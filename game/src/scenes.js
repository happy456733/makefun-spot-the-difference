// Original scene painters — every picture is drawn with Canvas 2D calls,
// so the game ships no image files at all. Each scene paints the same view
// twice: once plain (picture A) and once with its differences applied
// (picture B). A difference is a small `if (altered)` branch inside the
// painter, so both panels always share one style and one composition.

export const PANEL_W = 580;
export const PANEL_H = 372;

// ---- small drawing helpers -------------------------------------------------
export function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

export function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function skyGradient(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}

export function cloud(ctx, x, y, scale, white) {
  ctx.fillStyle = white;
  ellipse(ctx, x, y, 26 * scale, 15 * scale, white);
  ellipse(ctx, x + 20 * scale, y + 4 * scale, 20 * scale, 12 * scale, white);
  ellipse(ctx, x - 20 * scale, y + 5 * scale, 18 * scale, 11 * scale, white);
}

export function bird(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x - 7 * scale, y, 7 * scale, Math.PI * 1.15, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 7 * scale, y, 7 * scale, Math.PI * 1.1, Math.PI * 1.85);
  ctx.stroke();
}

export function flower(ctx, x, y, petal, center, stemH) {
  ctx.strokeStyle = '#2f7d32';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + stemH);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, 6, petal);
  }
  circle(ctx, x, y, 6, center);
}

// ---- Scene 1: Sunny Garden -------------------------------------------------
// Differences (5): sun rays, butterfly, third bird, tree apple, tulip colour.
export function drawGarden(ctx, altered) {
  skyGradient(ctx, '#7ec8f7', '#dff3ff');
  // Sun (top-left). Difference 1: rays vanish in picture B.
  circle(ctx, 72, 62, 34, '#ffd93b');
  if (!altered) {
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 72 + Math.cos(a) * 42, 62 + Math.sin(a) * 42,
        72 + Math.cos(a) * 56, 62 + Math.sin(a) * 56, '#ffd93b', 5);
    }
  }
  cloud(ctx, 250, 55, 1, '#ffffff');
  cloud(ctx, 430, 80, 0.8, '#ffffff');
  cloud(ctx, 520, 40, 0.6, '#f4fbff');
  // Birds. Difference 3: the middle bird is missing in picture B.
  bird(ctx, 200, 70, 1, '#3a3a3a');
  if (!altered) bird(ctx, 300, 58, 0.9, '#3a3a3a');
  bird(ctx, 380, 84, 1, '#3a3a3a');
  // Rolling hills and grass.
  ellipse(ctx, 140, 400, 340, 110, '#8ed081');
  ellipse(ctx, 480, 410, 320, 120, '#79c468');
  rect(ctx, 0, 300, PANEL_W, 72, '#8ed081');
  // Cottage with a red roof.
  rect(ctx, 90, 210, 130, 90, '#fff3d6');
  poly(ctx, [[78, 214], [155, 150], [232, 214]], '#d94f3d');
  rect(ctx, 140, 250, 30, 50, '#8b5a2b');
  circle(ctx, 166, 276, 3, '#ffd93b');
  rect(ctx, 105, 228, 28, 26, '#bfe8ff');
  line(ctx, 119, 228, 119, 254, '#8b5a2b', 2);
  line(ctx, 105, 241, 133, 241, '#8b5a2b', 2);
  rect(ctx, 188, 228, 28, 26, '#bfe8ff');
  line(ctx, 202, 228, 202, 254, '#8b5a2b', 2);
  line(ctx, 188, 241, 216, 241, '#8b5a2b', 2);
  // Apple tree. Difference 4: one apple is missing in picture B.
  rect(ctx, 458, 190, 18, 70, '#7a4a21');
  circle(ctx, 467, 150, 62, '#3f9e4d');
  circle(ctx, 420, 175, 38, '#4cb45c');
  circle(ctx, 512, 175, 38, '#4cb45c');
  circle(ctx, 440, 140, 14, '#e23b3b');
  circle(ctx, 490, 128, 14, '#e23b3b');
  circle(ctx, 467, 168, 14, '#e23b3b');
  if (!altered) circle(ctx, 505, 158, 14, '#e23b3b');
  circle(ctx, 430, 165, 14, '#e23b3b');
  // Sunflower patch and tulips.
  flower(ctx, 300, 300, '#ffcf3f', '#7a4a21', 34);
  flower(ctx, 330, 312, '#ffcf3f', '#7a4a21', 26);
  flower(ctx, 268, 314, '#ffcf3f', '#7a4a21', 24);
  // Difference 5: this tulip is red in A, purple in B.
  flower(ctx, 150, 306, altered ? '#8e44ad' : '#e23b3b', '#ffd93b', 30);
  flower(ctx, 180, 316, '#ff7fbf', '#ffd93b', 22);
  flower(ctx, 120, 318, '#ff7fbf', '#ffd93b', 20);
  // Pond with a duck.
  ellipse(ctx, 380, 340, 90, 20, '#6fc3e8');
  ellipse(ctx, 380, 340, 70, 13, '#8fd4f2');
  ellipse(ctx, 400, 332, 16, 11, '#ffffff');
  circle(ctx, 414, 322, 8, '#ffffff');
  poly(ctx, [[421, 322], [430, 325], [421, 327]], '#f2a007');
  circle(ctx, 416, 320, 1.8, '#222222');
  // Butterfly on a sunflower. Difference 2: gone in picture B.
  if (!altered) {
    ctx.fillStyle = '#ff7fbf';
    ellipse(ctx, 322, 292, 10, 7, '#ff7fbf');
    ellipse(ctx, 338, 292, 10, 7, '#ff9fd0');
    ellipse(ctx, 322, 302, 8, 5, '#ff9fd0');
    ellipse(ctx, 338, 302, 8, 5, '#ff7fbf');
    line(ctx, 330, 292, 330, 306, '#5b3a1a', 2);
  }
  // Picket fence along the bottom.
  for (let x = 20; x < PANEL_W; x += 34) {
    rect(ctx, x, 340, 8, 32, '#fff3d6');
    poly(ctx, [[x, 340], [x + 4, 330], [x + 8, 340]], '#fff3d6');
  }
  rect(ctx, 0, 352, PANEL_W, 5, '#e8d3a8');
}

// ---- Scene 2: Harbour at Dusk ----------------------------------------------
// Differences (7): moon shape, lighthouse beam, sail colour, extra star,
// crate stack, gull count, pier lantern.
export function drawHarbour(ctx, altered) {
  skyGradient(ctx, '#2c2a55', '#e8836b');
  // Stars. Difference 4: one extra star shines in picture B.
  const stars = [[60, 40], [150, 30], [230, 55], [330, 28], [420, 45], [520, 30], [280, 80], [90, 90]];
  for (const [x, y] of stars) {
    circle(ctx, x, y, 2.2, '#fff8d0');
  }
  if (altered) circle(ctx, 200, 42, 2.4, '#fff8d0');
  // Moon. Difference 1: full in A, crescent in B.
  circle(ctx, 500, 58, 30, '#ffeec2');
  if (altered) circle(ctx, 514, 50, 26, '#3a3468');
  // Sea with a setting-sun glitter path.
  rect(ctx, 0, 230, PANEL_W, 142, '#274b7a');
  rect(ctx, 0, 230, PANEL_W, 6, '#e8836b');
  for (let i = 0; i < 9; i++) {
    const y = 248 + i * 13;
    const w = 60 - i * 4;
    ellipse(ctx, 500, y, w, 3, 'rgba(255, 220, 150, 0.55)');
  }
  // Lighthouse. Difference 2: its beam is on in A, off in B.
  rect(ctx, 78, 120, 34, 110, '#f2ead8');
  rect(ctx, 78, 150, 34, 12, '#d94f3d');
  rect(ctx, 78, 190, 34, 12, '#d94f3d');
  rect(ctx, 84, 96, 22, 26, '#3a3a3a');
  circle(ctx, 95, 109, 7, altered ? '#5a5470' : '#ffe98a');
  if (!altered) {
    const beam = ctx.createLinearGradient(112, 109, 260, 60);
    beam.addColorStop(0, 'rgba(255, 233, 138, 0.75)');
    beam.addColorStop(1, 'rgba(255, 233, 138, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(112, 100);
    ctx.lineTo(270, 52);
    ctx.lineTo(270, 118);
    ctx.lineTo(112, 118);
    ctx.closePath();
    ctx.fill();
  }
  // Two boats. Difference 3: the small boat's sail is red in A, blue in B.
  poly(ctx, [[300, 210], [300, 150], [348, 210]], altered ? '#3b6fd4' : '#d94f3d');
  rect(ctx, 288, 210, 84, 16, '#8b5a2b');
  line(ctx, 300, 150, 300, 212, '#5b3a1a', 3);
  poly(ctx, [[170, 240], [170, 196], [206, 240]], '#f2ead8');
  rect(ctx, 156, 240, 72, 14, '#6b4a2a');
  line(ctx, 170, 196, 170, 242, '#5b3a1a', 3);
  // Gulls. Difference 6: the low gull is missing in picture B.
  bird(ctx, 150, 84, 1, '#1c1c2e');
  bird(ctx, 250, 60, 0.9, '#1c1c2e');
  if (!altered) bird(ctx, 340, 100, 0.8, '#1c1c2e');
  // Pier with crates. Difference 5: three crates in A, two in B.
  rect(ctx, 420, 300, 150, 12, '#6b4a2a');
  for (let i = 0; i < 4; i++) line(ctx, 430 + i * 38, 312, 430 + i * 38, 340, '#4a2f16', 3);
  rect(ctx, 440, 268, 32, 32, '#c89b5a');
  rect(ctx, 476, 268, 32, 32, '#b3854a');
  if (!altered) rect(ctx, 458, 236, 32, 32, '#d9b06e');
  line(ctx, 440, 268, 472, 300, '#8b6a3a', 2);
  line(ctx, 476, 268, 508, 300, '#8b6a3a', 2);
  // Pier lantern. Difference 7: lit warm in A, dark in B.
  line(ctx, 530, 300, 530, 268, '#3a3a3a', 3);
  circle(ctx, 530, 260, 9, altered ? '#4a4468' : '#ffe98a');
  if (!altered) {
    circle(ctx, 530, 260, 16, 'rgba(255, 233, 138, 0.35)');
  }
  // Rope buoys bobbing near the pier.
  circle(ctx, 400, 330, 8, '#d94f3d');
  circle(ctx, 360, 344, 7, '#f2a007');
}

// ---- Scene 3: Night Market -------------------------------------------------
// Differences (10): bulb colour, stall cat, balloon count, fruit pile,
// awning stripe, extra lantern, window light, basket count, sign star,
// chimney smoke.
export function drawMarket(ctx, altered) {
  skyGradient(ctx, '#141433', '#3d2b5e');
  // Stars and a sleepy moon.
  for (const [x, y] of [[40, 34], [120, 52], [210, 30], [330, 44], [470, 26], [540, 60], [80, 84]]) {
    circle(ctx, x, y, 2, '#fff8d0');
  }
  circle(ctx, 520, 48, 22, '#ffeec2');
  circle(ctx, 512, 42, 18, '#2a2450');
  // Festival string lights. Difference 1: the third bulb is red in A, green in B.
  ctx.strokeStyle = '#0c0c1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.quadraticCurveTo(290, 110, 580, 66);
  ctx.stroke();
  const bulbColors = ['#ff5a5a', '#ffd93b', '#ff5a5a', '#5aff8a', '#ffd93b', '#ff5a5a', '#5aff8a', '#ffd93b'];
  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 70;
    const t = i / 7;
    const y = 70 + Math.sin(t * Math.PI) * 28 - (t * 4);
    const color = (i === 2 && altered) ? '#5aff8a' : bulbColors[i];
    circle(ctx, x, y + 12, 7, color);
    circle(ctx, x, y + 12, 11, color + '44');
  }
  // Rooftops and a chimney. Difference 10: smoke curls in A, not in B.
  rect(ctx, 30, 190, 120, 90, '#241d3d');
  poly(ctx, [[20, 192], [90, 140], [160, 192]], '#3a2a5e');
  rect(ctx, 120, 120, 16, 40, '#4a3a6e');
  if (!altered) {
    ctx.fillStyle = 'rgba(230, 230, 245, 0.7)';
    ellipse(ctx, 130, 108, 10, 8, 'rgba(230, 230, 245, 0.7)');
    ellipse(ctx, 138, 94, 13, 9, 'rgba(230, 230, 245, 0.7)');
    ellipse(ctx, 148, 78, 15, 10, 'rgba(230, 230, 245, 0.7)');
  }
  // Window. Difference 7: lit in A, dark in B.
  rect(ctx, 62, 214, 30, 36, altered ? '#1a1430' : '#ffe98a');
  line(ctx, 77, 214, 77, 250, '#241d3d', 2);
  line(ctx, 62, 232, 92, 232, '#241d3d', 2);
  // Stall 1 (left): striped awning, fruit cart.
  // Difference 6: the awning's middle stripe is teal in A, pink in B.
  rect(ctx, 190, 210, 150, 14, '#f2ead8');
  for (let i = 0; i < 5; i++) {
    const stripe = (i === 2) ? (altered ? '#ff7fbf' : '#0f766e') : (i % 2 === 0 ? '#d94f3d' : '#f2ead8');
    rect(ctx, 190 + i * 30, 196, 30, 16, stripe);
  }
  rect(ctx, 196, 224, 8, 90, '#8b5a2b');
  rect(ctx, 326, 224, 8, 90, '#8b5a2b');
  rect(ctx, 190, 300, 150, 16, '#8b5a2b');
  // Fruit pile. Difference 4: apples in A, oranges in B.
  const fruit = altered ? '#f28c1e' : '#e23b3b';
  for (const [x, y] of [[220, 292], [240, 284], [260, 292], [280, 284], [300, 292], [250, 276], [270, 272]]) {
    circle(ctx, x, y, 9, fruit);
    circle(ctx, x - 3, y - 3, 2.5, 'rgba(255,255,255,0.5)');
  }
  // Stall 2 (right): lanterns and a signboard.
  rect(ctx, 380, 210, 160, 14, '#f2ead8');
  for (let i = 0; i < 5; i++) {
    rect(ctx, 380 + i * 32, 196, 32, 16, i % 2 === 0 ? '#f2a007' : '#f2ead8');
  }
  rect(ctx, 386, 224, 8, 90, '#8b5a2b');
  rect(ctx, 526, 224, 8, 90, '#8b5a2b');
  rect(ctx, 380, 300, 160, 16, '#8b5a2b');
  // Hanging lanterns. Difference 5: a third lantern hangs in B only.
  ellipse(ctx, 410, 246, 12, 16, '#ff5a5a');
  ellipse(ctx, 460, 246, 12, 16, '#ffd93b');
  if (altered) ellipse(ctx, 510, 246, 12, 16, '#ff5a5a');
  circle(ctx, 410, 246, 4, '#ffe98a');
  circle(ctx, 460, 246, 4, '#ffe98a');
  // Signboard. Difference 9: three stars in A, two in B.
  rect(ctx, 420, 150, 100, 34, '#7c3f16');
  rect(ctx, 424, 154, 92, 26, '#fff3d6');
  circle(ctx, 440, 167, 4, '#e4572e');
  circle(ctx, 462, 167, 4, '#e4572e');
  if (!altered) circle(ctx, 484, 167, 4, '#e4572e');
  // Baskets on the counter. Difference 8: two baskets in A, one in B.
  ellipse(ctx, 400, 296, 18, 10, '#c89b5a');
  if (!altered) ellipse(ctx, 436, 296, 18, 10, '#b3854a');
  // The stall cat. Difference 2: asleep on the counter in A, gone in B.
  if (!altered) {
    ellipse(ctx, 500, 292, 24, 11, '#3a3a3a');
    circle(ctx, 522, 284, 9, '#3a3a3a');
    poly(ctx, [[516, 278], [518, 270], [522, 277]], '#3a3a3a');
    poly(ctx, [[524, 277], [528, 270], [530, 278]], '#3a3a3a');
    line(ctx, 476, 292, 462, 288, '#3a3a3a', 4);
  }
  // Balloons. Difference 3: three balloons in A, two in B.
  const balloons = [[70, 130, '#ff5a5a'], [100, 110, '#5aff8a'], [130, 132, '#ffd93b']];
  for (let i = 0; i < (altered ? 2 : 3); i++) {
    const [x, y, c] = balloons[i];
    ellipse(ctx, x, y, 13, 16, c);
    line(ctx, x, y + 16, x + 4, y + 44, '#e8dcc3', 1.5);
  }
  // Cobblestones.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < 8; i++) ellipse(ctx, 40 + i * 70, 352, 26, 5, 'rgba(0,0,0,0.25)');
  rect(ctx, 0, 330, PANEL_W, 42, 'rgba(0,0,0,0.18)');
}


