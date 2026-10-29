import { webOrigin } from "@/utils/origin";

/** External returns are an operator-controlled allowlist, never user input. */
export async function authRedirect(url: string, baseUrl: string): Promise<string> {
  try {
    const target = new URL(url, baseUrl);
    const origin = webOrigin(target.href);
    if (!origin) return baseUrl;
    if (origin === webOrigin(baseUrl)) return target.href;
    const allowed = (process.env.AUTH_REDIRECT_ORIGINS ?? "").split(",").map(value => value.trim()).filter(Boolean);
    return allowed.some(value => webOrigin(value) === value && value === origin) ? target.href : baseUrl;
  } catch { return baseUrl; }
}
