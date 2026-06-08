import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  InboxClient,
  CommentActions,
  MessageActions,
} from "./inbox-client";

async function getInboxData() {
  try {
    const account = await getActiveAccount();
    if (!account) return null;

    const comments = await prisma.comment.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const messages = await prisma.message.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const templates = await prisma.replyTemplate.findMany({
      where: { accountId: account.id },
    });

    const unreadComments = comments.filter((c) => !c.isRead).length;
    const unreadMessages = messages.filter((m) => !m.isRead).length;

    return { account, comments, messages, templates, unreadComments, unreadMessages };
  } catch {
    return null;
  }
}

export default async function InboxPage() {
  const data = await getInboxData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">コメント・DM管理</h1>
        <p className="text-zinc-500">統合受信箱・返信・自動返信テンプレート</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-zinc-500">未読コメント</p>
          <p className="text-2xl font-bold">{data?.unreadComments ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">未読DM</p>
          <p className="text-2xl font-bold">{data?.unreadMessages ?? 0}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>自動返信テンプレート</CardTitle>
        </CardHeader>
        <InboxClient templates={data?.templates ?? []} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>コメント</CardTitle>
          </CardHeader>
          {data?.comments.length ? (
            <div className="space-y-3">
              {data.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-lg border p-3 ${
                    comment.isRead
                      ? "border-zinc-100 dark:border-zinc-800"
                      : "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">@{comment.username}</span>
                    <span className="text-xs text-zinc-500">
                      {format(comment.createdAt, "M/d HH:mm", { locale: ja })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.text}</p>
                  <CommentActions id={comment.id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Webhook連携後、コメントが表示されます
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DM</CardTitle>
          </CardHeader>
          {data?.messages.length ? (
            <div className="space-y-3">
              {data.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg border p-3 ${
                    msg.isRead
                      ? "border-zinc-100 dark:border-zinc-800"
                      : "border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {msg.isFromUser ? msg.senderName : "自分"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {format(msg.createdAt, "M/d HH:mm", { locale: ja })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{msg.text}</p>
                  {msg.windowEndsAt && (
                    <p className="mt-1 text-xs text-yellow-600">
                      返信期限: {format(msg.windowEndsAt, "M/d HH:mm", { locale: ja })}
                    </p>
                  )}
                  {msg.isFromUser && <MessageActions senderId={msg.senderId} />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Webhook連携後、DMが表示されます
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
