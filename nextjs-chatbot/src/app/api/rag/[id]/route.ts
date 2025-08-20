import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

// QA 상세 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${process.env.RAG_API_URL}/qa/${params.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
    console.error("QA Detail API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch QA detail" },
      { status: 500 }
    );
  }
}

// QA 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${process.env.RAG_API_URL}/qa/${params.id}`,
      {
        method: "DELETE",
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
    console.error("QA Delete API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete QA" },
      { status: 500 }
    );
  }
}