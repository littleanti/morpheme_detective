// 진입점 — M1: 시작 화면 표시 + 기본 내비게이션 골격
import { SCREENS } from './config.js';

let activeScreen = null;

export function showScreen(id) {
  if (activeScreen) activeScreen.classList.remove('active');
  activeScreen = document.getElementById(id);
  if (activeScreen) activeScreen.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  showScreen(SCREENS.START);

  document.getElementById('btn-start')?.addEventListener('click', () => {
    // M6에서 구현 — 사건 선택 화면으로 이동
    showScreen(SCREENS.STAGE_SELECT);
  });

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    // M7에서 구현
    showScreen(SCREENS.SETTINGS);
  });

  document.getElementById('btn-stage-select-back')?.addEventListener('click', () => {
    showScreen(SCREENS.START);
  });

  document.getElementById('btn-settings-back')?.addEventListener('click', () => {
    showScreen(SCREENS.START);
  });
});
