#!/usr/bin/env node
// 데이터 정합성 검증 — npm run validate
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

function loadModule(rel) {
  const code = readFileSync(join(root, rel), 'utf8')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+\{[^}]+\};?\s*$/gm, '');
  const fn = new Function(`
    "use strict";
    return (function(){
      ${code}
      const _r = {};
      try { _r.HANJA     = HANJA;     } catch(_) {}
      try { _r.HANJA_IDS = HANJA_IDS; } catch(_) {}
      try { _r.VOCAB     = VOCAB;     } catch(_) {}
      try { _r.STAGES    = STAGES;    } catch(_) {}
      try { _r.STAGE_IDS = STAGE_IDS; } catch(_) {}
      return _r;
    })()
  `);
  return fn();
}

let errors = 0, warnings = 0;
const err  = msg => { console.error(`❌  ${msg}`); errors++;   };
const warn = msg => { console.warn( `⚠️   ${msg}`); warnings++; };
const ok   = msg => console.log(`✅  ${msg}`);

// ── 1. hanja.js ─────────────────────────────────────────────────
const { HANJA = {}, HANJA_IDS = [] } = loadModule('src/data/hanja.js');
ok(`한자 ${HANJA_IDS.length}자 로드`);

for (const id of HANJA_IDS) {
  const h = HANJA[id];
  if (!h.reading)       err(`${id}: reading 없음`);
  if (!h.meaning)       err(`${id}: meaning 없음`);
  if (!h.grade)         err(`${id}: grade 없음`);
  if (!h.morphPathsRef) err(`${id}: morphPathsRef 없음`);
  if (!h.vocab || h.vocab.length < 3)
    warn(`${id}: vocab ${h.vocab?.length ?? 0}개 (권장 4~5)`);
}

// ── 2. morph path 검증 (P0: 車 / M4 데모: 水·火 / 새로운: 木·山·日·月·人) ────────────────
const MORPH_REQUIRED = ['車', '水', '火', '木', '山', '日', '月', '人'];
for (const hid of MORPH_REQUIRED) {
  try {
    const data = JSON.parse(readFileSync(join(root, `src/assets/hanja/${hid}.json`), 'utf8'));
    if (!Array.isArray(data.morphPaths) || data.morphPaths.length !== 3) {
      err(`${hid}.json: morphPaths 3개 필요`);
      continue;
    }
    const cmdCounts = data.morphPaths.map(p => (p.match(/[MLHVCSQTAZ]/gi) || []).length);
    const allSame   = cmdCounts.every(c => c === cmdCounts[0]);
    if (!allSame) warn(`${hid}.json: morphPaths 명령 수 불일치 ${cmdCounts} — 보간 시 cross-fade 폴백`);
    else ok(`${hid} morph paths: 3단계, 명령 수 ${cmdCounts[0]}개 일치`);
  } catch (e) {
    err(`${hid}.json 로드 실패: ${e.message}`);
  }
}

// ── 3. vocab.js ─────────────────────────────────────────────────
const { VOCAB = {} } = loadModule('src/data/vocab.js');
for (const [word, data] of Object.entries(VOCAB)) {
  for (const hid of (data.hanja ?? [])) {
    if (!HANJA[hid]) err(`vocab '${word}': 한자 '${hid}' HANJA에 없음`);
  }
  for (const [idx] of Object.entries(data.syllableMap ?? {})) {
    if (parseInt(idx) >= [...word].length)
      err(`vocab '${word}': syllableMap idx ${idx} 범위 초과`);
  }
}
ok(`어휘 ${Object.keys(VOCAB).length}개 검증 완료`);

// ── 4. stages.js ────────────────────────────────────────────────
const { STAGES = {}, STAGE_IDS = [] } = loadModule('src/data/stages.js');
for (const [sid, stage] of Object.entries(STAGES)) {
  if (!stage.name)            err(`stage '${sid}': name 없음`);
  if (!stage.hanjaIds?.length) err(`stage '${sid}': hanjaIds 없음`);
  for (const hid of (stage.hanjaIds ?? [])) {
    if (!HANJA[hid]) err(`stage '${sid}': 한자 '${hid}' HANJA에 없음`);
  }
  for (const [wid, wd] of Object.entries(stage.words ?? {})) {
    if (!wd.targetHanjaId) err(`stage '${sid}' word '${wid}': targetHanjaId 없음`);
    if (wd.targetHanjaId && !HANJA[wd.targetHanjaId])
      err(`stage '${sid}' word '${wid}': 한자 '${wd.targetHanjaId}' HANJA에 없음`);
    if (!VOCAB[wd.text])
      warn(`stage '${sid}' word '${wid}': '${wd.text}' vocab.js에 없음`);
  }
}
ok(`스테이지 ${STAGE_IDS.length}개 검증 완료`);

// ── 결과 ────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(44));
console.log(`결과: 오류 ${errors}개  경고 ${warnings}개`);
if (errors > 0) { console.error('❌  검증 실패'); process.exit(1); }
else            { console.log('✅  검증 통과'); }
