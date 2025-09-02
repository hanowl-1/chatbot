import { NextRequest, NextResponse } from "next/server";

const RAG_API_URL = process.env.RAG_API_URL;
const RAG_TOKEN = process.env.RAG_MASTER_TOKEN;

// 디버깅용 로그 (프로덕션에서는 제거하세요!)
console.log("RAG_API_URL:", RAG_API_URL);
console.log("RAG_TOKEN exists:", !!RAG_TOKEN);
console.log("RAG_TOKEN length:", RAG_TOKEN?.length);

// 모든 HTTP 메서드 지원
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "GET", params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "POST", params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "PUT", params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "DELETE", params.path);
}

async function handleRequest(
  request: NextRequest,
  method: string,
  pathSegments: string[]
) {
  try {
    // RAG API 엔드포인트 재구성
    let endpoint = "/" + pathSegments.join("/");

    // /qa 엔드포인트는 항상 끝 슬래시가 필요함
    // RAG API의 특성상 /qa는 /qa/로 리다이렉트됨
    if (endpoint === "/qa" || endpoint.startsWith("/qa?")) {
      endpoint = "/qa/";
    }

    const url = `${RAG_API_URL}${endpoint}`;

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    // 디버깅 로그
    console.log("Proxy Request:", {
      method,
      endpoint,
      fullUrl,
      hasToken: !!RAG_TOKEN,
      tokenLength: RAG_TOKEN?.length,
    });

    // 요청 헤더 준비 (토큰은 서버에서만!)
    const headers: HeadersInit = {
      Authorization: `Bearer ${RAG_TOKEN}`,
    };

    // Content-Type 처리
    const contentType = request.headers.get("content-type");
    if (contentType && !contentType.includes("multipart/form-data")) {
      headers["Content-Type"] = contentType;
    }

    // 요청 본문 처리
    let body: any = undefined;
    if (method !== "GET" && method !== "HEAD") {
      if (contentType?.includes("multipart/form-data")) {
        // FormData 처리
        body = await request.formData();
      } else if (contentType?.includes("application/json")) {
        // JSON 처리
        const jsonData = await request.json();
        body = JSON.stringify(jsonData);
      } else {
        // 기타 텍스트 데이터
        body = await request.text();
      }
    }

    // RAG API로 요청 전달
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    // 디버깅: 응답 상태 로그
    console.log("Proxy Response:", {
      status: response.status,
      statusText: response.statusText,
      url: fullUrl,
    });

    // 응답 처리
    const responseText = await response.text();

    // JSON 파싱 시도
    try {
      const responseData = JSON.parse(responseText);
      return NextResponse.json(responseData, { status: response.status });
    } catch {
      // JSON이 아닌 경우 텍스트로 반환
      return new NextResponse(responseText, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") || "text/plain",
        },
      });
    }
  } catch (error) {
    console.error("RAG API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal proxy error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
