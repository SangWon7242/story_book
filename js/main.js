/* ============================================
   비프의 푸른 바다 모험 - Main Application JS
   Open-Book Layout (양면 펼침)
   Left=Illustration(캐릭터), Right=Text(동화)
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  initBook();
  initAudioPlayer();
});

/* ========================
   Book (StPageFlip) 설정
   양면 펼침 모드 (usePortrait: false)
   ======================== */
function initBook() {
  const bookEl = document.getElementById("book");
  const bookStage = document.querySelector(".book-stage");
  if (!bookEl || !bookStage) return;

  // 사용 가능한 영역 계산
  const stageRect = bookStage.getBoundingClientRect();
  const availW = stageRect.width;
  const availH = stageRect.height;

  // 각 페이지(한 면)는 3:4 비율
  const pageRatio = 3 / 4;

  // 양면 펼침: 전체 너비의 절반이 한 페이지의 너비
  let pageW, pageH;

  // 높이 기준으로 먼저 계산
  pageH = Math.floor(availH * 0.98);
  pageW = Math.floor(pageH * pageRatio);

  // 두 페이지를 나란히 놓았을 때 가로 공간을 초과하면 가로 기준으로 재계산
  if (pageW * 2 > availW * 0.98) {
    pageW = Math.floor((availW * 0.98) / 2);
    pageH = Math.floor(pageW / pageRatio);
  }

  // 최소 크기 보장 (너무 작으면 읽기 어려움)
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
    /* ★ 핵심: usePortrait를 false로 설정하여 항상 양면 펼침 */
    usePortrait: false,
    startZIndex: 0,
    autoSize: false,
    drawShadow: true,
  });

  const pages = document.querySelectorAll(".page");
  pageFlip.loadFromHTML(pages);

  // 네비게이션 버튼
  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  const pageIndicator = document.getElementById("page-indicator");

  // 총 스토리 수 (커버 제외, 이미지+텍스트 페이지 쌍의 수)
  const TOTAL_STORIES = 5;

  /**
   * 현재 페이지 인덱스를 기반으로 인디케이터 업데이트
   * 양면 펼침 구조:
   * [Front Cover(0)] [Img1(1)+Txt1(2)] [Img2(3)+Txt2(4)] ... [Back Cover(11)]
   */
  const updateIndicator = () => {
    const current = pageFlip.getCurrentPageIndex();
    const total = pageFlip.getPageCount();

    // 표지 페이지
    if (current === 0) {
      pageIndicator.textContent = "표지";
      return;
    }

    // 뒷표지
    if (current >= total - 1) {
      pageIndicator.textContent = "끝";
      return;
    }

    // 스토리 번호 계산: 페이지 1-2 → 스토리1, 3-4 → 스토리2, ...
    const storyNum = Math.ceil(current / 2);
    pageIndicator.textContent = `${storyNum} / ${TOTAL_STORIES}`;
  };

  prevBtn.addEventListener("click", () => pageFlip.flipPrev());
  nextBtn.addEventListener("click", () => pageFlip.flipNext());

  pageFlip.on("flip", updateIndicator);

  // 키보드 내비게이션 (좌우 화살표)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") pageFlip.flipPrev();
    else if (e.key === "ArrowRight") pageFlip.flipNext();
  });

  updateIndicator();
  window._pageFlip = pageFlip;
}

/* ========================
   오디오 플레이어
   ======================== */
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
