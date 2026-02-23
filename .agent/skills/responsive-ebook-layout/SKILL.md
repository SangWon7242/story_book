---
name: responsive-ebook-layout
description: StPageFlip 기반 전자책 레이아웃 최적화 및 반응형 디자인 패턴을 정의합니다.
---

# 📐 Responsive Ebook Layout Skill

## 개요

이 스킬은 **StPageFlip 라이브러리** 기반의 전자책 레이아웃을 다양한 디바이스에서 최적화하는 방법과 반응형 디자인 패턴을 제공합니다.

## StPageFlip 라이브러리

### CDN 링크

```html
<script src="https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js"></script>
```

### 주요 설정 옵션

```javascript
const pageFlip = new St.PageFlip(bookEl, {
  width: pageW, // 페이지 너비 (px)
  height: pageH, // 페이지 높이 (px)
  size: "fixed", // "fixed" | "stretch"
  showCover: true, // 표지 페이지 표시
  maxShadowOpacity: 0.5, // 그림자 최대 불투명도
  mobileScrollSupport: false, // 모바일 스크롤과 충돌 방지
  flippingTime: 800, // 페이지 넘김 애니메이션 시간 (ms)
  usePortrait: true, // 세로 모드 지원
  startZIndex: 0, // 시작 z-index
  autoSize: false, // 자동 크기 조정 비활성화
  drawShadow: true, // 그림자 효과
});
```

### 페이지 크기 계산 로직

현재 프로젝트에서 사용하는 페이지 크기 계산 알고리즘:

```javascript
// book-stage 영역 기준
const stageRect = bookStage.getBoundingClientRect();
const availW = stageRect.width;
const availH = stageRect.height;

// 각 페이지는 3:4 비율
const pageRatio = 3 / 4;
let pageH = Math.floor(availH);
let pageW = Math.floor(pageH * pageRatio);

// 가로 모드: 두 페이지가 나란히 표시되므로 가로 넘침 방지
if (pageW * 2 > availW) {
  pageW = Math.floor(availW / 2);
  pageH = Math.floor(pageW / pageRatio);
}

// 최소 크기 보장 (너무 작으면 읽기 어려움)
pageW = Math.max(pageW, 220);
pageH = Math.max(pageH, 300);
```

## 레이아웃 구조

### 전체 레이아웃 (Flexbox 기반)

```
┌─────────────────────────────────────────┐
│  Top Bar (flex-shrink: 0)               │  ← 고정 높이
├─────────────────────────────────────────┤
│                                         │
│        Book Area (flex: 1)              │  ← 남은 공간 채움
│  ┌────────────┬────────────┐            │
│  │  Left Page │ Right Page │            │
│  │  (Image)   │  (Text)    │            │
│  └────────────┴────────────┘            │
│                                         │
├─────────────────────────────────────────┤
│  Bottom Nav (flex-shrink: 0)            │  ← 고정 높이
└─────────────────────────────────────────┘
    [🎵] ← Audio Toggle (fixed position)
```

### CSS 구조 핵심

```css
/* 전체 컨테이너: 뷰포트 전체를 차지 */
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
}

/* 책 영역: 남은 공간 모두 차지 */
.book-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden !important;
  min-height: 0; /* Flexbox 최소 높이 리셋 (중요!) */
}

/* 책 스테이지: 100% 크기 */
.book-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden !important;
}
```

## 페이지 타입별 스타일링

### 일러스트레이션 페이지 (왼쪽)

```css
.page-illustration {
  background: radial-gradient(
    ellipse at center,
    #22304a 0%,
    #1a2744 50%,
    #131e36 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.illustration-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 이미지가 잘리지 않고 전체가 보이도록 */
  padding: 12px;
}
```

### 스토리 텍스트 페이지 (오른쪽)

```css
.page-story {
  background: var(--paper-cream); /* 따뜻한 종이 느낌 */
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.story-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px 24px; /* 충분한 여백 */
  max-width: 420px;
}
```

## 스크롤 방지 전략

StPageFlip과 페이지 스크롤 충돌을 방지하기 위한 핵심 규칙:

```css
/* 모든 컨테이너에 overflow: hidden 강제 */
.app-container,
.book-area,
.book-stage,
.book-container {
  overflow: hidden !important;
}

/* 뷰포트 메타태그도 필수 */
/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /> */
```

## 키보드 내비게이션

```javascript
// 좌우 화살표 키로 페이지 넘기기
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") pageFlip.flipPrev();
  else if (e.key === "ArrowRight") pageFlip.flipNext();
});
```

## 디바이스별 최적화 가이드

### 태블릿 (주요 타겟)

- 3:4 비율의 펼친 책 레이아웃 최적 표시
- 터치 스와이프로 자연스러운 페이지 넘김
- `mobileScrollSupport: false` 로 스크롤 충돌 방지

### 모바일 (세로 모드)

- `usePortrait: true` 로 한 페이지씩 표시
- 최소 크기 `220x300px` 보장
- 버튼 터치 영역 60px 이상 유지

### 데스크톱

- 넉넉한 공간에서 두 페이지 펼침 표시
- 키보드 화살표 내비게이션 활성화
- 마우스 드래그로 페이지 넘김 가능

## 레이아웃 수정 시 체크리스트

- [ ] `overflow: hidden` 이 모든 부모 컨테이너에 적용되어 있는지 확인
- [ ] `flex: 1` + `min-height: 0` 조합이 book-area에 적용되어 있는지 확인
- [ ] 페이지 비율 3:4 유지되는지 확인
- [ ] 이미지에 `object-fit: contain` 적용되어 있는지 확인
- [ ] 최소 크기가 보장되는지 확인 (220x300px)
- [ ] 모바일에서 스크롤 없이 전체 화면을 차지하는지 확인
- [ ] 상단 바, 하단 내비게이션이 책 영역을 가리지 않는지 확인

## 주의사항

- ⚠️ StPageFlip의 `loadFromHTML()` 은 DOM 요소가 모두 로드된 후 호출해야 합니다
- ⚠️ 페이지 수가 홀수이면 마지막 페이지가 제대로 표시되지 않을 수 있습니다
- ⚠️ CSS 변경 후 반드시 다양한 화면 크기에서 테스트하세요
- ⚠️ `window._pageFlip` 전역 변수로 디버깅 시 접근 가능합니다
- ⚠️ 모든 주석은 한글로 작성합니다
