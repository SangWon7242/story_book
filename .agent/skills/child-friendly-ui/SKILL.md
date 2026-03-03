---
name: child-friendly-ui
description: 5~9세 어린이를 타겟으로 한 UI/UX 디자인 가이드라인과 CSS Modules 패턴을 정의합니다.
---

# 🎨 Child-Friendly UI/UX Design Skill (Next.js)

## 개요

이 스킬은 Next.js App Router 환경에서 5~9세 어린이를 대상으로 하는 인터랙티브 동화책의 **UI/UX 설계** 규칙과 **CSS Modules** 패턴을 제공합니다.

## 디자인 시스템 변수

전역 CSS 변수는 `src/app/globals.css`에 정의합니다:

```css
:root {
  /* 폰트 */
  --font-title: "Jua", sans-serif;
  --font-child: "Jua", sans-serif;

  /* 색상 팔레트 */
  --paper-cream: #f5f0e1;
  --dark-slate: #2c2c2c;
  --antique-gold: #c5b358;
  --sage-green: #b2ac88;
  --text-story: #3a3a3a;

  /* 동적 조절 */
  --font-size-adjust: 1; /* TopBar에서 0.85 / 1 / 1.15 로 변경 */
  --touch-min: 54px; /* 최소 터치 영역 */

  /* 배경 그라디언트 */
  background: linear-gradient(160deg, #1b1b2f 0%, #162447 60%, #1f4068 100%);
}

/* 다크모드 */
[data-theme="dark"] {
  --paper-cream: #2a2a3e;
  --dark-slate: #e0e0e0;
  --text-story: #d0d0d0;
}
```

## 폰트 설정 (Next.js)

`src/app/layout.tsx`에서 Google Fonts를 `next/font`로 로드합니다:

```typescript
import { Jua } from "next/font/google";
const jua = Jua({ subsets: ["latin"], weight: "400" });

// <body className={jua.className}>
```

## 색상 규칙

### 기본 원칙

- **배경**: 어두운 사이버펑크 톤 (진한 남색~짙은 파랑)
- **스토리 페이지**: 따뜻한 크림색 (`#f5f0e1`)으로 시각적 대비 확보
- **강조색**: 앤틱 골드 (`#c5b358`) — 챕터 번호, 구분선, 데코레이션
- **텍스트**: 충분한 대비 (본문 `#3a3a3a` on 크림 배경)

## 타이포그래피 규칙 (CSS Modules)

모든 폰트 크기에 `var(--font-size-adjust)` 계수를 곱합니다:

```css
.storyTitle {
  font-size: calc(clamp(1.2rem, 2.5vw, 1.8rem) * var(--font-size-adjust));
}
.storyBody {
  font-size: calc(clamp(0.85rem, 1.5vw, 1.1rem) * var(--font-size-adjust));
  line-height: 2.2;
}
```

## 버튼 디자인 규칙 (CSS Modules)

```css
.navBtn {
  min-width: 80px;
  min-height: var(--touch-min); /* 54px */
  padding: 0 20px;
  border: none;
  border-radius: 30px;
  font-family: var(--font-child);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-tap-highlight-color: transparent;
}

.navBtn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
}

.navBtn:active:not(:disabled) {
  transform: scale(0.9) !important;
}
```

## 컴포넌트 스타일링 패턴

### CSS Modules 사용 규칙

- 각 컴포넌트는 `ComponentName.module.css` 파일을 가짐
- `import styles from "./ComponentName.module.css";`
- 조건부 클래스: `className={\`\${styles.base} \${condition ? styles.active : ""}\`}`

### 현재 컴포넌트별 CSS Modules

| 컴포넌트      | CSS Module               |
| ------------- | ------------------------ |
| `StoryViewer` | `StoryViewer.module.css` |
| `DesktopBook` | `DesktopBook.module.css` |
| `AudioPlayer` | `AudioPlayer.module.css` |
| `TopBar`      | `TopBar.module.css`      |

## 애니메이션 가이드라인

```css
/* 슬라이드 다운 (토스트) */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 펄스 (자동 넘김 활성) */
@keyframes pulse-auto {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

## 반응형 디자인 브레이크포인트

```css
/* 태블릿/데스크톱 (PageFlip 활성) */
@media (min-width: 769px) {
}

/* 모바일 (카드 뷰) */
@media (max-width: 768px) {
}

/* 소형 모바일 */
@media (max-width: 480px) {
}

/* 초소형 */
@media (max-width: 360px) {
}
```

### 반응형 분기 훅

```typescript
// src/hooks/useResponsive.ts
const { isMobile } = useResponsive(); // 768px 기준
```

## 체크리스트: 새 UI 요소 추가 시

- [ ] `"use client"` 지시어 확인 (인터랙티브 요소)
- [ ] CSS Modules 파일 생성 (`ComponentName.module.css`)
- [ ] 터치 영역 최소 `var(--touch-min)` 확보
- [ ] 호버 / 활성 / 비활성 상태 피드백 적용
- [ ] `var(--font-size-adjust)` 계수 적용 (글자 크기 조절 연동)
- [ ] `var(--font-child)` 폰트 적용
- [ ] `aria-label` 등 접근성 속성 추가
- [ ] 4개 반응형 브레이크포인트 대응

## 주의사항

- ⚠️ 전역 스타일은 `globals.css`에만, 컴포넌트 스타일은 CSS Modules에만 작성
- ⚠️ `[data-theme="dark"]` 셀렉터로 다크모드 변수 오버라이드
- ⚠️ 인라인 스타일 사용 지양 (동적 값 제외)
- ⚠️ 모든 주석은 한글로 작성합니다
