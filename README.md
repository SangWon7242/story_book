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

- 🔖 **펼친 책 레이아웃** — 왼쪽 페이지에 삽화, 오른쪽 페이지에 동화 텍스트가 표시되는 실제 동화책 느낌의 UI
- 📖 **책장 넘김 애니메이션** — StPageFlip 라이브러리를 활용한 자연스러운 페이지 플립 효과
- 🎵 **구연동화 오디오 플레이어** — 재생/일시정지, 프로그레스바, 볼륨 조절이 가능한 오디오 플레이어
- 🗣️ **TTS 확장 구조** — 문장 단위 `<span>` 태그 분리로 Web Speech API 연동 준비 완료
- 📱 **반응형 디자인** — 태블릿, 모바일, 데스크탑 모든 환경에서 최적화
- 👆 **어린이 친화적 UX** — 60px 이상의 터치 영역, 둥글고 큼직한 폰트, 직관적인 네비게이션

---

## 📂 프로젝트 구조

```
story_book/
├── index.html              # 메인 HTML (동화 페이지 구조)
├── css/
│   └── style.css           # 전체 스타일시트 (Open-Book 레이아웃)
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

| 영역            | 기술                                                      | 설명                                           |
| --------------- | --------------------------------------------------------- | ---------------------------------------------- |
| **구조**        | HTML5                                                     | 시맨틱 마크업, SEO 메타태그                    |
| **스타일**      | CSS3 (Vanilla)                                            | CSS Variables, Flexbox, 미디어쿼리, 애니메이션 |
| **로직**        | Vanilla JavaScript (ES6+)                                 | 모듈화 패턴, DOM 조작                          |
| **페이지 플립** | [StPageFlip](https://github.com/nicklev/page-flip) v2.0.7 | 책장 넘김 효과 라이브러리                      |
| **폰트**        | Google Fonts (Jua, Playfair Display, Nanum Gothic)        | 어린이 친화적 + 프리미엄 타이포그래피          |

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

---

## 🔮 향후 확장 계획

- [ ] **Web Speech API TTS 연동** — 문장별 읽기 + 하이라이팅 기능
- [ ] **스토리 JSON 분리** — 다양한 동화 테마 추가 지원
- [ ] **터치 스와이프** — 모바일에서 스와이프로 페이지 넘기기
- [ ] **다국어 지원** — 영어/일본어 번역 버전

---

## 📜 라이선스

이 프로젝트의 동화 텍스트 및 삽화는 AI로 생성되었습니다.

---

<p align="center">
  <strong>Powered by AI Vibe Coding ✨</strong>
</p>
