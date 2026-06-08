import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { InsightsChart } from "@/components/charts/insights-chart";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { generateDemoInsights } from "@/lib/demo-data";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AnalyticsPeriodSelector } from "./period-selector";

async function getAnalytics(period: number) {
  try {
    const account = await getActiveAccount();
    if (!account) return null;

    const since = new Date();
    since.setDate(since.getDate() - period);

    const insights = await prisma.insightsDaily.findMany({
      where: { accountId: account.id, date: { gte: since } },
      orderBy: { date: "asc" },
    });

    const posts = await prisma.mediaPost.findMany({
      where: { accountId: account.id },
      orderBy: { engagementRate: "desc" },
      take: 10,
    });

    return { account, insights, posts };
  } catch {
    return null;
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = Number(params.period) || 30;
  const data = await getAnalytics(period);
  const isDemo = !data;

  const insights = data?.insights.length
    ? data.insights.map((i) => ({
        date: format(i.date, "yyyy-MM-dd"),
        reach: i.reach,
        impressions: i.impressions,
        engagementRate: i.engagementRate,
      }))
    : generateDemoInsights(period);

  const totals = insights.reduce(
    (acc, i) => ({
      reach: acc.reach + i.reach,
      impressions: acc.impressions + i.impressions,
      engagement: acc.engagement + i.engagementRate,
    }),
    { reach: 0, impressions: 0, engagement: 0 }
  );

  const avgEngagement = insights.length ? totals.engagement / insights.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">アカウント分析</h1>
          <p className="text-zinc-500">
            リーチ・インプレッション・エンゲージメント率
            {isDemo && <Badge variant="warning" className="ml-2">デモデータ</Badge>}
          </p>
        </div>
        <AnalyticsPeriodSelector current={period} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title={`総リーチ（${period}日）`} value={totals.reach} />
        <MetricCard title={`総インプレッション`} value={totals.impressions} />
        <MetricCard title="平均エンゲージメント率" value={avgEngagement} format="percent" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>時系列グラフ</CardTitle>
          <CardDescription>日次のリーチ・インプレッション・エンゲージメント率</CardDescription>
        </CardHeader>
        <InsightsChart data={insights} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>トップ投稿</CardTitle>
          <CardDescription>エンゲージメント率順</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {(data?.posts || []).length > 0 ? (
            data!.posts.map((post, i) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {post.caption?.slice(0, 60) || post.mediaType}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {post.mediaType} · リーチ {post.reach}
                    </p>
                  </div>
                </div>
                <Badge>{post.engagementRate.toFixed(1)}%</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">
              アカウント連携後、投稿データが表示されます
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
