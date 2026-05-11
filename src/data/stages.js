// 스테이지(사건) 메타 — TRD §2.1 data/stages.js
// hit zone 좌표는 M2 일러스트 제작 후 확정 (현재 placeholder)
export const STAGES = {
  'parking-lot': {
    id:          'parking-lot',
    name:        '🅿️ 주차장 사건',
    description: '주차장에 숨겨진 한자를 찾아라!',
    illustrationSrc: 'src/assets/stages/parking-lot.svg',
    viewBox:     '0 0 1600 900',
    hanjaIds:    ['車'],

    // 클릭 가능 객체 — polygon 좌표는 SVG viewBox(1600×900) 기준 (M2 확정)
    clickableObjects: [
      {
        id:      'sign-juchajang',
        wordId:  'parking-lot-sign',
        label:   '주차장 표지판',
        polygon: [[1245, 350], [1530, 350], [1530, 740], [1370, 740], [1370, 520], [1245, 520]],
      },
      {
        id:      'car-body-1',
        wordId:  'car-word',
        label:   '빨간 자동차',
        polygon: [[180, 670], [510, 670], [510, 870], [180, 870]],
      },
      {
        id:      'car-body-2',
        wordId:  'car-word',
        label:   '파란 자동차',
        polygon: [[840, 715], [1090, 715], [1090, 860], [840, 860]],
      },
    ],

    words: {
      'parking-lot-sign': {
        text:              '주차장',
        syllables:         ['주', '차', '장'],
        targetSyllableIdx: 1,
        targetHanjaId:    '車',
      },
      'car-word': {
        text:              '자동차',
        syllables:         ['자', '동', '차'],
        targetSyllableIdx: 2,
        targetHanjaId:    '車',
      },
    },
  },
};

export const STAGE_IDS = Object.keys(STAGES);
