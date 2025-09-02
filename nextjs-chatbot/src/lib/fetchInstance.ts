// 토큰은 서버에서만 처리되므로 브라우저에 노출되지 않음

// 기본 헤더 (FormData일 때는 Content-Type 제외)
const getHeaders = (isFormData: boolean = false) => {
  const headers: any = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

export async function fetchInstance(endpoint: string, options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;

  const proxyUrl = `/api/proxy${endpoint}`;

  const response = await fetch(proxyUrl, {
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
