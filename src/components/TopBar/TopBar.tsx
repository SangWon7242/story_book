"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./TopBar.module.css";

/**
 * TopBar — 상단 바 컴포넌트
 * 제목, 메타 정보, 글자크기, 다크모드 토글, 읽기 진행률 바
 */

interface Props {
  title: string;
  progress: number; // 0 ~ 1 (읽기 진행률)
}

type FontSize = "small" | "medium" | "large";
const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
};

export default function TopBar({ title, progress }: Props) {
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("storybook-theme") === "dark";
  });

  /* 다크모드 초기 적용 */
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* 글자 크기 변경 */
  const handleFontSize = (size: FontSize) => {
    setFontSize(size);
    document.documentElement.style.setProperty(
      "--font-size-adjust",
      String(FONT_SIZE_MAP[size]),
    );
  };

  /* 다크모드 토글 */
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("storybook-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("storybook-theme", "light");
    }
  };

  return (
    <>
      {/* === 읽기 진행률 바 (프롬프트 5) === */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* === 상단 바 === */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link
            href="/library"
            className={styles.topBarTitle}
            aria-label="동화 책장으로 돌아가기"
          >
            <h1>📖 {title}</h1>
          </Link>
        </div>

        <div className={styles.topBarRight}>
          {/* 메타 정보 */}
          <div className={styles.topBarMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>테마</span>
              <span className={styles.metaValue}>새로운 만남과 우정</span>
            </div>
            <div className={styles.metaDivider} />
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>주인공</span>
              <span className={styles.metaValue}>로봇 비프 &amp; 집게</span>
            </div>
            <div className={styles.metaDivider} />
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>스타일</span>
              <span className={styles.metaValue}>사이버펑크 동화</span>
            </div>
          </div>

          {/* 설정 도구 */}
          <div className={styles.settingsToolbar}>
            {/* 글자 크기 */}
            <div className={styles.fontSizeGroup}>
              {(["small", "medium", "large"] as FontSize[]).map((size) => (
                <button
                  key={size}
                  className={`${styles.fontBtn} ${fontSize === size ? styles.fontBtnActive : ""}`}
                  data-size={size}
                  onClick={() => handleFontSize(size)}
                  aria-label={`${size} 글자`}
                >
                  가
                </button>
              ))}
            </div>

            {/* 다크모드 */}
            <button
              className={styles.toolbarBtn}
              onClick={toggleDarkMode}
              aria-label="다크모드 전환"
              title="다크모드 전환"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="5" />
                  <path
                    strokeLinecap="round"
                    d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
