export function sessionCookieOptions(siteUrl: string | undefined, production: boolean) {
  // Local HTTP cannot reliably retain Secure cookies across browsers.
  const secure = siteUrl ? new URL(siteUrl).protocol === "https:" : production;
  return {
    httpOnly: true,
    sameSite: secure ? "none" as const : "lax" as const,
    path: "/",
    secure,
  };
}
