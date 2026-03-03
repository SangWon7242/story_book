"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * 반응형 분기 커스텀 훅
 * @returns isMobile - 768px 이하이면 true
 */
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return { isMobile };
}
