// Pointer Events 통합 — M2 기본형, M3 에서 자석 흡착·capture 강화
export function attachPointer(el, { down, move, up, cancel } = {}) {
  const offs = [];
  if (down) {
    const h = e => { try { el.setPointerCapture?.(e.pointerId); } catch (_) {} down(e); };
    el.addEventListener('pointerdown', h);
    offs.push([el, 'pointerdown', h]);
  }
  if (move)   { el.addEventListener('pointermove',   move);   offs.push([el, 'pointermove',   move]);   }
  if (up)     { el.addEventListener('pointerup',     up);     offs.push([el, 'pointerup',     up]);     }
  if (cancel) { el.addEventListener('pointercancel', cancel); offs.push([el, 'pointercancel', cancel]); }
  return () => offs.forEach(([t, name, h]) => t.removeEventListener(name, h));
}

// 모든 pointer capture 해제 — 화면 전환 시 호출 (TRD §2.4 부작용)
export function releaseAll(el) {
  // M3: pointerId 추적 큐를 만들어 일괄 release
}
