/* ============================================
   비프의 푸른 바다 모험 - Main Application JS
   데스크톱: StPageFlip 양면 펼침
   태블릿/모바일: 풀스크린 카드 뷰 (이미지 상단 + 텍스트 하단)
   ============================================ */

/* 모바일/태블릿 전환 기준 (px) */
const MOBILE_BREAKPOINT = 768;

document.addEventListener("DOMContentLoaded", () => {
  /* 화면 너비에 따라 데스크톱 모드 또는 모바일 모드 선택 */
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    initMobileBook();
  } else {
    initDesktopBook();
  }
  initAudioPlayer();
});

/* ============================================
   데스크톱: StPageFlip 양면 펼침 모드
   ============================================ */
function initDesktopBook() {
  const bookEl = document.getElementById("book");
  const bookStage = document.querySelector(".book-stage");
  if (!bookEl || !bookStage) return;

  // 사용 가능한 영역 계산
  const stageRect = bookStage.getBoundingClientRect();
  const availW = stageRect.width;
  const availH = stageRect.height;

  // 각 페이지(한 면)는 3:4 비율
  const pageRatio = 3 / 4;
  let pageH = Math.floor(availH * 0.98);
  let pageW = Math.floor(pageH * pageRatio);

  // 두 페이지를 나란히 놓았을 때 가로 넘침 방지
  if (pageW * 2 > availW * 0.98) {
    pageW = Math.floor((availW * 0.98) / 2);
    pageH = Math.floor(pageW / pageRatio);
  }

  // 최소 크기 보장
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

  // 네비게이션
  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  const pageIndicator = document.getElementById("page-indicator");
  const TOTAL_STORIES = 5;

  const updateIndicator = () => {
    const current = pageFlip.getCurrentPageIndex();
    const total = pageFlip.getPageCount();
    if (current === 0) {
      pageIndicator.textContent = "표지";
      return;
    }
    if (current >= total - 1) {
      pageIndicator.textContent = "끝";
      return;
    }
    const storyNum = Math.ceil(current / 2);
    pageIndicator.textContent = `${storyNum} / ${TOTAL_STORIES}`;
  };

  prevBtn.addEventListener("click", () => pageFlip.flipPrev());
  nextBtn.addEventListener("click", () => pageFlip.flipNext());
  pageFlip.on("flip", updateIndicator);

  // 키보드 내비게이션
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") pageFlip.flipPrev();
    else if (e.key === "ArrowRight") pageFlip.flipNext();
  });

  updateIndicator();
  window._pageFlip = pageFlip;
}

/* ============================================
   태블릿/모바일: 풀스크린 카드 뷰
   이미지 상단, 동화 텍스트 하단 레이아웃
   ============================================ */
function initMobileBook() {
  const bookEl = document.getElementById("book");
  const bookStage = document.querySelector(".book-stage");
  if (!bookEl || !bookStage) return;

  // 기존 페이지 요소들을 수집
  const allPages = Array.from(bookEl.querySelectorAll(".page"));
  const covers = allPages.filter((p) => p.classList.contains("page-cover"));
  const illustrations = allPages.filter((p) =>
    p.classList.contains("page-illustration"),
  );
  const stories = allPages.filter((p) => p.classList.contains("page-story"));

  // 모바일 슬라이드를 담을 컨테이너 생성
  const mobileContainer = document.createElement("div");
  mobileContainer.className = "mobile-book";

  const slides = [];

  /* --- 슬라이드 0: 앞표지 --- */
  const frontCover = document.createElement("div");
  frontCover.className = "mobile-page mobile-cover";
  frontCover.innerHTML = covers[0].innerHTML;
  slides.push(frontCover);

  /* --- 슬라이드 1~5: 스토리 (이미지 상단 + 텍스트 하단) --- */
  for (let i = 0; i < illustrations.length; i++) {
    const slide = document.createElement("div");
    slide.className = "mobile-page mobile-story-card";

    // 이미지 영역
    const imgSection = document.createElement("div");
    imgSection.className = "mobile-img-section";
    const imgWrap = illustrations[i].querySelector(".illustration-wrap");
    if (imgWrap) imgSection.innerHTML = imgWrap.innerHTML;

    // 텍스트 영역
    const textSection = document.createElement("div");
    textSection.className = "mobile-text-section";
    const storyWrap = stories[i].querySelector(".story-wrap");
    if (storyWrap) textSection.innerHTML = storyWrap.innerHTML;

    slide.appendChild(imgSection);
    slide.appendChild(textSection);
    slides.push(slide);
  }

  /* --- 마지막 슬라이드: 뒷표지 --- */
  const backCover = document.createElement("div");
  backCover.className = "mobile-page mobile-cover";
  backCover.innerHTML = covers[1] ? covers[1].innerHTML : covers[0].innerHTML;
  slides.push(backCover);

  // 기존 book 컨테이너 내용을 비우고, 모바일 컨테이너로 교체
  bookEl.style.display = "none";
  slides.forEach((slide, idx) => {
    slide.dataset.slideIndex = idx;
    if (idx !== 0) slide.style.display = "none";
    mobileContainer.appendChild(slide);
  });
  bookStage.appendChild(mobileContainer);

  // 모바일 네비게이션 로직
  let currentSlide = 0;
  const totalSlides = slides.length;
  const TOTAL_STORIES = illustrations.length;

  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  const pageIndicator = document.getElementById("page-indicator");

  /* 현재 슬라이드 표시 + 부드러운 전환 애니메이션 */
  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.style.display = "flex";
        // 슬라이드 등장 애니메이션
        slide.style.animation = "none";
        slide.offsetHeight; // 리플로우 트리거
        slide.style.animation = "mobileFadeIn 0.35s ease-out";
      } else {
        slide.style.display = "none";
      }
    });

    // 인디케이터 업데이트
    if (index === 0) {
      pageIndicator.textContent = "표지";
    } else if (index === totalSlides - 1) {
      pageIndicator.textContent = "끝";
    } else {
      pageIndicator.textContent = `${index} / ${TOTAL_STORIES}`;
    }
  }

  // 이전 / 다음 버튼
  prevBtn.addEventListener("click", () => {
    if (currentSlide > 0) {
      currentSlide--;
      showSlide(currentSlide);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      showSlide(currentSlide);
    }
  });

  // 키보드 내비게이션
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentSlide > 0) {
      currentSlide--;
      showSlide(currentSlide);
    } else if (e.key === "ArrowRight" && currentSlide < totalSlides - 1) {
      currentSlide++;
      showSlide(currentSlide);
    }
  });

  /* --- 터치 스와이프 지원 (어린이 친화적) --- */
  let touchStartX = 0;
  let touchEndX = 0;
  const SWIPE_THRESHOLD = 50; // 최소 스와이프 거리 (px)

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
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      // 왼쪽 스와이프 → 다음 페이지
      if (diff > SWIPE_THRESHOLD && currentSlide < totalSlides - 1) {
        currentSlide++;
        showSlide(currentSlide);
      }
      // 오른쪽 스와이프 → 이전 페이지
      else if (diff < -SWIPE_THRESHOLD && currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
      }
    },
    { passive: true },
  );

  // 초기 슬라이드 표시
  showSlide(0);
}

/* ============================================
   오디오 플레이어 (데스크톱/모바일 공통)
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

  // 패널 토글
  toggleBtn.addEventListener("click", () => {
    isPanelOpen = !isPanelOpen;
    panel.classList.toggle("open", isPanelOpen);
  });

  // 외부 클릭 시 패널 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".audio-player")) {
      isPanelOpen = false;
      panel.classList.remove("open");
    }
  });

  // 재생 / 일시정지 상태 업데이트
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

  // 시간 포맷
  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 프로그레스 바 업데이트
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      progressFill.style.width =
        (audio.currentTime / audio.duration) * 100 + "%";
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  // 시크 (프로그레스 바 클릭)
  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  // 볼륨 슬라이더
  volumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    previousVolume = vol;
    isMuted = false;
    updateVolumeIcon(vol);
  });

  // 음소거 토글
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

  // 볼륨 아이콘 업데이트
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
