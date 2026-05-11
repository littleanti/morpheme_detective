// 진입점 — M1: 시작 화면, M2: 스테이지 로드 + hit zone
import { SCREENS } from './config.js';
import { loadStage, unloadStage } from './stage.js';

let activeScreen = null;

export function showScreen(id) {
  if (activeScreen) activeScreen.classList.remove('active');
  activeScreen = document.getElementById(id);
  if (activeScreen) activeScreen.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  showScreen(SCREENS.START);

  // 시작 → 주차장 사건 자동 진입 (M6 에서 stage-select 통해 분기)
  document.getElementById('btn-start')?.addEventListener('click', async () => {
    try {
      await loadStage('parking-lot');
      showScreen(SCREENS.PLAY);
    } catch (e) {
      console.error('[main] stage 로드 실패:', e);
    }
  });

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    showScreen(SCREENS.SETTINGS);
  });

  document.getElementById('btn-stage-select-back')?.addEventListener('click', () => {
    showScreen(SCREENS.START);
  });

  document.getElementById('btn-settings-back')?.addEventListener('click', () => {
    showScreen(SCREENS.START);
  });

  document.getElementById('btn-play-back')?.addEventListener('click', () => {
    unloadStage();
    showScreen(SCREENS.START);
  });
});
