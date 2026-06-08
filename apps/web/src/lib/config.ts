export const TARGET_INSTAGRAM = {
  username: "laughpandemicmikey",
  displayName: "Laugh Pandemic Mikey",
  profileUrl: "https://www.instagram.com/laughpandemicmikey",
} as const;

/** OAuth リダイレクト URI（auth 開始と callback で必ず同じ値を使う） */
export function getMetaRedirectUri(): string {
  if (process.env.META_REDIRECT_URI?.trim()) {
    return process.env.META_REDIRECT_URI.trim();
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) return `${appUrl}/api/auth/meta/callback`;
  return "http://localhost:3000/api/auth/meta/callback";
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
