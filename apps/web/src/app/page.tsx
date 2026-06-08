import { redirect } from "next/navigation";
import { getActiveAccount } from "@/lib/account";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { TARGET_INSTAGRAM } from "@/lib/config";

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed:
    "Facebookログインがキャンセルまたは拒否されました。もう一度お試しください。",
  no_instagram_account:
    `Instagramビジネス/クリエイターアカウントがFacebookページと連携されていません。@${TARGET_INSTAGRAM.username} をビジネスアカウントに切り替え、Facebookページと連携してください。`,
  token_exchange_failed:
    "トークンの取得に失敗しました。META_APP_ID・META_APP_SECRET・OAuthリダイレクトURIの設定を確認してください。",
  meta_not_configured:
    "Metaアプリが未設定です。.env に META_APP_ID と META_APP_SECRET を設定し、devサーバーを再起動してください。",
};

const isMetaConfigured = Boolean(
  process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim()
);

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  try {
    const account = await getActiveAccount();
    if (account) redirect("/dashboard");
  } catch {
    // DB not connected, show login
  }

  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
        <Instagram className="h-8 w-8 text-white" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-zinc-900">Instagram運用ツール</h1>
      <p className="mt-3 max-w-md text-center text-zinc-600">
        @{TARGET_INSTAGRAM.username} のアカウント分析・予約投稿・競合分析・AIレポートを一元管理
      </p>

      {errorMessage && (
        <div className="mt-6 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isMetaConfigured ? (
        <a href="/api/auth/meta" className="mt-8">
          <Button size="lg">Instagramアカウントを連携</Button>
        </a>
      ) : (
        <div className="mt-8 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Metaアプリの設定が必要です</p>
          <p className="mt-2">
            1.{" "}
            <a
              href="https://developers.facebook.com/"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Meta for Developers
            </a>
            でアプリを作成
          </p>
          <p className="mt-1">
            2. <code className="text-xs">.env</code> に{" "}
            <code className="text-xs">META_APP_ID</code> と{" "}
            <code className="text-xs">META_APP_SECRET</code> を設定
          </p>
          <p className="mt-1">3. <code className="text-xs">npm run dev:restart</code> で再起動</p>
        </div>
      )}
      <p className="mt-4 text-sm text-zinc-400">
        Meta Business / Creator アカウント + Facebookページ連携が必要です
      </p>
    </div>
  );
}
