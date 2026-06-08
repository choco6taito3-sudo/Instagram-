import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const account = await requireAccount();
    const alerts = await prisma.performanceAlert.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(alerts);
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const account = await requireAccount();
    const { id, isRead } = await request.json();

    if (id) {
      await prisma.performanceAlert.updateMany({
        where: { id, accountId: account.id },
        data: { isRead: isRead ?? true },
      });
    } else {
      await prisma.performanceAlert.updateMany({
        where: { accountId: account.id, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
