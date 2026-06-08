import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const account = await requireAccount();
    const templates = await prisma.replyTemplate.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const account = await requireAccount();
    const { name, keywords, replyText, dmText } = await request.json();

    const template = await prisma.replyTemplate.create({
      data: {
        accountId: account.id,
        name,
        keywords,
        replyText,
        dmText,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof Error && error.message === "NO_ACCOUNT") {
      return NextResponse.json({ error: "No account" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
