"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { StoryData } from "@/types/story";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useResponsive } from "@/hooks/useResponsive";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import TopBar from "@/components/TopBar/TopBar";
import DesktopBook from "./DesktopBook";
import styles from "./StoryViewer.module.css";

/**
 * StoryViewer — 메인 동화책 뷰어 컴포넌트
 * 모든 기능 통합: 오디오, 하이라이팅, 키보드, 상단바, 진행률, 반응형,
 * PageFlip, 자동넘김, 이어읽기, 오디오 종료 자동넘김, 접근성
 */
interface Props {
  story: StoryData;
}

type AutoSpeed = "normal" | "fast" | "slow";
const AUTO_SPEED_MS: Record<AutoSpeed, number> = {
  normal: 8000,
  fast: 5000,
  slow: 12000,
};
const AUTO_SPEED_LABELS: Record<AutoSpeed, string> = {
  normal: "보통",
  fast: "빠름",
  slow: "느림",
};
const AUTO_SPEED_ORDER: AutoSpeed[] = ["normal", "fast", "slow"];

export default function StoryViewer({ story }: Props) {
  const router = useRouter();
  const totalPages = story.chapters.length + 2; /* +표지 +뒷표지 */
  const [currentPage, setCurrentPage] = useState(0);

  /* === 오디오 종료 시 자동 다음 챕터 넘김 === */
  const handleChapterEnd = useCallback(
    (endedChapterIdx: number) => {
      /* 다음 챕터가 있으면 자동으로 넘김 */
      const nextPage = endedChapterIdx + 2; // endedChapterIdx+1 = 다음챕터, +1 = 표지 오프셋
      if (nextPage < totalPages) {
        setCurrentPage(nextPage);
      }
    },
    [totalPages],
  );

  /* === 오디오 플레이어 훅 === */
  const audio = useAudioPlayer(story.chapters, {
    onChapterEnd: handleChapterEnd,
  });

  /* === 반응형 분기 === */
  const { isMobile } = useResponsive();

  /* === 이어읽기 === */
  const { getSavedPage, clearProgress } = useReadingProgress(currentPage);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const resumePageRef = useRef(0);

  /* 초기 로드 시 이어읽기 토스트 표시 */
  useEffect(() => {
    const saved = getSavedPage();
    if (saved > 0) {
      resumePageRef.current = saved;
      setShowResumeToast(true);
      const timer = setTimeout(() => setShowResumeToast(false), 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* === 자동 넘김 === */
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState<AutoSpeed>("normal");
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 페이지 전환 */
  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

  /* 자동 넘김 타이머 */
  useEffect(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (autoPlay && currentPage < totalPages - 1) {
      autoTimerRef.current = setTimeout(() => {
        goNext();
      }, AUTO_SPEED_MS[autoSpeed]);
    }
    if (currentPage === totalPages - 1) {
      setAutoPlay(false);
    }
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoPlay, autoSpeed, currentPage, totalPages, goNext]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((v) => !v);
  }, []);

  const cycleAutoSpeed = useCallback(() => {
    setAutoSpeed((prev) => {
      const idx = AUTO_SPEED_ORDER.indexOf(prev);
      return AUTO_SPEED_ORDER[(idx + 1) % AUTO_SPEED_ORDER.length];
    });
  }, []);

  /* === 페이지 전환 시 오디오 챕터 전환 === */
  useEffect(() => {
    const chIdx =
      currentPage >= 1 && currentPage <= story.chapters.length
        ? currentPage - 1
        : -1;
    audio.switchChapter(chIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /* === 키보드 내비게이션 + 접근성 단축키 === */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case " ":
          /* 스페이스바로 오디오 재생/정지 */
          e.preventDefault();
          audio.toggle();
          break;
        case "Home":
          e.preventDefault();
          setCurrentPage(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentPage(totalPages - 1);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goNext, goPrev, totalPages]);

  /* === 문장 하이라이팅 인덱스 계산 === */
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

  /* 현재 페이지에 해당하는 챕터 인덱스 */
  const chapterIdx =
    currentPage >= 1 && currentPage <= story.chapters.length
      ? currentPage - 1
      : -1;
  const chapter = chapterIdx >= 0 ? story.chapters[chapterIdx] : null;

  /* 페이지 인디케이터 텍스트 */
  const getIndicatorText = () => {
    if (currentPage === 0) return "표지";
    if (currentPage === totalPages - 1) return "끝";
    return `${currentPage} / ${story.chapters.length}`;
  };

  /* 접근성: 현재 페이지 설명 (aria-live 용) */
  const getPageDescription = () => {
    if (currentPage === 0) return `${story.title} 표지`;
    if (currentPage === totalPages - 1)
      return "마지막 페이지. 이야기가 끝났습니다.";
    if (chapter)
      return `챕터 ${chapter.chapterNum}: ${chapter.title}. ${story.chapters.length}개 중 ${chapter.chapterNum}번째.`;
    return "";
  };

  const handleResume = () => {
    setCurrentPage(resumePageRef.current);
    setShowResumeToast(false);
  };

  /* 처음으로(라이브러리) 핸들러 */
  const handleRestart = () => {
    audio.stopAll();
    clearProgress();
    router.push("/library");
  };

  return (
    <div
      className={styles.appContainer}
      role="application"
      aria-label={`${story.title} 인터랙티브 동화책`}
    >
      {/* === 접근성: 스크린리더용 라이브 리전 === */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {getPageDescription()}
      </div>

      {/* === 접근성: 키보드 단축키 설명 (스크린리더 전용) === */}
      <div className="sr-only" role="note" aria-label="키보드 단축키">
        좌우 화살표로 페이지를 넘길 수 있습니다. 스페이스바로 오디오를
        재생하거나 정지할 수 있습니다. Home 키는 처음으로, End 키는 마지막
        페이지로 이동합니다.
      </div>

      {/* === 이어읽기 토스트 === */}
      {showResumeToast && (
        <div className={styles.resumeToast} role="alert">
          📖 이전에 읽던 곳이 있어요!
          <button className={styles.resumeToastBtn} onClick={handleResume}>
            이어서 읽기
          </button>
          <button
            className={styles.resumeToastClose}
            onClick={() => setShowResumeToast(false)}
            aria-label="알림 닫기"
          >
            ✕
          </button>
        </div>
      )}

      {/* === 상단 바 + 읽기 진행률 === */}
      <TopBar
        title={story.title}
        progress={totalPages > 1 ? currentPage / (totalPages - 1) : 0}
      />

      {/* === 책 영역 === */}
      <main className={styles.bookArea} aria-label="동화책 내용">
        {!isMobile ? (
          <DesktopBook
            story={story}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            activeSentenceIdx={activeSentenceIdx}
            audioChapter={audio.currentChapter}
            audioPlaying={audio.isPlaying}
          />
        ) : (
          <div className={styles.bookStage}>
            {currentPage === 0 && (
              <div
                className={styles.coverPage}
                role="img"
                aria-label={`${story.title} 표지`}
              >
                <div className={styles.coverTitle}>{story.title}</div>
                <div className={styles.coverDecoration} aria-hidden="true" />
                <div className={styles.coverSubtitle}>{story.subtitle}</div>
              </div>
            )}

            {chapter && (
              <article
                className={styles.storyCard}
                aria-label={`챕터 ${chapter.chapterNum}: ${chapter.title}`}
              >
                <div className={styles.imgSection}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/${chapter.image}`} alt={chapter.imageAlt} />
                </div>
                <div className={styles.textSection}>
                  <div className={styles.storyChapter} aria-hidden="true">
                    Chapter {chapter.chapterNum}
                  </div>
                  <h2 className={styles.storyTitle}>{chapter.title}</h2>
                  <div className={styles.storyDivider} aria-hidden="true" />
                  <div
                    className={styles.storyBody}
                    role="region"
                    aria-label="이야기 내용"
                  >
                    {chapter.sentences.map((s, i) => {
                      const isActive =
                        chapterIdx === audio.currentChapter &&
                        i === activeSentenceIdx;
                      const isRead =
                        chapterIdx === audio.currentChapter &&
                        audio.isPlaying &&
                        i < activeSentenceIdx;
                      return (
                        <span
                          key={i}
                          className={`${styles.sentence} ${isActive ? styles.active : ""} ${isRead ? styles.read : ""}`}
                          aria-current={isActive ? "true" : undefined}
                        >
                          {s.text}
                        </span>
                      );
                    })}
                  </div>
                  <div className={styles.pageNumber} aria-hidden="true">
                    {chapter.chapterNum} / {story.chapters.length}
                  </div>
                </div>
              </article>
            )}

            {currentPage === totalPages - 1 && (
              <div
                className={styles.coverPage}
                role="img"
                aria-label="이야기 끝"
              >
                <div className={styles.coverTitle}>끝 ✨</div>
                <div className={styles.coverDecoration} aria-hidden="true" />
                <div className={styles.coverSubtitle}>
                  Powered by AI Vibe Coding
                </div>
                <button
                  className={styles.restartBtn}
                  onClick={handleRestart}
                  aria-label="처음부터 다시 읽기"
                >
                  🏠 처음으로
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* === 하단 네비게이션 === */}
      <nav className={styles.bottomNav} aria-label="페이지 내비게이션">
        <button
          className={`${styles.navBtn} ${styles.navBtnPrev}`}
          onClick={goPrev}
          disabled={currentPage === 0}
          aria-label={`이전 ${currentPage > 1 ? `챕터 ${currentPage - 1}` : "표지"}`}
        >
          ◀ 이전
        </button>

        <button
          className={`${styles.navBtn} ${styles.navBtnAuto} ${autoPlay ? styles.navBtnAutoActive : ""}`}
          onClick={toggleAutoPlay}
          aria-label={autoPlay ? "자동 넘김 정지" : "자동 넘김 시작"}
          aria-pressed={autoPlay}
        >
          {autoPlay ? "⏹ 정지" : "▶ 자동"}
        </button>

        {autoPlay && (
          <button
            className={`${styles.navBtn} ${styles.navBtnSpeed}`}
            onClick={cycleAutoSpeed}
            aria-label={`자동 넘김 속도: ${AUTO_SPEED_LABELS[autoSpeed]}`}
          >
            {AUTO_SPEED_LABELS[autoSpeed]}
          </button>
        )}

        <span
          className={styles.pageIndicator}
          role="status"
          aria-label={`현재 위치: ${getIndicatorText()}`}
        >
          {getIndicatorText()}
        </span>

        <button
          className={`${styles.navBtn} ${styles.navBtnNext}`}
          onClick={goNext}
          disabled={currentPage === totalPages - 1}
          aria-label={`다음 ${currentPage < story.chapters.length ? `챕터 ${currentPage + 1}` : "끝"}`}
        >
          다음 ▶
        </button>
      </nav>

      {/* === 오디오 플레이어 === */}
      <AudioPlayer
        isPlaying={audio.isPlaying}
        currentTime={audio.currentTime}
        duration={audio.duration}
        progress={audio.progress}
        volume={audio.volume}
        onTogglePlay={audio.toggle}
        onSeek={audio.seekTo}
        onVolumeChange={audio.setVolume}
      />
    </div>
  );
}
