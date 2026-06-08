import { NextRequest, NextResponse } from "next/server";
import { getMetaAuthUrl } from "@instagram-ops/sdk";
import { getAppUrl, getMetaRedirectUri } from "@/lib/config";

export async function GET() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = getMetaRedirectUri();

  if (!appId || !appSecret) {
    return NextResponse.redirect(
      new URL("/?error=meta_not_configured", getAppUrl())
    );
  }

  const url = getMetaAuthUrl(appId, redirectUri);
  return NextResponse.redirect(url);
}
