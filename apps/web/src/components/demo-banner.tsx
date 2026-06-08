import { isPortfolioDemo } from "@/lib/config";

export function DemoBanner() {
  if (!isPortfolioDemo()) return null;

  return (
    <div className="border-b border-purple-200 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-center text-sm text-white">
      ポートフォリオデモ — サンプルデータを表示中（閲覧専用）
    </div>
  );
}
