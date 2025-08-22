import { fetchInstance } from "@/lib/fetchInstance";
import { NextRequest, NextResponse } from "next/server";

// Reset 엔드포인트
export async function DELETE(request: NextRequest) {
  try {
    const data = await fetchInstance(`/qa/reset`, {
      method: "POST",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reset proxy error:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}

// 파일 업로드 엔드포인트
export async function POST(request: NextRequest) {
  try {
    // FormData 가져오기
    const formData = await request.formData();

    const data = await fetchInstance(`/qa/bulk-upload`, {
      method: "POST",
      body: formData,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
