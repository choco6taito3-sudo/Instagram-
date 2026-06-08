import { prisma } from "./prisma";
import { isPortfolioDemo } from "./config";

export async function getActiveAccount() {
  if (isPortfolioDemo()) return null;
  return prisma.account.findFirst({
    orderBy: { updatedAt: "desc" },
  });
}

export async function requireAccount() {
  if (isPortfolioDemo()) {
    throw new Error("DEMO_MODE");
  }
  const account = await getActiveAccount();
  if (!account) {
    throw new Error("NO_ACCOUNT");
  }
  return account;
}
