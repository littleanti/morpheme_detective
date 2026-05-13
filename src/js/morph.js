// SVG path morph — TRD §3.2 / PRD F9
// 1차: 토큰 정규화 후 좌표 lerp (requestAnimationFrame 루프)
// 2차: 명령 수 미스매치 / 저사양 디바이스 시 cross-fade 폴백
import { MORPH_DURATION } from './config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const NUM_RE = /-?\d+(?:\.\d+)?(?:e-?\d+)?/g;

let activeRaf = null;
let activeCleanup = null;

// ── 토큰화 ─────────────────────────────────────────────────────────
// "M 10,20 L 30,40 Z" → [{cmd:'M',args:[10,20]}, {cmd:'L',args:[30,40]}, {cmd:'Z',args:[]}]
export function tokenize(d) {
  if (!d) return [];
  const out = [];
  // 명령 문자 + 뒤따르는 숫자들로 분할
  const matches = d.match(/[A-Za-z][^A-Za-z]*/g) || [];
  for (const seg of matches) {
    const cmd  = seg[0];
    const nums = seg.slice(1).match(NUM_RE) || [];
    out.push({ cmd, args: nums.map(Number) });
  }
  return out;
}

export function serialize(tokens) {
  return tokens.map(t => t.cmd + (t.args.length ? ' ' + t.args.join(',') : '')).join(' ');
}

// 명령 시퀀스가 1:1 매칭되는지 (보간 호환)
export function isInterpolatable(fromTokens, toTokens) {
  if (fromTokens.length !== toTokens.length) return false;
  for (let i = 0; i < fromTokens.length; i++) {
    if (fromTokens[i].cmd !== toTokens[i].cmd) return false;
    if (fromTokens[i].args.length !== toTokens[i].args.length) return false;
  }
  return true;
}

// ── 보간 (한 프레임) ──────────────────────────────────────────────
export function lerpTokens(fromTokens, toTokens, t) {
  const out = [];
  for (let i = 0; i < fromTokens.length; i++) {
    const a = fromTokens[i];
    const b = toTokens[i];
    const args = a.args.map((v, j) => v + (b.args[j] - v) * t);
    out.push({ cmd: a.cmd, args });
  }
  return out;
}

const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ── 단일 path 보간 애니메이션 ─────────────────────────────────────
export function animatePath(pathEl, fromD, toD, durationMs = MORPH_DURATION) {
  return new Promise(resolve => {
    const from = tokenize(fromD);
    const to   = tokenize(toD);
    if (!isInterpolatable(from, to)) {
      // 보간 불가 시 즉시 toD 설정 — 폴백은 호출 측에서 처리
      pathEl.setAttribute('d', toD);
      resolve(false);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const k = easeInOutCubic(t);
      const interp = lerpTokens(from, to, k);
      pathEl.setAttribute('d', serialize(interp));
      if (t < 1) {
        activeRaf = requestAnimationFrame(step);
      } else {
        activeRaf = null;
        resolve(true);
      }
    };
    activeRaf = requestAnimationFrame(step);
  });
}

// ── 저사양 감지 ───────────────────────────────────────────────────
export function isLowEndDevice() {
  const mem  = navigator.deviceMemory ?? 4;
  const cpus = navigator.hardwareConcurrency ?? 4;
  return mem < 2 || cpus < 4;
}

// ── 3단계 morph: 실루엣 → 갑골문 → 해서체 ─────────────────────────
// pathEl 1개를 두 구간(0→1, 1→2)으로 순차 보간
export async function morphSequence(pathEl, morphPaths, durationMs = MORPH_DURATION) {
  if (!Array.isArray(morphPaths) || morphPaths.length < 2) return false;
  pathEl.setAttribute('d', morphPaths[0]);
  const segDuration = durationMs / (morphPaths.length - 1);
  for (let i = 0; i < morphPaths.length - 1; i++) {
    const ok = await animatePath(pathEl, morphPaths[i], morphPaths[i + 1], segDuration);
    if (!ok) return false;
  }
  return true;
}

// ── cross-fade 폴백 (보간 불가 / 저사양) ──────────────────────────
// container 안에 morphPaths.length 개의 <path> 를 스택, opacity 시퀀싱
export async function crossFadeSequence(container, morphPaths, durationMs = MORPH_DURATION) {
  container.innerHTML = '';
  const stages = morphPaths.map((d, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'morph-stage' + (i === 0 ? ' active' : '');
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'morph-svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('class', 'morph-path');
    p.setAttribute('d', d);
    svg.appendChild(p);
    wrap.appendChild(svg);
    container.appendChild(wrap);
    return wrap;
  });
  const segDuration = durationMs / (morphPaths.length - 1);
  for (let i = 1; i < stages.length; i++) {
    await new Promise(r => setTimeout(r, segDuration));
    stages[i - 1].classList.remove('active');
    stages[i].classList.add('active');
  }
  return true;
}

// ── 진입점: 컨테이너 + 한자 JSON → 자동 분기 ──────────────────────
export async function runMorph(container, hanjaData, durationMs = MORPH_DURATION) {
  if (!container || !hanjaData?.morphPaths?.length) return false;
  cancelMorph();

  const backdrop = container.querySelector('.morph-backdrop');
  backdrop?.classList.remove('animating');
  void backdrop?.offsetWidth; // reflow → 애니메이션 재시작
  backdrop?.classList.add('animating');

  const fromTokens = tokenize(hanjaData.morphPaths[0]);
  const allSameShape = hanjaData.morphPaths.every(d => {
    const t = tokenize(d);
    return isInterpolatable(fromTokens, t);
  });

  if (allSameShape && !isLowEndDevice()) {
    // 1차: 좌표 lerp
    container.querySelector('.morph-stage:not(:first-child)')?.remove();
    let stage = container.querySelector('.morph-stage');
    if (!stage) {
      stage = document.createElement('div');
      stage.className = 'morph-stage active';
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', 'morph-svg');
      svg.setAttribute('viewBox', hanjaData.viewBox || '0 0 200 200');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('class', 'morph-path');
      svg.appendChild(p);
      stage.appendChild(svg);
      container.appendChild(stage);
    }
    stage.classList.add('active');
    const pathEl = stage.querySelector('path');
    activeCleanup = () => { /* path lerp 자체는 rAF 취소로 충분 */ };
    return morphSequence(pathEl, hanjaData.morphPaths, durationMs);
  }

  // 폴백: cross-fade
  console.info('[morph] cross-fade fallback (mismatch or low-end)');
  return crossFadeSequence(container, hanjaData.morphPaths, durationMs);
}

export function cancelMorph() {
  if (activeRaf) { cancelAnimationFrame(activeRaf); activeRaf = null; }
  if (activeCleanup) { try { activeCleanup(); } catch (_) {} activeCleanup = null; }
}

// 한자 JSON lazy load (캐시 포함)
const cache = new Map();
export async function loadHanjaPaths(hanjaMeta) {
  if (!hanjaMeta?.morphPathsRef) return null;
  if (cache.has(hanjaMeta.id)) return cache.get(hanjaMeta.id);
  const res = await fetch(hanjaMeta.morphPathsRef);
  if (!res.ok) throw new Error(`hanja path 로드 실패: ${hanjaMeta.morphPathsRef}`);
  const data = await res.json();
  cache.set(hanjaMeta.id, data);
  return data;
}
