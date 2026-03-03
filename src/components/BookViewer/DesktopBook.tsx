"use client";

import { useRef, useEffect, useState, useCallback, Fragment } from "react";
import type { StoryData } from "@/types/story";
import styles from "./DesktopBook.module.css";

/**
 * DesktopBook — page-flip 라이브러리를 사용한 양면 펼침 뷰
 * 데스크톱(768px 초과)에서만 렌더링됩니다.
 */

interface Props {
  story: StoryData;
  currentPage: number;
  onPageChange: (page: number) => void;
  activeSentenceIdx: number;
  audioChapter: number;
  audioPlaying: boolean;
}

export default function DesktopBook({
  story,
  currentPage,
  onPageChange,
  activeSentenceIdx,
  audioChapter,
  audioPlaying,
}: Props) {
  const bookRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageFlipRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  /* PageFlip 초기화 (dynamic import) */
  useEffect(() => {
    if (!bookRef.current) return;
    let destroyed = false;

    import("page-flip").then(({ PageFlip }) => {
      if (destroyed || !bookRef.current) return;

      const container = bookRef.current;
      const parent = container.parentElement;
      if (!parent) return;

      /* 사용 가능 영역 계산 */
      const availW = parent.clientWidth - 40;
      const availH = parent.clientHeight - 20;

      /* 3:4 비율 유지 */
      const pageW = Math.max(220, Math.min(availW / 2, (availH * 3) / 4));
      const pageH = Math.max(300, Math.min(availH, (pageW * 4) / 3));

      const pf = new PageFlip(container, {
        width: Math.round(pageW),
        height: Math.round(pageH),
        size: "fixed",
        minWidth: 220,
        minHeight: 300,
        maxWidth: 800,
        maxHeight: 1066,
        showCover: true,
        maxShadowOpacity: 0.5,
        flippingTime: 800,
        useMouseEvents: true,
        startPage: 0,
        drawShadow: true,
        autoSize: false,
        startZIndex: 0,
        usePortrait: false,
        mobileScrollSupport: false,
      });

      /* 페이지 요소들 수집 */
      const pages = container.querySelectorAll(`.${styles.page}`);
      pf.loadFromHTML(pages as NodeListOf<HTMLElement>);

      pf.on("flip", (e: { data: number }) => {
        onPageChange(e.data);
      });

      pageFlipRef.current = pf;
      setReady(true);
    });

    return () => {
      destroyed = true;
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy();
        pageFlipRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 외부 페이지 변경 시 플립 */
  useEffect(() => {
    if (!ready || !pageFlipRef.current) return;
    const pfPage = pageFlipRef.current.getCurrentPageIndex();
    if (pfPage !== currentPage) {
      pageFlipRef.current.flip(currentPage);
    }
  }, [currentPage, ready]);

  /* 코너 힌트 애니메이션 */
  const showHint = useCallback(() => {
    if (pageFlipRef.current && ready) {
      pageFlipRef.current.flipNext();
    }
  }, [ready]);
  void showHint; // suppress unused

  return (
    <div className={styles.bookContainer}>
      <div ref={bookRef} className={styles.book}>
        {/* === 앞표지 === */}
        <div
          className={`${styles.page} ${styles.pageCover}`}
          data-density="hard"
        >
          <div className={styles.coverContent}>
            <div className={styles.coverTitle}>{story.title}</div>
            <div className={styles.coverDecoration} />
            <div className={styles.coverSubtitle}>{story.subtitle}</div>
          </div>
        </div>

        {/* === 스토리 페이지들 (일러스트 + 텍스트 쌍) === */}
        {story.chapters.map((ch, i) => (
          <Fragment key={`ch-${i}`}>
            {/* 일러스트 페이지 (왼쪽) */}
            <div
              className={`${styles.page} ${styles.pageIllustration}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/${ch.image}`} alt={ch.imageAlt} />
            </div>

            {/* 텍스트 페이지 (오른쪽) */}
            <div
              className={`${styles.page} ${styles.pageStory}`}
            >
              <div className={styles.storyWrap}>
                <div className={styles.storyChapter}>
                  Chapter {ch.chapterNum}
                </div>
                <h3 className={styles.storyTitle}>{ch.title}</h3>
                <div className={styles.storyDivider} />
                <div className={styles.storyBody}>
                  {ch.sentences.map((s, si) => {
                    const isActive =
                      i === audioChapter && si === activeSentenceIdx;
                    const isRead =
                      i === audioChapter &&
                      audioPlaying &&
                      si < activeSentenceIdx;
                    return (
                      <span
                        key={si}
                        className={`${styles.sentence} ${isActive ? styles.active : ""} ${isRead ? styles.read : ""}`}
                      >
                        {s.text}
                      </span>
                    );
                  })}
                </div>
                <div className={styles.pageNumber}>
                  {ch.chapterNum} / {story.chapters.length}
                </div>
              </div>
            </div>
          </Fragment>
        ))}

        {/* === 뒷표지 === */}
        <div
          className={`${styles.page} ${styles.pageCover}`}
          data-density="hard"
        >
          <div className={styles.coverContent}>
            <div className={styles.coverTitle}>끝 ✨</div>
            <div className={styles.coverDecoration} />
            <div className={styles.coverSubtitle}>
              Powered by AI Vibe Coding
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
