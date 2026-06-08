import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getFacebookPages,
} from "@instagram-ops/sdk";
import { InstagramClient } from "@instagram-ops/sdk";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/?error=auth_failed", request.url)
    );
  }

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = process.env.META_REDIRECT_URI!;

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
      return NextResponse.redirect(
        new URL("/?error=no_instagram_account", request.url)
      );
    }

    const igUserId = pageWithIg.instagram_business_account.id;
    const pageToken = pageWithIg.access_token;
    const client = new InstagramClient(pageToken);
    const igUser = await client.getUser(igUserId);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + longToken.expires_in);

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

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/?error=token_exchange_failed", request.url)
    );
  }
}
