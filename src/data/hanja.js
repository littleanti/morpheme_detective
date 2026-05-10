// 한자 메타 데이터 — TRD §3.2
// morphPathsRef: 실제 path 데이터는 src/assets/hanja/{id}.json 에서 lazy load
export const HANJA = {
  '車': {
    id: '車', reading: '차', meaning: '수레', grade: 7,
    morphPathsRef: 'src/assets/hanja/車.json',
    vocab: ['자동차', '기차', '마차', '전차', '주차장'],
  },
  '水': {
    id: '水', reading: '수', meaning: '물', grade: 8,
    morphPathsRef: 'src/assets/hanja/水.json',
    vocab: ['생수', '수영', '약수', '정수기', '홍수'],
  },
  '火': {
    id: '火', reading: '화', meaning: '불', grade: 8,
    morphPathsRef: 'src/assets/hanja/火.json',
    vocab: ['화산', '화재', '소화기', '화력', '불꽃'],
  },
  '木': {
    id: '木', reading: '목', meaning: '나무', grade: 8,
    morphPathsRef: 'src/assets/hanja/木.json',
    vocab: ['목요일', '식목일', '목재', '목수', '나무'],
  },
  '山': {
    id: '山', reading: '산', meaning: '산', grade: 8,
    morphPathsRef: 'src/assets/hanja/山.json',
    vocab: ['화산', '등산', '산악', '산림', '산책'],
  },
  '日': {
    id: '日', reading: '일', meaning: '날·해', grade: 8,
    morphPathsRef: 'src/assets/hanja/日.json',
    vocab: ['일요일', '생일', '매일', '일출', '일기'],
  },
  '月': {
    id: '月', reading: '월', meaning: '달', grade: 8,
    morphPathsRef: 'src/assets/hanja/月.json',
    vocab: ['월요일', '월급', '매월', '달력', '정월'],
  },
  '人': {
    id: '人', reading: '인', meaning: '사람', grade: 8,
    morphPathsRef: 'src/assets/hanja/人.json',
    vocab: ['인간', '인기', '외국인', '인형', '사람'],
  },
};

export const HANJA_IDS = Object.keys(HANJA);
