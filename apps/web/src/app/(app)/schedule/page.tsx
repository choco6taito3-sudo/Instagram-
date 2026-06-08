import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { demoScheduledPosts, demoHashtagSets } from "@/lib/demo-data";
import { isPortfolioDemo } from "@/lib/config";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScheduleForm } from "./schedule-form";

const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
  pending: { label: "予約済", variant: "warning" },
  processing: { label: "処理中", variant: "default" },
  published: { label: "投稿済", variant: "success" },
  failed: { label: "失敗", variant: "destructive" },
};

async function getScheduleData() {
  try {
    const account = await getActiveAccount();
    if (!account) return null;

    const posts = await prisma.scheduledPost.findMany({
      where: { accountId: account.id },
      orderBy: { scheduledAt: "desc" },
      include: { hashtagSet: true },
    });

    const hashtagSets = await prisma.hashtagSet.findMany({
      where: { accountId: account.id },
    });

    return { account, posts, hashtagSets };
  } catch {
    return null;
  }
}

export default async function SchedulePage() {
  const data = await getScheduleData();
  const posts = data?.posts?.length
    ? data.posts
    : isPortfolioDemo()
      ? demoScheduledPosts
      : [];
  const hashtagSets = data?.hashtagSets?.length
    ? data.hashtagSets
    : isPortfolioDemo()
      ? demoHashtagSets
      : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">予約投稿</h1>
        <p className="text-zinc-500">リール・フィードの日時指定投稿</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>新規予約投稿</CardTitle>
          </CardHeader>
          <ScheduleForm hashtagSets={hashtagSets} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>コンテンツカレンダー</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
            {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
              <div key={d} className="py-1 font-medium">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - new Date().getDay() + 1;
              const date = new Date();
              date.setDate(date.getDate() + day);
              const dayPosts = posts.filter(
                (p) =>
                  format(p.scheduledAt, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
              );
              return (
                <div
                  key={i}
                  className={`min-h-12 rounded border p-1 ${
                    day === 0
                      ? "border-purple-300 bg-purple-50 dark:bg-purple-950"
                      : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <div className="text-xs">{date.getDate()}</div>
                  {dayPosts.map((p) => (
                    <div
                      key={p.id}
                      className="mt-0.5 truncate rounded bg-purple-200 px-1 text-[10px] dark:bg-purple-800"
                    >
                      {format(p.scheduledAt, "HH:mm")}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>予約一覧</CardTitle>
        </CardHeader>
        {posts.length ? (
          <div className="space-y-3">
            {posts.map((post) => {
              const status = statusLabels[post.status] || statusLabels.pending;
              return (
                <div
                  key={post.id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-sm font-medium">{post.mediaType}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {post.caption?.slice(0, 80) || "（キャプションなし）"}
                    </p>
                    {post.errorMessage && (
                      <p className="mt-1 text-xs text-red-500">{post.errorMessage}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-zinc-500">
                    {format(post.scheduledAt, "yyyy/M/d HH:mm", { locale: ja })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">予約投稿がありません</p>
        )}
      </Card>
    </div>
  );
}
