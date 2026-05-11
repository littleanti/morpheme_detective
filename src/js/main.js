// 진입점 — M1 시작 화면, M2 스테이지/hit zone, M3 TTS unlock + 돋보기
import { SCREENS } from './config.js';
import { loadStage, unloadStage } from './stage.js';
import { unlock as unlockTts, cancel as cancelTts } from './tts.js';
import { attachMagnifier, detachMagnifier } from './magnifier.js';
import { releaseAll } from './pointer.js';

let activeScreen = null;

export function showScreen(id) {
  cancelTts();
  const stageCanvas = document.getElementById('stage-canvas');
  if (stageCanvas) releaseAll(stageCanvas);
  if (id !== SCREENS.PLAY) detachMagnifier();

  if (activeScreen) activeScreen.classList.remove('active');
  activeScreen = document.getElementById(id);
  if (activeScreen) activeScreen.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  showScreen(SCREENS.START);

  // 시작 → 주차장 사건 자동 진입 + 사용자 제스처에서 TTS unlock
  document.getElementById('btn-start')?.addEventListener('click', async () => {
    unlockTts(); // iOS Safari unlock — 첫 사용자 제스처 안에서 호출 필수
    try {
      await loadStage('parking-lot');
      showScreen(SCREENS.PLAY);
      attachMagnifier(document.getElementById('stage-canvas'));
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
