import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const account = await requireAccount();
    const { username } = await request.json();

    const competitor = await prisma.competitor.create({
      data: {
        accountId: account.id,
        username: username.replace("@", ""),
      },
    });

    return NextResponse.json(competitor);
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
