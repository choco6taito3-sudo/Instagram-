import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { publishQueue } from "@/lib/queue";

export async function POST(request: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await request.json();
    const { mediaType, mediaUrl, caption, scheduledAt, hashtagSetId } = body;

    const post = await prisma.scheduledPost.create({
      data: {
        accountId: account.id,
        mediaType,
        mediaUrl,
        caption,
        scheduledAt: new Date(scheduledAt),
        hashtagSetId,
        status: "pending",
      },
    });

    const delay = new Date(scheduledAt).getTime() - Date.now();
    if (delay <= 15 * 60 * 1000) {
      await publishQueue.add("publish", { postId: post.id });
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account connected" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to schedule" }, { status: 500 });
  }
}
