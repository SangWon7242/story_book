/**
 * 정적 자산 경로 관리 모듈
 * 모든 이미지/오디오 경로는 이 파일에서 중앙 관리됩니다.
 * public/assets/ 하위에 실제 파일이 위치합니다.
 */

/* ── 이미지 ─────────────────────────────────────── */
export const IMAGES = {
  ch1: "assets/images/1.png",
  ch2: "assets/images/2.png",
  ch3: "assets/images/3.png",
  ch4: "assets/images/4.png",
  ch5: "assets/images/5.png",
  ch6: "assets/images/6.png",
} as const;

/* ── 오디오 ─────────────────────────────────────── */
export const AUDIO = {
  ch1: "assets/audio/chapter1.mp3",
  ch2: "assets/audio/chapter2.mp3",
  ch3: "assets/audio/chapter3.mp3",
  ch4: "assets/audio/chapter4.mp3",
  ch5: "assets/audio/chapter5.mp3",
  ch6: "assets/audio/chapter6.mp3",
} as const;

export type ImageKey = keyof typeof IMAGES;
export type AudioKey = keyof typeof AUDIO;
