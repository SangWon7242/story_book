"use client";

import { useEffect, useCallback } from "react";

/**
 * 읽기 진행률 추적 커스텀 훅
 * localStorage에 현재 페이지 번호를 저장/복원합니다.
 */

const STORAGE_KEY = "storybook-progress";

export function useReadingProgress(currentPage: number) {
  /* 페이지 변경 시 자동 저장 */
  useEffect(() => {
    if (currentPage > 0) {
      localStorage.setItem(STORAGE_KEY, String(currentPage));
    }
  }, [currentPage]);

  /* 저장된 페이지 복원 */
  const getSavedPage = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  }, []);

  /* 진행률 초기화 */
  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { getSavedPage, clearProgress };
}
