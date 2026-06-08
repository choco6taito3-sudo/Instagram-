import { Sidebar } from "@/components/sidebar";
import { DemoBanner } from "@/components/demo-banner";
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
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <Sidebar username={username} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
