"use client";

import { useEffect, useState } from "react";
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
  Menu,
  X,
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

function Brand({ username, compact }: { username?: string; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
        <Instagram className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <h1 className="font-bold text-zinc-900 dark:text-zinc-100">IG Ops</h1>
        {username && !compact && (
          <p className="truncate text-xs text-zinc-500">@{username}</p>
        )}
      </div>
    </div>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-gradient-to-r from-purple-600/10 to-pink-600/10 text-purple-700 dark:text-purple-300"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar({ username }: { username?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="メニューを開く"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <Brand username={username} compact />
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          open ? "visible" : "invisible pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="メニューを閉じる"
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-zinc-200 bg-white shadow-xl transition-transform dark:border-zinc-800 dark:bg-zinc-950",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <Brand username={username} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="メニューを閉じる"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </nav>
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-400">Instagram Graph API 連携</p>
          </div>
        </aside>
      </div>

      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <Brand username={username} />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Instagram Graph API 連携</p>
        </div>
      </aside>
    </>
  );
}
