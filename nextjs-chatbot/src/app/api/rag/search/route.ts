import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/services/auth";
import { config } from "@/lib/config";

// QA 검색
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, limit = 3 } = body;

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Failed to obtain authentication token");
    }

    const response = await fetch(`${process.env.RAG_API_URL}/qa/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.rag.masterToken}`,
      },
      body: JSON.stringify({
        question,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`RAG API error: ${response.statusText}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("RAG Search API Error:", error);
    return NextResponse.json(error);
  }
}
