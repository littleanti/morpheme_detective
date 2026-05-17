// 어휘 → 한자 매핑
// syllableMap: { 음절인덱스(0-based): HanjaId }
// familiarity: 1=초1 빈출, 2=중간, 3=드문 노출 → card-deck 정렬 키
export const VOCAB = {
  // ── 車 (차, 수레) ─────────────────────────────────────────────────
  '자동차': { hanja: ['車'], syllableMap: { 2: '車' }, familiarity: 1 },
  '기차':   { hanja: ['車'], syllableMap: { 1: '車' }, familiarity: 1 },
  '마차':   { hanja: ['車'], syllableMap: { 1: '車' }, familiarity: 2 },
  '전차':   { hanja: ['車'], syllableMap: { 1: '車' }, familiarity: 3 },
  '주차장': { hanja: ['車'], syllableMap: { 1: '車' }, familiarity: 1 },

  // ── 水 (수, 물) ───────────────────────────────────────────────────
  '생수':   { hanja: ['水'], syllableMap: { 1: '水' }, familiarity: 1 },
  '수영':   { hanja: ['水'], syllableMap: { 0: '水' }, familiarity: 1 },
  '약수':   { hanja: ['水'], syllableMap: { 1: '水' }, familiarity: 2 },
  '정수기': { hanja: ['水'], syllableMap: { 1: '水' }, familiarity: 2 },
  '홍수':   { hanja: ['水'], syllableMap: { 1: '水' }, familiarity: 3 },

  // ── 火 (화, 불) ───────────────────────────────────────────────────
  '화산':   { hanja: ['火', '山'], syllableMap: { 0: '火', 1: '山' }, familiarity: 1 },
  '화재':   { hanja: ['火'],       syllableMap: { 0: '火' },           familiarity: 1 },
  '소화기': { hanja: ['火'],       syllableMap: { 1: '火' },           familiarity: 2 },
  '화력':   { hanja: ['火'],       syllableMap: { 0: '火' },           familiarity: 3 },

  // ── 木 (목, 나무) ─────────────────────────────────────────────────
  '목요일': { hanja: ['木'], syllableMap: { 0: '木' }, familiarity: 1 },
  '식목일': { hanja: ['木'], syllableMap: { 1: '木' }, familiarity: 2 },
  '목재':   { hanja: ['木'], syllableMap: { 0: '木' }, familiarity: 3 },
  '목수':   { hanja: ['木'], syllableMap: { 0: '木' }, familiarity: 2 },

  // ── 山 (산, 산) ───────────────────────────────────────────────────
  '등산':   { hanja: ['山'], syllableMap: { 1: '山' }, familiarity: 1 },
  '산악':   { hanja: ['山'], syllableMap: { 0: '山' }, familiarity: 2 },
  '산림':   { hanja: ['山'], syllableMap: { 0: '山' }, familiarity: 3 },
  '산책':   { hanja: ['山'], syllableMap: { 0: '山' }, familiarity: 1 },

  // ── 日 (일, 날·해) ────────────────────────────────────────────────
  '일요일': { hanja: ['日'], syllableMap: { 0: '日' }, familiarity: 1 },
  '생일':   { hanja: ['日'], syllableMap: { 1: '日' }, familiarity: 1 },
  '매일':   { hanja: ['日'], syllableMap: { 1: '日' }, familiarity: 1 },
  '일출':   { hanja: ['日'], syllableMap: { 0: '日' }, familiarity: 2 },
  '일기':   { hanja: ['日'], syllableMap: { 0: '日' }, familiarity: 1 },

  // ── 月 (월, 달) ───────────────────────────────────────────────────
  '월요일': { hanja: ['月'], syllableMap: { 0: '月' }, familiarity: 1 },
  '월급':   { hanja: ['月'], syllableMap: { 0: '月' }, familiarity: 3 },
  '매월':   { hanja: ['月'], syllableMap: { 1: '月' }, familiarity: 2 },
  '달력':   { hanja: ['月'], syllableMap: { 0: '月' }, familiarity: 1 },
  '정월':   { hanja: ['月'], syllableMap: { 1: '月' }, familiarity: 3 },

  // ── 人 (인, 사람) ─────────────────────────────────────────────────
  '인간':   { hanja: ['人'], syllableMap: { 0: '人' }, familiarity: 2 },
  '인기':   { hanja: ['人'], syllableMap: { 0: '人' }, familiarity: 1 },
  '외국인': { hanja: ['人'], syllableMap: { 2: '人' }, familiarity: 2 },
  '인형':   { hanja: ['人'], syllableMap: { 0: '人' }, familiarity: 1 },
};
