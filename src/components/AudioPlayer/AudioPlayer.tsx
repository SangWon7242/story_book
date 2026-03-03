"use client";

import { useState } from "react";
import styles from "./AudioPlayer.module.css";

/**
 * 오디오 플레이어 UI 컴포넌트
 * 화면 우하단 고정, 토글 패널 방식
 */

interface Props {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (fraction: number) => void;
  onVolumeChange: (vol: number) => void;
}

/* 시간 포맷팅 (mm:ss) */
function formatTime(sec: number): string {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  progress,
  volume,
  onTogglePlay,
  onSeek,
  onVolumeChange,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);

  /* 프로그래스 바 클릭 시크 */
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    onSeek(fraction);
  };

  return (
    <div className={styles.audioPlayer}>
      {/* 패널 */}
      {panelOpen && (
        <div className={styles.audioPanel}>
          <div className={styles.panelTitle}>
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
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            구연동화 오디오
          </div>

          <div className={styles.controls}>
            {/* 재생/일시정지 */}
            <button
              className={styles.playBtn}
              onClick={onTogglePlay}
              aria-label={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              )}
            </button>

            {/* 프로그래스 바 */}
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} onClick={handleProgressClick}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className={styles.timeDisplay}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* 볼륨 */}
          <div className={styles.volumeWrap}>
            <button
              className={styles.volumeBtn}
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
              aria-label="음소거 토글"
            >
              {volume > 0.5 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              ) : volume > 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              className={styles.volumeSlider}
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="볼륨 조절"
            />
          </div>
        </div>
      )}

      {/* 토글 버튼 */}
      <button
        className={`${styles.toggleBtn} ${isPlaying ? styles.playing : ""}`}
        onClick={() => setPanelOpen((v) => !v)}
        aria-label="오디오 패널 열기"
      >
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
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </button>
    </div>
  );
}
