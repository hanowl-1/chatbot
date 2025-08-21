import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/services/auth";
import { config } from "@/lib/config";

// RAG Generate API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, prompt_text, model, embedding_count = 1 } = body;

    const token = await getAuthToken();
    if (!token) {
      throw new Error("Failed to obtain authentication token");
    }

    const response = await fetch(`${process.env.RAG_API_URL}/qa/rag-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.rag.masterToken}`,
      },
      body: JSON.stringify({
        question,
        prompt_text,
        model,
        embedding_count,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RAG API Error Response:", errorText);
      throw new Error(`RAG API error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("RAG Generate API Error:", error);
    return NextResponse.json(error);
  }
}
