import { prisma } from "./prisma";

export async function getActiveAccount() {
  return prisma.account.findFirst({
    orderBy: { updatedAt: "desc" },
  });
}

export async function requireAccount() {
  const account = await getActiveAccount();
  if (!account) {
    throw new Error("NO_ACCOUNT");
  }
  return account;
}
