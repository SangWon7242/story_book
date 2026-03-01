# 📖 비프의 푸른 바다 모험

> 화성에서 온 로봇 비프의 신비로운 지구 바다 탐험 — AI 인터랙티브 동화책

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

---

## 🌊 프로젝트 소개

**비프의 푸른 바다 모험**은 5~9세 어린이를 대상으로 한 **사이버펑크 스타일의 인터랙티브 동화책** 웹 애플리케이션입니다.

화성에서 온 구식 로봇 **비프**가 지구의 바다에서 새로운 친구를 만나고, 아름다운 자연을 경험하며 성장하는 이야기를 담고 있습니다.

### ✨ 주요 특징

**레이아웃 & 네비게이션**

- 🔖 **양면 펼침(Open-Book) 레이아웃** — 실제 책을 펼친 것처럼 왼쪽에 캐릭터 삽화, 오른쪽에 동화 텍스트가 나란히 표시
- 📖 **책장 넘김 애니메이션** — StPageFlip 라이브러리를 활용한 자연스러운 페이지 플립 효과
- 📱 **풀페이지 반응형 디자인** — 데스크톱(양면 펼침) / 태블릿·모바일(카드 슬라이드) 이중 렌더링, 6단계 미디어쿼리
- ⌨️ **키보드 네비게이션** — 좌/우 화살표 키로 페이지 넘기기, 스와이프 지원

**오디오 & TTS**

- 🎵 **구연동화 오디오 플레이어** — 재생/일시정지, 프로그레스바, 볼륨 조절이 가능한 팝업형 오디오 플레이어
- 🗣️ **TTS 문장 하이라이트** — 오디오 재생 시 현재 읽고 있는 문장을 실시간으로 강조 표시
- 🎧 **MP3 오디오 최적화** — FFmpeg를 활용해 128kbps MP3로 변환, 빠른 로딩 속도 제공

**독자 편의 기능**

- 🌙 **다크/라이트 모드** — 한 번의 클릭으로 전체 테마 전환, 설정 localStorage 저장
- 🔤 **글자 크기 조절** — 작게/보통/크게 3단계 조절, 설정 localStorage 저장
- ▶️ **자동 넘김(오토플레이)** — 3단계 속도 조절(보통/빠름/느림), 오디오 재생 시 TTS 연동, 직관적인 색상 전환 버튼(보라=시작 / 빨강=정지)
- 🔖 **읽기 진행률 저장** — 마지막으로 읽은 페이지 자동 저장, 재방문 시 이어읽기 토스트 제공
- 🔊 **페이지 전환 효과음** — Web Audio API로 생성한 스와이프·클릭 효과음, ON/OFF 토글
- 🔄 **처음으로 버튼** — 동화 마지막 페이지에서 첫 표지로 즉시 이동
- 📚 **동화 라이브러리** — 상단 목록 버튼으로 동화 선택 화면 전환 (현재 1편 + 준비중 2편)
- 🖥️ **전체화면 모드** — 몰입감 있는 독서를 위한 브라우저 전체화면 전환

**아키텍처 & 확장성**

- 📦 **JSON 기반 동적 콘텐츠 로딩** — 스토리 데이터(텍스트, 이미지, TTS 타임스탬프)를 `data/story1.json`에 분리하여 HTML과 콘텐츠를 독립적으로 관리
- ⚙️ **동적 HTML 렌더링** — `buildStoryHTML()` 함수가 JSON 데이터를 파싱하여 책 페이지를 자동 생성
- 🌐 **PWA 기반 오프라인 지원** — Service Worker(`sw.js`) 등록으로 오프라인 캐싱 준비

**어린이 친화적 UX**

- 👆 54px 이상의 터치 영역, 둥글고 큼직한 Jua 폰트, 바운스 애니메이션 피드백
- ♿ 고대비 색상, `prefers-reduced-motion` 지원

---

## 📂 프로젝트 구조

```
story_book/
├── index.html              # 메인 HTML (UI 컴포넌트 + 동적 페이지 컨테이너)
├── css/
│   └── style.css           # 전체 스타일시트 (양면 펼침 레이아웃 + 다크모드 + 6단계 반응형)
├── js/
│   └── main.js             # 전체 로직 (JSON 로딩, 동적 렌더링, StPageFlip, 오디오, TTS 등)
├── data/
│   └── story1.json         # 📦 스토리 데이터 (챕터별 텍스트, 이미지 경로, TTS 타임스탬프)
├── images/
│   ├── 1.png               # Chapter 1 삽화
│   ├── 2.png               # Chapter 2 삽화
│   ├── 3.png               # Chapter 3 삽화
│   ├── 4.png               # Chapter 4 삽화
│   ├── 5.png               # Chapter 5 삽화
│   └── 6.png               # Chapter 6 삽화
├── audio/
│   └── story_audio.mp3     # 구연동화 오디오 파일 (MP3, 128kbps)
├── sw.js                   # Service Worker (PWA 오프라인 캐싱)
├── .agent/
│   └── skills/             # AI 에이전트 스킬 가이드라인
│       ├── storybook-page-management/   # 페이지 추가/수정/삭제 규칙
│       ├── child-friendly-ui/           # 어린이 친화적 UI/UX 가이드
│       ├── audio-tts-integration/       # 오디오/TTS 연동 가이드
│       ├── responsive-ebook-layout/     # 반응형 레이아웃 가이드
│       └── story-content-generation/    # 동화 콘텐츠 생성 가이드
├── CLAUDE.md               # Claude Code 에이전트 프로젝트 가이드라인
├── .gemini/
│   └── GEMINI.md           # Gemini AI 코딩 에이전트 시스템 프롬프트
└── README.md               # 프로젝트 문서
```

---

## 📦 데이터 구조 (`data/story1.json`)

스토리 콘텐츠는 JSON 파일로 분리되어 있으며, 다음과 같은 구조를 갖습니다:

```json
{
  "title": "비프의 푸른 바다 모험",
  "subtitle": "화성에서 온 로봇, 비프의 신비로운 지구 탐험기",
  "audio": "audio/story_audio.mp3",
  "chapters": [
    {
      "chapterNum": 1,
      "title": "안녕, 푸른 지구야!",
      "image": "images/1.png",
      "imageAlt": "비프가 푸른 지구의 바다에 도착한 장면",
      "sentences": [
        { "time": 0, "text": "먼지 폴폴 날리는 화성에서 온..." },
        { "time": 5.5, "text": "비프의 가슴에서는 무지갯빛..." }
      ]
    }
  ]
}
```

> **새로운 동화를 추가하려면** `data/story2.json`을 만들고 같은 구조로 작성하면 됩니다. HTML 수정 없이 콘텐츠만 교체할 수 있습니다.

---

## 📚 동화 목차

| Chapter | 제목                     | 내용 요약                                                      |
| ------- | ------------------------ | -------------------------------------------------------------- |
| 1       | **안녕, 푸른 지구야!**   | 화성에서 온 로봇 비프가 푸른 지구의 바다에 처음 도착하는 장면  |
| 2       | **새로운 친구, 집게**    | 은색 게 로봇 집게를 만나 단짝 친구가 되는 이야기               |
| 3       | **반짝반짝 바다의 마법** | 파도에 젖어도 고장나지 않고 더 빛나는 비프의 LED 하트          |
| 4       | **보랏빛 노을 아래서**   | 노을이 지는 바다에서 친구와 함께하는 따뜻한 시간               |
| 5       | **꿈꾸는 별빛 항해**     | 소라 친구와 빛나는 배를 바라보며 미래의 모험을 꿈꾸는 비프     |
| 6       | **영원한 바다 친구들**   | 세 친구가 나란히 밤바다를 바라보며 우정을 나누는 따뜻한 마무리 |

---

## 🛠️ 기술 스택

| 영역            | 기술                                                      | 설명                                                          |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| **구조**        | HTML5                                                     | 시맨틱 마크업, SEO 메타태그                                   |
| **스타일**      | CSS3 (Vanilla)                                            | CSS Variables, Flexbox, 6단계 미디어쿼리, 애니메이션          |
| **로직**        | Vanilla JavaScript (ES6+)                                 | 모듈화 패턴, DOM 조작, Fetch API, localStorage, Web Audio API |
| **데이터**      | JSON                                                      | 스토리 콘텐츠 분리, 동적 로딩 (`data/story1.json`)            |
| **페이지 플립** | [StPageFlip](https://github.com/nicklev/page-flip) v2.0.7 | 양면 펼침 책장 넘김 효과 라이브러리                           |
| **오디오**      | Web Audio API + MP3                                       | 구연동화 재생 + 효과음 생성 (화이트노이즈 스와이프, 팝 클릭)  |
| **오디오 변환** | FFmpeg                                                    | WAV → MP3 (128kbps) 변환, 파일 크기 최적화                    |
| **폰트**        | Google Fonts (Jua, Playfair Display, Nanum Gothic)        | 어린이 친화적 + 프리미엄 타이포그래피                         |
| **PWA**         | Service Worker                                            | 오프라인 캐싱 및 앱 설치 지원 준비                            |
| **AI 에이전트** | Claude Code + GEMINI.md + Skills                          | AI 기반 바이브 코딩 개발 워크플로우                           |

---

## 🚀 실행 방법

> **⚠️ 중요**: JSON 데이터를 `fetch()`로 동적 로딩하기 때문에, `file://` 프로토콜로는 CORS 정책에 의해 정상 동작하지 않습니다. 반드시 **로컬 서버**를 사용해주세요.

```bash
# 방법 1: Live Server 사용 (VS Code 확장) — 권장
# VS Code에서 index.html 우클릭 → "Open with Live Server"

# 방법 2: Python HTTP 서버
python -m http.server 8080
# → http://localhost:8080 접속

# 방법 3: Node.js http-server
npx http-server -p 8080
# → http://localhost:8080 접속
```

---

## 🎨 디자인 시스템

### 컬러 팔레트

| 변수명           | 라이트 모드 | 다크 모드 | 용도                      |
| ---------------- | ----------- | --------- | ------------------------- |
| `--paper-cream`  | `#fdf8ec`   | `#1e1e2e` | 텍스트 페이지 배경        |
| `--antique-gold` | `#c5b358`   | (고정)    | 제목, 강조색, 골드 포인트 |
| `--dark-slate`   | `#2f4f4f`   | `#e0dcc8` | 본문 텍스트               |
| `--text-story`   | `#3a3a3a`   | `#d4d0c0` | 동화 본문 색상            |
| `--bg-dark`      | `#1b1b2f`   | `#0e0e1a` | 앱 배경 (다크 사이버펑크) |

### 폰트 체계

- **`--font-child`**: `"Jua"` — 어린이 타겟 본문 폰트 (둥글고 가독성 높음)
- **`--font-title`**: `"Playfair Display"` — 챕터 제목, 커버 타이틀
- **`--font-size-adjust`**: CSS 변수로 글자 크기 3단계 조절 (0.85 / 1 / 1.2배)

### 반응형 브레이크포인트

| 브레이크포인트      | 렌더링 방식             | 적용 대상            |
| ------------------- | ----------------------- | -------------------- |
| `min-width: 1200px` | StPageFlip 양면 펼침    | 대형 데스크톱        |
| `769px ~ 1199px`    | StPageFlip 양면 펼침    | 태블릿 가로          |
| `max-width: 768px`  | 풀스크린 카드 슬라이드  | 태블릿 세로 ~ 모바일 |
| `max-width: 480px`  | 풀스크린 카드 슬라이드  | 모바일 세로          |
| `max-width: 360px`  | 풀스크린 카드 슬라이드  | 초소형 모바일        |
| `max-height: 500px` | 가로 모드 레이아웃 조정 | 가로 모드 최적화     |

---

## 🤖 AI 에이전트 스킬

이 프로젝트는 Claude Code 및 Gemini AI 코딩 에이전트와 협업하여 개발되었으며, `.agent/skills/` 폴더에 5개의 전문 스킬 가이드라인이 정의되어 있습니다:

| 스킬                        | 설명                                             |
| --------------------------- | ------------------------------------------------ |
| `storybook-page-management` | 스토리 페이지 추가/수정/삭제 시 일관된 구조 유지 |
| `child-friendly-ui`         | 5~9세 어린이를 위한 UI/UX 디자인 규칙            |
| `audio-tts-integration`     | 오디오 플레이어 및 TTS 연동 가이드               |
| `responsive-ebook-layout`   | StPageFlip 기반 반응형 레이아웃 최적화           |
| `story-content-generation`  | AI 동화 텍스트 및 삽화 프롬프트 생성             |

---

## 🔮 향후 확장 계획

- [x] **TTS 문장 하이라이트** — 오디오 재생 시 문장별 실시간 강조
- [x] **다크/라이트 모드** — 테마 전환 + localStorage 저장
- [x] **글자 크기 조절** — 3단계 조절 + localStorage 저장
- [x] **자동 넘김(오토플레이)** — 타이머 기반 자동 페이지 전환, 3단계 속도 조절
- [x] **읽기 진행률 저장** — localStorage + 이어읽기 토스트
- [x] **페이지 전환 효과음** — Web Audio API (외부 파일 불필요)
- [x] **동화 라이브러리 화면** — 목록 UI + 동화 선택 전환
- [x] **스토리 JSON 분리** — 콘텐츠/구조 완전 분리, 동적 HTML 렌더링
- [x] **오디오 MP3 최적화** — FFmpeg으로 WAV → MP3 변환 (128kbps)
- [x] **전체화면 모드** — Fullscreen API로 몰입감 있는 독서 경험
- [x] **Service Worker(PWA)** — 오프라인 캐싱 인프라 구축
- [x] **GitHub Pages 배포** — 온라인 퍼블리싱
- [ ] **터치 파티클 이펙트** — 클릭/터치 시 마법 파티클 애니메이션
- [ ] **스플래시 스크린** — 앱 로딩 중 귀여운 애니메이션 표시
- [ ] **PWA 완전 구현** — manifest.json + 앱 설치 프롬프트
- [ ] **개인화 기능** — 사용자 이름 입력 시 주인공 이름 변경
- [ ] **다국어 지원** — 영어/일본어 번역 버전

---

## 📜 라이선스

이 프로젝트의 동화 텍스트 및 삽화는 AI로 생성되었습니다.

---

<p align="center">
  <strong>Powered by AI Vibe Coding ✨</strong>
</p>
