---
name: story-content-generation
description: AI 동화 텍스트 작성과 이미지 생성 프롬프트를 위한 가이드라인입니다.
---

# ✍️ Story Content Generation Skill

## 개요

이 스킬은 AI를 활용하여 **동화 텍스트를 작성**하고 **삽화 생성을 위한 이미지 프롬프트**를 만들 때 따라야 할 규칙과 패턴을 제공합니다.

## 동화 텍스트 작성 가이드라인

### 타겟 독자

- **연령**: 5~9세 어린이
- **언어**: 한국어
- **읽기 수준**: 초등학교 1~2학년

### 문장 작성 규칙

#### 1. 길이

- 한 문장: **15~30자** 권장
- 한 페이지: **3~5개 문장** (너무 많으면 아이가 지루해함)
- 전체 스토리: **5~10개 챕터** 권장

#### 2. 어휘

- 쉬운 단어 사용 (초등 1학년 수준)
- 어려운 단어가 필요할 경우 쉬운 설명을 곁들이기
- 외래어는 최소한으로 사용

#### 3. 의성어/의태어 활용 (필수!)

아이들의 흥미를 끌기 위해 의성어와 의태어를 적극 사용합니다.

| 분류   | 예시                                                 |
| ------ | ---------------------------------------------------- |
| 소리   | 쏴아아, 철컥철컥, 찰싹찰싹, 윙윙, 치익치익, 보글보글 |
| 움직임 | 쪼르르, 꼬물꼬물, 둥실둥실, 쌩쌩, 뽀글뽀글           |
| 느낌   | 반짝반짝, 보들보들, 알록달록, 폴폴, 깜빡깜빡         |

#### 4. 서술 패턴

- **직접 화법** 활용하여 캐릭터에 생명력 부여
- **감각적 묘사** (시각, 청각, 촉각) 적극 활용
- **감정 표현** 으로 공감대 형성
- **짧은 대사** 로 리듬감 부여

### 좋은 동화 문장 예시 (현재 프로젝트 기반)

```
✅ "먼지 폴폴 날리는 화성에서 온 구식 로봇 비프가 드디어 푸른 지구에 도착했어요!"
   → 의태어(폴폴), 감각적 묘사, 감탄부호로 활기

✅ "비프의 가슴에서는 무지갯빛 LED 하트가 치익치익 소리를 내며 뜨겁게 빛나고 있었죠."
   → 의성어(치익치익), 시각+청각 묘사

✅ "와아, 처음 마주한 바다는 도시의 네온사인보다 더 눈부시게 일렁였답니다."
   → 감탄사(와아), 비유법, 친근한 종결어미(~답니다)
```

### 나쁜 동화 문장 예시

```
❌ "비프 로봇은 화성에서 지구로 이동하여 해양 환경을 관찰하기 시작했습니다."
   → 딱딱한 문어체, 의성어/의태어 없음, 감정 없음

❌ "바다의 파장이 로봇의 센서에 감지되었다."
   → 전문 용어, 객관적 서술, 아이가 이해하기 어려움
```

## 스토리 구조 템플릿

### 기본 스토리 아크 (5챕터 기준)

```
📖 Chapter 1: 도입 (새로운 세계 도착)
   → 주인공 소개, 배경 설명, 호기심 유발

📖 Chapter 2: 만남 (새 친구 등장)
   → 새 캐릭터 소개, 우정의 시작

📖 Chapter 3: 모험/갈등 (도전과 위기)
   → 예상치 못한 사건, 긴장감 조성

📖 Chapter 4: 성장/해결 (극복과 깨달음)
   → 위기 극복, 교훈 전달

📖 Chapter 5: 결말 (꿈과 희망)
   → 따뜻한 마무리, 미래에 대한 기대
```

### 교육적 메시지 삽입 방법

- 직접적인 훈훈한 교훈보다는 **스토리 속에 자연스럽게 녹여내기**
- 현재 프로젝트 테마: **새로운 만남과 우정**
- 예: 다름을 두려워하지 않기, 친구를 사귀는 용기, 새로운 경험의 즐거움

## 삽화 이미지 생성 프롬프트

### 프롬프트 구조

이미지 생성 AI (DALL-E, Midjourney, Stable Diffusion 등)에 전달할 프롬프트의 기본 구조:

```
[스타일] + [장면 묘사] + [분위기/색감] + [기술적 지시]
```

### 현재 프로젝트 스타일 키워드

```
스타일: cyberpunk fairy tale illustration, cute robot character,
       digital art, children's book illustration
색감: neon lights, warm glow, deep blue ocean, purple sunset,
     holographic effects, LED lights
분위기: magical, wonder, friendship, adventure, warm
기술적: high quality, detailed, consistent character design,
       square format (1024x1024)
```

### 프롬프트 예시 (현재 프로젝트 기반)

#### Chapter 1 삽화

```
A cute vintage robot named Beep arriving at Earth's blue ocean for the first time.
The robot has a glowing rainbow LED heart on its chest.
Cyberpunk fairy tale style illustration with neon lights reflecting on the water.
Warm, magical atmosphere. Digital art, children's book illustration, high quality.
Square format, soft colors with vibrant neon accents.
```

#### Chapter 2 삽화

```
A cute vintage robot (Beep) meeting a small silver crab robot (Jipge) on a sandy beach.
The crab robot waves hello. Holographic bubbles float above the ocean.
Cyberpunk fairy tale style, neon-lit ocean backdrop.
Friendly and cheerful mood. Children's book illustration, digital art, high quality.
```

### 일관성 유지 규칙

새 삽화를 생성할 때 반드시 다음 일관성을 유지합니다:

1. **캐릭터 일관성**
   - 비프: 구식 로봇, 가슴에 무지갯빛 LED 하트
   - 집게: 은색 소형 게 로봇

2. **환경 일관성**
   - 배경: 사이버펑크 스타일의 바다/해변
   - 네온 조명 효과 항상 포함
   - 따뜻한 톤의 마법적 분위기

3. **기술적 일관성**
   - 이미지 크기: 1024x1024px 이상
   - 파일 형식: PNG
   - 파일명: 번호.png (1.png, 2.png, ...)

## 새 스토리 기획 워크플로우

### Step 1: 컨셉 설정

```
- 테마: (예: 새로운 만남과 우정)
- 주인공: (예: 로봇 비프)
- 배경: (예: 사이버펑크 스타일의 바다)
- 교육 메시지: (예: 다름을 받아들이는 것)
```

### Step 2: 챕터별 플롯 작성

```
각 챕터별로:
- 제목 (Chapter N: 한글 제목)
- 핵심 사건 (한 줄 요약)
- 삽화 장면 묘사
- 3~5개 문장 본문
```

### Step 3: 이미지 프롬프트 생성

```
각 챕터별로:
- 장면 설명 (영어 프롬프트)
- 스타일 키워드 통일
- 캐릭터 묘사 일관성 확인
```

### Step 4: HTML 구조화

```
- storybook-page-management 스킬 참조
- 문장을 <span class="sentence"> 태그로 분리
- data-sentence 속성 부여
```

## 주의사항

- ⚠️ 폭력적이거나 무서운 내용은 절대 포함하지 않습니다
- ⚠️ 모든 캐릭터는 긍정적이고 친근한 성격으로 묘사합니다
- ⚠️ 어두운 장면이라도 따뜻한 빛(네온, 별빛)을 반드시 포함합니다
- ⚠️ 성 고정관념이나 편견을 조장하는 표현을 피합니다
- ⚠️ 모든 주석은 한글로 작성합니다
