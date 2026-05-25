#!/usr/bin/env node
// hanja.js 의 HANJA 메타로부터 src/assets/hanja/{id}.json 100개를 일괄 생성.
//
// 각 JSON 은 morph.js 의 path 보간 / cross-fade 폴백 입력으로 쓰인다.
// 마지막 단계는 system CJK 글리프(<text>) 로 자동 fallback 되므로 (TRD §3.2),
// path 데이터 자체는 generic placeholder 3-step 으로 충분하다.
//
// 사용: node scripts/gen-hanja-json.mjs
//
// 멱등(idempotent): 이미 존재하는 파일이라도 generic 템플릿으로 덮어쓴다.
// 손으로 다듬은 경우엔 SKIP_EXISTING=1 환경변수로 우회.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');
const OUT_DIR    = path.join(ROOT, 'src', 'assets', 'hanja');

// 3-step morph: 부드러운 원형 → 사각형 변형 → 격자 (모두 M+9L+Z=11 token)
// 마지막 stage 는 글리프 fallback 으로 가려지므로 placeholder 로 둠.
function genericPaths() {
  return [
    // step 1: 원형 실루엣 (객체 대표 형태)
    'M 100,15 L 145,30 L 175,65 L 185,110 L 165,155 L 125,180 L 75,180 L 35,155 L 15,110 L 25,65 Z',
    // step 2: 갑골문 느낌의 비대칭 다각형
    'M 100,15 L 150,40 L 165,85 L 180,130 L 140,160 L 110,180 L 70,170 L 40,140 L 25,90 L 50,45 Z',
    // step 3: 해서체 placeholder (사각형에 가까운) — 글리프 fallback 으로 덮임
    'M 25,25 L 175,25 L 175,100 L 175,175 L 100,175 L 25,175 L 25,100 L 100,100 L 100,25 L 25,100 Z',
  ];
}

async function main() {
  const skipExisting = process.env.SKIP_EXISTING === '1';

  // hanja.js 로드 (ESM dynamic import)
  const hanjaUrl = pathToFileURL(path.join(ROOT, 'src', 'data', 'hanja.js'));
  const { HANJA, HANJA_IDS } = await import(hanjaUrl);

  await fs.mkdir(OUT_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  for (const id of HANJA_IDS) {
    const meta    = HANJA[id];
    const outPath = path.join(OUT_DIR, `${id}.json`);

    if (skipExisting) {
      try {
        await fs.access(outPath);
        skipped++;
        continue;
      } catch { /* not exist → write */ }
    }

    const json = {
      id,
      reading:  meta.reading,
      meaning:  meta.meaning,
      source:   'placeholder — Make Me a Hanzi(GPL) 교체 대상',
      viewBox:  '0 0 200 200',
      morphPaths: genericPaths(),
      strokeCount: null,
      notes: '3-step morph placeholder. 마지막 단계는 system CJK 글리프 fallback (TRD §3.2) 으로 자동 대체.',
    };
    await fs.writeFile(outPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    written++;
  }
  console.log(`[gen-hanja-json] written=${written} skipped=${skipped} total=${HANJA_IDS.length} → ${path.relative(ROOT, OUT_DIR)}/`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
