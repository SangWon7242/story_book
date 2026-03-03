"use client";

import { useState, useCallback } from "react";
import type { StoryData } from "@/types/story";
import styles from "./StoryViewer.module.css";

/**
 * StoryViewer — 메인 동화책 뷰어 컴포넌트
 * 기존 index.html + main.js의 핵심 기능을 React로 포팅한 최소 버전입니다.
 *
 * Phase 1: 기본 모바일 카드 뷰 방식으로 동작
 * Phase 2에서 데스크톱 PageFlip 추가 예정
 */
interface Props {
  story: StoryData;
}

export default function StoryViewer({ story }: Props) {
  const totalPages = story.chapters.length + 2; /* +표지 +뒷표지 */
  const [currentPage, setCurrentPage] = useState(0);

  /* 페이지 전환 */
  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

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

  return (
    <div className={styles.appContainer}>
      {/* === 상단 바 === */}
      <div className={styles.topBar}>
        <div className={styles.topBarTitle}>
          <h1>📖 {story.title}</h1>
        </div>
      </div>

      {/* === 책 영역 === */}
      <div className={styles.bookArea}>
        <div className={styles.bookStage}>
          {/* 표지 */}
          {currentPage === 0 && (
            <div className={styles.coverPage}>
              <div className={styles.coverTitle}>{story.title}</div>
              <div className={styles.coverDecoration} />
              <div className={styles.coverSubtitle}>{story.subtitle}</div>
            </div>
          )}

          {/* 스토리 챕터 */}
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
                  {chapter.sentences.map((s, i) => (
                    <span key={i} className={styles.sentence}>
                      {s.text}
                    </span>
                  ))}
                </div>
                <div className={styles.pageNumber}>
                  {chapter.chapterNum} / {story.chapters.length}
                </div>
              </div>
            </div>
          )}

          {/* 뒷표지 */}
          {currentPage === totalPages - 1 && (
            <div className={styles.coverPage}>
              <div className={styles.coverTitle}>끝 ✨</div>
              <div className={styles.coverDecoration} />
              <div className={styles.coverSubtitle}>
                Powered by AI Vibe Coding
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
}
