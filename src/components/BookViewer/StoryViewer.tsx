"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
 * Phase 1~4 기능 모두 통합 완료
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
  const totalPages = story.chapters.length + 2; /* +표지 +뒷표지 */
  const [currentPage, setCurrentPage] = useState(0);

  /* === 오디오 플레이어 훅 (프롬프트 1) === */
  const audio = useAudioPlayer(story.chapters);

  /* === 반응형 분기 (프롬프트 6) === */
  const { isMobile } = useResponsive();

  /* === 이어읽기 (프롬프트 10) === */
  const { getSavedPage, clearProgress } = useReadingProgress(currentPage);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const resumePageRef = useRef(0);

  /* 초기 로드 시 이어읽기 토스트 표시 */
  useEffect(() => {
    const saved = getSavedPage();
    if (saved > 0) {
      resumePageRef.current = saved;
      setShowResumeToast(true);
      /* 5초 후 자동 사라짐 */
      const timer = setTimeout(() => setShowResumeToast(false), 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* === 자동 넘김 (프롬프트 9) === */
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

  /* 자동 넘김 토글 */
  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((v) => !v);
  }, []);

  /* 자동 넘김 속도 순환 */
  const cycleAutoSpeed = useCallback(() => {
    setAutoSpeed((prev) => {
      const idx = AUTO_SPEED_ORDER.indexOf(prev);
      return AUTO_SPEED_ORDER[(idx + 1) % AUTO_SPEED_ORDER.length];
    });
  }, []);

  /* === 페이지 전환 시 오디오 챕터 전환 (프롬프트 1) === */
  useEffect(() => {
    const chIdx =
      currentPage >= 1 && currentPage <= story.chapters.length
        ? currentPage - 1
        : -1;
    audio.switchChapter(chIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /* === 키보드 내비게이션 (프롬프트 3) === */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  /* === 문장 하이라이팅 인덱스 계산 (프롬프트 2) === */
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

  /* 현재 페이지에 해당하는 챕터 인덱스 (-1 = 표지/뒷표지) */
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

  /* 이어읽기 핸들러 */
  const handleResume = () => {
    setCurrentPage(resumePageRef.current);
    setShowResumeToast(false);
  };

  /* 처음으로 핸들러 */
  const handleRestart = () => {
    setCurrentPage(0);
    clearProgress();
  };

  return (
    <div className={styles.appContainer}>
      {/* === 이어읽기 토스트 (프롬프트 10) === */}
      {showResumeToast && (
        <div className={styles.resumeToast}>
          📖 이전에 읽던 곳이 있어요!
          <button className={styles.resumeToastBtn} onClick={handleResume}>
            이어서 읽기
          </button>
          <button
            className={styles.resumeToastClose}
            onClick={() => setShowResumeToast(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* === 상단 바 + 읽기 진행률 (프롬프트 4, 5) === */}
      <TopBar
        title={story.title}
        progress={totalPages > 1 ? currentPage / (totalPages - 1) : 0}
      />

      {/* === 책 영역 === */}
      <div className={styles.bookArea}>
        {!isMobile ? (
          /* 데스크톱: PageFlip 양면 펼침 (프롬프트 7) */
          <DesktopBook
            story={story}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            activeSentenceIdx={activeSentenceIdx}
            audioChapter={audio.currentChapter}
            audioPlaying={audio.isPlaying}
          />
        ) : (
          /* 모바일: 카드 뷰 */
          <div className={styles.bookStage}>
            {currentPage === 0 && (
              <div className={styles.coverPage}>
                <div className={styles.coverTitle}>{story.title}</div>
                <div className={styles.coverDecoration} />
                <div className={styles.coverSubtitle}>{story.subtitle}</div>
              </div>
            )}

            {chapter && (
              <div className={styles.storyCard}>
                <div className={styles.imgSection}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/${chapter.image}`} alt={chapter.imageAlt} />
                </div>
                <div className={styles.textSection}>
                  <div className={styles.storyChapter}>
                    Chapter {chapter.chapterNum}
                  </div>
                  <h3 className={styles.storyTitle}>{chapter.title}</h3>
                  <div className={styles.storyDivider} />
                  <div className={styles.storyBody}>
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
                        >
                          {s.text}
                        </span>
                      );
                    })}
                  </div>
                  <div className={styles.pageNumber}>
                    {chapter.chapterNum} / {story.chapters.length}
                  </div>
                </div>
              </div>
            )}

            {currentPage === totalPages - 1 && (
              <div className={styles.coverPage}>
                <div className={styles.coverTitle}>끝 ✨</div>
                <div className={styles.coverDecoration} />
                <div className={styles.coverSubtitle}>
                  Powered by AI Vibe Coding
                </div>
                {/* 처음으로 버튼 (프롬프트 10) */}
                <button className={styles.restartBtn} onClick={handleRestart}>
                  🏠 처음으로
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === 하단 네비게이션 === */}
      <nav className={styles.bottomNav}>
        <button
          className={`${styles.navBtn} ${styles.navBtnPrev}`}
          onClick={goPrev}
          disabled={currentPage === 0}
          aria-label="이전 페이지"
        >
          ◀ 이전
        </button>

        {/* 자동 넘김 버튼 (프롬프트 9) */}
        <button
          className={`${styles.navBtn} ${styles.navBtnAuto} ${autoPlay ? styles.navBtnAutoActive : ""}`}
          onClick={toggleAutoPlay}
          aria-label={autoPlay ? "자동 넘김 정지" : "자동 넘김 시작"}
        >
          {autoPlay ? "⏹ 정지" : "▶ 자동"}
        </button>

        {/* 자동 넘김 속도 (프롬프트 9) */}
        {autoPlay && (
          <button
            className={`${styles.navBtn} ${styles.navBtnSpeed}`}
            onClick={cycleAutoSpeed}
            aria-label="자동 넘김 속도 변경"
          >
            {AUTO_SPEED_LABELS[autoSpeed]}
          </button>
        )}

        <span className={styles.pageIndicator}>{getIndicatorText()}</span>

        <button
          className={`${styles.navBtn} ${styles.navBtnNext}`}
          onClick={goNext}
          disabled={currentPage === totalPages - 1}
          aria-label="다음 페이지"
        >
          다음 ▶
        </button>
      </nav>

      {/* === 오디오 플레이어 (프롬프트 1) === */}
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
