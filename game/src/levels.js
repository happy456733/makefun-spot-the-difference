// Level definitions: each level names its scene painter, its time limit,
// and every difference with the exact spot where it lives on the canvas.
// Coordinates are in panel pixels (580 x 372) and match the painters in
// scenes.js — a difference is "found" when a click lands inside its radius.
import { drawGarden, drawHarbour, drawMarket } from './scenes.js';

export const LEVELS = [
  {
    id: 'garden',
    name: 'Level 1 · Sunny Garden',
    short: 'Sunny Garden',
    painter: drawGarden,
    timeLimit: 120,
    blurb: 'A sleepy cottage garden. Five things changed between the pictures — find them all before the sun sets.',
    differences: [
      { x: 72, y: 62, r: 42, label: 'The sun lost its rays' },
      { x: 330, y: 297, r: 24, label: 'The butterfly flew away' },
      { x: 300, y: 58, r: 22, label: 'A bird is missing from the sky' },
      { x: 505, y: 158, r: 18, label: 'An apple fell off the tree' },
      { x: 150, y: 306, r: 22, label: 'The tulip changed colour' },
    ],
  },
  {
    id: 'harbour',
    name: 'Level 2 · Harbour at Dusk',
    short: 'Harbour at Dusk',
    painter: drawHarbour,
    timeLimit: 150,
    blurb: 'The harbour is settling down for the night. Seven quiet changes hide in the dusk light.',
    differences: [
      { x: 500, y: 58, r: 36, label: 'The moon turned crescent' },
      { x: 190, y: 88, r: 42, label: 'The lighthouse beam went dark' },
      { x: 324, y: 180, r: 32, label: 'The sail changed colour' },
      { x: 200, y: 42, r: 16, label: 'A new star appeared' },
      { x: 474, y: 252, r: 24, label: 'A crate vanished from the stack' },
      { x: 340, y: 100, r: 20, label: 'A gull flew off' },
      { x: 530, y: 260, r: 20, label: 'The pier lantern went out' },
    ],
  },
  {
    id: 'market',
    name: 'Level 3 · Night Market',
    short: 'Night Market',
    painter: drawMarket,
    timeLimit: 180,
    blurb: 'The night market is buzzing. Ten sneaky changes hide among the lanterns and stalls — the real test.',
    differences: [
      { x: 180, y: 103, r: 16, label: 'A festival bulb changed colour' },
      { x: 500, y: 288, r: 30, label: 'The stall cat wandered off' },
      { x: 130, y: 132, r: 22, label: 'A balloon floated away' },
      { x: 260, y: 288, r: 32, label: 'The fruit changed colour' },
      { x: 510, y: 246, r: 20, label: 'A lantern appeared' },
      { x: 265, y: 204, r: 22, label: 'An awning stripe changed colour' },
      { x: 77, y: 232, r: 24, label: 'The cottage window went dark' },
      { x: 436, y: 296, r: 20, label: 'A basket disappeared' },
      { x: 484, y: 167, r: 14, label: 'A star vanished from the sign' },
      { x: 140, y: 95, r: 26, label: 'The chimney smoke cleared' },
    ],
  },
];

// Total differences across the whole game (22) — the hunt stays fun past ten finds.
export const TOTAL_DIFFERENCES = LEVELS.reduce((sum, level) => sum + level.differences.length, 0);
