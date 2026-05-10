// Service Worker — M8에서 캐시 전략 구현
// 현재: 네트워크 패스스루 (개발 중 캐시 간섭 방지)
self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));
