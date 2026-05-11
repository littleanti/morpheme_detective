// 줌/팬 컨트롤 — P1 (M7 폰 모드)
import { state } from './state.js';
import { clamp } from './utils.js';

export function applyTransform({ scale = 1, x = 0, y = 0 } = {}) {
  state.stage.zoom = clamp(scale, 1, 2);
  state.stage.pan  = { x, y };
  // M7: stage-canvas 에 transform 적용
}

export function resetViewport() {
  applyTransform({ scale: 1, x: 0, y: 0 });
}
