---
name: audio-tts-integration
description: 오디오 플레이어 관리, TTS 연동, 문장 단위 하이라이팅 구현을 위한 가이드라인입니다.
---

# 🔊 Audio & TTS Integration Skill

## 개요

이 스킬은 동화책의 **오디오 플레이어 관리**와 **TTS(Text-to-Speech) 연동**, 그리고 **문장 단위 하이라이팅** 기능을 구현할 때 따라야 할 규칙을 정의합니다.

## 현재 오디오 시스템 구조

### HTML 요소

```html
<!-- 오디오 엘리먼트 (body 하단) -->
<audio id="story-audio" preload="metadata">
  <source src="audio/story_audio.mp3" type="audio/mpeg" />
</audio>
```

### 오디오 플레이어 UI 구성

```
┌──────────────────────────────────────┐
│  🎵 구연동화 오디오                    │
│  [▶] ━━━━━━━━━━━ 0:00 / 3:45       │
│  🔊 ───●─── (볼륨 슬라이더)           │
└──────────────────────────────────────┘
         [🎵] ← 토글 버튼 (Fixed)
```

### 핵심 DOM 요소 ID

| ID                    | 역할                           |
| --------------------- | ------------------------------ |
| `story-audio`         | `<audio>` 엘리먼트             |
| `audio-toggle`        | 패널 열기/닫기 토글 버튼       |
| `audio-panel`         | 오디오 컨트롤 패널             |
| `audio-play-btn`      | 재생/일시정지 버튼             |
| `audio-progress-bar`  | 프로그레스 바 (클릭 시크 가능) |
| `audio-progress-fill` | 프로그레스 채움 영역           |
| `audio-current-time`  | 현재 재생 시간 표시            |
| `audio-duration`      | 전체 길이 표시                 |
| `audio-volume`        | 볼륨 슬라이더 (range input)    |
| `audio-volume-btn`    | 음소거/음량 토글 버튼          |

## 오디오 파일 규칙

### 파일 위치 및 형식

- **위치**: `audio/` 폴더
- **형식**: MP3 (`audio/mpeg`) 권장
- **대체 형식**: WAV (`audio/wav`)를 사용할 수도 있으나, 파일 크기 고려 시 MP3 권장

### 파일 추가 시

```html
<audio id="story-audio" preload="metadata">
  <source src="audio/새파일명.mp3" type="audio/mpeg" />
  <!-- WAV 폴백 (선택사항) -->
  <source src="audio/새파일명.wav" type="audio/wav" />
</audio>
```

## 문장 하이라이팅 구현 가이드

### 현재 HTML 구조 (TTS 대비 완료)

각 문장은 이미 `<span class="sentence">` 태그로 분리되어 있습니다:

```html
<p class="story-body">
  <span class="sentence" data-sentence="1">첫 번째 문장.</span>
  <span class="sentence" data-sentence="2">두 번째 문장.</span>
  <span class="sentence" data-sentence="3">세 번째 문장.</span>
</p>
```

### 하이라이팅 CSS 패턴

```css
/* 문장 기본 스타일 */
.sentence {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  border-radius: 4px;
  padding: 2px 4px;
}

/* 현재 읽히고 있는 문장 */
.sentence.active {
  background-color: rgba(197, 179, 88, 0.25); /* 골드 하이라이트 */
  color: var(--dark-slate);
  font-weight: 700;
}

/* 이미 읽힌 문장 */
.sentence.read {
  opacity: 0.6;
}
```

### 하이라이팅 JavaScript 패턴

```javascript
/**
 * 문장 하이라이팅 매니저
 * 오디오 타임코드와 문장을 동기화합니다.
 */
class SentenceHighlighter {
  constructor(audioEl) {
    this.audio = audioEl;
    // 각 문장의 시작/끝 시간 (초 단위)
    // 실제 값은 오디오에 맞게 조정 필요
    this.timecodes = [
      // { page: 1, sentence: 1, start: 0, end: 8 },
      // { page: 1, sentence: 2, start: 8, end: 15 },
      // ...
    ];
  }

  // 현재 시간에 해당하는 문장 찾기
  getCurrentSentence(currentTime) {
    return this.timecodes.find(
      (tc) => currentTime >= tc.start && currentTime < tc.end,
    );
  }

  // 하이라이팅 업데이트
  update() {
    const current = this.getCurrentSentence(this.audio.currentTime);
    if (!current) return;

    // 모든 문장 초기화
    document.querySelectorAll(".sentence.active").forEach((el) => {
      el.classList.remove("active");
      el.classList.add("read");
    });

    // 현재 문장 하이라이팅
    const selector = `.page-story:nth-of-type(${current.page}) 
                       .sentence[data-sentence="${current.sentence}"]`;
    const el = document.querySelector(selector);
    if (el) el.classList.add("active");
  }
}
```

## Web Speech API (TTS) 연동 가이드

### 기본 구현 패턴

```javascript
/**
 * Web Speech API를 사용한 TTS 기능
 * 브라우저 내장 음성 합성 엔진을 활용합니다.
 */
function speakSentence(text) {
  if (!("speechSynthesis" in window)) {
    console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR"; // 한국어
  utterance.rate = 0.85; // 속도 (어린이용으로 약간 느리게)
  utterance.pitch = 1.1; // 음높이 (약간 높게)

  utterance.onstart = () => {
    // 해당 문장 하이라이팅 시작
  };

  utterance.onend = () => {
    // 다음 문장으로 이동
  };

  speechSynthesis.speak(utterance);
}
```

### TTS 모드 vs 오디오 모드

- **오디오 모드**: 사전 녹음된 구연동화 파일 재생 (현재 구현됨)
- **TTS 모드**: 브라우저 음성 합성으로 실시간 읽기 (확장 가능)
- 두 모드는 동시 사용하지 않도록 설계할 것

## 오디오 플레이어 수정 시 체크리스트

- [ ] 재생/일시정지 아이콘 토글이 정상 동작하는지 확인
- [ ] 프로그레스 바 클릭 시크가 정확한지 확인
- [ ] 볼륨 슬라이더와 음소거 버튼 동기화 확인
- [ ] `loadedmetadata` 이벤트로 전체 시간 표시 확인
- [ ] 패널 외부 클릭 시 패널이 닫히는지 확인
- [ ] 모바일에서 터치 조작이 원활한지 확인

## 주의사항

- ⚠️ iOS Safari에서는 사용자 인터랙션 없이 자동재생이 차단됩니다
- ⚠️ Web Speech API는 브라우저별 지원 범위가 다릅니다 (한국어 음성 미지원 가능)
- ⚠️ 오디오 파일 용량이 클 경우 `preload="metadata"` 로 초기 로딩 최소화
- ⚠️ 모든 주석은 한글로 작성합니다
