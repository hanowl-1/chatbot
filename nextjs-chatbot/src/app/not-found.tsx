"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <h1 className="text-2xl font-bold">404, 찾을 수 없는 페이지입니다.</h1>
      <button onClick={() => router.push("/")}>메인 페이지로 이동</button>
    </>
  );
}
