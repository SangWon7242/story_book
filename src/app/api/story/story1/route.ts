import { NextResponse } from "next/server";
import storyData from "@/data/stories/story1.json";

/**
 * GET /api/story/story1
 * 스토리 JSON 데이터를 반환합니다.
 */
export async function GET() {
  return NextResponse.json(storyData);
}
