import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { InstagramClient } from "@instagram-ops/sdk";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const account = await requireAccount();
    const { id } = await params;
    const { message } = await request.json();

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const client = new InstagramClient(
      account.pageAccessToken || account.accessToken
    );
    await client.replyToComment(comment.igCommentId, message);

    await prisma.comment.update({
      where: { id },
      data: { isRead: true, repliedAt: new Date() },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
