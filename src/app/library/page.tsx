"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Book3D from "@/components/Book3D/Book3D";

/**
 * 스토리 라이브러리 — 3D 하드커버 책장에서 동화를 선택하는 화면
 * Book3D 컴포넌트를 활용한 인터랙티브 3D 책 UI
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

/* 라이브러리 데이터 (향후 API 확장 가능) */
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

/* SSR-safe 마운트 감지 */
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

  const handleSelectStory = (storyId: string) => {
    router.push(`/?story=${storyId}`);
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen w-full relative flex flex-col overflow-y-auto overflow-x-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1b1b2f 0%, #162447 60%, #1f4068 100%)",
      }}
    >
      {/* 배경 글로우 */}
      <div
        className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(197,179,88,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* 헤더 */}
      <header className="text-center pt-16 pb-6 px-5 relative z-10 animate-[libFadeIn_0.6s_ease-out]">
        <h1
          className="text-[clamp(1.8rem,4vw,3rem)] mb-2"
          style={{
            fontFamily: 'var(--font-child, "Jua", sans-serif)',
            color: "#c5b358",
            textShadow: "0 2px 12px rgba(197,179,88,0.3)",
          }}
        >
          📚 동화 책장
        </h1>
        <p
          className="text-[clamp(0.9rem,2vw,1.15rem)]"
          style={{
            fontFamily: 'var(--font-child, "Jua", sans-serif)',
            color: "rgba(255,255,255,0.6)",
          }}
        >
          마우스를 올려 책을 열어보세요!
        </p>
      </header>

      {/* 3D 책장 */}
      <main className="relative z-10 flex-1 w-full px-6 py-10 flex items-center justify-center overflow-x-hidden">
        <div
          className="
            flex flex-wrap justify-center items-center content-center gap-y-16 gap-x-14
            w-full max-w-6xl mx-auto pt-6 pb-8
            max-[900px]:flex-col max-[900px]:items-center max-[900px]:gap-y-14 max-[900px]:max-w-md
          "
          role="list"
          aria-label="동화 목록"
        >
          {STORIES.map((story) => {
            const available = story.chaptersCount > 0;
            return (
              <div
                key={story.id}
                role="listitem"
                className="
                  relative group overflow-visible flex items-start justify-center self-start
                  w-auto max-[900px]:w-full
                "
              >
                <Book3D
                  title={story.title}
                  subtitle={story.subtitle}
                  coverImage={story.coverImage || undefined}
                  pageCount={available ? story.chaptersCount : 5}
                  onClick={() => handleSelectStory(story.id)}
                  disabled={!available}
                  badge={!available ? "준비 중" : undefined}
                />

                {/* 호버 메타 카드 (Tailwind) */}
                <div
                  className="
                  absolute bottom-full mb-8 w-72
                  max-w-[calc(100vw-2rem)] whitespace-normal break-words
                  rounded-xl !p-6 z-50
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-300 ease-out
                  translate-y-2 
                  pointer-events-none
                  max-[520px]:hidden
                  max-[720px]:bottom-auto max-[720px]:right-[-120px] max-[720px]:top-1/2
                  max-[720px]:translate-x-0 max-[720px]:-translate-y-1/2
                  max-[720px]:mb-0 max-[720px]:ml-4
                  max-[720px]:w-[min(18rem,calc(100vw-14rem))]
                "
                  style={{
                    background: "linear-gradient(135deg, #2f4f4f, #1a3333)",
                    border: "1px solid rgba(197,179,88,0.3)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                  role="tooltip"
                >
                  <h3
                    className="text-base mb-1"
                    style={{
                      fontFamily: 'var(--font-child, "Jua", sans-serif)',
                      color: "#c5b358",
                    }}
                  >
                    {story.title}
                  </h3>
                  <p
                    className="text-xs mb-3 leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-child, "Jua", sans-serif)',
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {story.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[
                      `🎨 ${story.theme}`,
                      `🤖 ${story.protagonist}`,
                      `✨ ${story.style}`,
                      ...(available
                        ? [`📖 ${story.chaptersCount}개 챕터`]
                        : []),
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.65rem] px-2 py-0.5 rounded-md"
                        style={{
                          fontFamily: 'var(--font-child, "Jua", sans-serif)',
                          color: "rgba(255,255,255,0.7)",
                          background: "rgba(255,255,255,0.08)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div
                    className="text-sm text-center font-bold !mt-3"
                    style={{
                      fontFamily: 'var(--font-child, "Jua", sans-serif)',
                      color: "#c5b358",
                    }}
                  >
                    {available ? "클릭하여 읽기 시작!" : "곧 만나요!"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 하단 */}
      <footer
        className="w-full text-center pb-5 relative z-10"
        aria-hidden="true"
      >
        <p
          className="text-xs"
          style={{
            fontFamily: 'var(--font-child, "Jua", sans-serif)',
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Powered by AI Vibe Coding ✨
        </p>
      </footer>
    </div>
  );
}
