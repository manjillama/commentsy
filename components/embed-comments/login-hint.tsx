import { ParentSiteData } from "./input-comment";

export default function LoginHint({ parentSiteData }: { parentSiteData: ParentSiteData }) {
  const callbackUrl = parentSiteData?.url ?? process.env.NEXT_PUBLIC_SITE_URL ?? "/";
  return <p className="text-sm opacity-70 my-3">
    <a className="underline font-semibold" href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} target="_blank" rel="noreferrer">Sign in</a> before posting to edit or delete your comments later. Guest comments cannot be managed after posting. After signing in, reload these comments.
  </p>;
}
