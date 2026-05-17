// 도감(컬렉션) 화면 — F14
import { HANJA, HANJA_IDS } from '../data/hanja.js';
import { state }            from './state.js';

export function renderCollectionScreen() {
  const container = document.querySelector('#collection-screen .card-screen');
  if (!container) return;

  const collected = state.progress.collected;

  container.innerHTML = `
    <h2 class="collection-title">📚 한자 도감</h2>
    <p class="collection-subtitle">발견한 한자: ${collected.size} / ${HANJA_IDS.length}</p>
    <div class="collection-grid">
      ${HANJA_IDS.map(id => {
        const h = HANJA[id];
        const found = collected.has(id);
        return `
          <div class="collection-card ${found ? 'found' : 'locked'}" aria-label="${found ? h.reading + ' ' + h.meaning : '미발견 한자'}">
            <div class="collection-card-hanja">${found ? id : '?'}</div>
            ${found
              ? `<div class="collection-card-reading">${h.reading}</div>
                 <div class="collection-card-meaning">${h.meaning}</div>`
              : '<div class="collection-card-lock">🔒</div>'
            }
          </div>
        `;
      }).join('')}
    </div>
    <div class="collection-actions">
      <button id="btn-collection-back" class="btn ghost small">← 돌아가기</button>
    </div>
  `;
}
