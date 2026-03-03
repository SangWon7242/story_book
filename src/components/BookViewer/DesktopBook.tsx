"use client";

import { useRef, useEffect, useState, Fragment } from "react";
import type { StoryData } from "@/types/story";
import styles from "./DesktopBook.module.css";

/**
 * DesktopBook — page-flip 라이브러리를 사용한 양면 펼침 뷰
 * 데스크톱(768px 초과)에서만 렌더링됩니다.
 *
 * 페이지 매핑:
 *   StoryViewer currentPage (챕터 단위):
 *     0 = 표지, 1 = Ch1, 2 = Ch2, ..., N+1 = 뒷표지
 *
 *   PageFlip 물리 페이지:
 *     0 = 앞표지 (hard)
 *     1 = Ch1 일러스트,  2 = Ch1 텍스트
 *     3 = Ch2 일러스트,  4 = Ch2 텍스트
 *     ...
 *     2N+1 = 뒷표지 (hard)
 *
 *   변환: chapterPage → pfPage = chapterPage === 0 ? 0
 *                                : chapterPage > chapters.length ? 2*chapters.length + 1
 *                                : (chapterPage - 1) * 2 + 1  (일러스트 페이지)
 *
 *   역변환: pfPage → chapterPage = pfPage === 0 ? 0
 *                                  : pfPage >= 2*chapters.length + 1 ? chapters.length + 1
 *                                  : Math.floor((pfPage - 1) / 2) + 1
 */

interface Props {
  story: StoryData;
  /** 챕터 단위 페이지 인덱스 (0=표지) */
  currentPage: number;
  /** 챕터 단위 페이지 변경 콜백 */
  onPageChange: (chapterPage: number) => void;
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
  const chaptersLen = story.chapters.length;

  /* ============================
     챕터 ↔ PageFlip 인덱스 변환
     ============================ */
  const chapterToPhysical = (cp: number): number => {
    if (cp <= 0) return 0;
    if (cp > chaptersLen) return chaptersLen * 2 + 1;
    return (cp - 1) * 2 + 1; // 일러스트 페이지
  };

  const physicalToChapter = (pf: number): number => {
    if (pf <= 0) return 0;
    if (pf >= chaptersLen * 2 + 1) return chaptersLen + 1;
    return Math.floor((pf - 1) / 2) + 1;
  };

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

      /* flip 이벤트 → 챕터 인덱스로 변환하여 부모에 알림 */
      pf.on("flip", (e: { data: number }) => {
        const chPage = physicalToChapter(e.data);
        onPageChange(chPage);
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

  /* 외부 페이지 변경 시 → 물리 페이지로 변환하여 플립 */
  useEffect(() => {
    if (!ready || !pageFlipRef.current) return;
    const targetPf = chapterToPhysical(currentPage);
    const curPf = pageFlipRef.current.getCurrentPageIndex();
    if (curPf !== targetPf) {
      pageFlipRef.current.flip(targetPf);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, ready]);

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
            <div className={`${styles.page} ${styles.pageIllustration}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/${ch.image}`} alt={ch.imageAlt} />
            </div>

            {/* 텍스트 페이지 (오른쪽) */}
            <div className={`${styles.page} ${styles.pageStory}`}>
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
