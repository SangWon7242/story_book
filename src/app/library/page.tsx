"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import styles from "./library.module.css";

/**
 * 스토리 라이브러리 — 3D 책장에서 동화를 선택하는 화면
 */

interface StoryMeta {
  id: string;
  title: string;
  subtitle: string;
  chaptersCount: number;
  coverImage: string;
  theme: string;
  protagonist: string;
  style: string;
}

/* 더미 라이브러리 데이터 (향후 API 확장 가능) */
const STORIES: StoryMeta[] = [
  {
    id: "story1",
    title: "비프의 푸른 바다 모험",
    subtitle: "화성에서 온 로봇, 비프의 신비로운 지구 탐험기",
    chaptersCount: 6,
    coverImage: "/assets/images/1.png",
    theme: "새로운 만남과 우정",
    protagonist: "로봇 비프 & 집게",
    style: "사이버펑크 동화",
  },
  {
    id: "coming-soon-1",
    title: "달빛 정원의 비밀",
    subtitle: "마법 정원에서 시작되는 신비한 모험",
    chaptersCount: 0,
    coverImage: "",
    theme: "자연과 마법",
    protagonist: "꽃 요정 루나",
    style: "판타지 동화",
  },
  {
    id: "coming-soon-2",
    title: "해저 왕국 탐험대",
    subtitle: "용감한 바다 탐험가들의 이야기",
    chaptersCount: 0,
    coverImage: "",
    theme: "용기와 모험",
    protagonist: "잠수함 캡틴 솔",
    style: "해양 모험 동화",
  },
];

/* SSR-safe 마운트 감지 (useEffect setState 없이) */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function LibraryPage() {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleSelectStory = (storyId: string, available: boolean) => {
    if (!available) return;
    router.push(`/?story=${storyId}`);
  };

  if (!mounted) return null;

  return (
    <div className={styles.libraryContainer}>
      {/* 배경 장식 */}
      <div className={styles.bgGlow} aria-hidden="true" />

      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>📚 동화 책장</h1>
        <p className={styles.headerSub}>좋아하는 이야기를 골라보세요!</p>
      </header>

      {/* 3D 책장 */}
      <main className={styles.shelf} role="list" aria-label="동화 목록">
        {STORIES.map((story, idx) => {
          const available = story.chaptersCount > 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={story.id}
              className={`${styles.bookSlot} ${!available ? styles.comingSoon : ""}`}
              role="listitem"
              style={{ animationDelay: `${idx * 0.12}s` }}
            >
              <button
                className={styles.book3d}
                onClick={() => handleSelectStory(story.id, available)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(idx)}
                onBlur={() => setHoveredIdx(null)}
                aria-label={`${story.title}${available ? "" : " (준비 중)"}`}
                disabled={!available}
              >
                {/* 책 앞면 */}
                <div className={styles.bookFront}>
                  {story.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className={styles.coverImg}
                    />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <span className={styles.placeholderIcon}>📖</span>
                    </div>
                  )}
                  <div className={styles.bookTitleOverlay}>
                    <span className={styles.bookTitle}>{story.title}</span>
                  </div>
                  {!available && (
                    <div className={styles.comingSoonBadge}>준비 중</div>
                  )}
                </div>

                {/* 책 옆면 (두께) */}
                <div className={styles.bookSpine} aria-hidden="true">
                  <span className={styles.spineTitle}>{story.title}</span>
                </div>

                {/* 책 윗면 */}
                <div className={styles.bookTop} aria-hidden="true" />
              </button>

              {/* 호버 메타 정보 */}
              {isHovered && (
                <div className={styles.metaTooltip} role="tooltip">
                  <h3 className={styles.metaTitle}>{story.title}</h3>
                  <p className={styles.metaSub}>{story.subtitle}</p>
                  <div className={styles.metaTags}>
                    <span>🎨 {story.theme}</span>
                    <span>🤖 {story.protagonist}</span>
                    <span>✨ {story.style}</span>
                    {available && <span>📖 {story.chaptersCount}개 챕터</span>}
                  </div>
                  {available ? (
                    <div className={styles.metaCta}>클릭하여 읽기 시작!</div>
                  ) : (
                    <div className={styles.metaCta}>곧 만나요!</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* 하단 장식 */}
      <footer className={styles.footer} aria-hidden="true">
        <div className={styles.shelfEdge} />
        <p className={styles.footerText}>Powered by AI Vibe Coding ✨</p>
      </footer>
    </div>
  );
}
