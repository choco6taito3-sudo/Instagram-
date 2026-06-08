import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { InstagramClient } from "@instagram-ops/sdk";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const account = await requireAccount();
    const { senderId, message } = await request.json();

    const client = new InstagramClient(
      account.pageAccessToken || account.accessToken
    );
    await client.sendMessage(account.igUserId, senderId, message);

    await prisma.message.updateMany({
      where: { senderId, accountId: account.id },
      data: { isRead: true },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
