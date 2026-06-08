import { NextResponse } from "next/server";
import { getMetaAuthUrl } from "@instagram-ops/sdk";

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.redirect(
      new URL("/?error=meta_not_configured", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }

  const url = getMetaAuthUrl(appId, redirectUri);
  return NextResponse.redirect(url);
}
