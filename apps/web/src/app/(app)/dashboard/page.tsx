import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { InsightsChart } from "@/components/charts/insights-chart";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { generateDemoInsights, toChartPoint, type InsightChartPoint } from "@/lib/demo-data";
import { TARGET_INSTAGRAM, isPortfolioDemo } from "@/lib/config";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getDashboardData() {
  try {
    const account = await getActiveAccount();
    if (!account) return null;

    const insights = await prisma.insightsDaily.findMany({
      where: { accountId: account.id },
      orderBy: { date: "asc" },
      take: 30,
    });

    const alerts = await prisma.performanceAlert.findMany({
      where: { accountId: account.id, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const scheduled = await prisma.scheduledPost.findMany({
      where: { accountId: account.id, status: "pending" },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });

    const onlineData = await prisma.audienceOnline.findMany({
      where: { accountId: account.id },
      orderBy: { count: "desc" },
      take: 1,
    });

    return { account, insights, alerts, scheduled, bestTime: onlineData[0] };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const isDemo = isPortfolioDemo() || !data;

  const account = data?.account ?? {
    username: TARGET_INSTAGRAM.username,
    followersCount: 1250,
    name: TARGET_INSTAGRAM.displayName,
  };

  const insights: InsightChartPoint[] = data?.insights.length
    ? data.insights.map(toChartPoint)
    : generateDemoInsights(30);

  const latest = insights[insights.length - 1];
  const previous = insights[insights.length - 8];
  const reachChange = previous
    ? ((latest.reach - previous.reach) / previous.reach) * 100
    : 0;
  const engagementChange = previous
    ? latest.engagementRate - previous.engagementRate
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          ダッシュボード
        </h1>
        <p className="text-zinc-500">
          @{account.username} の運用状況
          {isDemo && (
            <Badge variant="warning" className="ml-2">
              デモデータ表示中
            </Badge>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="フォロワー" value={account.followersCount} />
        <MetricCard title="リーチ（直近）" value={latest.reach} change={reachChange} />
        <MetricCard title="インプレッション" value={latest.impressions} />
        <MetricCard
          title="エンゲージメント率"
          value={latest.engagementRate}
          format="percent"
          change={engagementChange}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>パフォーマンストレンド</CardTitle>
          <CardDescription>リーチ・インプレッション・エンゲージメント率（30日間）</CardDescription>
        </CardHeader>
        <InsightsChart data={insights} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              ベスト投稿時間
            </CardTitle>
          </CardHeader>
          {data?.bestTime ? (
            <p className="text-lg">
              {["日", "月", "火", "水", "木", "金", "土"][data.bestTime.dayOfWeek]}曜{" "}
              {data.bestTime.hour}:00 頃（{data.bestTime.count}人がアクティブ）
            </p>
          ) : (
            <p className="text-lg">土曜 21:00 頃（フォロワーが最もアクティブ）</p>
          )}
          <Link href="/audience" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              詳細を見る
            </Button>
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-600" />
              クイックアクション
            </CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            <Link href="/schedule">
              <Button size="sm">予約投稿を作成</Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="sm">
                AIレポート生成
              </Button>
            </Link>
            <Link href="/competitors">
              <Button variant="outline" size="sm">
                競合を確認
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {(data?.alerts.length || isDemo) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              アラート
            </CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {(data?.alerts || []).map((alert) => (
              <li key={alert.id} className="text-sm text-zinc-600">
                {alert.message}
              </li>
            ))}
            {isDemo && (
              <li className="text-sm text-zinc-600">
                エンゲージメント率が平均を下回る投稿があります。AIレポートで改善案を確認してください。
              </li>
            )}
          </ul>
        </Card>
      )}

      {data?.scheduled && data.scheduled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>予約投稿予定</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {data.scheduled.map((post) => (
              <li key={post.id} className="flex justify-between text-sm">
                <span>{post.caption?.slice(0, 50) || post.mediaType}</span>
                <span className="text-zinc-500">
                  {format(post.scheduledAt, "M/d HH:mm", { locale: ja })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
