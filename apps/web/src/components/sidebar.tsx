"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Calendar,
  Hash,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Target,
  Instagram,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/analytics", label: "アカウント分析", icon: BarChart3 },
  { href: "/audience", label: "フォロワー属性", icon: Users },
  { href: "/competitors", label: "競合分析", icon: Target },
  { href: "/schedule", label: "予約投稿", icon: Calendar },
  { href: "/hashtags", label: "ハッシュタグ", icon: Hash },
  { href: "/inbox", label: "コメント・DM", icon: MessageSquare },
  { href: "/reports", label: "AIレポート", icon: FileText },
];

export function Sidebar({ username }: { username?: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
          <Instagram className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-zinc-900 dark:text-zinc-100">IG Ops</h1>
          {username && (
            <p className="text-xs text-zinc-500">@{username}</p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-purple-600/10 to-pink-600/10 text-purple-700 dark:text-purple-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-xs text-zinc-400">
          Instagram Graph API 連携
        </p>
      </div>
    </aside>
  );
}
