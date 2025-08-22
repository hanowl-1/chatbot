"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, FileText, Settings, AlertTriangle } from "lucide-react";

const navItems = [
  { href: "/chatbot", label: "챗봇 테스터", icon: MessageSquare },
  { href: "/prompts", label: "프롬프트 관리", icon: FileText },
  { href: "/settings", label: "설정", icon: Settings },
  // { href: "/reviews", label: "검증 대기", icon: AlertTriangle },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">슈퍼멤버스 챗봇 자동화 테스터</h1>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                    isActive
                      ? "text-blue-600 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800 border-transparent hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
