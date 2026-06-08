"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface HashtagSet {
  id: string;
  name: string;
  tags: string[];
}

export function ScheduleForm({ hashtagSets }: { hashtagSets: HashtagSet[] }) {
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("IMAGE");
  const [scheduledAt, setScheduledAt] = useState("");
  const [hashtagSetId, setHashtagSetId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !scheduledAt) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await uploadRes.json();

      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType,
          mediaUrl: url,
          caption,
          scheduledAt,
          hashtagSetId: hashtagSetId || undefined,
        }),
      });

      setCaption("");
      setScheduledAt("");
      setFile(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">メディアタイプ</label>
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="IMAGE">フィード（画像）</option>
          <option value="REELS">リール</option>
          <option value="VIDEO">動画</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">メディアファイル</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 w-full text-sm"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">キャプション</label>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="mt-1"
          placeholder="投稿テキストを入力..."
        />
      </div>

      {hashtagSets.length > 0 && (
        <div>
          <label className="text-sm font-medium">ハッシュタグセット</label>
          <select
            value={hashtagSetId}
            onChange={(e) => setHashtagSetId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">なし</option>
            {hashtagSets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name} ({set.tags.length}個)
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">投稿日時</label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1"
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "予約中..." : "予約投稿を作成"}
      </Button>
    </form>
  );
}
