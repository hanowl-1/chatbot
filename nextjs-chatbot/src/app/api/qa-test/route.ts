import { NextRequest, NextResponse } from "next/server";

// 테스트용 엔드포인트 - 실제 백엔드가 복구되면 제거
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    console.log('Test upload - File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 파일 내용 읽기 (테스트용)
    const text = await file.text();
    const lines = text.split('\n').slice(0, 5); // 처음 5줄만
    console.log('First 5 lines:', lines);
    
    // 더미 응답 반환
    return NextResponse.json({
      success: true,
      processed_count: Math.floor(Math.random() * 50) + 10,
      message: "테스트 업로드 성공 (실제 백엔드 아님)",
      file_info: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      note: "⚠️ 이것은 테스트 응답입니다. 실제 데이터는 저장되지 않았습니다."
    });
  } catch (error) {
    console.error("Test upload error:", error);
    return NextResponse.json(
      { error: "Test upload failed" },
      { status: 500 }
    );
  }
}