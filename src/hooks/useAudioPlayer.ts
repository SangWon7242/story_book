"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Chapter } from "@/types/story";

/**
 * 챕터별 오디오 재생을 관리하는 커스텀 훅
 * - 챕터별 Audio 객체 생성/관리
 * - 재생/정지/토글/시크/볼륨 기능
 * - 프로그레스 추적 (currentTime, duration, progress)
 */

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 ~ 1
  volume: number;
  currentChapter: number; // -1이면 재생 중인 챕터 없음
}

interface UseAudioPlayerReturn extends AudioState {
  play: (chapterIdx: number) => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (fraction: number) => void;
  setVolume: (vol: number) => void;
  stopAll: () => void;
  switchChapter: (chapterIdx: number) => void;
}

export function useAudioPlayer(chapters: Chapter[]): UseAudioPlayerReturn {
  const audioMapRef = useRef<Map<number, HTMLAudioElement>>(new Map());
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    volume: 0.7,
    currentChapter: -1,
  });

  /* 챕터별 Audio 객체 초기화 */
  useEffect(() => {
    const map = audioMapRef.current;
    chapters.forEach((ch, i) => {
      if (!map.has(i)) {
        const audio = new Audio(ch.audio);
        audio.preload = "metadata";
        audio.volume = state.volume;
        map.set(i, audio);
      }
    });

    return () => {
      /* 클린업: 모든 Audio 정지 및 해제 */
      map.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      map.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  /* 현재 재생 중인 Audio의 timeupdate 이벤트 처리 */
  useEffect(() => {
    if (state.currentChapter < 0) return;
    const audio = audioMapRef.current.get(state.currentChapter);
    if (!audio) return;

    const onTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        progress: audio.duration ? audio.currentTime / audio.duration : 0,
      }));
    };

    const onLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    const onEnded = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        progress: 1,
      }));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [state.currentChapter]);

  /* 모든 챕터 오디오 정지 */
  const stopAll = useCallback(() => {
    audioMapRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      progress: 0,
      currentChapter: -1,
    }));
  }, []);

  /* 특정 챕터 재생 */
  const play = useCallback(
    (chapterIdx: number) => {
      /* 다른 챕터 정지 */
      audioMapRef.current.forEach((audio, idx) => {
        if (idx !== chapterIdx) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      const audio = audioMapRef.current.get(chapterIdx);
      if (!audio) return;

      audio.volume = state.volume;
      audio.play().catch(() => {
        /* 사용자 인터랙션 없이 autoplay 차단 시 무시 */
      });

      setState((prev) => ({
        ...prev,
        isPlaying: true,
        currentChapter: chapterIdx,
      }));
    },
    [state.volume],
  );

  /* 일시정지 */
  const pause = useCallback(() => {
    if (state.currentChapter >= 0) {
      audioMapRef.current.get(state.currentChapter)?.pause();
    }
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, [state.currentChapter]);

  /* 재생/일시정지 토글 */
  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else if (state.currentChapter >= 0) {
      const audio = audioMapRef.current.get(state.currentChapter);
      if (audio) {
        audio.play().catch(() => {});
        setState((prev) => ({ ...prev, isPlaying: true }));
      }
    }
  }, [state.isPlaying, state.currentChapter, pause]);

  /* 시크 (0~1 비율) */
  const seekTo = useCallback(
    (fraction: number) => {
      if (state.currentChapter < 0) return;
      const audio = audioMapRef.current.get(state.currentChapter);
      if (!audio || !audio.duration) return;
      audio.currentTime = fraction * audio.duration;
    },
    [state.currentChapter],
  );

  /* 볼륨 설정 (0~1) */
  const setVolume = useCallback((vol: number) => {
    audioMapRef.current.forEach((audio) => {
      audio.volume = vol;
    });
    setState((prev) => ({ ...prev, volume: vol }));
  }, []);

  /* 챕터 전환 (페이지 넘김 시 호출) */
  const switchChapter = useCallback(
    (chapterIdx: number) => {
      if (chapterIdx < 0 || chapterIdx >= chapters.length) {
        stopAll();
        return;
      }
      /* 이미 같은 챕터면 무시 */
      if (chapterIdx === state.currentChapter && state.isPlaying) return;
      /* 이전에 재생 중이었다면 새 챕터도 자동 재생 */
      if (state.isPlaying) {
        play(chapterIdx);
      } else {
        /* 재생 중이 아니었으면 챕터만 전환 (자동 재생 안 함) */
        audioMapRef.current.forEach((audio, idx) => {
          if (idx !== chapterIdx) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
        setState((prev) => ({
          ...prev,
          currentChapter: chapterIdx,
          currentTime: 0,
          progress: 0,
        }));
      }
    },
    [chapters.length, state.currentChapter, state.isPlaying, play, stopAll],
  );

  return {
    ...state,
    play,
    pause,
    toggle,
    seekTo,
    setVolume,
    stopAll,
    switchChapter,
  };
}
