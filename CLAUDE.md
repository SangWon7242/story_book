# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this Next.js project.

## Project Overview

A **Next.js 16 (App Router)** children's interactive e-book web app ("Beep's Blue Ocean Adventure" / 비프의 푸른 바다 모험) targeting ages 5-9. Built with **React 19**, **TypeScript**, and **CSS Modules**.

## Running the Project

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## Architecture

### App Router Structure

- `src/app/layout.tsx` — 루트 레이아웃 (메타데이터, Google Fonts, 글로벌 CSS)
- `src/app/page.tsx` — 홈 페이지 (스토리 데이터 로드 → StoryViewer 렌더링)
- `src/app/api/story/story1/route.ts` — 스토리 데이터 API 엔드포인트
- `src/app/globals.css` — CSS 디자인 토큰 + 글로벌 리셋

### Component-Based Rendering (React)

현재 `StoryViewer` 컴포넌트가 모바일 카드 뷰 방식으로 모든 화면 크기에서 동작합니다:

- 표지(앞/뒤) + 챕터별 카드(이미지 상단 + 텍스트 하단)
- 하단 네비게이션(이전/다음/페이지번호)

### File Structure

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 홈 페이지 (Client Component)
│   ├── globals.css             # CSS 변수, 리셋, 애니메이션
│   └── api/story/story1/
│       └── route.ts            # 스토리 데이터 API
├── components/
│   └── BookViewer/
│       ├── StoryViewer.tsx     # 메인 뷰어 컴포넌트
│       └── StoryViewer.module.css
├── hooks/                      # (확장용) 커스텀 훅
├── types/
│   └── story.ts                # StoryData, Chapter, Sentence 타입
└── data/stories/
    └── story1.json             # 스토리 JSON 데이터

public/
├── images/1~6.png              # 챕터 삽화 (정적 자산)
└── audio/chapter1~6.mp3        # 챕터별 오디오 + 전체 오디오
```

### Data Flow

1. `page.tsx` → fetch `/api/story/story1` → JSON 로드
2. `<StoryViewer story={data} />` 에 데이터 전달
3. StoryViewer가 currentPage state로 표지/챕터/뒷표지 조건부 렌더링

### CSS Design System

- 글로벌 CSS 변수: `src/app/globals.css`의 `:root`에 정의
- 컴포넌트 스타일: CSS Modules (`.module.css`)
- 주요 변수: `--paper-cream`, `--antique-gold`, `--dark-slate`, `--font-child` (Jua), `--font-title` (Playfair Display)
- 다크모드: `[data-theme="dark"]` 변수 오버라이드
- 반응형: `clamp()` + 미디어 쿼리 (768px, 480px, 360px)

## Key Constraints

- **'use client' 지시어**: 브라우저 API(Audio, window, localStorage) 사용 컴포넌트에 필수
- **Child-friendly UX**: Minimum 54px touch targets, line-height 1.85+, 바운스 애니메이션
- **Korean content**: 모든 스토리 텍스트, 주석, UI 라벨은 한국어
- **TypeScript**: 모든 새 파일은 `.ts`/`.tsx` 확장자
- **CSS Modules**: 컴포넌트별 스타일은 `ComponentName.module.css` 사용
- **Accessibility**: 고대비, `aria-label`, 키보드 내비게이션

## 아직 마이그레이션되지 않은 기능 (TODO)

- [ ] 데스크톱 StPageFlip 양면 펼침 (page-flip npm 설치됨)
- [ ] 오디오 플레이어 (챕터별 재생, 하이라이팅)
- [ ] 상단 바 상세 설정 (글자 크기, 다크모드, 효과음)
- [ ] 동화 라이브러리 화면 (3D 책장)
- [ ] 이어읽기/자동넘김 기능
- [ ] 키보드 좌우 화살표 페이지 넘김
- [ ] 읽기 진행률 바
- [ ] 전체화면 모드

## AI Skill Guidelines

`.agent/skills/*/SKILL.md` 참조:

- **storybook-page-management**: JSON 데이터 기반 챕터 추가/수정/삭제 규칙
- **child-friendly-ui**: 디자인 토큰, 애니메이션 패턴, 접근성 체크리스트
- **responsive-ebook-layout**: page-flip 설정, Flexbox 레이아웃, 스크롤 방지
- **audio-tts-integration**: 오디오 플레이어, 문장 하이라이팅, Web Speech API
- **story-content-generation**: 동화 작성 규칙, 이미지 프롬프트 구조
