// 일러스트 로드 + hit zone 등록 + 객체 탭 → 단어 분리·TTS·morph·카드 덱 — M2~M5
import { STAGES }               from '../data/stages.js';
import { HANJA }                from '../data/hanja.js';
import { state }                from './state.js';
import { PULSE_DURATION }       from './config.js';
import { showWord, clearWord }  from './word-block.js';
import { speakHanja, cancel as cancelTts } from './tts.js';
import { getSnappedHitZone }    from './magnifier.js';
import { runMorph, loadHanjaPaths, cancelMorph } from './morph.js';
import { showCardDeck, clearCards } from './card-deck.js';
import { play as playAudio }    from './audio.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
let pulseTimer       = null;
let hitListener      = null;
let svgEl            = null;
let currentStage     = null;
let discoveryCallback = null;

export function setDiscoveryCallback(fn) { discoveryCallback = fn; }

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
    if (!target) target = getSnappedHitZone();
    if (!target) {
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

async function onHit({ objectId, wordId, label }) {
  stopPulse();
  console.log(`[stage] hit objectId="${objectId}" wordId="${wordId}" label="${label}"`);

  const word = currentStage?.words?.[wordId];
  if (!word) return;

  showWord({
    wordId,
    text:              word.text,
    syllables:         word.syllables,
    targetSyllableIdx: word.targetSyllableIdx,
    targetHanjaId:     word.targetHanjaId,
  });

  const hanja = HANJA[word.targetHanjaId];

  if (hanja) {
    setTimeout(() => speakHanja({ reading: hanja.reading, meaning: hanja.meaning }), 260);
  }

  try {
    playAudio('transform'); // 변형음 — morph 시작과 동시
    await triggerMorph(hanja);
    state.detection.error = null;

    if (hanja) {
      playAudio('discovery'); // 발견음 — morph 완료 후
      showCardDeck(hanja.id);
    }
  } catch (e) {
    state.detection.error = 'morph-failed';
    console.warn('[stage] morph 실패, 카드 폴백 강행:', e);
    // morph 실패해도 카드는 반드시 표시
    if (hanja) showCardDeck(hanja.id);
  }

  // 발견 콜백 — morph 성공/실패 무관하게 항상 호출
  if (hanja) discoveryCallback?.(hanja.id);
}

async function triggerMorph(hanja) {
  if (!hanja) return;
  const container = document.getElementById('morph-container');
  if (!container) return;
  const data = await loadHanjaPaths(hanja);
  if (!data) return;
  container.setAttribute('aria-hidden', 'false');
  state.detection.morphPhase = 'silhouette';
  await runMorph(container, data);
  state.detection.morphPhase = 'done';
}

function springBackFlash(svg, e) {
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
  cancelMorph();
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
  if (svgEl && hitListener) svgEl.removeEventListener('click', hitListener);
  const canvas = document.getElementById('stage-canvas');
  if (canvas) canvas.innerHTML = '';
  clearWord();
  clearCards();
  const morphEl = document.getElementById('morph-container');
  if (morphEl) {
    morphEl.querySelectorAll('.morph-stage').forEach(n => n.remove());
    morphEl.querySelector('.morph-backdrop')?.classList.remove('animating');
    morphEl.setAttribute('aria-hidden', 'true');
  }
  state.stage.currentStageId     = null;
  state.stage.illustrationLoaded = false;
  state.stage.hitZones           = [];
  state.stage.pulseUntilTs       = 0;
  state.detection.morphPhase     = 'idle';
  state.detection.error          = null;
  hitListener  = null;
  svgEl        = null;
  currentStage = null;
}
