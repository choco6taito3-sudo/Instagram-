import { NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { generateAiReport } from "@/lib/ai";
import { reportQueue } from "@/lib/queue";

export async function POST() {
  try {
    const account = await requireAccount();

    try {
      const report = await generateAiReport(account.id, 7);
      return NextResponse.json({ status: "generated", reportId: report.id });
    } catch (directError) {
      console.warn("Direct AI generation failed, queuing:", directError);
      await reportQueue.add("generate", { accountId: account.id, days: 7 });
      return NextResponse.json({ status: "queued" });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
