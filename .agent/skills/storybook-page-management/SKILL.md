---
name: storybook-page-management
description: Next.js 환경에서 동화책 스토리 페이지를 추가, 수정, 삭제할 때 따라야 할 규칙과 구조를 정의합니다.
---

# 📖 Storybook Page Management Skill (Next.js)

## 개요

이 스킬은 Next.js App Router 환경의 AI 인터랙티브 동화책에서 **스토리 페이지를 관리**(추가/수정/삭제)할 때 일관성을 유지하기 위한 가이드라인입니다.

## 프로젝트 파일 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 홈 페이지 (스토리 로드)
│   ├── globals.css             # 전역 CSS 변수 + 리셋
│   └── api/story/story1/
│       └── route.ts            # 스토리 데이터 API
├── components/
│   ├── BookViewer/
│   │   ├── StoryViewer.tsx     # 메인 뷰어
│   │   ├── DesktopBook.tsx     # 데스크톱 PageFlip
│   │   └── *.module.css
│   ├── AudioPlayer/
│   │   └── AudioPlayer.tsx     # 오디오 컨트롤
│   └── TopBar/
│       └── TopBar.tsx          # 상단 바 + 설정
├── hooks/
│   ├── useAudioPlayer.ts
│   ├── useResponsive.ts
│   └── useReadingProgress.ts
├── types/
│   ├── story.ts                # StoryData 타입
│   └── page-flip.d.ts
└── data/stories/
    └── story1.json             # 스토리 데이터
public/
├── images/                     # 삽화 이미지 (1.png ~ N.png)
└── audio/                      # 챕터별 오디오 (chapter1.mp3 ~ chapterN.mp3)
```

## 스토리 데이터 구조 (JSON)

### TypeScript 타입 (`src/types/story.ts`)

```typescript
export interface Sentence {
  text: string;
}
export interface Chapter {
  chapterNum: number;
  title: string;
  image: string; // "images/1.png"
  imageAlt: string;
  audio: string; // "audio/chapter1.mp3"
  sentences: Sentence[];
}
export interface StoryData {
  title: string;
  subtitle: string;
  chapters: Chapter[];
}
```

### JSON 예시 (`src/data/stories/story1.json`)

```json
{
  "title": "비프의 푸른 바다 모험",
  "subtitle": "화성에서 온 로봇, 비프의 신비로운 지구 탐험기",
  "chapters": [
    {
      "chapterNum": 1,
      "title": "안녕, 푸른 지구야!",
      "image": "images/1.png",
      "imageAlt": "비프가 푸른 지구의 바다에 도착한 장면",
      "audio": "audio/chapter1.mp3",
      "sentences": [{ "text": "첫 번째 문장." }, { "text": "두 번째 문장." }]
    }
  ]
}
```

## 페이지 쌍(Pair) 원칙

데스크톱 PageFlip은 각 챕터를 **2개의 물리 페이지**로 표현합니다:

```
[앞표지] [Ch1 일러스트 | Ch1 텍스트] [Ch2 일러스트 | Ch2 텍스트] ... [뒷표지]
```

- 왼쪽 페이지: 일러스트 (`pageIllustration`)
- 오른쪽 페이지: 텍스트 (`pageStory`)

모바일에서는 한 장에 일러스트+텍스트가 모두 표시됩니다.

## 챕터 추가 절차

### Step 1: 이미지 준비

- [ ] `public/images/` 폴더에 새 이미지 추가 (파일명: `N.png`)
- [ ] 이미지 크기: 1024×1024px 이상 (정사각형 또는 3:4 비율)

### Step 2: 오디오 준비

- [ ] `public/audio/` 폴더에 새 오디오 추가 (파일명: `chapterN.mp3`)
- [ ] MP3 형식 권장

### Step 3: JSON 데이터 수정

`src/data/stories/story1.json`에 새 챕터 추가:

```json
{
  "chapterNum": 7,
  "title": "새 챕터 제목",
  "image": "images/7.png",
  "imageAlt": "새 챕터 장면 설명",
  "audio": "audio/chapter7.mp3",
  "sentences": [
    { "text": "첫 번째 문장." },
    { "text": "두 번째 문장." },
    { "text": "세 번째 문장." }
  ]
}
```

### Step 4: 확인

- [ ] `npm run build` 성공 확인
- [ ] 모바일 / 데스크톱 양쪽에서 새 챕터 표시 확인
- [ ] 오디오 재생 확인
- [ ] 페이지 인디케이터 총 수 자동 업데이트 확인

## 챕터 삭제 절차

1. `story1.json`에서 해당 챕터 객체 삭제
2. `public/images/`에서 해당 이미지 삭제
3. `public/audio/`에서 해당 오디오 삭제
4. 남은 챕터들의 `chapterNum` 재정렬
5. 빌드 확인

## 문장 작성 가이드라인

- 한 문장: **15~30자** 권장
- 한 챕터: **3~5개 문장**
- 의성어/의태어 적극 활용
- `story-content-generation` 스킬 참조

## 주의사항

- ⚠️ JSON만 수정하면 UI가 자동으로 업데이트됨 (HTML 수동 편집 필요 없음)
- ⚠️ 이미지/오디오는 `public/` 폴더에 위치 (경로는 `/images/N.png`)
- ⚠️ 챕터 수 변경 시 `totalPages` 계산이 자동 반영됨 (`chapters.length + 2`)
- ⚠️ PageFlip 물리 페이지 수 = `chapters.length * 2 + 2` (앞뒤 표지 포함)
- ⚠️ 모든 주석은 한글로 작성합니다
