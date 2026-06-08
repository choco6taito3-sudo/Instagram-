import { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

export async function processGenerateReport(job: Job<{ accountId: string; days?: number }>) {
  const days = job.data.days || 7;
  const account = await prisma.account.findUnique({
    where: { id: job.data.accountId },
  });
  if (!account) return;

  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - days);

  const insights = await prisma.insightsDaily.findMany({
    where: {
      accountId: account.id,
      date: { gte: periodStart, lte: periodEnd },
    },
    orderBy: { date: "asc" },
  });

  const topPosts = await prisma.mediaPost.findMany({
    where: { accountId: account.id },
    orderBy: { engagementRate: "desc" },
    take: 5,
  });

  const demographics = await prisma.audienceDemographic.findMany({
    where: { accountId: account.id },
    orderBy: { count: "desc" },
    take: 20,
  });

  const competitors = await prisma.competitor.findMany({
    where: { accountId: account.id },
    include: {
      posts: { orderBy: { engagementRate: "desc" }, take: 3 },
    },
  });

  const prompt = `あなたはInstagramアルゴリズムに精通したソーシャルメディアコンサルタントです。
以下のデータを分析し、日本語でレポートを作成してください。

アカウント: @${account.username}
フォロワー数: ${account.followersCount}
分析期間: 過去${days}日間

【日次インサイト】
${JSON.stringify(insights, null, 2)}

【トップ投稿】
${JSON.stringify(topPosts.map((p) => ({ type: p.mediaType, caption: p.caption?.slice(0, 100), engagementRate: p.engagementRate, reach: p.reach })), null, 2)}

【フォロワー属性】
${JSON.stringify(demographics, null, 2)}

【競合データ】
${JSON.stringify(competitors.map((c) => ({ username: c.username, followers: c.followersCount, topPosts: c.posts })), null, 2)}

以下のJSON形式で回答してください:
{
  "summary": "3行以内のパフォーマンス要約",
  "strengths": "強み（箇条書き）",
  "weaknesses": "弱み（箇条書き）",
  "actions": "次の7日間の具体的アクション（投稿タイプ・時間帯・ハッシュタグ・競合から学ぶポイント）",
  "fullReport": "詳細レポート全文（マークダウン形式）"
}

アルゴリズムのベストプラクティスを考慮してください:
- リール優先（リーチ拡大）
- 保存率・シェア率の重視
- コメント返信率の向上
- フォロワーのアクティブ時間帯への投稿
- 一貫した投稿頻度`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No report generated");

  const report = JSON.parse(content);

  await prisma.aiReport.create({
    data: {
      accountId: account.id,
      periodStart,
      periodEnd,
      summary: report.summary,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      actions: report.actions,
      fullReport: report.fullReport,
    },
  });
}
