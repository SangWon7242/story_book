/* ============================================
   비프의 푸른 바다 모험 — Service Worker (PWA)
   캐시 우선 전략으로 오프라인 지원 및 빠른 재방문 제공
   ============================================ */

const CACHE_NAME = "beep-storybook-v1";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/main.js",
  "./images/1.png",
  "./images/2.png",
  "./images/3.png",
  "./images/4.png",
  "./images/5.png",
  "./images/6.png",
  "./data/story1.json",
  "./audio/story_audio.wav",
  "https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js",
  "https://fonts.googleapis.com/css2?family=Jua&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
];

/* 설치: 모든 정적 에셋을 캐시에 저장 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

/* 활성화: 이전 버전 캐시 정리 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* Fetch: 캐시 우선, 없으면 네트워크 */
self.addEventListener("fetch", (event) => {
  /* POST 요청이나 chrome-extension 등은 패스 */
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          /* 유효한 응답만 캐시에 추가 */
          if (
            response &&
            response.status === 200 &&
            response.type !== "opaque"
          ) {
            const cloned = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => {
          /* 네트워크 실패 시 index.html 반환 (오프라인 폴백) */
          return caches.match("./index.html");
        });
    }),
  );
});
