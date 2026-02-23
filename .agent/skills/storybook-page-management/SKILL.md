---
name: storybook-page-management
description: 동화책 스토리 페이지를 추가, 수정, 삭제할 때 따라야 할 규칙과 구조를 정의합니다.
---

# 📖 Storybook Page Management Skill

## 개요

이 스킬은 AI 인터랙티브 동화책의 **스토리 페이지를 관리**(추가/수정/삭제)할 때 일관성을 유지하기 위한 가이드라인입니다.

## 프로젝트 파일 구조

```
story_book/
├── index.html          # 메인 HTML (모든 스토리 페이지 포함)
├── css/style.css       # 전체 스타일시트
├── js/main.js          # 메인 로직 (StPageFlip, Audio Player)
├── images/             # 삽화 이미지 (1.png, 2.png, ...)
└── audio/              # 구연동화 오디오 파일
```

## 페이지 구조 규칙

### 1. 페이지 쌍(Pair) 원칙

각 스토리는 반드시 **2개의 페이지 쌍**으로 구성됩니다:

- **왼쪽 페이지 (일러스트레이션)**: `page page-illustration`
- **오른쪽 페이지 (텍스트)**: `page page-story`

```html
<!-- ===== Story N - Image (Left) ===== -->
<div class="page page-illustration">
  <div class="illustration-wrap">
    <img src="images/N.png" alt="장면 설명" />
  </div>
</div>

<!-- ===== Story N - Text (Right) ===== -->
<div class="page page-story">
  <div class="story-wrap">
    <div class="story-chapter">Chapter N</div>
    <h3 class="story-title">챕터 제목</h3>
    <div class="story-divider"></div>
    <p class="story-body">
      <span class="sentence" data-sentence="1">첫 번째 문장.</span>
      <span class="sentence" data-sentence="2">두 번째 문장.</span>
      <!-- 문장 추가... -->
    </p>
    <div class="story-page-number">N / TOTAL</div>
  </div>
</div>
```

### 2. 전체 페이지 순서

```
[Front Cover (data-density="hard")]
[Story 1 - Image] [Story 1 - Text]
[Story 2 - Image] [Story 2 - Text]
...
[Story N - Image] [Story N - Text]
[Back Cover (data-density="hard")]
```

### 3. 커버 페이지 템플릿

```html
<!-- Front Cover -->
<div class="page page-cover" data-density="hard">
  <div class="cover-title">동화 제목</div>
  <div class="cover-decoration"></div>
  <div class="cover-subtitle">부제목</div>
</div>

<!-- Back Cover -->
<div class="page page-cover" data-density="hard">
  <div class="cover-title">끝 ✨</div>
  <div class="cover-decoration"></div>
  <div class="cover-subtitle">Powered by AI Vibe Coding</div>
</div>
```

## 페이지 추가 절차

새 스토리 페이지를 추가할 때 다음 체크리스트를 따릅니다:

### Step 1: 이미지 준비

- [ ] `images/` 폴더에 새 이미지 파일 추가 (파일명: 번호.png)
- [ ] 이미지 크기: 1024x1024px 이상 권장 (정사각형 또는 3:4 비율)
- [ ] alt 텍스트에 장면 설명을 상세히 작성

### Step 2: HTML 페이지 쌍 삽입

- [ ] 마지막 스토리 페이지와 Back Cover 사이에 새 페이지 쌍 삽입
- [ ] `data-sentence` 속성의 번호를 1부터 순서대로 부여
- [ ] Chapter 번호, 페이지 번호 업데이트

### Step 3: 기존 페이지 번호 업데이트

- [ ] 모든 기존 `.story-page-number` 의 총 페이지 수 업데이트 (예: `N / 5` → `N / 6`)

### Step 4: JavaScript 상수 업데이트

- [ ] `js/main.js` 파일의 `TOTAL_STORIES` 상수 값 변경

```javascript
// 총 스토리 수 (커버 제외, 이미지+텍스트 페이지 쌍의 수)
const TOTAL_STORIES = 6; // 5 → 6 으로 변경
```

## 문장 작성 가이드라인

- 한 문장은 30자 이내를 권장 (어린이 가독성)
- 의성어/의태어를 적극 활용 (예: 쏴아아, 철컥철컥, 뽀글뽀글)
- 한 페이지당 3~5개 문장이 적당
- 각 문장은 `<span class="sentence" data-sentence="N">` 태그로 감싸기 (TTS 연동 대비)

## 페이지 삭제 절차

1. `index.html`에서 해당 스토리의 Image + Text 페이지 쌍 삭제
2. `images/` 폴더에서 해당 이미지 파일 삭제
3. 남은 페이지들의 Chapter 번호, 페이지 번호 재정렬
4. `TOTAL_STORIES` 상수 값 업데이트

## 주의사항

- ⚠️ 페이지는 반드시 **쌍(pair)** 단위로 추가/삭제해야 StPageFlip이 정상 동작합니다
- ⚠️ `data-density="hard"` 속성은 **커버 페이지에만** 사용합니다
- ⚠️ 이미지 파일명은 스토리 순서와 일치시킵니다 (1.png, 2.png, ...)
- ⚠️ 모든 주석은 한글로 작성합니다
