---
name: responsive-ebook-layout
description: PageFlip 기반 전자책 레이아웃 최적화 및 반응형 디자인 패턴을 정의합니다.
---

# 📐 Responsive Ebook Layout Skill (Next.js)

## 개요

이 스킬은 Next.js App Router 환경에서 **page-flip 라이브러리** 기반의 전자책 레이아웃을 다양한 디바이스에서 최적화하는 방법과 반응형 디자인 패턴을 제공합니다.

## 핵심 파일

| 파일                                               | 역할                             |
| -------------------------------------------------- | -------------------------------- |
| `src/components/BookViewer/StoryViewer.tsx`        | 메인 뷰어 (모바일/데스크톱 분기) |
| `src/components/BookViewer/DesktopBook.tsx`        | 데스크톱 PageFlip 양면 펼침      |
| `src/components/BookViewer/DesktopBook.module.css` | PageFlip 스타일                  |
| `src/components/BookViewer/StoryViewer.module.css` | 모바일 카드뷰 스타일             |
| `src/hooks/useResponsive.ts`                       | 반응형 분기 훅 (768px 기준)      |

## page-flip 라이브러리

### 설치 (npm)

```bash
npm install page-flip
```

### Dynamic Import (SSR 안전)

```typescript
useEffect(() => {
  import("page-flip").then(({ PageFlip }) => {
    // PageFlip 초기화
  });
}, []);
```

### 타입 선언 (`src/types/page-flip.d.ts`)

```typescript
declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, options: Record<string, unknown>);
    loadFromHTML(pages: NodeListOf<HTMLElement>): void;
    on(event: string, callback: (e: { data: number }) => void): void;
    flip(pageIndex: number): void;
    flipNext(): void;
    flipPrev(): void;
    getCurrentPageIndex(): number;
    destroy(): void;
  }
}
```

### 주요 설정 옵션

```typescript
const pf = new PageFlip(container, {
  width: pageW,
  height: pageH,
  size: "fixed",
  showCover: true,
  maxShadowOpacity: 0.5,
  flippingTime: 800,
  useMouseEvents: true,
  startPage: 0,
  usePortrait: false, // 데스크톱: false (양면)
  mobileScrollSupport: false,
  autoSize: false,
  drawShadow: true,
});
```

## ⚠️ 페이지 인덱스 변환 (핵심!)

StoryViewer의 `currentPage`는 **챕터 단위**이고, PageFlip의 내부 인덱스는 **물리 페이지 단위**입니다. 반드시 변환이 필요합니다.

### 페이지 구조

```
StoryViewer currentPage (챕터 단위):
  0 = 표지, 1 = Ch1, 2 = Ch2, ..., N+1 = 뒷표지

PageFlip 물리 페이지:
  0 = 앞표지 (hard)
  1 = Ch1 일러스트,  2 = Ch1 텍스트
  3 = Ch2 일러스트,  4 = Ch2 텍스트
  ...
  2N+1 = 뒷표지 (hard)
```

### 변환 함수

```typescript
// 챕터 → 물리 페이지
const chapterToPhysical = (cp: number): number => {
  if (cp <= 0) return 0;
  if (cp > chaptersLen) return chaptersLen * 2 + 1;
  return (cp - 1) * 2 + 1;
};

// 물리 페이지 → 챕터
const physicalToChapter = (pf: number): number => {
  if (pf <= 0) return 0;
  if (pf >= chaptersLen * 2 + 1) return chaptersLen + 1;
  return Math.floor((pf - 1) / 2) + 1;
};
```

## 레이아웃 구조

```
┌─────────────────────────────────────────┐
│  TopBar (진행률 바 + 메타 + 설정)          │  ← flex-shrink: 0
├─────────────────────────────────────────┤
│                                         │
│        Book Area (flex: 1)              │
│  ┌────────────┬────────────┐            │
│  │  Left Page │ Right Page │ ← Desktop  │
│  │  (Image)   │  (Text)    │   PageFlip │
│  └────────────┴────────────┘            │
│                                         │
│  ┌─────────────────────────┐            │
│  │     Card View           │ ← Mobile   │
│  │  [Image]                │            │
│  │  [Text Section]         │            │
│  └─────────────────────────┘            │
│                                         │
├─────────────────────────────────────────┤
│  Bottom Nav (이전 | 자동 | 표지 | 다음)   │  ← flex-shrink: 0
└─────────────────────────────────────────┘
     [🎵] ← Audio Toggle (fixed)
```

### CSS 핵심 (CSS Modules)

```css
.appContainer {
  width: 100vw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
}

.bookArea {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden !important;
  min-height: 0; /* Flexbox 최소 높이 리셋 */
}
```

## 반응형 분기

```typescript
// StoryViewer.tsx
const { isMobile } = useResponsive(); // 768px 기준

{!isMobile ? (
  <DesktopBook ... />
) : (
  <div className={styles.bookStage}>...</div>
)}
```

## 페이지 크기 계산 (데스크톱)

```typescript
const availW = parent.clientWidth - 40;
const availH = parent.clientHeight - 20;

// 3:4 비율
const pageW = Math.max(220, Math.min(availW / 2, (availH * 3) / 4));
const pageH = Math.max(300, Math.min(availH, (pageW * 4) / 3));
```

## 레이아웃 수정 시 체크리스트

- [ ] `"use client"` 지시어 확인
- [ ] `overflow: hidden` 전체 부모 체인에 적용
- [ ] `flex: 1 + min-height: 0` 조합 확인
- [ ] 페이지 비율 3:4 유지
- [ ] 이미지 `object-fit: contain` 적용
- [ ] 최소 크기 보장 (220×300px)
- [ ] **챕터↔물리 페이지 인덱스 변환** 정합성 확인
- [ ] `Fragment` 키가 고유한지 확인

## 주의사항

- ⚠️ PageFlip은 `dynamic import`로만 로드 (SSR 불가)
- ⚠️ 페이지 수가 홀수이면 마지막 페이지가 정상 표시되지 않을 수 있음
- ⚠️ 페이지는 **쌍(pair)** 단위로 관리 (일러스트+텍스트)
- ⚠️ `data-density="hard"`는 표지 페이지에만 사용
- ⚠️ `useEffect` cleanup에서 반드시 `pf.destroy()` 호출
- ⚠️ 모든 주석은 한글로 작성합니다
