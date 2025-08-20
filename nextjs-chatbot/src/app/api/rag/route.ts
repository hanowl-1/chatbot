import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/services/auth";
import { config } from "@/lib/config";

// QA 목록 조회 (페이지네이션 지원)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const size = searchParams.get("size") || "20";

    const response = await fetch(
      `${process.env.RAG_API_URL}/qa/?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${config.rag.masterToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`RAG API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("QA List API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch QA list" },
      { status: 500 }
    );
  }
}

// QA 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer } = body;

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Failed to obtain authentication token");
    }

    const response = await fetch(`${process.env.RAG_API_URL}/qa/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.rag.masterToken}`,
      },
      body: JSON.stringify({
        question,
        answer,
      }),
    });

    if (!response.ok) {
      throw new Error(`RAG API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("RAG API Error:", error);
    return NextResponse.json(error);
  }
}
