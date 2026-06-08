import { Sidebar } from "@/components/sidebar";
import { getActiveAccount } from "@/lib/account";
import { TARGET_INSTAGRAM } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let username: string = TARGET_INSTAGRAM.username;
  try {
    const account = await getActiveAccount();
    if (account?.username) username = account.username;
  } catch {
    // DB未接続時はデモ用ユーザー名
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar username={username} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
