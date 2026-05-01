import { WumpusWorld } from './wumpus.js';
import { KnowledgeBase } from './kb.js';
import { Agent } from './agent.js';

let world, kb, agent;
let running = false;
let stepInterval = null;
let totalSteps = 0;
let currentPercepts = { breeze: false, stench: false, glitter: false };
let gameOver = false;
let revealAll = false;


const gridEl       = document.getElementById('grid');
const logEl        = document.getElementById('log');
const btnNew       = document.getElementById('btn-new');
const btnStep      = document.getElementById('btn-step');
const btnRun       = document.getElementById('btn-run');
const btnReveal    = document.getElementById('btn-reveal');
const inRows       = document.getElementById('in-rows');
const inCols       = document.getElementById('in-cols');
const metaSteps    = document.getElementById('meta-steps');
const metaPos      = document.getElementById('meta-pos');
const metaPercepts = document.getElementById('meta-percepts');
const metaStatus   = document.getElementById('meta-status');
const speedSlider  = document.getElementById('speed-slider');


function newGame() {
  stopRun();
  revealAll = false;
  gameOver = false;
  totalSteps = 0;

  const rows = Math.max(2, Math.min(10, parseInt(inRows.value) || 4));
  const cols = Math.max(2, Math.min(10, parseInt(inCols.value) || 4));
  inRows.value = rows;
  inCols.value = cols;

  world = new WumpusWorld(rows, cols);
  kb    = new KnowledgeBase();
  agent = new Agent(world, kb);

  currentPercepts = world.getPercepts(0, 0);
  updateMetrics();
  renderGrid();
  renderLog();
  setStatus('running');
}


function step() {
  if (gameOver) return;

  const result = agent.step();
  totalSteps++;
  currentPercepts = result.percepts || { breeze: false, stench: false, glitter: false };

  if (result.done) {
    gameOver = true;
    stopRun();
    revealAll = true;
    if (agent.won) setStatus('won');
    else if (!agent.alive) setStatus('dead');
    else setStatus('stuck');
  }

  updateMetrics();
  renderGrid();
  renderLog();
}


function startRun() {
  if (running || gameOver) return;
  running = true;
  btnRun.textContent = 'PAUSE';
  scheduleStep();
}

function scheduleStep() {
  const delay = 1100 - parseInt(speedSlider.value);
  stepInterval = setTimeout(() => {
    if (!running) return;
    step();
    if (!gameOver) scheduleStep();
  }, delay);
}

function stopRun() {
  running = false;
  clearTimeout(stepInterval);
  btnRun.textContent = 'AUTO RUN';
}

function toggleRun() {
  if (running) stopRun();
  else startRun();
}

function renderGrid() {
  const rows = world.rows;
  const cols = world.cols;
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridEl.innerHTML = '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      const status = agent.getCellStatus(r, c);
      cell.dataset.status = status;

      const actualCell = world.getCell(r, c);
      const icons = [];

      if (status === 'agent') {
        icons.push('<span class="icon agent-icon">◈</span>');
        cell.classList.add('cell-agent');
      } else if (revealAll) {
        if (actualCell.pit)    icons.push('<span class="icon pit-icon">◉</span>');
        if (actualCell.wumpus) icons.push('<span class="icon wumpus-icon">⊛</span>');
        if (actualCell.gold)   icons.push('<span class="icon gold-icon">◆</span>');
        cell.classList.add(actualCell.pit || actualCell.wumpus ? 'cell-danger' : 'cell-revealed');
      } else if (status === 'visited') {
        cell.classList.add('cell-safe');
        if (actualCell.gold) icons.push('<span class="icon gold-icon">◆</span>');
      } else if (status === 'safe') {
        cell.classList.add('cell-safe-inferred');
        icons.push('<span class="icon safe-icon">✓</span>');
      } else if (status === 'danger') {
        cell.classList.add('cell-danger-inferred');
        icons.push('<span class="icon danger-icon">✕</span>');
      } else {
        cell.classList.add('cell-unknown');
        icons.push('<span class="icon unknown-icon">?</span>');
      }

      // Coord label
      cell.innerHTML = `<span class="coord">${r},${c}</span>${icons.join('')}`;
      gridEl.appendChild(cell);
    }
  }
}

function renderLog() {
  const entries = agent.log.slice(-40); 
  logEl.innerHTML = entries.map(entry => {
    if (entry.type === 'tell') {
      const p = entry.percepts;
      const active = [
        p.breeze  ? 'BREEZE'  : '',
        p.stench  ? 'STENCH'  : '',
        p.glitter ? 'GLITTER' : '',
      ].filter(Boolean).join(' ');
      return `<div class="log-entry log-tell">
        <span class="log-tag">TELL</span>
        <span>KB updated at (${entry.r},${entry.c}) — ${active || 'clear'}</span>
      </div>`;
    }
    if (entry.type === 'infer') {
      const cls = entry.result === 'SAFE' ? 'log-safe' : 'log-danger';
      return `<div class="log-entry ${cls}">
        <span class="log-tag">ASK</span>
        <span>(${entry.r},${entry.c}) → ${entry.result} [steps: ${kb.inferenceSteps}]</span>
      </div>`;
    }
    if (entry.type === 'move') {
      return `<div class="log-entry log-move ${entry.risky ? 'log-risky' : ''}">
        <span class="log-tag">MOVE</span>
        <span>(${entry.from[0]},${entry.from[1]}) → (${entry.to[0]},${entry.to[1]}) ${entry.risky ? '⚠ RISKY' : ''}</span>
      </div>`;
    }
    if (entry.type === 'event') {
      return `<div class="log-entry log-event">
        <span class="log-tag">EVENT</span>
        <span>${entry.msg}</span>
      </div>`;
    }
    return '';
  }).join('');
  logEl.scrollTop = logEl.scrollHeight;
}

function updateMetrics() {
  metaSteps.textContent   = kb.inferenceSteps.toLocaleString();
  metaPos.textContent     = `(${agent.pos[0]}, ${agent.pos[1]})`;
  const p = currentPercepts;
  const active = [
    p.breeze  ? '〜 BREEZE'  : '',
    p.stench  ? '⊛ STENCH'  : '',
    p.glitter ? '◆ GLITTER' : '',
  ].filter(Boolean);
  metaPercepts.innerHTML = active.length
    ? active.map(a => `<span class="percept-badge">${a}</span>`).join('')
    : '<span class="percept-none">—</span>';
}

function setStatus(s) {
  const map = {
    running: { text: '● ACTIVE', cls: 'status-active' },
    won:     { text: '✓ GOLD FOUND', cls: 'status-won' },
    dead:    { text: '✕ AGENT DEAD', cls: 'status-dead' },
    stuck:   { text: '◈ STUCK', cls: 'status-stuck' },
  };
  metaStatus.textContent = map[s].text;
  metaStatus.className = 'status-badge ' + map[s].cls;
}


function toggleReveal() {
  revealAll = !revealAll;
  btnReveal.textContent = revealAll ? 'HIDE MAP' : 'REVEAL MAP';
  renderGrid();
}


btnNew.addEventListener('click', newGame);
btnStep.addEventListener('click', step);
btnRun.addEventListener('click', toggleRun);
btnReveal.addEventListener('click', toggleReveal);


newGame();