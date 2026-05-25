// 일러스트 로드 + hit zone 등록 + 객체 탭 → 단어 분리·TTS·morph·카드 덱 — M2~M5
import { STAGES }               from '../data/stages.js';
import { HANJA }                from '../data/hanja.js';
import { state }                from './state.js';
import { PULSE_DURATION, IDLE_HINT_DELAY, MAGNET_PX } from './config.js';
import { showWord, clearWord }  from './word-block.js';
import { speakHanja, cancel as cancelTts } from './tts.js';
import { getSnappedHitZone }    from './magnifier.js';
import { runMorph, loadHanjaPaths, cancelMorph } from './morph.js';
import { showCardDeck, clearCards } from './card-deck.js';
import { play as playAudio }    from './audio.js';

// ── 좌표 기반 hit-zone 매칭 ─────────────────────────────────────
// e.target 의존(closest('.hit-zone'))은 SVG 내부 다른 자식이 클릭을 가로채면 실패.
// 클릭 좌표를 SVG 좌표계로 변환한 뒤 polygon 안에 직접 들어가는지 검사한다.

function clientToSvgPoint(svg, clientX, clientY) {
  if (!svg || !svg.createSVGPoint || !svg.getScreenCTM) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  try { return pt.matrixTransform(ctm.inverse()); }
  catch (_) { return null; }
}

// ray-casting point-in-polygon (SVG 좌표)
function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];
    const hit = ((yi > y) !== (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (hit) inside = !inside;
  }
  return inside;
}

// 클릭 좌표가 어떤 hit-zone polygon 내부인지 직접 검사 (e.target 의존 0).
function findHitZoneByPoint(svg, objects, clientX, clientY) {
  const p = clientToSvgPoint(svg, clientX, clientY);
  if (!p) return null;
  for (const obj of objects) {
    if (pointInPolygon(p.x, p.y, obj.polygon)) {
      return svg.querySelector(
        `.hit-zone[data-object-id="${CSS.escape ? CSS.escape(obj.id) : obj.id}"]`
      );
    }
  }
  return null;
}

// 거리 기반 nearest — 위 검사가 모두 실패한 마지막 폴백.
function nearestHitZoneFromPoint(svg, clientX, clientY, maxPx) {
  const zones = svg.querySelectorAll('.hit-zone');
  let best = null;
  let bestDist = Infinity;
  zones.forEach(z => {
    const r = z.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const d  = Math.hypot(cx - clientX, cy - clientY);
    if (d < bestDist) { bestDist = d; best = z; }
  });
  return (best && bestDist <= maxPx) ? best : null;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
let pulseTimer       = null;
let idleHintTimer    = null;
let hitListener      = null;
let canvasEl         = null;
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
  canvasEl = canvas;

  const res = await fetch(stage.illustrationSrc);
  if (!res.ok) throw new Error(`일러스트 로드 실패 (${res.status}): ${stage.illustrationSrc}`);
  const svgText = await res.text();
  canvas.innerHTML = svgText;

  svgEl = canvas.querySelector('svg');
  if (!svgEl) throw new Error('일러스트에 <svg> 없음');
  svgEl.classList.add('stage-illustration');

  attachHitZones(canvas, svgEl, stage.clickableObjects);
  state.stage.illustrationLoaded = true;

  startPulse();
  scheduleIdleHint();
  console.log(`[stage] ${stageId} 로드 완료 — hit zone ${stage.clickableObjects.length}개`);
}

function attachHitZones(canvas, svg, objects) {
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
    // PC 마우스 / 터치 공통 — 4단계 라우팅으로 e.target 의존성 제거.
    //
    //  1) e.target.closest('.hit-zone') — 가장 정확
    //  2) findHitZoneByPoint — 클릭 좌표를 SVG 좌표로 변환 후 polygon 내부 직접 검사
    //     (일러스트 자식 요소가 클릭을 가로채는 경우, letterbox 영역 클릭, transform 적용 등 모두 대응)
    //  3) magnifier 의 lastSnap — 사용자가 hover 로 이미 자석 흡착한 zone
    //  4) 거리 기반 nearest — 최후 폴백 (MAGNET_PX * 3)
    let target = e.target?.closest?.('.hit-zone');
    if (!target) target = findHitZoneByPoint(svg, objects, e.clientX, e.clientY);
    if (!target) target = getSnappedHitZone();
    if (!target) target = nearestHitZoneFromPoint(svg, e.clientX, e.clientY, MAGNET_PX * 3);

    if (!target) {
      console.log('[stage] click miss', {
        tag: e.target?.tagName,
        x:   e.clientX,
        y:   e.clientY,
      });
      springBackFlash(svg, e);
      return;
    }
    onHit({
      objectId: target.dataset.objectId,
      wordId:   target.dataset.wordId,
      label:    target.getAttribute('aria-label'),
    });
  };

  // click 은 inner <svg> 가 아니라 stage-canvas (div) 에 등록:
  //  - letterbox 여백, viewport.js 의 transform, SVG 내부 다른 자식 등 어떤 환경에서도 도달 보장.
  canvas.addEventListener('click', hitListener);
}

async function onHit({ objectId, wordId, label }) {
  stopPulse();
  clearIdleHint();
  // 발견된 hit zone 표시 + 강화 펄스 제거 (PRD F18)
  if (svgEl && objectId) {
    const sel = `.hit-zone[data-object-id="${CSS.escape ? CSS.escape(objectId) : objectId}"]`;
    const el  = svgEl.querySelector(sel);
    if (el) {
      el.classList.add('discovered');
      el.classList.remove('pulse-strong');
    }
  }
  // hit-zone polygon 은 tabindex 가 있어 클릭 후에도 focus-visible 가
  // 유지되며 stroke 가 잔상처럼 보일 수 있다. 즉시 blur 로 해제.
  if (document.activeElement?.classList?.contains?.('hit-zone')) {
    document.activeElement.blur();
  }
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

  // 다음 미발견 객체를 위해 idle hint 재예약 (남아있는 hit zone 있을 때만)
  scheduleIdleHint();
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
  // 설정 OFF 시 펄스 자체를 띄우지 않음 (이미 attachHitZones 에서 .pulse 클래스가
  // 붙은 hit-zone 들을 즉시 제거하고 종료).
  if (state.settings.pulseEnabled === false) {
    stopPulse();
    return;
  }
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

// ── PRD F18: 일정 시간 미발견 시 강화 펄스 ──────────────────
// IDLE_HINT_DELAY 동안 새 발견이 없으면 미발견(.hit-zone:not(.discovered))
// 모두에 .pulse-strong 부착. onHit / unloadStage / loadStage 가 리셋.
function scheduleIdleHint() {
  if (state.settings.pulseEnabled === false) return; // 발광 힌트 설정 OFF 시 비활성
  if (idleHintTimer) clearTimeout(idleHintTimer);
  idleHintTimer = setTimeout(() => {
    if (!svgEl) return;
    const undiscovered = svgEl.querySelectorAll('.hit-zone:not(.discovered)');
    if (undiscovered.length === 0) return;
    undiscovered.forEach(el => el.classList.add('pulse-strong'));
  }, IDLE_HINT_DELAY);
}

function clearIdleHint() {
  if (idleHintTimer) { clearTimeout(idleHintTimer); idleHintTimer = null; }
  if (svgEl) {
    svgEl.querySelectorAll('.hit-zone.pulse-strong')
      .forEach(el => el.classList.remove('pulse-strong'));
  }
}

export function unloadStage() {
  cancelTts();
  cancelMorph();
  clearIdleHint();
  if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
  if (canvasEl && hitListener) canvasEl.removeEventListener('click', hitListener);
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
  canvasEl     = null;
  svgEl        = null;
  currentStage = null;
}
