# 🗂️ PLAN — 형태소 탐정 게임

> 개발 계획 및 진행 상태
> Last updated: 2026-05-12
> Status: **M3 돋보기·단어 분리·하이라이트·TTS 완료 (실기기 검증만 P1)**

## 📌 현재 상태

본 게임은 부모 `AGENTS.md`(2026-04-25)의 7단계 로드맵 중 **4단계(형태소 인식)** 에 해당. M3 완료 시점 기준 데이터 코어 + 시작 화면 + 주차장 SVG 일러스트(자체 제작) + hit zone 3개(주차장 표지판·빨간 자동차·파란 자동차) 발광 펄스 + 탭 → 단어 음절 분리 + 핵심 한자 음절 하이라이트 + Web Speech TTS("차, 수레 차") + 돋보기 자석 흡착 + spring-back 시각 거절 동작. 검증 스크립트(`npm run validate`) 오류 0 / 경고 0 유지, 신규 7개 JS 모듈 syntax-check 통과.

선행: `3_word_network` (구현 완료) — 일상 어휘 자동 읽기 졸업 가정
후행: `5_vocabulary_tree` (설계 단계) — 발견 한자를 어휘 가지로 확장

## 🧭 마일스톤 개요

| 마일스톤 | 핵심 산출 | 종료 기준 (Definition of Done) |
|---|---|---|
| M0 | 문서 합의 | PRD/TRD/PLAN 리뷰 완료, P0급 오픈 이슈 해소 |
| M1 | 데이터 코어 | 한자 8자 메타·morph path·어휘 매핑·1개 스테이지 데이터 |
| M2 | 일러스트 + Hit Zone | 1개 사건 SVG + 클릭 가능 객체 좌표·발광 힌트 동작 ✅ |
| M3 | 돋보기 + 단어 분리 | 객체 탭 → 단어 → 음절 분리 + 핵심 음절 하이라이트 + TTS ✅ (실기기 P1) |
| M4 | 상형문자 변형 | 실루엣 → 갑골문 → 해서체 SVG morph 부드러운 1.5 ~ 2.5초 |
| M5 | 어휘 카드 + TTS | 한자 공유 어휘 4 ~ 5개 카드 + 음·뜻 + 어휘 발음 |
| M6 | MVP 게임 루프 | F1 ~ F12 완성, 1개 사건 완주 + 미션 카드 출력 |
| M7 | 다중 사건 + 확장 | 사건 4개+, F13 ~ F19 확장 기능 |
| M8 | 모바일 QA + 출시 | 실기기 매트릭스 통과, PWA 배포 |
| M9 | v2+ 로드맵 | SRL, 부모 대시보드, 발음 평가, 5단계 연동 |

## 🚧 M0 — 문서 합의 (현재)

- [x] PRD.md 작성 (제품 요구사항, 시나리오, P0/P1/P2)
- [x] TRD.md 작성 (스택, SVG morph, 모바일 정책, 테스트 전략)
- [x] PLAN.md 작성 (본 문서)
- [ ] 부모/교사 1차 리뷰 (시나리오 S1 ~ S4 현실성 검증)
- [x] MVP 디폴트 사건 결정 → **주차장** (2026-05-10)
- [x] 일러스트 자산 확보 전략 결정 → **자체 SVG 제작** (2026-05-10)
- [x] 한자 path 데이터 출처 결정 → **Make Me a Hanzi (GPL)** (2026-05-10)
- [x] 한자 폰트 서브셋 자동화 도구 결정 → **pyftsubset (fonttools)** (2026-05-10)
- [ ] 초1 ~ 초2 사용성 테스트 대상 1차 확보 계획

## 🧱 M1 — 데이터 코어 (완료 · 2026-05-10)

### P0 (필수)
- [x] **디렉터리 골격 생성** — TRD §2.1 구조
  - `src/{css,js,data,assets/{stages,hanja,fonts,icons}}` + `scripts/` + `.omc/{autopilot,plans}`
- [x] **`src/data/hanja.js`** — 한자 메타 8자
  - 車 / 水 / 火 / 木 / 山 / 日 / 月 / 人
  - 각 항목: `id` · `reading` · `meaning` · `grade` · `morphPathsRef` · `vocab[]`
- [x] **`src/data/vocab.js`** — 어휘 → 한자 매핑 (총 36개)
  - 형식: `{ hanja: [HanjaId], syllableMap: { 음절인덱스: HanjaId } }`
  - 예: `'주차장': { hanja: ['車'], syllableMap: { 1: '車' } }`
- [x] **`src/data/stages.js`** — 사건 메타 1개 (`parking-lot`)
  - `clickableObjects` 2개 (주차장 표지판, 자동차) — polygon 좌표는 M2 일러스트 제작 후 확정
  - `words` 2개 (`parking-lot-sign`, `car-word`) — 각 `targetSyllableIdx` + `targetHanjaId`
- [x] **車 morph path 추출** — `src/assets/hanja/車.json`
  - 3-step: 수레바퀴 실루엣 → 갑골문(甲骨文) → 해서체(楷書)
  - 각 path 명령어 수 일치 (M + 9L + Z = 11) — 보간 호환
  - ⚠️ **placeholder** — Make Me a Hanzi(GPL) 실 데이터로 교체 예정
- [x] **시작 화면 F1·F2** — PRD §10 디자인 공통 규격 준수
  - `index.html` — 6개 화면 섹션 골격 (start / stage-select / play / settings / mission / end)
  - `src/js/main.js` — `showScreen()` 내비게이션 + 4개 버튼 핸들러
  - `src/js/config.js` — 상수 (SCREENS, MAGNET_PX, HIT_MIN_DP, MORPH_DURATION)
  - `src/js/state.js` — 전역 상태 싱글톤 (settings/stage/detection/progress)
  - CSS 7종: `tokens` · `base` · `screens` · `stage` · `magnifier` · `word-blocks` · `morph`
  - Jua/Gowun Dodum, coral `≥64dp` 버튼, cream 배경 + radial-gradient 3개
  - `@media (orientation: portrait)` 분기로 가로/세로 모두 대응
- [x] **검증 스크립트** — `scripts/validate-data.js`
  - hanja 8자 필수 필드 검사 (reading/meaning/grade/morphPathsRef)
  - 車.json morphPaths 3개 + 명령어 수 일치 검사
  - vocab `syllableMap` 인덱스 범위 + HANJA 참조 정합성
  - stages `targetHanjaId` ↔ HANJA, `text` ↔ VOCAB 교차 검증
  - `npm run validate` → ✅ 오류 0개 / 경고 0개

### P1 (M2~M4 진입 전)
- [ ] morph path 나머지 7자 (水/火/木/山/日/月/人) — Make Me a Hanzi 추출
- [ ] 한자 폰트 서브셋 (Noto Sans CJK 100자) — `pyftsubset`, woff2 < 200KB

### 종료 기준 (Definition of Done) — 충족
- [x] `data/hanja.js` import → `'車'` 객체에서 음/뜻/morphPathsRef/vocab 접근 가능
- [x] `npm run validate` 정합성 검증 통과 (오류 0)
- [x] `npx serve -p 3004` HTTP 200 + 시작 화면 13개 핵심 요소 렌더링
- [x] code-reviewer CRITICAL 이슈 0건 (인라인 onclick → event listener 패턴 수정 완료)

## 🎨 M2 — 일러스트 + Hit Zone (완료 · 2026-05-12)

### P0 (필수)
- [x] **주차장 SVG 일러스트 자체 제작** — `src/assets/stages/parking-lot.svg`
  - viewBox `0 0 1600 900` (16:9, preserveAspectRatio meet)
  - 구성: 하늘 그래디언트 + 해/구름 + 원경 건물(창문) + 나무 + 아스팔트 + 주차선(원근) + 표지판 + 자동차 2대
- [x] **`src/js/stage.js`** — 일러스트 로드 + hit zone overlay 동적 삽입
  - `fetch(illustrationSrc)` → `innerHTML` 주입 → `<svg>` 추출 → `<g id="hit-zone-overlay">` 추가
  - `unloadStage()` 로 안전 해제 (pulse timer · listener 정리)
- [x] **hit zone 좌표 데이터** — `src/data/stages.js`
  - 3개: `sign-juchajang` (주차장 표지판 · 기둥 포함 L자형 polygon)
  - `car-body-1` (빨간 자동차 전경 · 사각형)
  - `car-body-2` (파란 자동차 배경 · 사각형)
  - 좌표 모두 viewBox(1600×900) 기준, 폴리곤 영역 ≥ 80×80dp 환산
- [x] **발광 힌트 펄스** (PRD F5)
  - `.hit-zone.pulse { animation: hitPulse 1.2s ease-in-out infinite }`
  - SVG polygon `fill`/`stroke` 보간 (rgba 황색)
  - 5초 후 `setTimeout(stopPulse)` 자동 중단
  - 첫 클릭 시 즉시 중단 (인지 학습 후 종료)
- [x] **빈 영역 탭 무반응** — `e.target.closest('.hit-zone')` 가드
- [x] **`src/js/utils.js`** — `clamp` · `dist` · `dprPx` · `clientToViewBox` · `throttle`
- [x] **`src/js/pointer.js`** — Pointer Events 통합 attach/release (M3 확장 기반)
- [x] **`src/js/viewport.js`** — 줌/팬 스켈레톤 (P1, M7 활성화 예정)
- [x] **`main.js` 통합** — 시작 → 주차장 자동 로드 → 플레이 화면 + 홈 복귀 버튼
- [x] **`stage.css` 갱신** — SVG polygon 기반 `.hit-zone` 스타일 (focus/hover/pulse)
- [x] **`npm run dev`** 추가 (개발 서버 별칭)

### P1 (M3 진입 전)
- [ ] hit zone 80×80dp 실기기 검증 — iPad Mini / 갤럭시 탭 A8

### 종료 기준 (Definition of Done) — 충족
- [x] 1개 일러스트 위에 클릭 가능 객체 3개 발광 (3~5 범위 충족)
- [x] 객체 탭 시 콘솔 `[stage] hit objectId="…" wordId="…" label="…"` 출력
- [x] 빈 영역 탭 무반응 (closest 가드)
- [x] `npm run validate` 통과 (한자 8 / 어휘 36 / 스테이지 1)
- [x] 핵심 자산 6종 HTTP 200 + SVG viewBox·visual 그룹 5종 확인

## 🔍 M3 — 돋보기 + 단어 분리 (완료 · 2026-05-12)

### P0 (필수)
- [x] **`src/js/pointer.js`** — 통합 Pointer Events 강화
  - `down/move/up/cancel` + `setPointerCapture` + 자동 `releasePointerCapture`
  - `WeakMap<el, Set<pointerId>>` 기반 active pointer 추적
  - `releaseAll(el)` 구현 — 화면 전환 시 일괄 release (TRD §2.4)
- [x] **`src/js/hangul.js`** — 음절 분해 (TRD §3.1, 2단계와 동일)
  - `decompose(syllable)` → `{cho,jung,jong}` (0xAC00 기반)
  - `splitWord('주차장')` → `['주','차','장']`
  - `isHangulSyllable(ch)` 가드
- [x] **`src/js/tts.js`** — Web Speech API 래퍼 (TRD §3.6)
  - `unlock()` — 첫 사용자 제스처(`btn-start`)에서 빈 utterance 호출 → iOS Safari 활성화
  - `speakHanja({reading,meaning})` → "차, 수레 차" 패턴
  - `cancel()` — 화면 전환·언로드 시 정리
- [x] **`src/js/word-block.js`** — 단어 → 음절 분리 컴포넌트 (TRD §5.2 / PRD F7·F8)
  - `<span class="syllable">` 동적 렌더, `data-target="1"` 표시
  - `requestAnimationFrame` 후 `.spread` 클래스 → 음절 간격 트랜지션
  - 220ms 뒤 핵심 음절 `.hl` 추가 → 분리·하이라이트 단계감
  - `clearWord()` 로 안전 해제
- [x] **`src/js/magnifier.js`** — 돋보기 + 자석 흡착 (TRD §3.3 / PRD F6)
  - `attachMagnifier(stage)` — body 직속 `.magnifier` div, `pointer-events: none`
  - `pointermove` → 가장 가까운 `.hit-zone` 중심 거리 계산
  - `dist ≤ MAGNET_PX(=40 * devicePixelRatio)` 이면 `.snapped` + 중심으로 스냅
  - `detachMagnifier()` — 화면 전환 시 cleanup
- [x] **`stage.js` 확장** — hit → 단어 분리 + TTS 통합
  - `onHit` → `showWord({...})` + 260ms 뒤 `speakHanja` (하이라이트 트랜지션 직후)
  - 빈 영역 탭 → `springBackFlash` SVG 펄스 (PRD F4 부드러운 거절)
  - `unloadStage` → `cancelTts()` + `clearWord()` 정리 보강
- [x] **`main.js` 통합** — TTS unlock + magnifier 라이프사이클
  - `btn-start` click 안에서 `unlockTts()` 호출 (iOS 자동재생 정책)
  - `play` 진입 → `attachMagnifier(stage-canvas)`
  - `showScreen` → `releaseAll` + `detachMagnifier` + `cancelTts` 일괄 부작용
- [x] **CSS 마감**
  - `stage.css`: `.spring-back` 빈 영역 탭 시각 거절 펄스 (360ms)
  - `word-blocks.css`: spread/hl 트랜지션 (기존 스켈레톤 활용)
  - `magnifier.css`: snapped 시 coral 글로우 (기존 스켈레톤 활용)

### P1 (M4 진입 전)
- [ ] **실기기 1차 점검** — iPad / 갤럭시 탭 — 자석 흡착 거리·TTS 한국어 보이스 가용성
- [ ] 한국어 음성 미설치 환경 폴백 (시각 자막 + 효과음만) — Web Audio audio.js 도입 시
- [ ] 보급형 안드로이드 입력 지연 ≤ 16ms 확인 (Performance 패널)

### 종료 기준 (Definition of Done) — 데스크톱·정적 검증 통과
- [x] 객체 탭 → 1초 이내 단어 음절 분리 + 핵심 음절 하이라이트
- [x] `speakHanja` 호출 → "차, 수레 차" TTS (브라우저 한국어 보이스 존재 시)
- [x] 빈 영역 탭 → spring-back 펄스 표시 + 다른 부작용 없음
- [x] 돋보기 `.snapped` 토글 — hit zone 화면 좌표 기준 ≤ 40dp 시 스냅
- [x] 화면 전환 → pointer capture release + TTS cancel + magnifier hide
- [x] `npm run validate` 통과 (오류 0 / 경고 0) — 데이터 회귀 없음
- [x] 모든 신규/수정 모듈 `node --check` syntax OK
- [ ] iPad / 갤럭시 탭 영상 검증 (P1)

## 🐢→🐉 M4 — 상형문자 변형 애니메이션

| # | 작업 | 비고 |
|---|---|---|
| 1 | `morph.js` — path 토큰 정규화 + 좌표 lerp | 단계 1: 기본 보간 |
| 2 | requestAnimationFrame 루프 + duration 제어 | 1.5 ~ 2.5s, easing |
| 3 | 단순 cross-fade 폴백 | 저사양 디바이스 / 토큰 수 미스매치 시 |
| 4 | 저사양 감지 (`deviceMemory`, `hardwareConcurrency`) | 폴백 자동 전환 |
| 5 | transform-origin = viewBox 중앙 고정 | 회전·스케일 안정성 |
| 6 | 한자 8자 모두 동작 검증 | M1.6과 동기화 |
| 7 | 보급형 안드로이드 30fps+ 측정 | Performance 패널 |
| 8 | (선택) `flubber` 라이브러리 평가 | 자체 구현이 부족할 시 P1로 |

종료 기준: 車/水/火 3자 morph 부드럽게 동작 + 보급형 안드로이드 30fps+ + 폴백 동작 영상 검증.

## 🃏 M5 — 어휘 카드 + TTS

| # | 작업 | 비고 |
|---|---|---|
| 1 | `card-deck.js` — 부채꼴 등장 애니메이션 | rotate + translate transition |
| 2 | 카드 탭 → 어휘 발음 (Web Speech) | TTS rate 0.95, ko-KR |
| 3 | 음·뜻 자동 발음 (한자 변형 직후) | "차, 수레 차" |
| 4 | 한국어 음성 미설치 폴백 | 시각 자막 + 효과음만 |
| 5 | `audio.js` — 발견음/변형음/보상음 | Web Audio 사전 디코딩 |
| 6 | 카드 등장 순서 = 친숙도 순 | vocab 데이터 우선순위 필드 |

종료 기준: 한자 발견 직후 카드 4개가 부드럽게 펼쳐지고, 각 카드 탭 시 발음. iOS Safari TTS unlock 검증.

## 🎮 M6 — MVP 게임 루프 (F1 ~ F12)

| # | 기능 | 의존 마일스톤 |
|---|---|---|
| 1 | 시작 화면 (F1, F2) — 가로/세로 모두 지원, 회전 안내 없음 | — |
| 2 | 사건 카드 선택 화면 (F3) | M2 |
| 3 | 일러스트 + 클릭 객체 + 발광 힌트 (F4, F5) | M2 |
| 4 | 돋보기 자석 (F6) | M3 |
| 5 | 단어 → 음절 분리 + 한자 음절 하이라이트 (F7, F8) | M3 |
| 6 | 상형문자 변형 (F9) | M4 |
| 7 | 어휘 카드 덱 (F10) | M5 |
| 8 | 진행률 + 별 스티커 (F11) | — |
| 9 | 종료 화면 + 미션 카드 (F12) | `mission.js` |
| 10 | `game.js` — 라운드 컨트롤러 통합 | 모든 위 |
| 11 | 사건 1개 = 한자 1 ~ 2개 발견 시나리오 | — |

종료 기준: 1개 사건(주차장 권장)에서 학습자가 한자 1개를 발견하고 어휘 카드까지 탐색 + 미션 카드 출력 완주 가능. 초1 사용자 시범에서 부모 개입 ≤ 1회.

## 🌐 M7 — 다중 사건 + 확장 기능

| # | 작업 | 우선 |
|---|---|---|
| 1 | 사건 4개 (학교 급식실, 주차장, 소방서, 약수터) | High |
| 2 | F13 줌/팬 모드 (폰 우선) | High |
| 3 | F14 도감(컬렉션) 화면 | High |
| 4 | F15 한자 풀 필터 (교사·부모 설정) | Med |
| 5 | F16 진척도 영속화 (`4md:` localStorage) | High |
| 6 | F17 음·뜻 자동 TTS 정책 정리 | High |
| 7 | F18 부분 힌트 (펄스 강화) | Med |
| 8 | F19 다크 모드 + 폰트 크기 | Low |
| 9 | 한자 8자 모두 적어도 1 사건에서 발견 가능 | High |

종료 기준: 사건 4종 모두에서 한자 발견 → 컬렉션 누적 → 다음 세션에 별·컬렉션 유지. 모든 확장 토글이 MVP 흐름을 깨지 않음.

## 🧪 M8 — 모바일 QA + 출시

### 디바이스 매트릭스 (TRD §8 동기화)
- [ ] iPad Mini (iOS 15+)
- [ ] iPad Pro 12.9"
- [ ] 갤럭시 탭 A8 (Android 12+)
- [ ] iPhone SE (가로/세로 + 줌/팬)
- [ ] 보급형 안드로이드 (2GB RAM)

### 인지·정책 검증
- [ ] **게임 내 한자 쓰기 입력 부재** 확인 (정책)
- [ ] 학습자가 **이미 아는 단어**에서만 한자 노출 확인 (정책)
- [ ] "한자가 어렵다" 부정 반응 < 10% (사용자 시범 5 ~ 10명)
- [ ] 미션 카드 발급 → 일주일 후 학부모 인터뷰: 일상 한자 발견 행동 30%+

### 출시 체크리스트
- [ ] PWA 매니페스트 (icons 192/512, theme color, orientation: any — 가로/세로 모두 허용)
- [ ] Service Worker 캐시 — `app-shell` + `stages` + `hanja-paths` + `fonts` 분리
- [ ] Lighthouse 모바일 PWA 스코어 ≥ 90
- [ ] 첫 로드 < 3초 (3G 시뮬레이션), 첫 사건 진입 < 5초
- [ ] 한자 폰트 서브셋 < 200KB
- [ ] 사용자 시범 (만 7·8세 각 2 ~ 3명) 1개 사건 완주 가능 확인

## 🔭 M9 — v2+ 로드맵 (아이디어)

### P2
- [ ] **IndexedDB SRL**: 발견 한자별 재노출 스케줄 (에빙하우스 곡선)
- [ ] **5단계 연동**: 발견 한자 → `5_vocabulary_tree` 학습 큐 자동 전달 (`4md:collected` → `5vt:queue`)
- [ ] **부모 대시보드(웹)**: 발견 한자, 취약 한자, 세션 시간 시각화
- [ ] **발음 평가**: Web Speech API + Levenshtein 거리 → 어휘 카드 따라 읽기 채점
- [ ] **다크 모드 + 폰트 크기 조절**: 접근성 강화
- [ ] **사용자 기여 어휘**: 부모/교사가 추가 어휘 등록(JSON import)

### P3 (실험)
- [ ] **8 ~ 7급 한자 100자 풀**: AGENTS.md 권장 범위 전체
- [ ] **상형 추리 모드**: 한자 → 실루엣 역방향 추리(보상 연계)
- [ ] **클래스룸 모드**: 교사 PC에서 학생 태블릿 진척도 LAN 미러링
- [ ] **사건 자동 생성기**: 학습자 어휘 풀 기반 일러스트 추천
- [ ] **음·뜻 사전 녹음 음성**: TTS 품질 부족 디바이스 폴백

## 🔄 기술 부채 / 개선점 (예상)

| 항목 | 우선순위 | 메모 |
|---|---|---|
| TypeScript 마이그레이션 | Medium | state·hanja 데이터 타입 안정성 |
| Vitest 단위 테스트 | Medium | morph path 정합성 우선 |
| Playwright 모바일 E2E | Low | 실기기 검증 보조용 |
| Vite 빌드 도구 | Medium | 한자 폰트 서브셋·SW precache 자동화 시 |
| `flubber` 라이브러리 도입 | Medium | 자체 morph 보간 부족 시 |
| 한자 path 데이터 통합 도구 | High | Make Me a Hanzi 라이선스 검토 + 변환 파이프라인 |
| i18n | Low | 한국어 학습 외국인 영어 UI |
| Canvas 렌더 | 매우 낮음 | SVG morph 30fps 미달 시에만 |

## 🎯 브랜치 전략 (제안)

```
main                 # 배포 안정 버전 (M8 이후)
├── dev              # 통합 개발 브랜치
    ├── feat/m1-data-core
    ├── feat/m2-stage-hitzone
    ├── feat/m3-magnifier
    ├── feat/m4-svg-morph
    ├── feat/m5-card-deck
    ├── feat/m6-mvp-loop
    ├── feat/m7-stages-extensions
    └── feat/m8-pwa-release
```

커밋 컨벤션: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `perf:`, `a11y:`, `data:`(한자/어휘 데이터 변경)

## 📝 릴리즈 노트 (예정)

### v0.1.0 — M6 MVP (예정)
- 사건 1개(주차장) 완주 가능
- 한자 1 ~ 2자 발견 + 어휘 카드 + 미션 카드
- iPad / 갤럭시 탭 가로/세로 모드 동작
- SVG morph + Web Speech TTS

### v0.5.0 — M7
- 사건 4개 + 한자 8자 모두 발견 가능
- 컬렉션·필터·진척도 영속화
- 줌/팬 모드 (폰)

### v1.0.0 — M8
- PWA 정식 배포
- 실기기 매트릭스 통과
- 한자 폰트 서브셋 < 200KB

## 📚 참고 문서

- 부모 `../AGENTS.md` — 7단계 로드맵, 모바일 정책, 포트 컨벤션
- 본 디렉토리 `../AGENTS.md` — 게임 메커닉 1차 출처 (한자 풀, 인지 목표)
- `docs/PRD.md` — 제품 요구사항
- `docs/TRD.md` — 기술 설계, SVG morph 알고리즘, 수동 테스트 체크리스트
- 인접: `../../2_syllable_assembly/docs/`, `../../5_vocabulary_tree/AGENTS.md` — 데이터/패턴 호환
- 이론: 보고서 §"제3단계: 형태소 탐정 게임" — 양뇌 활성화, 만 6세 전후 형태소 인식 임계점

---

## 디자인 일관성 체크리스트 (홈·설정·완료 화면)

시작·설정·완료 화면 구현 전·후 아래 항목을 확인한다 (기준: `1_chosung_quiz`).

- [ ] 제목에 `font-family: 'Jua', sans-serif` 적용
- [ ] 설명·본문에 `font-family: 'Gowun Dodum', sans-serif` 적용
- [ ] `tokens.css` CSS 변수 팔레트 — 1단계 기준 색상·배경·간격 동일 적용
- [ ] 큰 라운드 버튼 스타일 (`1_chosung_quiz/src/css/components.css` 참조)
- [ ] 배경 색상 `--color-bg` 동일 사용
- [ ] 미션 완료 화면(mission-screen)에도 동일 폰트·색상·버튼 스타일 적용
- [ ] 1단계 홈·설정·완료 화면과 나란히 놓고 시각적 통일감 육안 확인
