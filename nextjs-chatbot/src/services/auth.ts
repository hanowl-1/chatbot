// supabase 인증 토큰 발급
import supabase from "@/lib/supabase";

// JWT 토큰 캐싱 (메모리)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAuthToken() {
  // 토큰이 있고 만료되지 않았으면 캐시된 토큰 사용
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // 새로운 토큰 발급
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_SERVICE_EMAIL!,
    password: process.env.SUPABASE_SERVICE_PASSWORD!,
  });

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  cachedToken = data.session?.access_token || null;
  // 토큰 만료 시간 설정 (1시간 - 5분 버퍼)
  tokenExpiry = Date.now() + 55 * 60 * 1000;

  return cachedToken;
}
