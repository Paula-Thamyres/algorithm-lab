import {
  MAX_ARRAY_SIZE,
  MAX_VALUE,
  MIN_ARRAY_SIZE,
  findMaxIndex,
  findMinIndex,
  generateRandomArray,
  selectionSortSteps,
} from './sorting.js';

const DEFAULT_ARRAY_SIZE = 16;
const MIN_SPEED = 1;
const MAX_SPEED = 10;
const DEFAULT_SPEED = 5;
const BASE_DELAY_MS = 600;

const BAR_STATE = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  CURRENT_MIN: 'current-min',
  MAX: 'max',
  SORTED: 'sorted',
};

function createLayout(root) {
  root.innerHTML = `
    <div class="sorting-controls">
      <button type="button" class="btn btn--primary" data-role="toggle">Iniciar</button>
      <button type="button" class="btn" data-role="shuffle">Embaralhar</button>
      <label class="control">
        <span>Tamanho</span>
        <input type="range" data-role="size" min="${MIN_ARRAY_SIZE}" max="${MAX_ARRAY_SIZE}" value="${DEFAULT_ARRAY_SIZE}">
        <output data-role="size-output"></output>
      </label>
      <label class="control">
        <span>Velocidade</span>
        <input type="range" data-role="speed" min="${MIN_SPEED}" max="${MAX_SPEED}" value="${DEFAULT_SPEED}">
        <output data-role="speed-output"></output>
      </label>
    </div>
    <div class="sorting-bars" role="img" aria-label="Barras que representam os valores do vetor" data-role="bars"></div>
    <p class="sorting-status" data-role="status"></p>
  `;

  const find = (role) => root.querySelector(`[data-role="${role}"]`);

  return {
    toggleButton: find('toggle'),
    shuffleButton: find('shuffle'),
    sizeInput: find('size'),
    sizeOutput: find('size-output'),
    speedInput: find('speed'),
    speedOutput: find('speed-output'),
    bars: find('bars'),
    status: find('status'),
  };
}

function readNumber(input, min, max, fallback) {
  const parsed = Number(input.value);
  return Number.isFinite(parsed) ? Math.min(Math.max(Math.round(parsed), min), max) : fallback;
}

function getBarState(index, frame) {
  if (index < frame.sortedCount) return BAR_STATE.SORTED;
  if (index === frame.scanIndex) return BAR_STATE.SCANNING;
  if (index === frame.minIndex) return BAR_STATE.CURRENT_MIN;
  if (index === frame.maxIndex) return BAR_STATE.MAX;
  return BAR_STATE.IDLE;
}

function renderBars(container, frame) {
  const bars = frame.values.map((value, index) => {
    const bar = document.createElement('div');
    bar.className = `bar bar--${getBarState(index, frame)}`;
    bar.style.height = `${(value / MAX_VALUE) * 100}%`;
    bar.title = String(value);
    return bar;
  });
  container.replaceChildren(...bars);
}

function describeStep(step, isLastStep) {
  if (isLastStep) return 'Vetor ordenado.';
  return step.scanIndex === null
    ? 'Menor valor da rodada colocado na posição certa.'
    : `Procurando o menor valor: olhando a posição ${step.scanIndex + 1}.`;
}

export function initSortingView(root) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError('root must be an HTMLElement.');
  }

  const elements = createLayout(root);
  const state = { values: [], steps: [], stepIndex: 0, timerId: null, isDone: false };

  const isRunning = () => state.timerId !== null;
  const getDelay = () => BASE_DELAY_MS / readNumber(elements.speedInput, MIN_SPEED, MAX_SPEED, DEFAULT_SPEED);

  function updateToggleLabel() {
    elements.toggleButton.textContent = isRunning() ? 'Pausar' : 'Iniciar';
  }

  function stopTimer() {
    clearTimeout(state.timerId);
    state.timerId = null;
    updateToggleLabel();
  }

  function showIdle() {
    const minIndex = findMinIndex(state.values);
    const maxIndex = findMaxIndex(state.values);
    renderBars(elements.bars, { values: state.values, scanIndex: null, minIndex, maxIndex, sortedCount: 0 });
    elements.status.textContent = `Menor valor: ${state.values[minIndex]} · maior valor: ${state.values[maxIndex]}.`;
  }

  function shuffle() {
    stopTimer();
    const size = readNumber(elements.sizeInput, MIN_ARRAY_SIZE, MAX_ARRAY_SIZE, DEFAULT_ARRAY_SIZE);
    state.values = generateRandomArray(size);
    state.steps = [];
    state.stepIndex = 0;
    state.isDone = false;
    showIdle();
  }

  function tick() {
    const step = state.steps[state.stepIndex];
    const isLastStep = state.stepIndex === state.steps.length - 1;
    renderBars(elements.bars, step);
    elements.status.textContent = describeStep(step, isLastStep);

    if (isLastStep) {
      state.isDone = true;
      stopTimer();
      return;
    }
    state.stepIndex += 1;
    state.timerId = setTimeout(tick, getDelay());
  }

  function start() {
    if (state.isDone) shuffle();
    if (state.steps.length === 0) {
      state.steps = selectionSortSteps(state.values);
      state.stepIndex = 0;
    }
    tick();
    updateToggleLabel();
  }

  elements.toggleButton.addEventListener('click', () => {
    if (isRunning()) {
      stopTimer();
    } else {
      start();
    }
  });

  elements.shuffleButton.addEventListener('click', shuffle);

  elements.sizeInput.addEventListener('input', () => {
    elements.sizeOutput.textContent = elements.sizeInput.value;
    shuffle();
  });

  elements.speedInput.addEventListener('input', () => {
    elements.speedOutput.textContent = elements.speedInput.value;
  });

  elements.sizeOutput.textContent = elements.sizeInput.value;
  elements.speedOutput.textContent = elements.speedInput.value;
  shuffle();
}
