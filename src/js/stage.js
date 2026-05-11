// 일러스트 로드 + hit zone 등록 + 객체 탭 → 단어 분리·TTS — M2~M3
import { STAGES } from '../data/stages.js';
import { HANJA }  from '../data/hanja.js';
import { state }  from './state.js';
import { PULSE_DURATION } from './config.js';
import { showWord, clearWord } from './word-block.js';
import { speakHanja, cancel as cancelTts } from './tts.js';
import { getSnappedHitZone } from './magnifier.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
let pulseTimer  = null;
let hitListener = null;
let svgEl       = null;
let currentStage = null;

export async function loadStage(stageId) {
  const stage = STAGES[stageId];
  if (!stage) throw new Error(`stage 없음: ${stageId}`);

  unloadStage(); // 이전 스테이지 정리

  state.stage.currentStageId = stageId;
  currentStage = stage;

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
    let target = e.target.closest('.hit-zone');
    // 마우스/터치 UX: 커서가 살짝 빗나갔어도 돋보기가 hit zone에 스냅돼 있으면 그곳으로 라우팅
    if (!target) target = getSnappedHitZone();
    if (!target) {
      // 빈 영역 탭은 무반응 + spring-back 시각 피드백 (PRD F4·M3 #6)
      springBackFlash(svg, e);
      return;
    }
    onHit({
      objectId: target.dataset.objectId,
      wordId:   target.dataset.wordId,
      label:    target.getAttribute('aria-label'),
    });
  };
  svg.addEventListener('click', hitListener);
}

function onHit({ objectId, wordId, label }) {
  stopPulse();
  console.log(`[stage] hit objectId="${objectId}" wordId="${wordId}" label="${label}"`);

  const word = currentStage?.words?.[wordId];
  if (!word) return;

  // M3: 단어 → 음절 분리 + 핵심 한자 음절 하이라이트
  showWord({
    wordId,
    text:              word.text,
    syllables:         word.syllables,
    targetSyllableIdx: word.targetSyllableIdx,
    targetHanjaId:     word.targetHanjaId,
  });

  // M3: TTS "차, 수레 차" (하이라이트 트랜지션 시작 직후)
  const hanja = HANJA[word.targetHanjaId];
  if (hanja) {
    setTimeout(() => speakHanja({ reading: hanja.reading, meaning: hanja.meaning }), 260);
  }

  // M4: morph 애니메이션, M5: 어휘 카드 — 이후 마일스톤
}

function springBackFlash(svg, e) {
  // 빈 영역 탭 — 짧은 시각 피드백(부드러운 거절)
  const pt = svg.createSVGPoint?.();
  if (!pt) return;
  pt.x = e.clientX; pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const local = pt.matrixTransform(ctm.inverse());

  const r = document.createElementNS(SVG_NS, 'circle');
  r.setAttribute('cx', String(local.x));
  r.setAttribute('cy', String(local.y));
  r.setAttribute('r', '4');
  r.setAttribute('class', 'spring-back');
  svg.appendChild(r);
  setTimeout(() => r.remove(), 360);
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
  cancelTts();
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
  if (svgEl && hitListener) svgEl.removeEventListener('click', hitListener);
  const canvas = document.getElementById('stage-canvas');
  if (canvas) canvas.innerHTML = '';
  clearWord();
  state.stage.currentStageId    = null;
  state.stage.illustrationLoaded = false;
  state.stage.hitZones          = [];
  state.stage.pulseUntilTs      = 0;
  hitListener  = null;
  svgEl        = null;
  currentStage = null;
}
