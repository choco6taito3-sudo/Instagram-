import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InstagramClient } from "@instagram-ops/sdk";
import { getActiveAccount } from "@/lib/account";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_WEBHOOK_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const account = await getActiveAccount();
    if (!account) return NextResponse.json({ status: "ok" });

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === "comments") {
          const value = change.value;
          await prisma.comment.upsert({
            where: { igCommentId: value.id },
            create: {
              accountId: account.id,
              igCommentId: value.id,
              igMediaId: value.media?.id || "",
              username: value.from?.username || "unknown",
              text: value.text || "",
            },
            update: {
              text: value.text || "",
            },
          });

          const templates = await prisma.replyTemplate.findMany({
            where: { accountId: account.id, isActive: true },
          });

          const client = new InstagramClient(
            account.pageAccessToken || account.accessToken
          );

          for (const template of templates) {
            const matched = template.keywords.some((kw) =>
              (value.text || "").toLowerCase().includes(kw.toLowerCase())
            );
            if (matched) {
              await client.replyToComment(value.id, template.replyText);
              if (template.dmText) {
                try {
                  await client.sendPrivateReply(
                    account.igUserId,
                    value.id,
                    template.dmText
                  );
                } catch {
                  // Private reply may fail outside 7-day window
                }
              }
              break;
            }
          }
        }
      }

      for (const messaging of entry.messaging || []) {
        const msg = messaging.message;
        if (!msg) continue;

        const senderId = messaging.sender?.id || "";
        const isEcho = messaging.message?.is_echo;

        if (!isEcho) {
          await prisma.message.upsert({
            where: { igMessageId: msg.mid },
            create: {
              accountId: account.id,
              igMessageId: msg.mid,
              senderId,
              senderName: senderId,
              text: msg.text || "",
              isFromUser: true,
              windowEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            update: {
              text: msg.text || "",
            },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "ok" });
  }
}
