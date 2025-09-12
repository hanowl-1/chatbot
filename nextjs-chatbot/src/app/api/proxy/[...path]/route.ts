import { NextRequest, NextResponse } from "next/server";

const RAG_API_URL = process.env.RAG_API_URL;
const RAG_TOKEN = process.env.RAG_MASTER_TOKEN;

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "PATCH", params.path);
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
    // 엔드포인트 재구성
    let endpoint = "/" + pathSegments.join("/");

    // 일부 엔드포인트는 항상 끝 슬래시가 필요함 (307 리다이렉트 방지)
    // RAG API의 특성상 슬래시 없으면 HTTP로 리다이렉트됨
    // if (endpoint === "/qa" || endpoint.startsWith("/qa?")) {
    //   endpoint = "/qa/";
    // }
    // // /prompts도 슬래시 필요 (HTTPS→HTTP 리다이렉트 방지)
    // if (endpoint === "/prompts") {
    //   endpoint = "/prompts/";
    // }

    const url = `${RAG_API_URL}${endpoint}`;

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    console.log("fullUrl", fullUrl);

    // 요청 헤더 준비 (토큰은 서버에서만!)
    // 토큰 디버깅 - 실제 값 일부 확인
    if (RAG_TOKEN) {
      console.log("Token first 10 chars:", RAG_TOKEN.substring(0, 10));
      console.log(
        "Token last 10 chars:",
        RAG_TOKEN.substring(RAG_TOKEN.length - 10)
      );
      console.log("Token length:", RAG_TOKEN.length);
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${RAG_TOKEN}`,
    };

    console.log("headers", headers);

    // 실제 fetch 요청 디버깅
    console.log("🚀 실제 요청 정보:", {
      url: fullUrl,
      method,
      tokenValue: RAG_TOKEN, // 실제 토큰값 전체 확인
      headerAuth: headers.Authorization,
    });
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
    console.log("body", body);
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body || undefined,
    });

    // 응답 처리
    const responseText = await response.text();

    // JSON 파싱 시도
    try {
      const safeParsedText = responseText.replace(
        /"chat_dialog_id"\s*:\s*(\d{16,})/g, // 16자리 이상의 숫자 탐지
        '"chat_dialog_id":"$1"' // 숫자를 문자열로 감싸기
      );
      const responseData = JSON.parse(safeParsedText);
      return NextResponse.json(responseData, {
        status: response.status,
      });
    } catch {
      // JSON이 아닌 경우 텍스트로 반환
      return new NextResponse(responseText, {
        status: response.status,
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
