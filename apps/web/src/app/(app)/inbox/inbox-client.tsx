"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  keywords: string[];
  replyText: string;
  isActive: boolean;
}

export function InboxClient({
  templates,
}: {
  templates: Template[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <TemplateForm onCreated={() => router.refresh()} />
      {templates.map((t) => (
        <div key={t.id} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t.name}</span>
            <Badge variant={t.isActive ? "success" : "default"}>
              {t.isActive ? "有効" : "無効"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-500">キーワード: {t.keywords.join(", ")}</p>
          <p className="mt-1 text-sm">{t.replyText}</p>
        </div>
      ))}
    </div>
  );
}

function TemplateForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [replyText, setReplyText] = useState("");
  const [dmText, setDmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          keywords: keywords.split(",").map((k) => k.trim()),
          replyText,
          dmText: dmText || undefined,
        }),
      });
      setName("");
      setKeywords("");
      setReplyText("");
      setDmText("");
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="テンプレート名"
          required
        />
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="キーワード（カンマ区切り）"
          required
        />
      </div>
      <Input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="コメント返信テキスト"
        required
      />
      <Input
        value={dmText}
        onChange={(e) => setDmText(e.target.value)}
        placeholder="DMテキスト（任意）"
      />
      <Button type="submit" size="sm" disabled={loading}>
        テンプレート追加
      </Button>
    </form>
  );
}

export function CommentActions({ id }: { id: string }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/inbox/comments/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      setReply("");
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async () => {
    await fetch(`/api/inbox/comments/${id}/hide`, { method: "POST" });
  };

  return (
    <div className="mt-2 flex gap-2">
      <Input
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="返信を入力..."
        className="text-xs"
      />
      <Button size="sm" onClick={handleReply} disabled={loading}>
        返信
      </Button>
      <Button size="sm" variant="outline" onClick={handleHide}>
        非表示
      </Button>
    </div>
  );
}

export function MessageActions({ senderId }: { senderId: string }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/inbox/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, message: reply }),
      });
      setReply("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 flex gap-2">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="DM返信を入力..."
        rows={2}
        className="text-xs"
      />
      <Button size="sm" onClick={handleReply} disabled={loading}>
        返信
      </Button>
    </div>
  );
}
