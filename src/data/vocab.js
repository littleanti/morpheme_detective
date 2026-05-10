// 어휘 → 한자 매핑
// syllableMap: { 음절인덱스(0-based): HanjaId }
export const VOCAB = {
  // ── 車 (차, 수레) ─────────────────────────
  '자동차': { hanja: ['車'], syllableMap: { 2: '車' } },
  '기차':   { hanja: ['車'], syllableMap: { 1: '車' } },
  '마차':   { hanja: ['車'], syllableMap: { 1: '車' } },
  '전차':   { hanja: ['車'], syllableMap: { 1: '車' } },
  '주차장': { hanja: ['車'], syllableMap: { 1: '車' } },

  // ── 水 (수, 물) ───────────────────────────
  '생수':   { hanja: ['水'], syllableMap: { 1: '水' } },
  '수영':   { hanja: ['水'], syllableMap: { 0: '水' } },
  '약수':   { hanja: ['水'], syllableMap: { 1: '水' } },
  '정수기': { hanja: ['水'], syllableMap: { 1: '水' } },
  '홍수':   { hanja: ['水'], syllableMap: { 1: '水' } },

  // ── 火 (화, 불) ───────────────────────────
  '화산':   { hanja: ['火', '山'], syllableMap: { 0: '火', 1: '山' } },
  '화재':   { hanja: ['火'],       syllableMap: { 0: '火' } },
  '소화기': { hanja: ['火'],       syllableMap: { 1: '火' } },
  '화력':   { hanja: ['火'],       syllableMap: { 0: '火' } },

  // ── 木 (목, 나무) ─────────────────────────
  '목요일': { hanja: ['木'], syllableMap: { 0: '木' } },
  '식목일': { hanja: ['木'], syllableMap: { 1: '木' } },
  '목재':   { hanja: ['木'], syllableMap: { 0: '木' } },
  '목수':   { hanja: ['木'], syllableMap: { 0: '木' } },

  // ── 山 (산, 산) ───────────────────────────
  '등산':   { hanja: ['山'], syllableMap: { 1: '山' } },
  '산악':   { hanja: ['山'], syllableMap: { 0: '山' } },
  '산림':   { hanja: ['山'], syllableMap: { 0: '山' } },
  '산책':   { hanja: ['山'], syllableMap: { 0: '山' } },

  // ── 日 (일, 날·해) ────────────────────────
  '일요일': { hanja: ['日'], syllableMap: { 0: '日' } },
  '생일':   { hanja: ['日'], syllableMap: { 1: '日' } },
  '매일':   { hanja: ['日'], syllableMap: { 1: '日' } },
  '일출':   { hanja: ['日'], syllableMap: { 0: '日' } },
  '일기':   { hanja: ['日'], syllableMap: { 0: '日' } },

  // ── 月 (월, 달) ───────────────────────────
  '월요일': { hanja: ['月'], syllableMap: { 0: '月' } },
  '월급':   { hanja: ['月'], syllableMap: { 0: '月' } },
  '매월':   { hanja: ['月'], syllableMap: { 1: '月' } },
  '달력':   { hanja: ['月'], syllableMap: { 0: '月' } },
  '정월':   { hanja: ['月'], syllableMap: { 1: '月' } },

  // ── 人 (인, 사람) ─────────────────────────
  '인간':   { hanja: ['人'], syllableMap: { 0: '人' } },
  '인기':   { hanja: ['人'], syllableMap: { 0: '人' } },
  '외국인': { hanja: ['人'], syllableMap: { 2: '人' } },
  '인형':   { hanja: ['人'], syllableMap: { 0: '人' } },
};
