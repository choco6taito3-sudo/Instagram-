import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { InstagramClient } from "@instagram-ops/sdk";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const account = await requireAccount();
    const { id } = await params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const client = new InstagramClient(
      account.pageAccessToken || account.accessToken
    );
    await client.hideComment(comment.igCommentId, true);

    await prisma.comment.update({
      where: { id },
      data: { isHidden: true },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
