import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { demoHashtagSets } from "@/lib/demo-data";
import { isPortfolioDemo } from "@/lib/config";
import { HashtagForm } from "./hashtag-form";
import { Badge } from "@/components/ui/badge";

async function getHashtagSets() {
  try {
    const account = await getActiveAccount();
    if (!account) return null;
    const sets = await prisma.hashtagSet.findMany({
      where: { accountId: account.id },
      orderBy: { updatedAt: "desc" },
    });
    return { account, sets };
  } catch {
    return null;
  }
}

export default async function HashtagsPage() {
  const data = await getHashtagSets();
  const sets = data?.sets.length
    ? data.sets
    : isPortfolioDemo()
      ? demoHashtagSets
      : [];
  const totalTags = sets.reduce((s, set) => s + set.tags.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">ハッシュタグ管理</h1>
        <p className="text-zinc-500">
          セット管理・投稿連携・パフォーマンス追跡
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API制限</CardTitle>
          <CardDescription>
            Instagram APIは7日間で30ユニークハッシュタグまで検索可能
          </CardDescription>
        </CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-zinc-200">
              <div
                className={`h-2 rounded-full ${
                  totalTags > 25 ? "bg-red-500" : "bg-purple-600"
                }`}
                style={{ width: `${Math.min((totalTags / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-zinc-500">{totalTags} / 30</span>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>新規ハッシュタグセット</CardTitle>
        </CardHeader>
        <HashtagForm />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sets.map((set) => (
          <Card key={set.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{set.name}</CardTitle>
                <Badge>{set.tags.length}タグ</Badge>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-1">
              {set.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-zinc-500">使用回数</p>
                <p className="font-bold">{set.usageCount}</p>
              </div>
              <div>
                <p className="text-zinc-500">平均リーチ</p>
                <p className="font-bold">{set.avgReach.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-zinc-500">平均ER</p>
                <p className="font-bold">{set.avgEngagement.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!sets.length && (
        <p className="text-center text-sm text-zinc-500">
          ハッシュタグセットを作成してください
        </p>
      )}
    </div>
  );
}
