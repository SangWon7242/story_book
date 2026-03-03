import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "비프의 푸른 바다 모험",
  description:
    "화성에서 온 로봇 비프의 신비로운 지구 바다 탐험 동화. 사이버펑크 스타일의 인터랙티브 동화책.",
};

export const viewport: Viewport = {
  themeColor: "#1b1b2f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google Fonts — Jua(한글), Playfair Display(영문 제목), Nanum Gothic(보조) */}
        <link
          href="https://fonts.googleapis.com/earlyaccess/nanumgothic.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jua&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
