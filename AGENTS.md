<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-25 | Updated: 2026-04-25 -->

# 4_morpheme_detective — 형태소 탐정 게임

## Purpose
이미 익숙하게 사용하던 한국어 단어 속에 한자(뜻글자)가 형태소로 숨어 있다는 사실을 시각적·서사적으로 깨닫게 하는 게임. 한자를 강제로 암기시키는 대신, 이미지 처리 우뇌와 논리 처리 좌뇌를 동시에 자극하여 형태소적 인식(morphological awareness)을 자연스럽게 형성한다.

## Target & Cognitive Goal

| 항목 | 내용 |
|------|------|
| 대상 연령 | 초등 1 ~ 2학년 |
| 발달 단계 | 형태소 인식 (Morphological Awareness) 진입 |
| 핵심 인지 목표 | 단어의 분해 가능성 인지, 음운(소리) ↔ 형태소(뜻) 통합 |
| 선행 게임 | `../3_word_network/` — 일상 어휘 자동 읽기 |
| 후행 게임 | `../5_vocabulary_tree/` — 형태소 1개 → 다수 어휘 파생 |

## Game Mechanics

### 핵심 루프
1. 친숙한 일상 공간 일러스트 제시 (예: 학교 급식실, 지하 주차장, 소방서)
2. 학습자가 '탐정 돋보기' 도구를 들고 화면을 탐색
3. 단어가 적힌 객체(표지판, 간판) 클릭 시 단어가 음절 블록으로 분리
4. 시스템이 핵심 한자를 하이라이트 (예: '주차장' → '차' 강조)
5. **상형문자 변형 애니메이션**: 객체의 실루엣(예: 수레바퀴)이 한자(車)로 점진적 변형
6. 같은 한자를 공유하는 친숙한 어휘 3 ~ 5개 동시 제시 (자동차, 기차, 자전거)

### 추천 한자 풀 (초등 8급 ~ 7급 기준)
| 한자 | 음·뜻 | 어휘 예시 | 시각적 변형 소스 |
|------|-------|----------|-----------------|
| 車 | 차 / 수레 | 자동차, 기차, 자전거, 마차 | 수레바퀴 |
| 水 | 수 / 물 | 생수, 수영, 약수, 정수기 | 흐르는 물결 |
| 火 | 화 / 불 | 화재, 화산, 점화, 소방차 | 불꽃 |
| 木 | 목 / 나무 | 목재, 식목일, 목공, 산림 | 가지 달린 나무 |
| 山 | 산 / 산 | 등산, 화산, 산맥, 산소 | 세 봉우리 |
| 日 | 일 / 해·날 | 일출, 일기, 매일, 일요일 | 떠오르는 해 |
| 月 | 월 / 달 | 월요일, 매월, 보름달, 정월 | 초승달 |
| 人 | 인 / 사람 | 인간, 노인, 미인, 한국인 | 서 있는 사람 |

### 부모-자녀 연계 활동
게임 종료 화면에서 "오늘은 'ㅇㅇ' 한자를 발견했어요. 집에 가는 길에 함께 찾아보세요"라는 미션 카드 발급 — 일상 환경으로 학습 전이.

## Mobile-First Considerations

| 항목 | 권장 사양 |
|------|----------|
| 화면 모드 | **가로(Landscape) 우선** — 일러스트의 풍경감 살리기 |
| 권장 디바이스 | 태블릿(8인치+) 권장, 폰은 7"+ 패블릿급 |
| 클릭 가능 객체 | 일러스트 내 최소 **80×80dp** 영역 |

### 모바일에서의 핵심 도전
원본 설계의 "돋보기 탐색"은 좁은 폰 화면에서 hit zone 식별이 어려워짐. 다음과 같이 보완:
- **객체 발광 힌트**: 처음 5초간 클릭 가능 객체가 부드럽게 펄스(opacity 0.6 ↔ 1.0)
- **돋보기 자석**: 손가락 근처 hit zone에 돋보기가 자성처럼 끌림
- **줌 모드**: 폰의 경우 일러스트를 **2x 줌 + 팬(드래그)** 으로 탐색

### 상형문자 변형 애니메이션 — 모바일 성능
- **CSS transform / opacity 전환**으로 GPU 가속 (transform-origin 주의)
- 단계별 PNG 시퀀스보다 **SVG path morph** 우선 — 해상도 자유, 파일 작음
- 저사양 디바이스 감지 시 (`navigator.deviceMemory < 2`) 단순 페이드 폴백

### 한자 폰트 로드
- `font-display: swap` — 한자 폰트(2 ~ 3MB) 로드 동안 시스템 폰트 표시
- 사용 한자만 서브셋 폰트로 추출 (전체 CJK 폰트 임베드 금지)

## For AI Agents

### Working In This Directory
- 미구현 설계 단계
- 권장 스택: Vanilla JS + CSS + SVG 애니메이션 (한자 변형 핵심), 포트 **3004**
- 한자 폰트는 시스템 기본 또는 무료 라이선스 (예: `Noto Sans CJK`) — 서브셋 권장

### Implementation Priorities
1. **상형문자 변형 애니메이션** — SVG morph 또는 단계별 PNG 시퀀스. 객체 → 갑골문 → 해서체 한자
2. **한자-어휘 매핑 데이터** — 한 한자당 친숙한 어휘 4 ~ 8개
3. **돋보기 인터랙션** — 마우스/터치 위치 추적 + 클릭 가능 객체 시각화
4. **일러스트 자산** — 일상 공간 SVG/PNG (각 스테이지별 1 ~ 2개)
5. **줌/팬 컨트롤** — 핀치-투-줌 (`gesturechange` + 자체 핸들러)

### Key Behaviors to Preserve
- **한자 자체의 암기를 강요하지 않음** — 게임 내 한자 쓰기 입력 절대 금지
- 학습자가 **이미 아는 단어**에서 시작 — 새 단어로 한자 노출하지 않음
- 한자의 음·뜻은 부드러운 TTS로 함께 제공 (시각만으로 부족)

### Testing Requirements
- 한자에 대한 거부감 없이 게임 플레이가 자연스러운지 사용자 테스트
- SVG 변형 애니메이션이 모바일에서 부드럽게 재생되는지 검증 (보급형 안드로이드 30fps+ 목표)
- 폰(5.5") / 태블릿(10") 양쪽에서 객체 식별성 검증

## Dependencies (Planned)

### External
- SVG 애니메이션 (anime.js 류 라이브러리, 또는 순수 SMIL/CSS)
- 한자 폰트 (Noto Sans CJK Korean — 서브셋 임베드)

### Data
- 한자-형태소 매핑 DB (8급 ~ 7급, 약 100자 정도)
- 일상 공간 일러스트 자산

## Design Consistency (홈·설정·완료 화면)

시작 화면(`start-screen`), 설정 화면(`settings-screen`), 미션 완료 화면(`mission-screen`)은 `1_chosung_quiz`의 디자인 시스템을 계승한다.

| 요소 | 규격 |
|------|------|
| 시작·완료 화면 제목 | `font-family: 'Jua', sans-serif` |
| 시작 화면 제목 크기 | `font-size: 3rem; letter-spacing: 2px; color: var(--coral)` |
| 설정 화면 제목 크기 | `font-size: 1.8rem; color: var(--coral)` |
| 완료 화면 제목 크기 | `font-size: 2.1rem; color: var(--coral)` |
| 설명·본문 | `font-family: 'Gowun Dodum', sans-serif; font-size: clamp(0.9rem, 3vw, 1.2rem)` |
| 버튼 기본 (`.btn`) | `font-family: 'Jua', sans-serif; font-size: 1.2rem; padding: 14px 28px; border-radius: 100px` |
| 버튼 대형 (`.btn.big`) | `font-size: 1.45rem; padding: 16px 44px; border-radius: 100px` |
| 버튼 소형 (`.btn.small`) | `font-size: 1rem; padding: 10px 20px; border-radius: 100px` |
| 버튼 색상 | `background: var(--coral); color: #fff; box-shadow: 0 5px 0 var(--coral-dark)` |
| 버튼 눌림 | `transform: translateY(4px); box-shadow: 0 1px 0 var(--coral-dark)` |
| 배경 | `background: var(--cream)` (`#FFF6E4`) |
| 색상 변수 | `1_chosung_quiz/src/css/tokens.css` 팔레트 동일 적용 |

> 플레이 화면(가로 일러스트·돋보기 인터랙션)은 이 게임 특유의 방식을 사용.  
> 상세 스펙: `docs/TRD.md §11` 및 `docs/PLAN.md` 디자인 일관성 체크리스트 참조.

## Theoretical Reference
- 보고서 §"제3단계: 형태소 탐정 게임" 참조
- 우뇌 이미지 처리 + 좌뇌 논리 처리의 양뇌 활성화 (만 6세 전후가 적기)
- 표준국어대사전 어휘의 70%+가 한자어 — 형태소 인식이 학습 어휘 폭발의 키

<!-- MANUAL: -->
