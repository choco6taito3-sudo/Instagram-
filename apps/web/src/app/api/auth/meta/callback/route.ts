import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getFacebookPages,
} from "@instagram-ops/sdk";
import { InstagramClient } from "@instagram-ops/sdk";
import { prisma } from "@/lib/prisma";
import { getAppUrl, getMetaRedirectUri } from "@/lib/config";

function redirectWithError(error: string, detail?: string) {
  const url = new URL("/", getAppUrl());
  url.searchParams.set("error", error);
  if (detail) url.searchParams.set("detail", detail.slice(0, 200));
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return redirectWithError("auth_failed");
  }

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = getMetaRedirectUri();

  try {
    const shortToken = await exchangeCodeForToken(
      appId,
      appSecret,
      redirectUri,
      code
    );
    const longToken = await getLongLivedToken(
      appId,
      appSecret,
      shortToken.access_token
    );

    const pages = await getFacebookPages(longToken.access_token);
    const pageWithIg = pages.find((p) => p.instagram_business_account?.id);

    if (!pageWithIg?.instagram_business_account) {
      return redirectWithError("no_instagram_account");
    }

    const igUserId = pageWithIg.instagram_business_account.id;
    const pageToken = pageWithIg.access_token;
    const client = new InstagramClient(pageToken);
    const igUser = await client.getUser(igUserId);

    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + (longToken.expires_in || 60 * 24 * 60 * 60)
    );

    await prisma.account.upsert({
      where: { igUserId },
      create: {
        igUserId,
        username: igUser.username,
        name: igUser.name,
        profilePicture: igUser.profile_picture_url,
        followersCount: igUser.followers_count ?? 0,
        accessToken: longToken.access_token,
        tokenExpiresAt: expiresAt,
        pageId: pageWithIg.id,
        pageAccessToken: pageToken,
      },
      update: {
        username: igUser.username,
        name: igUser.name,
        profilePicture: igUser.profile_picture_url,
        followersCount: igUser.followers_count ?? 0,
        accessToken: longToken.access_token,
        tokenExpiresAt: expiresAt,
        pageId: pageWithIg.id,
        pageAccessToken: pageToken,
      },
    });

    return NextResponse.redirect(new URL("/dashboard", getAppUrl()));
  } catch (err) {
    console.error("OAuth callback error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    const isDbError =
      err instanceof Prisma.PrismaClientKnownRequestError ||
      err instanceof Prisma.PrismaClientInitializationError ||
      err instanceof Prisma.PrismaClientValidationError ||
      message.includes("P1001") ||
      message.includes("Can't reach database") ||
      message.includes("database server") ||
      message.includes("prisma.");

    if (isDbError) {
      return redirectWithError("db_failed", message);
    }

    return redirectWithError("token_exchange_failed", message);
  }
}
