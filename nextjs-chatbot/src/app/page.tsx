import { redirect } from 'next/navigation';

export default function Home() {
  // 메인 페이지 접속 시 챗봇 테스터로 리다이렉트
  redirect('/chatbot');
}