---
name: audio-tts-integration
description: Next.js 기반 오디오 플레이어 훅, TTS 연동, 문장 단위 하이라이팅 구현 가이드라인입니다.
---

# 🔊 Audio & TTS Integration Skill (Next.js)

## 개요

이 스킬은 Next.js App Router 환경에서 동화책의 **오디오 플레이어 관리**와 **TTS 연동**, **문장 단위 하이라이팅**을 구현할 때 따라야 할 규칙을 정의합니다.

## 현재 오디오 시스템 구조

### 핵심 파일

| 파일                                                | 역할                                           |
| --------------------------------------------------- | ---------------------------------------------- |
| `src/hooks/useAudioPlayer.ts`                       | 커스텀 훅 — HTMLAudioElement 관리, 챕터별 재생 |
| `src/components/AudioPlayer/AudioPlayer.tsx`        | UI 컴포넌트 — 토글, 패널, 프로그레스바, 볼륨   |
| `src/components/AudioPlayer/AudioPlayer.module.css` | CSS Modules 스타일                             |

### useAudioPlayer 훅 API

```typescript
const audio = useAudioPlayer(story.chapters);

// 반환값
audio.isPlaying      // boolean — 재생 중 여부
audio.currentChapter // number — 현재 재생 중인 챕터 인덱스 (-1이면 없음)
audio.currentTime    // number — 현재 재생 위치 (초)
audio.duration       // number — 전체 길이 (초)
audio.progress       // number — 0~1 진행률
audio.volume         // number — 0~1 볼륨

// 메서드
audio.toggle()                  // 재생/일시정지 토글
audio.seekTo(time: number)      // 특정 시간으로 이동
audio.setVolume(vol: number)    // 볼륨 변경
audio.switchChapter(idx: number) // 챕터 전환 (-1이면 정지)
```

### 오디오 플레이어 UI (AudioPlayer 컴포넌트)

```
┌──────────────────────────────────────┐
│  🎵 구연동화 오디오                    │
│  [▶] ━━━━━━━━━━━ 0:00 / 3:45       │
│  🔊 ───●─── (볼륨 슬라이더)           │
└──────────────────────────────────────┘
         [🎵] ← 토글 버튼 (Fixed)
```

### Props 인터페이스

```typescript
interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
}
```

## 오디오 파일 규칙

### 파일 위치 및 형식

- **위치**: `public/audio/` 폴더
- **형식**: MP3 (`audio/mpeg`) 권장
- **명명**: `chapterN.mp3` (chapter1.mp3, chapter2.mp3, ...)
- **JSON 참조**: `story1.json`의 `chapters[].audio` 필드

### 챕터별 오디오 데이터 구조

```json
{
  "chapters": [
    {
      "chapterNum": 1,
      "audio": "audio/chapter1.mp3",
      ...
    }
  ]
}
```

## 문장 하이라이팅 구현 가이드

### 현재 구현 방식 (StoryViewer 내장)

`useMemo`로 오디오 재생 시간 기반 활성 문장 인덱스를 계산합니다:

```typescript
const activeSentenceIdx = useMemo(() => {
  if (!audio.isPlaying || audio.currentChapter < 0) return -1;
  const ch = story.chapters[audio.currentChapter];
  if (!ch || !audio.duration) return -1;
  const count = ch.sentences.length;
  const idx = Math.floor((audio.currentTime / audio.duration) * count);
  return Math.min(idx, count - 1);
}, [
  audio.isPlaying,
  audio.currentChapter,
  audio.currentTime,
  audio.duration,
  story.chapters,
]);
```

### 하이라이팅 CSS (CSS Modules)

```css
.sentence {
  display: block;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.sentence.active {
  background-color: rgba(197, 179, 88, 0.2);
  color: var(--dark-slate);
  font-weight: 700;
}

.sentence.read {
  opacity: 0.55;
}
```

### JSX에서 클래스 적용

```tsx
{
  chapter.sentences.map((s, i) => {
    const isActive =
      chapterIdx === audio.currentChapter && i === activeSentenceIdx;
    const isRead =
      chapterIdx === audio.currentChapter &&
      audio.isPlaying &&
      i < activeSentenceIdx;
    return (
      <span
        key={i}
        className={`${styles.sentence} ${isActive ? styles.active : ""} ${isRead ? styles.read : ""}`}
      >
        {s.text}
      </span>
    );
  });
}
```

## 페이지 전환 시 오디오 챕터 자동 전환

```typescript
useEffect(() => {
  const chIdx =
    currentPage >= 1 && currentPage <= story.chapters.length
      ? currentPage - 1
      : -1;
  audio.switchChapter(chIdx);
}, [currentPage]);
```

## 오디오 플레이어 수정 시 체크리스트

- [ ] `"use client"` 지시어 확인 (훅과 컴포넌트 모두)
- [ ] 재생/일시정지 아이콘 토글이 정상 동작하는지 확인
- [ ] 프로그레스 바 클릭 시크가 정확한지 확인
- [ ] 볼륨 슬라이더와 음소거 버튼 동기화 확인
- [ ] 챕터 전환 시 이전 오디오가 정지되는지 확인
- [ ] CSS Modules 클래스명이 정확한지 확인
- [ ] 모바일에서 터치 조작이 원활한지 확인

## 주의사항

- ⚠️ iOS Safari에서는 사용자 인터랙션 없이 자동재생이 차단됩니다
- ⚠️ `useAudioPlayer` 훅은 `"use client"` 컴포넌트에서만 사용 가능
- ⚠️ `HTMLAudioElement`는 SSR에서 사용 불가 — `useRef` + `useEffect` 내에서만 생성
- ⚠️ 오디오 파일은 `public/` 폴더에, 경로는 `/audio/chapterN.mp3` 형식
- ⚠️ 모든 주석은 한글로 작성합니다
