import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const account = await requireAccount();
    const reportId = request.nextUrl.searchParams.get("id");

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    const report = await prisma.aiReport.findFirst({
      where: { id: reportId, accountId: account.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const start = format(report.periodStart, "yyyy/MM/dd");
    const end = format(report.periodEnd, "yyyy/MM/dd");

    const content = [
      "Instagram AI分析レポート",
      `アカウント: @${account.username}`,
      `期間: ${start} - ${end}`,
      "",
      "【要約】",
      report.summary,
      "",
      "【強み】",
      report.strengths,
      "",
      "【弱み】",
      report.weaknesses,
      "",
      "【次のアクション】",
      report.actions,
      "",
      "【詳細レポート】",
      report.fullReport,
    ].join("\n");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="report-${start}-${end}.txt"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
