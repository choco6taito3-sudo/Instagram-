import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { demoReports } from "@/lib/demo-data";
import { isPortfolioDemo } from "@/lib/config";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { GenerateReportButton } from "./generate-button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

async function getReports() {
  try {
    const account = await getActiveAccount();
    if (!account) return null;
    const reports = await prisma.aiReport.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return { account, reports };
  } catch {
    return null;
  }
}

export default async function ReportsPage() {
  const data = await getReports();
  const reports = data?.reports.length
    ? data.reports
    : isPortfolioDemo()
      ? demoReports
      : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI分析レポート</h1>
          <p className="text-zinc-500">
            アルゴリズムに基づく自動分析と次のアクション提案
          </p>
        </div>
        <GenerateReportButton />
      </div>

      {reports.length ? (
        reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {format(report.periodStart, "yyyy/M/d", { locale: ja })} 〜{" "}
                    {format(report.periodEnd, "yyyy/M/d", { locale: ja })}
                  </CardTitle>
                  <CardDescription>
                    生成日: {format(report.createdAt, "yyyy/M/d HH:mm", { locale: ja })}
                  </CardDescription>
                </div>
                <Link href={`/api/export/report?id=${report.id}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    エクスポート
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-purple-600">要約</h4>
                <p className="mt-1 text-sm">{report.summary}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold text-green-600">強み</h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{report.strengths}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-600">弱み</h4>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{report.weaknesses}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-blue-600">次の7日間のアクション</h4>
                <p className="mt-1 whitespace-pre-wrap text-sm">{report.actions}</p>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-zinc-500">
                  詳細レポートを表示
                </summary>
                <div className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                  {report.fullReport}
                </div>
              </details>
            </div>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>レポートがありません</CardTitle>
            <CardDescription>
              「レポートを生成」ボタンで、過去7日間のデータを分析したレポートを作成できます。
              {!data && (
                <Badge variant="warning" className="ml-2">
                  アカウント未連携時はデモレポートが生成されます
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
