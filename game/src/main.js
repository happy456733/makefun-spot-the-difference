// Bootstrap: wires the canvases, buttons and keyboard to the game, and
// supports deterministic screenshot modes used to take the entry's shots:
//   ?shot=start  title screen over the garden (default)
//   ?shot=play   level 1 mid-game, two differences circled, three still hidden
//   ?shot=play2  level 3 mid-game, four circled, six still hidden
//   ?shot=harbour a quick look at level 2 mid-game (two circled, five hidden)
//   ?shot=end    the "you found them all" screen after the final scene
// Screenshot modes freeze the timer so every capture is identical.
import { LEVELS } from './levels.js';
import { Renderer, panelPoint } from './render.js';
import { SpotGame } from './game.js';

const panelA = document.getElementById('panelA');
const panelB = document.getElementById('panelB');
const overlay = document.getElementById('overlay');

const hud = {
  levelName: document.getElementById('levelName'),
  foundCount: document.getElementById('foundCount'),
  score: document.getElementById('score'),
  combo: document.getElementById('combo'),
  clock: document.getElementById('clock'),
  hints: document.getElementById('hints'),
  timerBar: document.getElementById('timerBar'),
  message: document.getElementById('msg'),
  hintBtn: document.getElementById('hintBtn'),
};

const renderer = new Renderer(panelA, panelB, hud);
const game = new SpotGame(renderer, overlay);

panelA.addEventListener('click', (event) => {
  const point = panelPoint(panelA, event);
  game.clickAt('A', point.x, point.y);
});
panelB.addEventListener('click', (event) => {
  const point = panelPoint(panelB, event);
  game.clickAt('B', point.x, point.y);
});

document.getElementById('hintBtn').addEventListener('click', () => game.useHint());
document.getElementById('restartBtn').addEventListener('click', () => {
  if (game.screen !== 'title') game.startLevel(game.levelIndex);
});
document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  game.handleKey(event.key);
});

// ---- deterministic screenshot states ---------------------------------------
// Mark some differences as already found, without playing sounds or the timer,
// so the cover shot shows a real mid-game state: circled finds, unfound ones
// still hiding, and the counter showing how many remain.
function stageMidGame(levelIndex, foundIndexes, score, secondsLeft, message) {
  game.startLevel(levelIndex);
  game.stopTimer();
  game.score = score;
  game.timeLeft = secondsLeft;
  for (const index of foundIndexes) {
    game.found.add(index);
    game.totalFound += 1;
    renderer.stampFound(game.level.differences[index], '#2f9e44');
  }
  game.combo = foundIndexes.length + 1;
  renderer.setCounts(game.found.size, game.level.differences.length);
  renderer.setScore(score);
  renderer.setCombo(game.combo);
  renderer.setClock(secondsLeft);
  renderer.setTimerBar(secondsLeft / game.level.timeLimit);
  renderer.setMessage(message);
}

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot === 'play') {
  stageMidGame(0, [0, 4], 300, 92, '✓ The tulip changed colour — 300 points! 3 to go in this scene.');
} else if (shot === 'play2') {
  stageMidGame(2, [1, 3, 5, 8], 1000, 140, '✓ The fruit changed colour — 400 points! 6 to go in this scene.');
} else if (shot === 'harbour') {
  stageMidGame(1, [1, 4], 550, 118, '✓ A crate vanished from the stack — 250 points! 5 to go in this scene.');
} else if (shot === 'end') {
  game.startLevel(2);
  game.stopTimer();
  game.score = 2450;
  game.totalFound = 12;
  for (let i = 0; i < game.level.differences.length; i++) {
    game.found.add(i);
    renderer.stampFound(game.level.differences[i], '#2f9e44');
  }
  game.totalFound = 22;
  renderer.setCounts(10, 10);
  game.levelClear();
} else {
  game.showTitle();
}
