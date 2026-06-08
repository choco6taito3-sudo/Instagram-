import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { demoCompetitors, demoTopCompetitorPosts } from "@/lib/demo-data";
import { isPortfolioDemo } from "@/lib/config";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CompetitorForm } from "./competitor-form";
import { SyncButton } from "./sync-button";

async function getCompetitors() {
  try {
    const account = await getActiveAccount();
    if (!account) return null;

    const competitors = await prisma.competitor.findMany({
      where: { accountId: account.id },
      include: {
        posts: { orderBy: { engagementRate: "desc" }, take: 5 },
      },
      orderBy: { followersCount: "desc" },
    });

    const ownPosts = await prisma.mediaPost.findMany({
      where: { accountId: account.id },
    });

    const ownAvgEngagement =
      ownPosts.length > 0
        ? ownPosts.reduce((s, p) => s + p.engagementRate, 0) / ownPosts.length
        : 0;

    const topPosts = await prisma.competitorPost.findMany({
      where: { competitor: { accountId: account.id } },
      orderBy: { engagementRate: "desc" },
      take: 10,
      include: { competitor: true },
    });

    return { account, competitors, ownAvgEngagement, topPosts };
  } catch {
    return null;
  }
}

export default async function CompetitorsPage() {
  const data = await getCompetitors();
  const competitors = data?.competitors.length
    ? data.competitors
    : isPortfolioDemo()
      ? demoCompetitors
      : [];
  const topPosts = data?.topPosts.length
    ? data.topPosts
    : isPortfolioDemo()
      ? demoTopCompetitorPosts
      : [];
  const ownAvgEngagement = data?.ownAvgEngagement ?? (isPortfolioDemo() ? 4.2 : 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">競合分析</h1>
          <p className="text-zinc-500">同ジャンルアカウントの動向（公開データのみ）</p>
        </div>
        <SyncButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>競合アカウントを追加</CardTitle>
        </CardHeader>
        <CompetitorForm />
      </Card>

      {(data || isPortfolioDemo()) && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-zinc-500">自アカウント平均ER</p>
            <p className="text-2xl font-bold">{ownAvgEngagement.toFixed(1)}%</p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-500">登録競合数</p>
            <p className="text-2xl font-bold">{competitors.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-500">分析対象投稿</p>
            <p className="text-2xl font-bold">{topPosts.length}</p>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>競合アカウント一覧</CardTitle>
        </CardHeader>
        {competitors.length ? (
          <div className="space-y-4">
            {competitors.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">@{c.username}</p>
                  <p className="text-sm text-zinc-500">
                    {c.name} · 投稿 {c.mediaCount}件
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNumber(c.followersCount)}</p>
                  <p className="text-xs text-zinc-500">フォロワー</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            競合アカウントを追加してください（例: 同ジャンルのクリエイター）
          </p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>伸びている投稿</CardTitle>
          <CardDescription>エンゲージメント率ランキング（公開データ）</CardDescription>
        </CardHeader>
        {topPosts.length ? (
          <div className="space-y-3">
            {topPosts.map((post, i) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-purple-600">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">@{post.competitor.username}</p>
                    <p className="text-xs text-zinc-500">
                      {post.caption?.slice(0, 50) || post.mediaType} · ♥ {post.likeCount}
                    </p>
                  </div>
                </div>
                <Badge>{post.engagementRate.toFixed(2)}%</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">競合を追加して同期すると表示されます</p>
        )}
      </Card>
    </div>
  );
}
