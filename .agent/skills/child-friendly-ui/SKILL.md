---
name: child-friendly-ui
description: 5~9세 어린이를 타겟으로 한 UI/UX 디자인 가이드라인과 CSS 패턴을 정의합니다.
---

# 🎨 Child-Friendly UI/UX Design Skill

## 개요

이 스킬은 5~9세 어린이를 대상으로 하는 인터랙티브 동화책에서 **UI/UX를 설계**할 때 반드시 지켜야 할 디자인 규칙과 CSS 패턴을 제공합니다.

## 디자인 시스템 변수

현재 프로젝트에서 사용 중인 CSS 커스텀 프로퍼티:

```css
:root {
  /* 폰트 */
  --font-title: "Jua", sans-serif;
  --font-child: "Jua", sans-serif;

  /* 색상 팔레트 */
  --paper-cream: #f5f0e1; /* 스토리 텍스트 배경 */
  --dark-slate: #2c2c2c; /* 본문 텍스트 색상 */
  --antique-gold: #c5b358; /* 포인트 골드 색상 */

  /* 배경 그라디언트 */
  background: linear-gradient(160deg, #1b1b2f 0%, #162447 60%, #1f4068 100%);
}
```

## 색상 규칙

### 기본 원칙

- **배경**: 어두운 사이버펑크 톤 (진한 남색~짙은 파랑)
- **스토리 페이지**: 따뜻한 크림색 (`#f5f0e1`)으로 시각적 대비 확보
- **강조색**: 앤틱 골드 (`#c5b358`) — 챕터 번호, 구분선, 데코레이션에 사용
- **텍스트**: 충분한 대비 (본문은 `#2c2c2c` on 크림 배경)

### 접근성 체크리스트

- [ ] 텍스트와 배경의 대비 비율 최소 4.5:1 이상
- [ ] 중요 정보를 색상만으로 전달하지 않기
- [ ] 애니메이션 시 `prefers-reduced-motion` 미디어 쿼리 고려

## 타이포그래피 규칙

### 폰트 선택

- **제목/네비게이션**: `Jua` (둥글고 친근한 한글 웹폰트)
- Google Fonts CDN: `https://fonts.googleapis.com/css2?family=Jua&display=swap`

### 폰트 크기 가이드

```css
/* clamp()를 사용한 반응형 폰트 크기 */
.story-title {
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
} /* 챕터 제목 */
.story-body {
  font-size: clamp(0.95rem, 1.8vw, 1.25rem);
} /* 본문 텍스트 */
.story-chapter {
  font-size: clamp(0.6rem, 1vw, 0.75rem);
} /* 챕터 라벨 */
.cover-title {
  font-size: clamp(1.6rem, 3.5vw, 2.8rem);
} /* 표지 제목 */
```

### 줄 간격

- 본문 텍스트: `line-height: 2.2` (어린이의 읽기 편의성 극대화)
- 제목: `line-height: 1.3~1.4`

## 버튼 디자인 규칙

### 터치 영역

```css
/* 아이들의 서툰 조작을 고려한 최소 터치 영역 */
.nav-btn {
  min-width: 60px;
  min-height: 60px;
  padding: 12px 28px;
  border-radius: 50px; /* 완전 둥글게 */
  font-size: 1.05rem;
  font-weight: 700;
}
```

### 시각적 피드백

모든 인터랙티브 요소에 반드시 피드백을 제공합니다:

```css
/* 호버 효과 */
.nav-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(60, 141, 255, 0.5);
  transition: all 0.25s ease;
}

/* 클릭(액티브) 효과 - 바운스 */
.nav-btn:active {
  transform: scale(0.9) !important;
  animation: btn-bounce 0.4s ease;
}

@keyframes btn-bounce {
  0% {
    transform: scale(0.85);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

## 애니메이션 가이드라인

### 원칙

1. **부드럽게**: `transition` 최소 `0.25s ease`
2. **과하지 않게**: 화려함보다 직관적인 피드백이 우선
3. **일관되게**: 같은 종류의 요소에는 같은 애니메이션 적용

### 자주 사용하는 애니메이션 패턴

```css
/* 슬라이드 업 (패널 등장) */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 펄스 글로우 (재생 중 표시) */
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.35),
      0 0 15px rgba(197, 179, 88, 0.2);
  }
  50% {
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.35),
      0 0 25px rgba(197, 179, 88, 0.45);
  }
}
```

## 반응형 디자인 브레이크포인트

```css
/* 태블릿 가로 이상 */
@media (min-width: 1200px) {
  .top-bar-title .subtitle {
    display: inline;
  }
}

/* 모바일/태블릿 세로 (주요 타겟 환경) */
@media (max-width: 768px) {
  /* 타이틀 바 간소화 */
  /* 버튼 크기 유지 또는 확대 */
  /* 오디오 패널 전체 너비 활용 */
}
```

## 체크리스트: 새 UI 요소 추가 시

- [ ] 터치 영역 최소 60x60px 확보
- [ ] 호버 및 활성화 상태 피드백 적용
- [ ] `clamp()` 를 사용한 반응형 폰트 크기 적용
- [ ] 한글 폰트 Jua 적용 여부 확인
- [ ] 크림색 배경 위의 텍스트 가독성 확인
- [ ] 어두운 배경 위의 UI 요소 가시성 확인
- [ ] 애니메이션 속도 0.25s 이상 (급격한 변화 방지)
- [ ] `aria-label` 등 접근성 속성 추가
