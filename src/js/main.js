// 진입점 — 화면 전환·TTS/Audio unlock·스테이지 로드
import { SCREENS }                      from './config.js';
import { STAGES, STAGE_IDS }           from '../data/stages.js';
import { loadStage, unloadStage }       from './stage.js';
import { unlock as unlockTts,
         cancel as cancelTts }          from './tts.js';
import { unlock as unlockAudio,
         stopAll as stopAudio }         from './audio.js';
import { attachMagnifier,
         detachMagnifier }              from './magnifier.js';
import { releaseAll }                   from './pointer.js';
import { clearCards }                   from './card-deck.js';
import { initGame, showMission,
         showEnd, restartGame }         from './game.js';
import { attachViewport, detachViewport } from './viewport.js';
import { renderCollectionScreen }         from './collection.js';

let activeScreen   = null;
let selectedStageId = null;

export function showScreen(id) {
  cancelTts();
  stopAudio();
  const stageCanvas = document.getElementById('stage-canvas');
  if (stageCanvas) releaseAll(stageCanvas);
  if (id !== SCREENS.PLAY) {
    detachMagnifier();
    detachViewport();
    clearCards();
  }

  if (activeScreen) activeScreen.classList.remove('active');
  activeScreen = document.getElementById(id);
  if (activeScreen) activeScreen.classList.add('active');
}

async function _loadAndPlay(stageId) {
  selectedStageId = stageId ?? selectedStageId ?? 'parking-lot';
  try {
    await loadStage(selectedStageId);
    showScreen(SCREENS.PLAY);
    attachMagnifier(document.getElementById('stage-canvas'));
    attachViewport(document.getElementById('stage-canvas'));
  } catch (e) {
    console.error('[main] stage 로드 실패:', e);
  }
}

// F3: stages.js 기반 동적 렌더
function _renderStageSelect() {
  const list = document.getElementById('stage-card-list');
  if (!list) return;

  list.innerHTML = STAGE_IDS.map(id => {
    const s = STAGES[id];
    return `
      <button class="stage-card" data-stage-id="${id}" role="listitem"
              aria-label="${s.label ?? s.name} 사건 선택">
        <div class="stage-card-name">${s.name}</div>
        <div class="stage-card-desc">${s.description}</div>
      </button>
    `;
  }).join('');

  list.addEventListener('click', async e => {
    const card = e.target.closest('.stage-card');
    if (!card) return;
    await _loadAndPlay(card.dataset.stageId);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initGame(showScreen);
  showScreen(SCREENS.START);

  // 첫 사용자 제스처 안에서 TTS + AudioContext unlock (iOS Safari 자동재생 정책)
  document.getElementById('btn-start')?.addEventListener('click', () => {
    unlockTts();
    unlockAudio();
    _renderStageSelect();
    showScreen(SCREENS.STAGE_SELECT);
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

  document.getElementById('btn-show-mission')?.addEventListener('click', showMission);

  // 이벤트 위임: 종료 화면 버튼 (game.js가 동적으로 렌더링)
  document.getElementById('end-screen')?.addEventListener('click', e => {
    const target = /** @type {HTMLElement} */ (e.target);
    if (target.id === 'btn-end-replay') {
      restartGame(() => {
        unloadStage();
        _loadAndPlay(selectedStageId);
      });
    } else if (target.id === 'btn-end-collection') {
      renderCollectionScreen();
      showScreen(SCREENS.COLLECTION);
    } else if (target.id === 'btn-end-home') {
      unloadStage();
      showScreen(SCREENS.START);
    }
  });

  document.getElementById('collection-screen')?.addEventListener('click', e => {
    if (e.target.id === 'btn-collection-back') showScreen(SCREENS.END);
  });
});
