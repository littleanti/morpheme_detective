// 어휘 카드 덱 컴포넌트 — TRD §5.4 / PRD F10
// showCardDeck(hanjaId): morph 완료 직후 호출 → familiarity 순 카드 펼침
// clearCards(): 화면 전환·언로드 시 정리
import { HANJA }  from '../data/hanja.js';
import { VOCAB }  from '../data/vocab.js';
import { speak, isAvailable as ttsAvailable } from './tts.js';

const CONTAINER_ID = 'card-deck-container';

function getContainer() {
  return document.getElementById(CONTAINER_ID);
}

// vocab 항목을 familiarity 오름차순(친숙 → 낯선)으로 정렬, 최대 5개
function getSortedVocab(hanjaId) {
  const hanja = HANJA[hanjaId];
  if (!hanja?.vocab?.length) return [];

  return hanja.vocab
    .map(word => ({ word, familiarity: VOCAB[word]?.familiarity ?? 9 }))
    .sort((a, b) => a.familiarity - b.familiarity)
    .slice(0, 5)
    .map(v => v.word);
}

function buildCard(word, index) {
  const card = document.createElement('div');
  card.className = 'vocab-card';
  card.textContent = word;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${word} 발음 듣기`);
  card.dataset.word = word;

  if (!ttsAvailable()) card.classList.add('tts-unavail');

  function activate() {
    speak(word);
    card.classList.add('tapped');
    setTimeout(() => card.classList.remove('tapped'), 300);
    console.log(`[card-deck] 탭: "${word}"`);
  }

  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
  });

  return card;
}

export function showCardDeck(hanjaId) {
  const container = getContainer();
  if (!container) {
    console.warn('[card-deck] #card-deck-container 없음');
    return;
  }

  clearCards();

  const words = getSortedVocab(hanjaId);
  if (!words.length) {
    console.warn(`[card-deck] ${hanjaId}: 어휘 없음`);
    return;
  }

  words.forEach((word, i) => {
    const card = buildCard(word, i);
    container.appendChild(card);
  });

  // 컨테이너 노출: portrait 모드에서는 translateY(100%→0) 트랜지션
  container.classList.add('revealed');

  // 카드를 순차적으로 .revealed 추가 (부채꼴/슬라이드 진입 효과)
  const cards = container.querySelectorAll('.vocab-card');
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('revealed'), 80 + i * 60);
  });

  console.log(`[card-deck] showCardDeck ${hanjaId} — ${words.length}개 카드`);
}

export function clearCards() {
  const container = getContainer();
  if (!container) return;
  container.innerHTML = '';
  container.classList.remove('revealed');
}
