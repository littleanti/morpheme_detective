// 스테이지(사건) 메타 — TRD §2.1 data/stages.js
export const STAGES = {
  'parking-lot': {
    id:          'parking-lot',
    name:        '🅿️ 주차장 사건',
    description: '주차장에 숨겨진 한자를 찾아라!',
    illustrationSrc: 'src/assets/stages/parking-lot.svg',
    viewBox:     '0 0 1600 900',
    hanjaIds:    ['車'],

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

  'school-cafeteria': {
    id:          'school-cafeteria',
    name:        '🍽 학교 급식실',
    description: '급식실에 숨겨진 한자를 찾아라!',
    illustrationSrc: 'src/assets/stages/school-cafeteria.svg',
    viewBox:     '0 0 1600 900',
    hanjaIds:    ['木', '人', '水'],

    clickableObjects: [
      {
        id:      'cafeteria-tree',
        wordId:  'cafeteria-day',
        label:   '나무 탁자',
        polygon: [[50, 400], [350, 400], [350, 750], [50, 750]],
      },
      {
        id:      'cafeteria-student',
        wordId:  'cafeteria-person',
        label:   '학생',
        polygon: [[600, 300], [900, 300], [900, 750], [600, 750]],
      },
      {
        id:      'cafeteria-sink',
        wordId:  'cafeteria-water',
        label:   '수도꼭지',
        polygon: [[1100, 350], [1400, 350], [1400, 700], [1100, 700]],
      },
    ],

    words: {
      'cafeteria-day':    { text: '목요일', syllables: ['목','요','일'], targetSyllableIdx: 0, targetHanjaId: '木' },
      'cafeteria-person': { text: '인기',   syllables: ['인','기'],     targetSyllableIdx: 0, targetHanjaId: '人' },
      'cafeteria-water':  { text: '수영',   syllables: ['수','영'],     targetSyllableIdx: 0, targetHanjaId: '水' },
    },
  },

  'fire-station': {
    id:          'fire-station',
    name:        '🚒 소방서 사건',
    description: '소방서에 숨겨진 한자를 찾아라!',
    illustrationSrc: 'src/assets/stages/fire-station.svg',
    viewBox:     '0 0 1600 900',
    hanjaIds:    ['火', '水'],

    clickableObjects: [
      {
        id:      'station-flame',
        wordId:  'station-fire',
        label:   '불꽃',
        polygon: [[200, 300], [600, 300], [600, 750], [200, 750]],
      },
      {
        id:      'station-extinguisher',
        wordId:  'station-extinguisher',
        label:   '소화기',
        polygon: [[750, 350], [1050, 350], [1050, 800], [750, 800]],
      },
      {
        id:      'station-hose',
        wordId:  'station-water',
        label:   '소방 호스',
        polygon: [[1150, 400], [1500, 400], [1500, 780], [1150, 780]],
      },
    ],

    words: {
      'station-fire':         { text: '화재',   syllables: ['화','재'],       targetSyllableIdx: 0, targetHanjaId: '火' },
      'station-extinguisher': { text: '소화기', syllables: ['소','화','기'],   targetSyllableIdx: 1, targetHanjaId: '火' },
      'station-water':        { text: '생수',   syllables: ['생','수'],        targetSyllableIdx: 1, targetHanjaId: '水' },
    },
  },

  'water-spring': {
    id:          'water-spring',
    name:        '💧 약수터 사건',
    description: '약수터에 숨겨진 한자를 찾아라!',
    illustrationSrc: 'src/assets/stages/water-spring.svg',
    viewBox:     '0 0 1600 900',
    hanjaIds:    ['水', '山', '日', '月'],

    clickableObjects: [
      {
        id:      'spring-tap',
        wordId:  'spring-water',
        label:   '약수 수도꼭지',
        polygon: [[650, 450], [950, 450], [950, 800], [650, 800]],
      },
      {
        id:      'spring-peak',
        wordId:  'spring-mountain',
        label:   '산봉우리',
        polygon: [[100, 200], [600, 200], [600, 600], [100, 600]],
      },
      {
        id:      'spring-sunrise',
        wordId:  'spring-sun',
        label:   '해',
        polygon: [[1200, 80], [1500, 80], [1500, 380], [1200, 380]],
      },
      {
        id:      'spring-calendar',
        wordId:  'spring-moon',
        label:   '달력',
        polygon: [[1050, 450], [1350, 450], [1350, 750], [1050, 750]],
      },
    ],

    words: {
      'spring-water':    { text: '약수', syllables: ['약','수'],   targetSyllableIdx: 1, targetHanjaId: '水' },
      'spring-mountain': { text: '등산', syllables: ['등','산'],   targetSyllableIdx: 1, targetHanjaId: '山' },
      'spring-sun':      { text: '일출', syllables: ['일','출'],   targetSyllableIdx: 0, targetHanjaId: '日' },
      'spring-moon':     { text: '달력', syllables: ['달','력'],   targetSyllableIdx: 0, targetHanjaId: '月' },
    },
  },
};

export const STAGE_IDS = Object.keys(STAGES);
