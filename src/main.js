import { initSortingView } from './modules/sorting/sorting-view.js';

const ACTIVE_TAB_CLASS = 'is-active';
const SORTING_ROOT_ID = 'sorting-root';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

function moduleExists(moduleId) {
  return Array.from(panels).some((panel) => panel.id === moduleId);
}

function showModule(moduleId) {
  if (!moduleExists(moduleId)) return;

  tabs.forEach((tab) => {
    const isSelected = tab.dataset.module === moduleId;
    tab.classList.toggle(ACTIVE_TAB_CLASS, isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
  });

  panels.forEach((panel) => {
    panel.hidden = panel.id !== moduleId;
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => showModule(tab.dataset.module));
});

initSortingView(document.getElementById(SORTING_ROOT_ID));
