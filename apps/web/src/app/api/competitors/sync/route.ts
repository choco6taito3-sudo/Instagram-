import { NextResponse } from "next/server";
import { competitorsQueue } from "@/lib/queue";

export async function POST() {
  try {
    await competitorsQueue.add("sync", {});
    return NextResponse.json({ status: "queued" });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
