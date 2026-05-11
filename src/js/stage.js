// 일러스트 로드 + hit zone 등록 — M2 핵심
import { STAGES } from '../data/stages.js';
import { state }  from './state.js';
import { PULSE_DURATION } from './config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
let pulseTimer  = null;
let hitListener = null;
let svgEl       = null;

export async function loadStage(stageId) {
  const stage = STAGES[stageId];
  if (!stage) throw new Error(`stage 없음: ${stageId}`);

  unloadStage(); // 이전 스테이지 정리

  state.stage.currentStageId = stageId;

  const canvas = document.getElementById('stage-canvas');
  if (!canvas) throw new Error('#stage-canvas 없음');

  const res = await fetch(stage.illustrationSrc);
  if (!res.ok) throw new Error(`일러스트 로드 실패 (${res.status}): ${stage.illustrationSrc}`);
  const svgText = await res.text();
  canvas.innerHTML = svgText;

  svgEl = canvas.querySelector('svg');
  if (!svgEl) throw new Error('일러스트에 <svg> 없음');
  svgEl.classList.add('stage-illustration');

  attachHitZones(svgEl, stage.clickableObjects);
  state.stage.illustrationLoaded = true;

  startPulse();
  console.log(`[stage] ${stageId} 로드 완료 — hit zone ${stage.clickableObjects.length}개`);
}

function attachHitZones(svg, objects) {
  const overlay = document.createElementNS(SVG_NS, 'g');
  overlay.setAttribute('id', 'hit-zone-overlay');

  for (const obj of objects) {
    const poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', obj.polygon.map(p => p.join(',')).join(' '));
    poly.setAttribute('class', 'hit-zone pulse');
    poly.setAttribute('tabindex', '0');
    poly.setAttribute('role', 'button');
    poly.setAttribute('aria-label', obj.label);
    poly.dataset.objectId = obj.id;
    poly.dataset.wordId   = obj.wordId;
    overlay.appendChild(poly);
  }

  svg.appendChild(overlay);
  state.stage.hitZones = objects.slice();

  hitListener = e => {
    const target = e.target.closest('.hit-zone');
    if (!target) return; // 빈 영역 탭은 무반응 (M2 DoD)
    onHit({
      objectId: target.dataset.objectId,
      wordId:   target.dataset.wordId,
      label:    target.getAttribute('aria-label'),
    });
  };
  // click 으로 키보드 Enter 도 자동 처리됨
  svg.addEventListener('click', hitListener);
}

function onHit({ objectId, wordId, label }) {
  stopPulse(); // 첫 발견 시 펄스 중단 (PRD F5 — 인지 학습 후 자동 종료)
  console.log(`[stage] hit objectId="${objectId}" wordId="${wordId}" label="${label}"`);
  // M3: word-block 분리 + 한자 음절 하이라이트
  // M4: morph 애니메이션
  // M5: 어휘 카드 등장
}

function startPulse() {
  state.stage.pulseUntilTs = Date.now() + PULSE_DURATION;
  if (pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(stopPulse, PULSE_DURATION);
}

function stopPulse() {
  document.querySelectorAll('.hit-zone.pulse')
    .forEach(el => el.classList.remove('pulse'));
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
  state.stage.pulseUntilTs = 0;
}

export function unloadStage() {
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
  if (svgEl && hitListener) svgEl.removeEventListener('click', hitListener);
  const canvas = document.getElementById('stage-canvas');
  if (canvas) canvas.innerHTML = '';
  state.stage.currentStageId    = null;
  state.stage.illustrationLoaded = false;
  state.stage.hitZones          = [];
  state.stage.pulseUntilTs      = 0;
  hitListener = null;
  svgEl       = null;
}
