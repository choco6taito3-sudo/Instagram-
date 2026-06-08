import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const account = await requireAccount();
    const sets = await prisma.hashtagSet.findMany({
      where: { accountId: account.id },
    });
    return NextResponse.json(sets);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const account = await requireAccount();
    const { name, tags } = await request.json();

    const set = await prisma.hashtagSet.create({
      data: {
        accountId: account.id,
        name,
        tags,
      },
    });

    return NextResponse.json(set);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
