import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

// Excel 파일 일괄 업로드 API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sheetName = formData.get("sheetName") as string || "Sheet1";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 파일명이 없으면 기본값 사용
    const fileName = file.name || "FAQ관리.xlsx";

    // FormData를 그대로 전달
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const response = await fetch(
      `${process.env.RAG_API_URL}/qa/bulk-upload?file_path=${encodeURIComponent(fileName)}&sheet_name=${encodeURIComponent(sheetName)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.rag.masterToken}`,
        },
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Excel upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
