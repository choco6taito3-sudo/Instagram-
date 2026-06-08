import OpenAI from "openai";
import { prisma } from "./prisma";
import { generateDemoInsights } from "./demo-data";
import { TARGET_INSTAGRAM } from "./config";

function buildDemoReport(days: number) {
  const insights = generateDemoInsights(days);
  const avgReach =
    insights.reduce((s, i) => s + i.reach, 0) / insights.length;
  const avgEr =
    insights.reduce((s, i) => s + i.engagementRate, 0) / insights.length;

  return {
    summary: `過去${days}日間、平均リーチ${Math.round(avgReach)}・平均エンゲージメント率${avgEr.toFixed(1)}%。リール投稿の反応が良好で、週末夜の投稿が特に効果的です。`,
    strengths:
      "・リール形式の投稿が高いリーチを獲得\n・週末21時前後の投稿タイミングが最適\n・コメント返信率が競合平均を上回る",
    weaknesses:
      "・フィード投稿の保存率が低い\n・平日昼間の投稿パフォーマンスが低迷\n・ハッシュタグの多様性が不足",
    actions:
      "1. 週3本のリール投稿を維持（土日21時を優先）\n2. 保存を促すキャプション（まとめ・チェックリスト形式）を導入\n3. 新ハッシュタグセットを2つ追加しA/Bテスト\n4. 競合の高ER投稿を参考にフック（冒頭3秒）を改善\n5. 未返信コメントを24時間以内にすべて返信",
    fullReport: `@${TARGET_INSTAGRAM.username} の過去${days}日間分析（デモレポート）\n\nアルゴリズム観点では、リールの初動エンゲージメントとコメント返信率が重要です。保存率の向上と投稿時間の最適化により、次の7日間でリーチ15%向上が見込めます。`,
  };
}

export async function generateAiReport(accountId: string, days = 7) {
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - days);

  const [insights, topPosts, competitors] = await Promise.all([
    prisma.insightsDaily.findMany({
      where: { accountId, date: { gte: periodStart } },
      orderBy: { date: "asc" },
    }),
    prisma.mediaPost.findMany({
      where: { accountId },
      orderBy: { engagementRate: "desc" },
      take: 5,
    }),
    prisma.competitor.findMany({
      where: { accountId },
      include: { posts: { orderBy: { engagementRate: "desc" }, take: 3 } },
    }),
  ]);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const demo = buildDemoReport(days);
    return prisma.aiReport.create({
      data: {
        accountId,
        periodStart,
        periodEnd,
        ...demo,
      },
    });
  }

  const context = {
    username: TARGET_INSTAGRAM.username,
    periodDays: days,
    insights: insights.length
      ? insights.map((i) => ({
          date: i.date,
          reach: i.reach,
          impressions: i.impressions,
          engagementRate: i.engagementRate,
        }))
      : generateDemoInsights(days),
    topPosts: topPosts.map((p) => ({
      type: p.mediaType,
      caption: p.caption?.slice(0, 100),
      reach: p.reach,
      engagementRate: p.engagementRate,
    })),
    competitors: competitors.map((c) => ({
      username: c.username,
      followers: c.followersCount,
      topPosts: c.posts.map((p) => ({
        type: p.mediaType,
        likes: p.likeCount,
        engagementRate: p.engagementRate,
      })),
    })),
  };

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `あなたはInstagram運用の専門家です。アルゴリズム（リール優先、保存率、コメント返信率、投稿時間最適化）に基づき、日本語で分析レポートを作成してください。JSON形式で返答: {"summary":"3行要約","strengths":"箇条書き","weaknesses":"箇条書き","actions":"次7日間の具体的アクション","fullReport":"詳細レポート"}`,
      },
      {
        role: "user",
        content: JSON.stringify(context),
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI response empty");

  const parsed = JSON.parse(content) as {
    summary: string;
    strengths: string;
    weaknesses: string;
    actions: string;
    fullReport: string;
  };

  return prisma.aiReport.create({
    data: {
      accountId,
      periodStart,
      periodEnd,
      summary: parsed.summary,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      actions: parsed.actions,
      fullReport: parsed.fullReport,
    },
  });
}
