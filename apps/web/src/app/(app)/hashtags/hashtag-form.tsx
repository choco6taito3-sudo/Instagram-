"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export function HashtagForm() {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tags.trim()) return;
    setLoading(true);

    try {
      const tagList = tags
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tags: tagList }),
      });

      setName("");
      setTags("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">セット名</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: リール用、日常投稿"
          className="mt-1"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">ハッシュタグ（スペースまたはカンマ区切り）</label>
        <Textarea
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          rows={3}
          placeholder="#fashion #style #ootd"
          className="mt-1"
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "作成中..." : "セットを作成"}
      </Button>
    </form>
  );
}
