/* ============================================
   비프의 푸른 바다 모험 - Main Application JS
   데스크톱: StPageFlip 양면 펼침
   태블릿/모바일: 풀스크린 카드 뷰 (이미지 상단 + 텍스트 하단)
   + 7가지 기능: TTS 하이라이트, 다크모드, 글자크기,
     자동넘김, 읽기 진행률, 효과음, 라이브러리
   ============================================ */

/* 모바일/태블릿 전환 기준 (px) */
const MOBILE_BREAKPOINT = 768;
const TOTAL_STORIES = 6;

/* ============================================
   기능 1: TTS 문장 하이라이트 타임스탬프
   각 챕터별 문장 시작 시간(초) — 오디오 1개에 6챕터
   ============================================ */
const CHAPTER_TIMESTAMPS = [
  // Chapter 1 (4 sentences)
  { start: 0, sentences: [0, 5.5, 12, 18] },
  // Chapter 2 (5 sentences)
  { start: 25, sentences: [25, 31, 37, 42, 50] },
  // Chapter 3 (5 sentences)
  { start: 58, sentences: [58, 64, 69, 77, 85] },
  // Chapter 4 (5 sentences)
  { start: 92, sentences: [92, 99, 106, 111, 116] },
  // Chapter 5 (4 sentences)
  { start: 124, sentences: [124, 132, 139, 148] },
  // Chapter 6 (5 sentences) — 오디오 총 길이 ~172초에 맞춰 조정
  { start: 155, sentences: [155, 160, 163, 167, 170] },
];

/* 하이라이트 타이밍 오프셋 (초) — 양수 값이면 하이라이트가 늦게 표시됨 */
const TTS_HIGHLIGHT_OFFSET = 3.0;

/* ============================================
   전역 상태 & 유틸리티
   ============================================ */
let appState = {
  isMobile: false,
  currentPage: 0, // 통합 페이지 인덱스 (0=표지, 1~6=챕터, 7=뒷표지)
  autoplayActive: false,
  autoplayTimer: null,
  sfxEnabled: true,
  audioCtx: null,
  isFlipping: false, // 페이지 넘김 애니메이션 진행 중 여부
  flipDebounceTimer: null, // 페이지 전환 디바운스 타이머
  lastHighlightChapter: -1, // 마지막으로 하이라이트된 챕터 (시크 감지용)
};

/* 페이지 변경 콜백 — 각 모드에서 등록 */
let onPageChange = null;

/* 현재 챕터 번호 반환 (0-based, 표지=-1, 뒷표지=-1) */
function getCurrentChapter() {
  if (appState.currentPage >= 1 && appState.currentPage <= TOTAL_STORIES) {
    return appState.currentPage - 1;
  }
  return -1;
}

/* ============================================
   DOMContentLoaded
   ============================================ */
document.addEventListener("DOMContentLoaded", () => {
  appState.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  if (appState.isMobile) {
    initMobileBook();
  } else {
    initDesktopBook();
  }

  initAudioPlayer();
  initThemeToggle();
  initFontSize();
  initAutoplay();
  initRestartBtn();
  initReadingProgress();
  initSfxToggle();
  initLibrary();
});

/* ============================================
   데스크톱: StPageFlip 양면 펼침 모드
   ============================================ */
function initDesktopBook() {
  const bookEl = document.getElementById("book");
  const bookStage = document.querySelector(".book-stage");
  if (!bookEl || !bookStage) return;

  const stageRect = bookStage.getBoundingClientRect();
  const availW = stageRect.width;
  const availH = stageRect.height;

  const pageRatio = 3 / 4;
  let pageH = Math.floor(availH * 0.98);
  let pageW = Math.floor(pageH * pageRatio);

  if (pageW * 2 > availW * 0.98) {
    pageW = Math.floor((availW * 0.98) / 2);
    pageH = Math.floor(pageW / pageRatio);
  }

  pageW = Math.max(pageW, 160);
  pageH = Math.max(pageH, 220);

  const pageFlip = new St.PageFlip(bookEl, {
    width: pageW,
    height: pageH,
    size: "fixed",
    showCover: true,
    maxShadowOpacity: 0.5,
    mobileScrollSupport: false,
    flippingTime: 800,
    usePortrait: false,
    startZIndex: 0,
    autoSize: false,
    drawShadow: true,
  });

  const pages = document.querySelectorAll(".page");
  pageFlip.loadFromHTML(pages);

  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  const pageIndicator = document.getElementById("page-indicator");

  /* 데스크톱 pageFlip 인덱스 → 통합 페이지 인덱스 변환 */
  function flipIndexToPage(idx) {
    if (idx === 0) return 0; // 표지
    const total = pageFlip.getPageCount();
    if (idx >= total - 1) return TOTAL_STORIES + 1; // 뒷표지
    return Math.ceil(idx / 2); // 챕터 1~6
  }

  const updateIndicator = () => {
    const current = pageFlip.getCurrentPageIndex();
    appState.currentPage = flipIndexToPage(current);
    appState.isFlipping = false; // 애니메이션 완료

    if (appState.currentPage === 0) {
      pageIndicator.textContent = "표지";
    } else if (appState.currentPage > TOTAL_STORIES) {
      pageIndicator.textContent = "끝";
    } else {
      pageIndicator.textContent = `${appState.currentPage} / ${TOTAL_STORIES}`;
    }

    updateRestartBtn(appState.currentPage);
    saveLastPage();
    playSfx("flip");
  };

  prevBtn.addEventListener("click", () => {
    pageFlip.flipPrev();
    playSfx("click");
  });
  nextBtn.addEventListener("click", () => {
    pageFlip.flipNext();
    playSfx("click");
  });
  pageFlip.on("flip", updateIndicator);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") pageFlip.flipPrev();
    else if (e.key === "ArrowRight") pageFlip.flipNext();
  });

  updateIndicator();
  window._pageFlip = pageFlip;

  /* 통합 페이지 전환 콜백 (자동넘김/TTS에서 사용) */
  /* 디바운스를 적용하여 연속적인 페이지 전환 요청 시 애니메이션 충돌 방지 */
  onPageChange = (targetPage) => {
    // targetPage: 0=표지, 1~6=챕터, 7=뒷표지
    // 이미 해당 페이지에 있으면 무시
    if (appState.currentPage === targetPage) return;

    // 즉시 currentPage를 업데이트하여 중복 전환 요청 방지
    appState.currentPage = targetPage;

    // 페이지 인디케이터도 즉시 업데이트
    if (targetPage === 0) {
      pageIndicator.textContent = "표지";
    } else if (targetPage > TOTAL_STORIES) {
      pageIndicator.textContent = "끝";
    } else {
      pageIndicator.textContent = `${targetPage} / ${TOTAL_STORIES}`;
    }

    // 디바운스: 빠른 연속 전환 방지 (300ms)
    if (appState.flipDebounceTimer) {
      clearTimeout(appState.flipDebounceTimer);
    }

    appState.flipDebounceTimer = setTimeout(() => {
      let flipIdx;
      if (targetPage === 0) flipIdx = 0;
      else if (targetPage > TOTAL_STORIES)
        flipIdx = pageFlip.getPageCount() - 1;
      else flipIdx = (targetPage - 1) * 2 + 1; // 챕터 N → illustration page

      appState.isFlipping = true;
      pageFlip.flip(flipIdx);
      appState.flipDebounceTimer = null;
    }, 300);
  };
}

/* ============================================
   태블릿/모바일: 풀스크린 카드 뷰
   ============================================ */
function initMobileBook() {
  const bookEl = document.getElementById("book");
  const bookStage = document.querySelector(".book-stage");
  if (!bookEl || !bookStage) return;

  const allPages = Array.from(bookEl.querySelectorAll(".page"));
  const covers = allPages.filter((p) => p.classList.contains("page-cover"));
  const illustrations = allPages.filter((p) =>
    p.classList.contains("page-illustration"),
  );
  const stories = allPages.filter((p) => p.classList.contains("page-story"));

  const mobileContainer = document.createElement("div");
  mobileContainer.className = "mobile-book";

  const slides = [];

  const frontCover = document.createElement("div");
  frontCover.className = "mobile-page mobile-cover";
  frontCover.innerHTML = covers[0].innerHTML;
  slides.push(frontCover);

  for (let i = 0; i < illustrations.length; i++) {
    const slide = document.createElement("div");
    slide.className = "mobile-page mobile-story-card";

    const imgSection = document.createElement("div");
    imgSection.className = "mobile-img-section";
    const imgWrap = illustrations[i].querySelector(".illustration-wrap");
    if (imgWrap) imgSection.innerHTML = imgWrap.innerHTML;

    const textSection = document.createElement("div");
    textSection.className = "mobile-text-section";
    const storyWrap = stories[i].querySelector(".story-wrap");
    if (storyWrap) textSection.innerHTML = storyWrap.innerHTML;

    slide.appendChild(imgSection);
    slide.appendChild(textSection);
    slides.push(slide);
  }

  const backCover = document.createElement("div");
  backCover.className = "mobile-page mobile-cover";
  backCover.innerHTML = covers[1] ? covers[1].innerHTML : covers[0].innerHTML;
  slides.push(backCover);

  bookEl.style.display = "none";
  slides.forEach((slide, idx) => {
    slide.dataset.slideIndex = idx;
    if (idx !== 0) slide.style.display = "none";
    mobileContainer.appendChild(slide);
  });
  bookStage.appendChild(mobileContainer);

  let currentSlide = 0;
  const totalSlides = slides.length;

  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  const pageIndicator = document.getElementById("page-indicator");

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.style.display = "flex";
        slide.style.animation = "none";
        slide.offsetHeight;
        slide.style.animation = "mobileFadeIn 0.35s ease-out";
      } else {
        slide.style.display = "none";
      }
    });

    currentSlide = index;
    appState.currentPage = index; // 모바일: slide index = page index

    if (index === 0) {
      pageIndicator.textContent = "표지";
    } else if (index === totalSlides - 1) {
      pageIndicator.textContent = "끝";
    } else {
      pageIndicator.textContent = `${index} / ${TOTAL_STORIES}`;
    }

    updateRestartBtn(index);
    saveLastPage();
    playSfx("flip");
  }

  prevBtn.addEventListener("click", () => {
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
      playSfx("click");
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentSlide < totalSlides - 1) {
      showSlide(currentSlide + 1);
      playSfx("click");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentSlide > 0) showSlide(currentSlide - 1);
    else if (e.key === "ArrowRight" && currentSlide < totalSlides - 1)
      showSlide(currentSlide + 1);
  });

  let touchStartX = 0;
  const SWIPE_THRESHOLD = 50;

  mobileContainer.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  mobileContainer.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (diff > SWIPE_THRESHOLD && currentSlide < totalSlides - 1)
        showSlide(currentSlide + 1);
      else if (diff < -SWIPE_THRESHOLD && currentSlide > 0)
        showSlide(currentSlide - 1);
    },
    { passive: true },
  );

  showSlide(0);

  /* 통합 페이지 전환 콜백 */
  onPageChange = (targetPage) => {
    if (targetPage >= 0 && targetPage < totalSlides) {
      showSlide(targetPage);
    }
  };
}

/* ============================================
   오디오 플레이어 + TTS 하이라이트 (기능 1)
   ============================================ */
function initAudioPlayer() {
  const audio = document.getElementById("story-audio");
  if (!audio) return;

  const toggleBtn = document.getElementById("audio-toggle");
  const panel = document.getElementById("audio-panel");
  const playBtn = document.getElementById("audio-play-btn");
  const progressBar = document.getElementById("audio-progress-bar");
  const progressFill = document.getElementById("audio-progress-fill");
  const currentTimeEl = document.getElementById("audio-current-time");
  const durationEl = document.getElementById("audio-duration");
  const volumeSlider = document.getElementById("audio-volume");
  const volumeBtn = document.getElementById("audio-volume-btn");

  let isPanelOpen = false;
  let isMuted = false;
  let previousVolume = 0.7;
  audio.volume = 0.7;

  toggleBtn.addEventListener("click", () => {
    isPanelOpen = !isPanelOpen;
    panel.classList.toggle("open", isPanelOpen);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".audio-player")) {
      isPanelOpen = false;
      panel.classList.remove("open");
    }
  });

  const updatePlayState = () => {
    const playIcon = playBtn.querySelector(".icon-play");
    const pauseIcon = playBtn.querySelector(".icon-pause");
    const togglePlay = toggleBtn.querySelector(".icon-play");
    const togglePause = toggleBtn.querySelector(".icon-pause");

    if (audio.paused) {
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
      togglePlay.style.display = "block";
      togglePause.style.display = "none";
      toggleBtn.classList.remove("playing");
    } else {
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
      togglePlay.style.display = "none";
      togglePause.style.display = "block";
      toggleBtn.classList.add("playing");
    }
  };

  playBtn.addEventListener("click", () => {
    audio.paused ? audio.play() : audio.pause();
  });

  toggleBtn.addEventListener("dblclick", (e) => {
    e.preventDefault();
    audio.paused ? audio.play() : audio.pause();
  });

  audio.addEventListener("play", updatePlayState);
  audio.addEventListener("pause", updatePlayState);

  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* timeupdate — 프로그레스 + TTS 하이라이트 */
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;

    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    currentTimeEl.textContent = formatTime(audio.currentTime);

    updateTTSHighlight(audio.currentTime);
  });

  /* seeked — 시크 완료 후 즉시 하이라이트 갱신 및 페이지 전환 */
  audio.addEventListener("seeked", () => {
    if (!audio.duration) return;
    // 시크 후 즉시 프로그레스 바 업데이트
    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    currentTimeEl.textContent = formatTime(audio.currentTime);
    clearAllHighlights();

    // 시크한 위치의 챕터를 찾아 페이지 전환 (일시정지 상태에서도 동작)
    let activeChapter = -1;
    for (let i = CHAPTER_TIMESTAMPS.length - 1; i >= 0; i--) {
      if (audio.currentTime >= CHAPTER_TIMESTAMPS[i].start) {
        activeChapter = i;
        break;
      }
    }
    if (activeChapter >= 0) {
      const targetPage = activeChapter + 1;
      if (appState.currentPage !== targetPage && onPageChange) {
        onPageChange(targetPage);
      }
      appState.lastHighlightChapter = activeChapter;
    }

    updateTTSHighlight(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  volumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    previousVolume = vol;
    isMuted = false;
    updateVolumeIcon(vol);
  });

  volumeBtn.addEventListener("click", () => {
    if (isMuted) {
      audio.volume = previousVolume;
      volumeSlider.value = previousVolume;
      isMuted = false;
    } else {
      previousVolume = audio.volume;
      audio.volume = 0;
      volumeSlider.value = 0;
      isMuted = true;
    }
    updateVolumeIcon(audio.volume);
  });

  const updateVolumeIcon = (vol) => {
    const hi = volumeBtn.querySelector(".icon-vol-high");
    const lo = volumeBtn.querySelector(".icon-vol-low");
    const mu = volumeBtn.querySelector(".icon-vol-mute");
    hi.style.display = lo.style.display = mu.style.display = "none";
    if (vol === 0) mu.style.display = "block";
    else if (vol < 0.5) lo.style.display = "block";
    else hi.style.display = "block";
  };

  updatePlayState();
  updateVolumeIcon(audio.volume);
}

/* ============================================
   TTS 하이라이트 로직 (기능 1)
   ============================================ */
function updateTTSHighlight(rawTime) {
  // 하이라이트를 오디오보다 살짝 늦추기 위해 오프셋 적용
  const currentTime = Math.max(0, rawTime - TTS_HIGHLIGHT_OFFSET);
  // 현재 시간에 해당하는 챕터 찾기
  let activeChapter = -1;
  for (let i = CHAPTER_TIMESTAMPS.length - 1; i >= 0; i--) {
    if (currentTime >= CHAPTER_TIMESTAMPS[i].start) {
      activeChapter = i;
      break;
    }
  }
  if (activeChapter < 0) return;

  // 현재 문장 찾기
  const chapterData = CHAPTER_TIMESTAMPS[activeChapter];
  let activeSentence = 0;
  for (let i = chapterData.sentences.length - 1; i >= 0; i--) {
    if (currentTime >= chapterData.sentences[i]) {
      activeSentence = i;
      break;
    }
  }

  // 시크(뒤로 돌림) 감지: 이전 챕터보다 현재 챕터가 작으면 모든 하이라이트 초기화
  if (activeChapter < appState.lastHighlightChapter) {
    clearAllHighlights();
  }
  appState.lastHighlightChapter = activeChapter;

  // 해당 챕터 페이지로 이동 (챕터 0-based → page 1-based)
  // 오디오 재생 중이면 항상 해당 챕터 페이지로 자동 전환
  const audio = document.getElementById("story-audio");
  const targetPage = activeChapter + 1;
  if (
    audio &&
    !audio.paused &&
    appState.currentPage !== targetPage &&
    onPageChange
  ) {
    onPageChange(targetPage);
  }

  // 모든 문장에서 active 제거, 해당 챕터의 해당 문장에 active 추가
  highlightSentence(activeChapter, activeSentence);
}

/* 모든 문장에서 active / read 클래스 초기화 (시크 시 사용) */
function clearAllHighlights() {
  document
    .querySelectorAll(".sentence.active, .sentence.read")
    .forEach((el) => {
      el.classList.remove("active", "read");
    });
}

function highlightSentence(chapterIdx, sentenceIdx) {
  // 모든 .sentence에서 active 제거
  document.querySelectorAll(".sentence.active").forEach((el) => {
    el.classList.remove("active");
    el.classList.add("read");
  });

  // 해당 챕터의 story-body 찾기
  // 데스크톱: .page-story 내부, 모바일: .mobile-text-section 내부
  let targetBody = null;

  if (appState.isMobile) {
    // 모바일: mobile-text-section 내의 story-body
    const mobileBodies = document.querySelectorAll(
      ".mobile-text-section .story-body",
    );
    if (mobileBodies[chapterIdx]) targetBody = mobileBodies[chapterIdx];
  } else {
    // 데스크톱: page-story 내의 story-body
    const desktopBodies = document.querySelectorAll(".page-story .story-body");
    if (desktopBodies[chapterIdx]) targetBody = desktopBodies[chapterIdx];
  }

  if (!targetBody) return;

  const sentences = targetBody.querySelectorAll(".sentence");
  if (sentences[sentenceIdx]) {
    sentences[sentenceIdx].classList.remove("read");
    sentences[sentenceIdx].classList.add("active");
  }
}

/* ============================================
   기능 2: 다크모드 / 라이트모드 전환
   ============================================ */
function initThemeToggle() {
  const btn = document.getElementById("btn-theme-toggle");
  if (!btn) return;

  const iconSun = btn.querySelector(".icon-sun");
  const iconMoon = btn.querySelector(".icon-moon");

  // localStorage에서 저장된 테마 복원
  const saved = localStorage.getItem("storybook-theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    iconSun.style.display = "none";
    iconMoon.style.display = "block";
  }

  btn.addEventListener("click", () => {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      iconSun.style.display = "block";
      iconMoon.style.display = "none";
      localStorage.setItem("storybook-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      iconSun.style.display = "none";
      iconMoon.style.display = "block";
      localStorage.setItem("storybook-theme", "dark");
    }
    playSfx("click");
  });
}

/* ============================================
   기능 3: 글자 크기 조절
   ============================================ */
function initFontSize() {
  const fontBtns = document.querySelectorAll(".font-btn");
  if (!fontBtns.length) return;

  const sizeMap = { small: 0.85, medium: 1, large: 1.2 };

  // localStorage에서 저장된 크기 복원
  const saved = localStorage.getItem("storybook-font-size") || "medium";
  applyFontSize(saved);
  fontBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.size === saved);
  });

  fontBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = btn.dataset.size;
      applyFontSize(size);
      fontBtns.forEach((b) => b.classList.toggle("active", b === btn));
      localStorage.setItem("storybook-font-size", size);
      playSfx("click");
    });
  });

  function applyFontSize(size) {
    const val = sizeMap[size] || 1;
    document.documentElement.style.setProperty("--font-size-adjust", val);
  }
}

/* ============================================
   기능 4: 페이지 자동 넘김 (오토플레이)
   ============================================ */
function initAutoplay() {
  const btn = document.getElementById("btn-autoplay");
  if (!btn) return;

  const AUTO_INTERVAL = 8000; // 8초

  const iconPlay = btn.querySelector(".icon-auto-play");
  const iconStop = btn.querySelector(".icon-auto-stop");
  const label = btn.querySelector(".auto-btn-label");

  /* 버튼 비주얼 상태 업데이트 */
  function updateAutoBtn() {
    if (appState.autoplayActive) {
      if (iconPlay) iconPlay.style.display = "none";
      if (iconStop) iconStop.style.display = "block";
      if (label) label.textContent = "정지";
    } else {
      if (iconPlay) iconPlay.style.display = "block";
      if (iconStop) iconStop.style.display = "none";
      if (label) label.textContent = "자동넘김";
    }
    btn.classList.toggle("active", appState.autoplayActive);
  }

  btn.addEventListener("click", () => {
    appState.autoplayActive = !appState.autoplayActive;
    updateAutoBtn();
    playSfx("click");

    if (appState.autoplayActive) {
      // 기존 타이머 정리 후 새로 시작
      clearInterval(appState.autoplayTimer);
      appState.autoplayTimer = setInterval(() => {
        // 버튼이 꺼졌으면 정지
        if (!appState.autoplayActive) {
          clearInterval(appState.autoplayTimer);
          appState.autoplayTimer = null;
          return;
        }

        // 오디오 재생 중이면 타이머 넘김 (TTS → updateTTSHighlight 가 페이지 담당)
        const audio = document.getElementById("story-audio");
        if (audio && !audio.paused) return;

        // 마지막 페이지에 도달했으면 자동 정지
        if (appState.currentPage >= TOTAL_STORIES + 1) {
          clearInterval(appState.autoplayTimer);
          appState.autoplayTimer = null;
          appState.autoplayActive = false;
          updateAutoBtn();
          return;
        }

        // 기존 '다음 버튼'과 동일한 경로로 페이지 전환
        const nextBtn = document.getElementById("btn-next");
        if (nextBtn) nextBtn.click();
      }, AUTO_INTERVAL);
    } else {
      clearInterval(appState.autoplayTimer);
      appState.autoplayTimer = null;
    }
  });
}

/* ============================================
   처음으로 버튼 (마지막 페이지에서만 표시)
   ============================================ */
function updateRestartBtn(page) {
  const restartBtn = document.getElementById("btn-restart");
  const nextBtn = document.getElementById("btn-next");
  if (!restartBtn) return;

  const isLastPage = page >= TOTAL_STORIES + 1;
  restartBtn.style.display = isLastPage ? "flex" : "none";
  if (nextBtn) nextBtn.style.display = isLastPage ? "none" : "flex";
}

function initRestartBtn() {
  const btn = document.getElementById("btn-restart");
  if (!btn) return;

  btn.addEventListener("click", () => {
    playSfx("click");

    // 자동넘김이 켜져 있으면 함께 정지
    if (appState.autoplayActive) {
      appState.autoplayActive = false;
      clearInterval(appState.autoplayTimer);
      appState.autoplayTimer = null;
      const autoBtn = document.getElementById("btn-autoplay");
      if (autoBtn) {
        autoBtn.classList.remove("active");
        const iconPlay = autoBtn.querySelector(".icon-auto-play");
        const iconStop = autoBtn.querySelector(".icon-auto-stop");
        const label = autoBtn.querySelector(".auto-btn-label");
        if (iconPlay) iconPlay.style.display = "block";
        if (iconStop) iconStop.style.display = "none";
        if (label) label.textContent = "자동넘김";
      }
    }

    // 첫 페이지(표지)로 이동
    if (onPageChange) onPageChange(0);
  });
}

/* ============================================
   기능 5: 읽기 진행률 저장 (localStorage)
   ============================================ */
function saveLastPage() {
  if (appState.currentPage > 0) {
    localStorage.setItem("storybook-last-page", appState.currentPage);
  }
}

function initReadingProgress() {
  const saved = localStorage.getItem("storybook-last-page");
  if (!saved || parseInt(saved) <= 0) return;

  const lastPage = parseInt(saved);
  if (lastPage <= 0 || lastPage > TOTAL_STORIES + 1) return;

  const toast = document.getElementById("resume-toast");
  const resumeBtn = document.getElementById("resume-toast-btn");
  const closeBtn = document.getElementById("resume-toast-close");
  if (!toast) return;

  // 토스트 표시
  toast.style.display = "flex";

  // 이어서 읽기 클릭
  resumeBtn.addEventListener("click", () => {
    if (onPageChange) onPageChange(lastPage);
    toast.style.display = "none";
    playSfx("click");
  });

  // 닫기
  closeBtn.addEventListener("click", () => {
    toast.style.display = "none";
  });

  // 5초 후 자동 사라짐
  setTimeout(() => {
    toast.style.display = "none";
  }, 5000);
}

/* ============================================
   기능 6: 페이지 전환 효과음 (Web Audio API)
   ============================================ */
function getAudioContext() {
  if (!appState.audioCtx) {
    appState.audioCtx = new (
      window.AudioContext || window.webkitAudioContext
    )();
  }
  return appState.audioCtx;
}

function playSfx(type) {
  if (!appState.sfxEnabled) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    if (type === "flip") {
      playFlipSound(ctx);
    } else if (type === "click") {
      playClickSound(ctx);
    }
  } catch (e) {
    // Web Audio API 미지원 시 무시
  }
}

function playFlipSound(ctx) {
  // 화이트노이즈 + 밴드패스 필터 = 부드러운 스와이프
  const duration = 0.15;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}

function playClickSound(ctx) {
  // 짧은 사인파 팝
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

function initSfxToggle() {
  const btn = document.getElementById("btn-sfx-toggle");
  if (!btn) return;

  const iconOn = btn.querySelector(".icon-sfx-on");
  const iconOff = btn.querySelector(".icon-sfx-off");

  // localStorage 복원
  const saved = localStorage.getItem("storybook-sfx");
  if (saved === "off") {
    appState.sfxEnabled = false;
    iconOn.style.display = "none";
    iconOff.style.display = "block";
  }

  btn.addEventListener("click", () => {
    appState.sfxEnabled = !appState.sfxEnabled;
    iconOn.style.display = appState.sfxEnabled ? "block" : "none";
    iconOff.style.display = appState.sfxEnabled ? "none" : "block";
    localStorage.setItem("storybook-sfx", appState.sfxEnabled ? "on" : "off");
  });
}

/* ============================================
   기능 7: 동화 라이브러리 화면
   ============================================ */
function initLibrary() {
  const libraryScreen = document.getElementById("library-screen");
  const btnLibrary = document.getElementById("btn-library");
  const btnBack = document.getElementById("btn-library-back");
  if (!libraryScreen || !btnLibrary) return;

  const appContainer = document.querySelector(".app-container");
  const audioPlayer = document.querySelector(".audio-player");

  btnLibrary.addEventListener("click", () => {
    libraryScreen.style.display = "flex";
    if (appContainer) appContainer.style.display = "none";
    if (audioPlayer) audioPlayer.style.display = "none";
    playSfx("click");
  });

  // 돌아가기 버튼
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      libraryScreen.style.display = "none";
      if (appContainer) appContainer.style.display = "flex";
      if (audioPlayer) audioPlayer.style.display = "flex";
      playSfx("click");
    });
  }

  // 활성 카드 클릭 → 동화로 돌아가기
  const activeCard = libraryScreen.querySelector(".library-card-active");
  if (activeCard) {
    activeCard.addEventListener("click", () => {
      libraryScreen.style.display = "none";
      if (appContainer) appContainer.style.display = "flex";
      if (audioPlayer) audioPlayer.style.display = "flex";
      playSfx("click");
    });
  }
}
