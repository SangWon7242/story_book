"use client";

/**
 * Book3D — 3D 하드커버 책 컴포넌트
 *
 * CSS 3D Transform을 활용한 하드커버 책 UI
 * - perspective + preserve-3d로 3D 공간 생성
 * - ::before/::after 가상 요소로 표지 두께 표현
 * - hover 시 앞표지 열림 + 페이지 부채꼴 펼침 애니메이션
 */

import styles from "./Book3D.module.css";

interface Book3DProps {
  /** 표지 이미지 URL */
  coverImage?: string;
  /** 책 제목 */
  title: string;
  /** 부제목 */
  subtitle?: string;
  /** 페이지 수 (최소 5) */
  pageCount?: number;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 비활성 상태 (준비 중) */
  disabled?: boolean;
  /** 배지 텍스트 */
  badge?: string;
}

export default function Book3D({
  coverImage,
  title,
  subtitle,
  pageCount = 6,
  onClick,
  disabled = false,
  badge,
}: Book3DProps) {
  /* 페이지 배열 생성 (최소 5장) */
  const pages = Array.from({ length: Math.max(pageCount, 5) });

  return (
    <figure
      className={`${styles.book} ${disabled ? styles.disabled : ""}`}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${title}${disabled ? " (준비 중)" : ""}`}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <ul className={styles.hardcover_front}>
        {/* ============================================
            앞표지 (Front Cover)
            - ::before = 우측 두께면 (rotateY(90deg))
            - ::after  = 하단 두께면 (rotateX(-90deg))
            ============================================ */}
        <li>
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt={title} className={styles.coverImg} />
          ) : (
            <div className={styles.placeholderCover}>
              <span className={styles.placeholderEmoji}>📖</span>
            </div>
          )}

          {/* 제목 오버레이 */}
          <div className={styles.coverOverlay}>
            <h3 className={styles.coverTitle}>{title}</h3>
            {subtitle && <p className={styles.coverSubtitle}>{subtitle}</p>}
          </div>

          {/* 배지 (준비 중 등) */}
          {badge && <span className={styles.badge}>{badge}</span>}
        </li>
      </ul>

      {/* ============================================
          내부 페이지들 (Pages)
          - 각 페이지는 약간 다른 translateZ로 쌓임
          - hover 시 부채꼴 펼침 (-30deg ~ -50deg)
          ============================================ */}
      {pages.map((_, i) => (
        <ul key={i} className={styles.page}>
          <li>
            {/* 페이지 앞면: 크림색 종이 질감 */}
            <div className={styles.pageFront}>
              <span className={styles.pageNumber}>
                {i === 0 ? "" : pages.length - i}
              </span>
            </div>
          </li>
        </ul>
      ))}

      {/* ============================================
          뒤표지 (Back Cover)
          - ::before = 우측 두께면
          - ::after  = 하단 두께면
          ============================================ */}
      <ul className={styles.hardcover_back}>
        <li />
      </ul>
    </figure>
  );
}
