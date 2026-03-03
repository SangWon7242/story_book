"use client";

import { useEffect, useState } from "react";
import type { StoryData } from "@/types/story";
import StoryViewer from "@/components/BookViewer/StoryViewer";

/**
 * 홈 페이지 — 스토리 데이터를 로드하고 StoryViewer를 렌더링합니다.
 * 현재는 단일 스토리만 지원하며, 향후 라이브러리 화면으로 확장 가능합니다.
 */
export default function HomePage() {
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* JSON 스토리 데이터 로드 */
    fetch("/api/story/story1")
      .then((res) => res.json())
      .then((data: StoryData) => {
        setStoryData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("스토리 데이터 로드 실패:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, #1b1b2f 0%, #162447 60%, #1f4068 100%)",
          color: "#c5b358",
          fontFamily: '"Jua", sans-serif',
          fontSize: "1.5rem",
        }}
      >
        📖 동화를 불러오고 있어요...
      </div>
    );
  }

  if (!storyData) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1b1b2f",
          color: "#ff6b6b",
          fontFamily: '"Jua", sans-serif',
          fontSize: "1.2rem",
        }}
      >
        ❌ 동화 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return <StoryViewer story={storyData} />;
}
