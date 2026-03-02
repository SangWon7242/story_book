/* ============================================
   비프의 푸른 바다 모험 - Main Application JS
   데스크톱: StPageFlip 양면 펼침
   태블릿/모바일: 풀스크린 카드 뷰 (이미지 상단 + 텍스트 하단)
   + 기능: 챕터별 TTS 오디오, 하이라이트, 다크모드, 글자크기, 자동넘김,
     읽기진행률, 효과음, 라이브러리, 전체화면, 이미지 프리로드
   ============================================ */

/* 모바일/태블릿 전환 기준 (px) */
const MOBILE_BREAKPOINT = 768;
let TOTAL_STORIES = 0;

/* ============================================
   챕터별 오디오 시스템
   각 챕터마다 독립적인 Audio 객체를 관리합니다.
   ============================================ */
let chapterAudios = []; // 챕터별 Audio 객체 배열
let currentPlayingChapter = -1; // 현재 재생 중인 챕터 인덱스 (-1 = 없음)
let storyData = null;

/* 자동넘김 속도 옵션: 보통 → 빠름 → 느림 순환 */
const AUTOPLAY_SPEEDS = [
  { label: "보통", ms: 8000 },
  { label: "빠름", ms: 5000 },
  { label: "느림", ms: 12000 },
];

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
  flipDebounceTimer: null,
  initialized: false, // 초기화 완료 여부 — 효과음 방지용
  celebrated: false, // 마지막 페이지 축하 재생 여부
  autoplaySpeedIdx: 0, // 현재 자동넘김 속도 인덱스
  userStartedAudio: false, // 사용자가 오디오를 시작했는지 여부
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
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("data/story1.json");
    if (!res.ok) throw new Error("Failed to load story data");
    storyData = await res.json();

    TOTAL_STORIES = storyData.chapters.length;

    /* 챕터별 Audio 객체 생성 */
    initChapterAudios(storyData);

    // Top Bar 업데이트
    const titleH1 = document.querySelector(".top-bar-title h1");
    if (titleH1) titleH1.textContent = "📖 " + storyData.title;
    const subT = document.querySelector(".top-bar-title .subtitle");
    if (subT) subT.textContent = storyData.subtitle;

    // HTML 동적 생성
    buildStoryHTML(storyData);
  } catch (e) {
    console.error("Error loading story:", e);
  }

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
  initFullscreen();

  appState.initialized = true;

  /* 서비스 워커 등록 (PWA 오프라인 지원) */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  /* 창 크기 변경: 모바일↔데스크톱 경계 넘을 때 재초기화 */
  let _resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      const nowMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      if (nowMobile !== appState.isMobile) {
        location.reload();
      }
    }, 300);
  });
});

/* ============================================
   챕터별 Audio 객체 초기화
   각 챕터에 독립적인 Audio 엘리먼트를 생성합니다.
   ============================================ */
function initChapterAudios(data) {
  chapterAudios = [];

  data.chapters.forEach((ch, idx) => {
    if (!ch.audio) {
      chapterAudios.push(null);
      return;
    }

    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = ch.audio;

    /* 챕터 오디오 종료 시: 다음 챕터로 자동 전환 */
    audio.addEventListener("ended", () => {
      const nextChapter = idx + 1;
      if (nextChapter < TOTAL_STORIES) {
        /* 다음 챕터 페이지로 전환 */
        const nextPage = nextChapter + 1;
        if (onPageChange) {
          onPageChange(nextPage);
        }
        /* 약간의 딜레이 후 다음 챕터 오디오 자동 재생 */
        setTimeout(() => {
          playChapterAudio(nextChapter);
        }, 800);
      } else {
        /* 마지막 챕터 종료 — 재생 상태 초기화 */
        currentPlayingChapter = -1;
        updateAudioPlayerUI();
      }
    });

    /* 시간 업데이트 시 해당 챕터의 하이라이팅 동기화 */
    audio.addEventListener("timeupdate", () => {
      if (currentPlayingChapter !== idx) return;
      updateChapterHighlight(idx, audio.currentTime, audio.duration);
      updateAudioProgressUI(audio);
    });

    /* 메타데이터 로드 시 UI 업데이트 */
    audio.addEventListener("loadedmetadata", () => {
      if (currentPlayingChapter === idx) {
        updateAudioDurationUI(audio);
      }
    });

    chapterAudios.push(audio);
  });
}

/* ============================================
   챕터 오디오 재생/정지/전환
   ============================================ */

/* 특정 챕터의 오디오 재생 */
function playChapterAudio(chapterIdx) {
  if (chapterIdx < 0 || chapterIdx >= chapterAudios.length) return;
  const audio = chapterAudios[chapterIdx];
  if (!audio) return;

  /* 이전 챕터 오디오 정지 */
  if (currentPlayingChapter >= 0 && currentPlayingChapter !== chapterIdx) {
    stopChapterAudio(currentPlayingChapter);
  }

  currentPlayingChapter = chapterIdx;
  audio.currentTime = 0;
  audio.play().catch((e) => {
    console.warn("오디오 재생 실패 (사용자 인터랙션 필요):", e);
  });

  appState.userStartedAudio = true;
  updateAudioPlayerUI();
  updateAudioDurationUI(audio);
}

/* 특정 챕터의 오디오 정지 */
function stopChapterAudio(chapterIdx) {
  if (chapterIdx < 0 || chapterIdx >= chapterAudios.length) return;
  const audio = chapterAudios[chapterIdx];
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  clearChapterHighlights(chapterIdx);
}

/* 모든 챕터 오디오 정지 */
function stopAllChapterAudios() {
  chapterAudios.forEach((audio, idx) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    clearChapterHighlights(idx);
  });
  currentPlayingChapter = -1;
  updateAudioPlayerUI();
}

/* 현재 챕터 오디오 일시정지/재개 토글 */
function toggleCurrentChapterAudio() {
  const chapterIdx = getCurrentChapter();

  if (chapterIdx < 0) return;

  const audio = chapterAudios[chapterIdx];
  if (!audio) return;

  if (currentPlayingChapter === chapterIdx && !audio.paused) {
    /* 현재 재생 중 → 일시정지 */
    audio.pause();
    updateAudioPlayerUI();
  } else if (currentPlayingChapter === chapterIdx && audio.paused) {
    /* 현재 일시정지 상태 → 재개 */
    audio.play().catch(() => {});
    appState.userStartedAudio = true;
    updateAudioPlayerUI();
  } else {
    /* 새 챕터 재생 시작 */
    playChapterAudio(chapterIdx);
  }
}

/* 현재 재생 중인 Audio 객체 반환 */
function getCurrentAudio() {
  if (currentPlayingChapter < 0) return null;
  return chapterAudios[currentPlayingChapter] || null;
}

/* ============================================
   챕터별 하이라이팅 로직
   오디오 duration을 문장 수로 균등 분할하여 하이라이팅
   ============================================ */
function updateChapterHighlight(chapterIdx, currentTime, duration) {
  if (!storyData || chapterIdx < 0 || chapterIdx >= storyData.chapters.length)
    return;

  const chapter = storyData.chapters[chapterIdx];
  const sentenceCount = chapter.sentences.length;
  if (sentenceCount === 0 || !duration || isNaN(duration)) return;

  /* 각 문장의 시간 영역을 균등 분할 */
  const timePerSentence = duration / sentenceCount;
  let activeSentence = Math.floor(currentTime / timePerSentence);
  activeSentence = Math.min(activeSentence, sentenceCount - 1);
  activeSentence = Math.max(activeSentence, 0);

  highlightSentence(chapterIdx, activeSentence);
}

/* 특정 챕터의 하이라이트 초기화 */
function clearChapterHighlights(chapterIdx) {
  let targetBody = null;

  if (appState.isMobile) {
    const mobileBodies = document.querySelectorAll(
      ".mobile-text-section .story-body",
    );
    if (mobileBodies[chapterIdx]) targetBody = mobileBodies[chapterIdx];
  } else {
    const desktopBodies = document.querySelectorAll(".page-story .story-body");
    if (desktopBodies[chapterIdx]) targetBody = desktopBodies[chapterIdx];
  }

  if (!targetBody) return;

  targetBody.querySelectorAll(".sentence").forEach((el) => {
    el.classList.remove("active", "read");
  });
}

/* 모든 문장에서 active / read 클래스 초기화 */
function clearAllHighlights() {
  document
    .querySelectorAll(".sentence.active, .sentence.read")
    .forEach((el) => {
      el.classList.remove("active", "read");
    });
}

/* 특정 챕터의 특정 문장 하이라이팅 */
function highlightSentence(chapterIdx, sentenceIdx) {
  /* 해당 챕터 내에서만 하이라이팅 업데이트 */
  let targetBody = null;

  if (appState.isMobile) {
    const mobileBodies = document.querySelectorAll(
      ".mobile-text-section .story-body",
    );
    if (mobileBodies[chapterIdx]) targetBody = mobileBodies[chapterIdx];
  } else {
    const desktopBodies = document.querySelectorAll(".page-story .story-body");
    if (desktopBodies[chapterIdx]) targetBody = desktopBodies[chapterIdx];
  }

  if (!targetBody) return;

  const sentences = targetBody.querySelectorAll(".sentence");

  /* 기존 active 문장을 read로 전환 */
  sentences.forEach((el, idx) => {
    if (idx < sentenceIdx) {
      el.classList.remove("active");
      el.classList.add("read");
    } else if (idx === sentenceIdx) {
      el.classList.remove("read");
      el.classList.add("active");
    } else {
      el.classList.remove("active", "read");
    }
  });
}

/* ============================================
   HTML 동적 생성 (JSON 데이터 기반)
   ============================================ */
function buildStoryHTML(data) {
  const bookEl = document.getElementById("book");
  if (!bookEl) return;
  bookEl.innerHTML = "";

  // 1. 표지 (Front Cover)
  const coverHTML = `
    <div class="page page-cover" data-density="hard">
      <div class="cover-title">${data.title}</div>
      <div class="cover-decoration"></div>
      <div class="cover-subtitle">${data.subtitle}</div>
    </div>
  `;
  bookEl.insertAdjacentHTML("beforeend", coverHTML);

  // 2. 챕터별 일러스트/스토리
  data.chapters.forEach((ch) => {
    // Left: Image
    const imgHTML = `
      <div class="page page-illustration">
        <div class="illustration-wrap">
          <img src="${ch.image}" alt="${ch.imageAlt}" />
        </div>
      </div>
    `;
    bookEl.insertAdjacentHTML("beforeend", imgHTML);

    // Right: Text
    const sentencesHTML = ch.sentences
      .map(
        (s, idx) =>
          `<span class="sentence" data-sentence="${idx + 1}">${s.text}</span>`,
      )
      .join(" ");

    const textHTML = `
      <div class="page page-story">
        <div class="story-wrap">
          <div class="story-chapter">Chapter ${ch.chapterNum}</div>
          <h3 class="story-title">${ch.title}</h3>
          <div class="story-divider"></div>
          <p class="story-body">
            ${sentencesHTML}
          </p>
          <div class="story-page-number">${ch.chapterNum} / ${data.chapters.length}</div>
        </div>
      </div>
    `;
    bookEl.insertAdjacentHTML("beforeend", textHTML);
  });

  // 3. 뒷표지 (Back Cover)
  const backHTML = `
    <div class="page page-cover" data-density="hard">
      <div class="cover-title">끝 ✨</div>
      <div class="cover-decoration"></div>
      <div class="cover-subtitle">Powered by AI Vibe Coding</div>
    </div>
  `;
  bookEl.insertAdjacentHTML("beforeend", backHTML);
}

/* ============================================
   페이지 전환 시 챕터 오디오 자동 연동
   ============================================ */
function handlePageChangeAudio(newPage) {
  const newChapter =
    newPage >= 1 && newPage <= TOTAL_STORIES ? newPage - 1 : -1;

  if (newChapter < 0) {
    /* 표지 또는 뒷표지 → 모든 오디오 정지 */
    if (currentPlayingChapter >= 0) {
      stopAllChapterAudios();
    }
    return;
  }

  if (newChapter === currentPlayingChapter) {
    /* 같은 챕터 → 아무것도 하지 않음 */
    return;
  }

  /* 사용자가 오디오를 한 번이라도 시작했으면, 페이지 전환 시 자동 재생 */
  if (appState.userStartedAudio) {
    playChapterAudio(newChapter);
  } else {
    /* 아직 사용자가 오디오를 시작하지 않았으면 UI만 업데이트 */
    if (currentPlayingChapter >= 0) {
      stopChapterAudio(currentPlayingChapter);
    }
    currentPlayingChapter = -1;
    updateAudioPlayerUI();
  }
}

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

  /* silent=true 이면 효과음 없이 인디케이터만 갱신 (초기화 시 사용) */
  const updateIndicator = (silent = false) => {
    const current = pageFlip.getCurrentPageIndex();
    const prevPage = appState.currentPage;
    appState.currentPage = flipIndexToPage(current);
    appState.isFlipping = false;

    if (appState.currentPage === 0) {
      pageIndicator.textContent = "표지";
    } else if (appState.currentPage > TOTAL_STORIES) {
      pageIndicator.textContent = "끝";
    } else {
      pageIndicator.textContent = `${appState.currentPage} / ${TOTAL_STORIES}`;
    }

    updateRestartBtn(appState.currentPage);
    updateReadingProgressBar(appState.currentPage);
    saveLastPage();
    preloadNextImage(appState.currentPage);
    if (!silent) playSfx("flip");

    /* 챕터 오디오 자동 연동 */
    if (prevPage !== appState.currentPage) {
      handlePageChangeAudio(appState.currentPage);
    }
  };

  /* flip 이벤트가 효과음을 전담 — 버튼 클릭에서 중복 방지 */
  prevBtn.addEventListener("click", () => {
    pageFlip.flipPrev();
  });
  nextBtn.addEventListener("click", () => {
    pageFlip.flipNext();
  });

  pageFlip.on("flip", () => updateIndicator(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") pageFlip.flipPrev();
    else if (e.key === "ArrowRight") pageFlip.flipNext();
  });

  updateIndicator(true); /* 초기 인디케이터 갱신 — 효과음 없이 */

  /* 통합 페이지 전환 콜백 (자동넘김/TTS에서 사용) */
  onPageChange = (targetPage) => {
    if (appState.currentPage === targetPage) return;

    appState.currentPage = targetPage;

    if (targetPage === 0) {
      pageIndicator.textContent = "표지";
    } else if (targetPage > TOTAL_STORIES) {
      pageIndicator.textContent = "끝";
    } else {
      pageIndicator.textContent = `${targetPage} / ${TOTAL_STORIES}`;
    }

    updateReadingProgressBar(targetPage);

    if (appState.flipDebounceTimer) {
      clearTimeout(appState.flipDebounceTimer);
    }

    appState.flipDebounceTimer = setTimeout(() => {
      let flipIdx;
      if (targetPage === 0) flipIdx = 0;
      else if (targetPage > TOTAL_STORIES)
        flipIdx = pageFlip.getPageCount() - 1;
      else flipIdx = (targetPage - 1) * 2 + 1;

      appState.isFlipping = true;
      pageFlip.flip(flipIdx);
      appState.flipDebounceTimer = null;
    }, 300);

    /* 챕터 오디오 자동 연동 */
    handlePageChangeAudio(targetPage);
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

  /* silent=true 이면 효과음 없이 슬라이드 전환 (초기화 시 사용) */
  function showSlide(index, silent = false) {
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

    const prevPage = appState.currentPage;
    currentSlide = index;
    appState.currentPage = index;

    if (index === 0) {
      pageIndicator.textContent = "표지";
    } else if (index === totalSlides - 1) {
      pageIndicator.textContent = "끝";
    } else {
      pageIndicator.textContent = `${index} / ${TOTAL_STORIES}`;
    }

    updateRestartBtn(index);
    updateReadingProgressBar(index);
    saveLastPage();
    preloadNextImage(index);
    if (!silent) playSfx("flip");

    /* 챕터 오디오 자동 연동 */
    if (prevPage !== appState.currentPage) {
      handlePageChangeAudio(appState.currentPage);
    }
  }

  /* showSlide 가 효과음을 전담 — 버튼에서 중복 방지 */
  prevBtn.addEventListener("click", () => {
    if (currentSlide > 0) showSlide(currentSlide - 1);
  });

  nextBtn.addEventListener("click", () => {
    if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1);
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

  showSlide(0, true); /* 초기 슬라이드 — 효과음 없이 */

  /* 통합 페이지 전환 콜백 */
  onPageChange = (targetPage) => {
    if (targetPage >= 0 && targetPage < totalSlides) {
      showSlide(targetPage);
    }
  };
}

/* ============================================
   오디오 플레이어 UI (챕터별 오디오)
   ============================================ */
function initAudioPlayer() {
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

  /* 모든 챕터 오디오에 볼륨 설정 */
  chapterAudios.forEach((audio) => {
    if (audio) audio.volume = 0.7;
  });

  /* 패널 열기/닫기 */
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isPanelOpen = !isPanelOpen;
    panel.classList.toggle("open", isPanelOpen);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".audio-player")) {
      isPanelOpen = false;
      panel.classList.remove("open");
    }
  });

  /* 재생/일시정지 버튼 */
  playBtn.addEventListener("click", () => {
    toggleCurrentChapterAudio();
  });

  /* 토글 버튼 더블클릭 — 재생/일시정지 */
  toggleBtn.addEventListener("dblclick", (e) => {
    e.preventDefault();
    toggleCurrentChapterAudio();
  });

  /* 프로그레스 바 클릭 시크 */
  progressBar.addEventListener("click", (e) => {
    const audio = getCurrentAudio();
    if (!audio || !audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  /* 볼륨 슬라이더 */
  volumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    chapterAudios.forEach((audio) => {
      if (audio) audio.volume = vol;
    });
    previousVolume = vol;
    isMuted = false;
    updateVolumeIcon(vol);
  });

  /* 음소거 토글 */
  volumeBtn.addEventListener("click", () => {
    if (isMuted) {
      chapterAudios.forEach((audio) => {
        if (audio) audio.volume = previousVolume;
      });
      volumeSlider.value = previousVolume;
      isMuted = false;
    } else {
      previousVolume = parseFloat(volumeSlider.value) || 0.7;
      chapterAudios.forEach((audio) => {
        if (audio) audio.volume = 0;
      });
      volumeSlider.value = 0;
      isMuted = true;
    }
    updateVolumeIcon(isMuted ? 0 : previousVolume);
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

  updateVolumeIcon(0.7);
  updateAudioPlayerUI();
}

/* ============================================
   오디오 플레이어 UI 업데이트 헬퍼들
   ============================================ */
function updateAudioPlayerUI() {
  const playBtn = document.getElementById("audio-play-btn");
  const toggleBtn = document.getElementById("audio-toggle");
  if (!playBtn || !toggleBtn) return;

  const playIcon = playBtn.querySelector(".icon-play");
  const pauseIcon = playBtn.querySelector(".icon-pause");
  const togglePlay = toggleBtn.querySelector(".icon-play");
  const togglePause = toggleBtn.querySelector(".icon-pause");

  const audio = getCurrentAudio();
  const isPlaying = audio && !audio.paused;

  if (isPlaying) {
    if (playIcon) playIcon.style.display = "none";
    if (pauseIcon) pauseIcon.style.display = "block";
    if (togglePlay) togglePlay.style.display = "none";
    if (togglePause) togglePause.style.display = "block";
    toggleBtn.classList.add("playing");
  } else {
    if (playIcon) playIcon.style.display = "block";
    if (pauseIcon) pauseIcon.style.display = "none";
    if (togglePlay) togglePlay.style.display = "block";
    if (togglePause) togglePause.style.display = "none";
    toggleBtn.classList.remove("playing");
  }

  /* 패널 타이틀 업데이트: 현재 챕터 표시 */
  const panelTitle = document.querySelector(".audio-panel-title");
  if (panelTitle) {
    const chapterIdx = getCurrentChapter();
    if (chapterIdx >= 0 && storyData) {
      const chTitle = storyData.chapters[chapterIdx].title;
      panelTitle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg> Ch.${chapterIdx + 1} ${chTitle}`;
    } else {
      panelTitle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg> 구연동화 오디오`;
    }
  }
}

/* 프로그레스 바 & 현재시간 업데이트 */
function updateAudioProgressUI(audio) {
  const progressFill = document.getElementById("audio-progress-fill");
  const currentTimeEl = document.getElementById("audio-current-time");
  if (!progressFill || !currentTimeEl || !audio || !audio.duration) return;

  progressFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

/* 전체 시간 업데이트 */
function updateAudioDurationUI(audio) {
  const durationEl = document.getElementById("audio-duration");
  if (!durationEl || !audio) return;
  durationEl.textContent = formatTime(audio.duration);
}

/* 시간 포맷팅 */
function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ============================================
   기능 2: 다크모드 / 라이트모드 전환
   ============================================ */
function initThemeToggle() {
  const btn = document.getElementById("btn-theme-toggle");
  if (!btn) return;

  const iconSun = btn.querySelector(".icon-sun");
  const iconMoon = btn.querySelector(".icon-moon");

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

  const iconPlay = btn.querySelector(".icon-auto-play");
  const iconStop = btn.querySelector(".icon-auto-stop");
  const label = btn.querySelector(".auto-btn-label");
  const speedBtn = document.getElementById("btn-autoplay-speed");

  /* 속도 버튼 라벨 업데이트 */
  function updateSpeedBtn() {
    if (!speedBtn) return;
    speedBtn.textContent = AUTOPLAY_SPEEDS[appState.autoplaySpeedIdx].label;
  }

  /* 자동넘김 타이머 시작 (속도 반영) */
  function startTimer() {
    clearInterval(appState.autoplayTimer);
    const speed = AUTOPLAY_SPEEDS[appState.autoplaySpeedIdx].ms;
    appState.autoplayTimer = setInterval(() => {
      if (!appState.autoplayActive) {
        clearInterval(appState.autoplayTimer);
        appState.autoplayTimer = null;
        return;
      }
      /* 오디오가 재생 중이면 자동넘김 건너뛰기 */
      const audio = getCurrentAudio();
      if (audio && !audio.paused) return;
      if (appState.currentPage >= TOTAL_STORIES + 1) {
        clearInterval(appState.autoplayTimer);
        appState.autoplayTimer = null;
        appState.autoplayActive = false;
        updateAutoBtn();
        return;
      }
      const nextBtn = document.getElementById("btn-next");
      if (nextBtn) nextBtn.click();
    }, speed);
  }

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
      startTimer();
    } else {
      clearInterval(appState.autoplayTimer);
      appState.autoplayTimer = null;
    }
  });

  /* 속도 버튼: 보통 → 빠름 → 느림 순환 */
  if (speedBtn) {
    speedBtn.addEventListener("click", () => {
      appState.autoplaySpeedIdx =
        (appState.autoplaySpeedIdx + 1) % AUTOPLAY_SPEEDS.length;
      updateSpeedBtn();
      playSfx("click");
      if (appState.autoplayActive) startTimer(); /* 실행 중이면 즉시 반영 */
    });
    updateSpeedBtn();
  }
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

  /* 마지막 페이지 도달 시 축하 연출 */
  if (isLastPage) celebrateLastPage();
}

function initRestartBtn() {
  const btn = document.getElementById("btn-restart");
  if (!btn) return;

  btn.addEventListener("click", () => {
    playSfx("click");

    /* 모든 오디오 정지 */
    stopAllChapterAudios();
    appState.userStartedAudio = false;

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

    appState.celebrated = false; /* 다시 읽을 때 축하 재설정 */
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

  toast.style.display = "flex";

  resumeBtn.addEventListener("click", () => {
    if (onPageChange) onPageChange(lastPage);
    toast.style.display = "none";
    playSfx("click");
  });

  closeBtn.addEventListener("click", () => {
    toast.style.display = "none";
  });

  setTimeout(() => {
    toast.style.display = "none";
  }, 5000);
}

/* ============================================
   읽기 진행률 바 업데이트
   ============================================ */
function updateReadingProgressBar(page) {
  const fill = document.getElementById("reading-progress-fill");
  if (!fill) return;
  const total = TOTAL_STORIES + 1; /* 뒷표지 포함 */
  const pct = Math.min((page / total) * 100, 100);
  fill.style.width = pct + "%";
}

/* ============================================
   다음 이미지 프리로드
   ============================================ */
function preloadNextImage(currentPage) {
  const next = currentPage + 1;
  if (next >= 1 && next <= TOTAL_STORIES) {
    const img = new Image();
    img.src = `images/${next}.png`;
  }
}

/* ============================================
   마지막 페이지 축하 연출 (confetti + 사운드)
   ============================================ */
function celebrateLastPage() {
  if (appState.celebrated) return;
  appState.celebrated = true;

  playSfx("celebrate");

  const container = document.querySelector(".book-stage");
  if (!container) return;

  for (let i = 0; i < 22; i++) {
    const dot = document.createElement("div");
    dot.className = "confetti-dot";
    dot.style.setProperty("--x", `${5 + Math.random() * 90}%`);
    dot.style.setProperty("--delay", `${Math.random() * 0.9}s`);
    dot.style.setProperty(
      "--color",
      `hsl(${Math.floor(Math.random() * 360)}, 80%, 65%)`,
    );
    dot.style.setProperty("--size", `${6 + Math.floor(Math.random() * 10)}px`);
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 2600);
  }
}

/* ============================================
   전체화면 버튼
   ============================================ */
function initFullscreen() {
  const btn = document.getElementById("btn-fullscreen");
  if (!btn) return;

  const iconExpand = btn.querySelector(".icon-expand");
  const iconCollapse = btn.querySelector(".icon-collapse");

  function updateIcon() {
    const isFull = !!document.fullscreenElement;
    if (iconExpand) iconExpand.style.display = isFull ? "none" : "block";
    if (iconCollapse) iconCollapse.style.display = isFull ? "block" : "none";
  }

  btn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    playSfx("click");
  });

  document.addEventListener("fullscreenchange", updateIcon);
  updateIcon();
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
    } else if (type === "celebrate") {
      playCelebrationSound(ctx);
    }
  } catch (e) {
    // Web Audio API 미지원 시 무시
  }
}

function playFlipSound(ctx) {
  // 3-레이어 실제 책 페이지 넘김 효과음
  const now = ctx.currentTime;
  const totalDuration = 0.42;

  // === Layer 1: 페이지 잡을 때 초기 바스락 (고주파 노이즈 버스트) ===
  const crinkleDur = 0.07;
  const crinkleBuf = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * crinkleDur),
    ctx.sampleRate,
  );
  const crinkleData = crinkleBuf.getChannelData(0);
  for (let i = 0; i < crinkleData.length; i++) {
    const t = i / crinkleData.length;
    crinkleData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 18);
  }
  const crinkleSrc = ctx.createBufferSource();
  crinkleSrc.buffer = crinkleBuf;
  const crinkleHp = ctx.createBiquadFilter();
  crinkleHp.type = "highpass";
  crinkleHp.frequency.value = 4500;
  const crinkleGain = ctx.createGain();
  crinkleGain.gain.setValueAtTime(0.22, now);
  crinkleSrc.connect(crinkleHp);
  crinkleHp.connect(crinkleGain);
  crinkleGain.connect(ctx.destination);
  crinkleSrc.start(now);
  crinkleSrc.stop(now + crinkleDur);

  // === Layer 2: 종이가 공기를 가르는 휘슁 스윕 ===
  const whooshBuf = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * totalDuration),
    ctx.sampleRate,
  );
  const whooshData = whooshBuf.getChannelData(0);
  for (let i = 0; i < whooshData.length; i++) {
    const t = i / whooshData.length;
    const env = t < 0.2 ? t / 0.2 : Math.pow((1 - t) / 0.8, 1.4);
    whooshData[i] = (Math.random() * 2 - 1) * env;
  }
  const whooshSrc = ctx.createBufferSource();
  whooshSrc.buffer = whooshBuf;
  const whooshBp = ctx.createBiquadFilter();
  whooshBp.type = "bandpass";
  whooshBp.frequency.setValueAtTime(2800, now);
  whooshBp.frequency.exponentialRampToValueAtTime(
    550,
    now + totalDuration * 0.82,
  );
  whooshBp.Q.value = 0.9;
  const whooshGain = ctx.createGain();
  whooshGain.gain.setValueAtTime(0.0, now);
  whooshGain.gain.linearRampToValueAtTime(0.11, now + 0.05);
  whooshGain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);
  whooshSrc.connect(whooshBp);
  whooshBp.connect(whooshGain);
  whooshGain.connect(ctx.destination);
  whooshSrc.start(now);
  whooshSrc.stop(now + totalDuration);

  // === Layer 3: 페이지가 내려앉는 덜컥 (저주파 사인파 임팩트) ===
  const landTime = now + totalDuration * 0.72;
  const landOsc = ctx.createOscillator();
  landOsc.type = "sine";
  landOsc.frequency.setValueAtTime(105, landTime);
  landOsc.frequency.exponentialRampToValueAtTime(52, landTime + 0.12);
  const landGain = ctx.createGain();
  landGain.gain.setValueAtTime(0.0, landTime);
  landGain.gain.linearRampToValueAtTime(0.06, landTime + 0.012);
  landGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.13);
  landOsc.connect(landGain);
  landGain.connect(ctx.destination);
  landOsc.start(landTime);
  landOsc.stop(landTime + 0.14);
}

function playClickSound(ctx) {
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

function playCelebrationSound(ctx) {
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const t = now + i * 0.13;
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.13, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function initSfxToggle() {
  const btn = document.getElementById("btn-sfx-toggle");
  if (!btn) return;

  const iconOn = btn.querySelector(".icon-sfx-on");
  const iconOff = btn.querySelector(".icon-sfx-off");

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
    /* 라이브러리 화면 전환 시 오디오 일시정지 */
    const audio = getCurrentAudio();
    if (audio && !audio.paused) audio.pause();
    updateAudioPlayerUI();

    libraryScreen.style.display = "flex";
    if (appContainer) appContainer.style.display = "none";
    if (audioPlayer) audioPlayer.style.display = "none";
    playSfx("click");
  });

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      libraryScreen.style.display = "none";
      if (appContainer) appContainer.style.display = "flex";
      if (audioPlayer) audioPlayer.style.display = "flex";
      playSfx("click");
    });
  }

  const libReadBtn = libraryScreen.querySelector(".lib-btn");
  if (libReadBtn) {
    libReadBtn.addEventListener("click", () => {
      libraryScreen.style.display = "none";
      if (appContainer) appContainer.style.display = "flex";
      if (audioPlayer) audioPlayer.style.display = "flex";
      playSfx("click");
    });
  }
}
