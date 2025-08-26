// RAG API 직접 호출을 위한 간단한 클라이언트

const RAG_API_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL || "https://rag.supermembers.co.kr";
const RAG_TOKEN =
  process.env.NEXT_PUBLIC_RAG_MASTER_TOKEN ||
  "85f5e10431f69bc2a14046a13aabaefc660103b6de7a84f75c4b96181d03f0b5";

// 기본 헤더 (FormData일 때는 Content-Type 제외)
const getHeaders = (isFormData: boolean = false) => {
  const headers: any = {
    Authorization: `Bearer ${RAG_TOKEN}`,
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// RAG API fetch 래퍼
export async function fetchInstance(endpoint: string, options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;

  const response = await fetch(`${RAG_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(isFormData),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RAG API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
