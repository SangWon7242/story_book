/* ============================================
   스토리 데이터 타입 정의
   ============================================ */

/** 개별 문장 */
export interface Sentence {
  text: string;
}

/** 챕터 (이미지 + 텍스트 + 오디오) */
export interface Chapter {
  chapterNum: number;
  title: string;
  image: string;
  imageAlt: string;
  audio: string;
  sentences: Sentence[];
}

/** 스토리 전체 데이터 */
export interface StoryData {
  title: string;
  subtitle: string;
  chapters: Chapter[];
}
