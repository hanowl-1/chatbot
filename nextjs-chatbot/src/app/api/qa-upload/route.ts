import { fetchInstance } from "@/lib/fetchInstance";
import { NextRequest, NextResponse } from "next/server";

// Reset 엔드포인트
export async function DELETE(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.RAG_API_URL}/qa/reset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RAG_MASTER_TOKEN}`,
      },
    });
    if (!response.ok) {
      throw new Error("Reset failed");
    }
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reset proxy error:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}

// GitHub에 파일 업로드 (임시 저장소로 Gist 사용)
async function uploadToGitHubGist(file: File) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  // base64 파일명으로 저장 (다운로드 시 디코딩 필요함을 명시)
  const gistFileName = `${file.name}.base64`;
  
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      description: `Excel upload - ${file.name} - ${new Date().toISOString()}`,
      public: false,
      files: {
        [gistFileName]: {
          content: base64
        }
      }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gist upload failed:', errorText);
    throw new Error('Failed to upload to Gist');
  }
  
  const gist = await response.json();
  // Gist raw URL 반환
  return gist.files[gistFileName].raw_url;
}

// GitHub Actions 방식 - 백그라운드 처리
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("파일이 없습니다");
    }

    console.log(`Uploading ${file.name} to GitHub Gist...`);
    
    // 1. 파일을 GitHub Gist에 업로드
    const fileUrl = await uploadToGitHubGist(file);
    
    console.log(`File uploaded to: ${fileUrl}`);
    
    // 2. GitHub Actions 트리거
    const jobId = `job_${Date.now()}`;
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          event_type: 'process-excel',
          client_payload: {
            fileUrl,
            fileName: file.name,
            jobId,
            timestamp: Date.now()
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${errorText}`);
    }
    
    // 3. 즉시 응답 반환
    return NextResponse.json({
      success: true,
      message: "파일이 백그라운드에서 처리되고 있습니다. GitHub Actions에서 진행 상황을 확인할 수 있습니다.",
      jobId,
      workflowUrl: `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions`,
      estimatedTime: "약 2-5분 소요 예정"
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}