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

- 🔖 **양면 펼침(Open-Book) 레이아웃** — 실제 책을 펼친 것처럼 왼쪽에 캐릭터 삽화, 오른쪽에 동화 텍스트가 나란히 표시
- 📖 **책장 넘김 애니메이션** — StPageFlip 라이브러리를 활용한 자연스러운 페이지 플립 효과
- 🎵 **구연동화 오디오 플레이어** — 재생/일시정지, 프로그레스바, 볼륨 조절이 가능한 팝업형 오디오 플레이어
- 🗣️ **TTS 확장 구조** — 문장 단위 `<span>` 태그 분리로 Web Speech API 연동 준비 완료
- 📱 **풀페이지 반응형 디자인** — 태블릿, 모바일, 데스크탑 등 6단계 미디어 쿼리로 모든 화면 크기 최적화
- 👆 **어린이 친화적 UX** — 54px 이상의 터치 영역, 둥글고 큼직한 Jua 폰트, 바운스 애니메이션 피드백
- ⌨️ **키보드 네비게이션** — 좌/우 화살표 키로 페이지 넘기기 지원

---

## 📂 프로젝트 구조

```
story_book/
├── index.html              # 메인 HTML (동화 페이지 구조)
├── css/
│   └── style.css           # 전체 스타일시트 (양면 펼침 레이아웃 + 6단계 반응형)
├── js/
│   └── main.js             # StPageFlip 초기화 + 오디오 플레이어 로직
├── images/
│   ├── 1.png               # Chapter 1 삽화
│   ├── 2.png               # Chapter 2 삽화
│   ├── 3.png               # Chapter 3 삽화
│   ├── 4.png               # Chapter 4 삽화
│   └── 5.png               # Chapter 5 삽화
├── audio/
│   └── story_audio.mp3     # 구연동화 오디오 파일
├── .agent/
│   └── skills/             # AI 에이전트 스킬 가이드라인
│       ├── storybook-page-management/   # 페이지 추가/수정/삭제 규칙
│       ├── child-friendly-ui/           # 어린이 친화적 UI/UX 가이드
│       ├── audio-tts-integration/       # 오디오/TTS 연동 가이드
│       ├── responsive-ebook-layout/     # 반응형 레이아웃 가이드
│       └── story-content-generation/    # 동화 콘텐츠 생성 가이드
├── .gemini/
│   └── GEMINI.md           # AI 코딩 에이전트 시스템 프롬프트
└── README.md               # 프로젝트 문서
```

---

## 📚 동화 목차

| Chapter | 제목                     | 내용 요약                                                     |
| ------- | ------------------------ | ------------------------------------------------------------- |
| 1       | **안녕, 푸른 지구야!**   | 화성에서 온 로봇 비프가 푸른 지구의 바다에 처음 도착하는 장면 |
| 2       | **새로운 친구, 집게**    | 은색 게 로봇 집게를 만나 단짝 친구가 되는 이야기              |
| 3       | **반짝반짝 바다의 마법** | 파도에 젖어도 고장나지 않고 더 빛나는 비프의 LED 하트         |
| 4       | **보랏빛 노을 아래서**   | 노을이 지는 바다에서 친구와 함께하는 따뜻한 시간              |
| 5       | **꿈꾸는 별빛 항해**     | 소라 친구와 빛나는 배를 바라보며 미래의 모험을 꿈꾸는 비프    |

---

## 🛠️ 기술 스택

| 영역            | 기술                                                      | 설명                                                 |
| --------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| **구조**        | HTML5                                                     | 시맨틱 마크업, SEO 메타태그                          |
| **스타일**      | CSS3 (Vanilla)                                            | CSS Variables, Flexbox, 6단계 미디어쿼리, 애니메이션 |
| **로직**        | Vanilla JavaScript (ES6+)                                 | 모듈화 패턴, DOM 조작                                |
| **페이지 플립** | [StPageFlip](https://github.com/nicklev/page-flip) v2.0.7 | 양면 펼침 책장 넘김 효과 라이브러리                  |
| **폰트**        | Google Fonts (Jua, Playfair Display, Nanum Gothic)        | 어린이 친화적 + 프리미엄 타이포그래피                |
| **AI 에이전트** | Antigravity + GEMINI.md + Skills                          | AI 기반 바이브 코딩 개발 워크플로우                  |

---

## 🚀 실행 방법

### 로컬 실행

별도의 빌드 과정 없이 `index.html`을 브라우저에서 직접 열면 됩니다.

```bash
# 방법 1: 파일 직접 열기
open index.html

# 방법 2: Live Server 사용 (VS Code 확장)
# VS Code에서 index.html 우클릭 → "Open with Live Server"

# 방법 3: Python HTTP 서버
python -m http.server 8080
# → http://localhost:8080 접속
```

---

## 🎨 디자인 시스템

### 컬러 팔레트

| 변수명           | 색상      | 용도                      |
| ---------------- | --------- | ------------------------- |
| `--paper-cream`  | `#fdf8ec` | 텍스트 페이지 배경        |
| `--antique-gold` | `#c5b358` | 제목, 강조색, 골드 포인트 |
| `--dark-slate`   | `#2f4f4f` | 본문 텍스트               |
| `--bg-dark`      | `#1b1b2f` | 앱 배경 (다크 사이버펑크) |

### 폰트 체계

- **`--font-child`**: `"Jua"` — 어린이 타겟 본문 폰트 (둥글고 가독성 높음)
- **`--font-title`**: `"Playfair Display"` — 챕터 제목, 커버 타이틀

### 반응형 브레이크포인트

| 브레이크포인트      | 적용 대상                 |
| ------------------- | ------------------------- |
| `min-width: 1200px` | 대형 데스크톱             |
| `769px ~ 1199px`    | 태블릿 가로               |
| `max-width: 768px`  | 태블릿 세로 ~ 모바일 가로 |
| `max-width: 480px`  | 모바일 세로               |
| `max-width: 360px`  | 초소형 모바일             |
| `max-height: 500px` | 가로 모드 최적화          |

---

## 🤖 AI 에이전트 스킬

이 프로젝트는 AI 코딩 에이전트(Antigravity)와 협업하여 개발되었으며, `.agent/skills/` 폴더에 5개의 전문 스킬 가이드라인이 정의되어 있습니다:

| 스킬                        | 설명                                             |
| --------------------------- | ------------------------------------------------ |
| `storybook-page-management` | 스토리 페이지 추가/수정/삭제 시 일관된 구조 유지 |
| `child-friendly-ui`         | 5~9세 어린이를 위한 UI/UX 디자인 규칙            |
| `audio-tts-integration`     | 오디오 플레이어 및 TTS 연동 가이드               |
| `responsive-ebook-layout`   | StPageFlip 기반 반응형 레이아웃 최적화           |
| `story-content-generation`  | AI 동화 텍스트 및 삽화 프롬프트 생성             |

---

## 🔮 향후 확장 계획

- [ ] **Web Speech API TTS 연동** — 문장별 읽기 + 실시간 하이라이팅 기능
- [ ] **개인화 기능** — 사용자 이름 입력 시 주인공 이름 변경 + 배경색 커스터마이징
- [ ] **스토리 JSON 분리** — 다양한 동화 테마 추가 지원
- [ ] **효과음** — 페이지 넘김 소리, 배경 효과음 추가
- [ ] **다국어 지원** — 영어/일본어 번역 버전
- [ ] **Vercel/GitHub Pages 배포** — 온라인 퍼블리싱

---

## 📜 라이선스

이 프로젝트의 동화 텍스트 및 삽화는 AI로 생성되었습니다.

---

<p align="center">
  <strong>Powered by AI Vibe Coding ✨</strong>
</p>
