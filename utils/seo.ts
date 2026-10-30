import type { Metadata } from "next";
import { SITE_DATA } from "@/constants";

// Keep all search and share URLs on the configured public origin.
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL as string).origin;

export function publicPageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, siteUrl).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: "Commentsy",
      title,
      description,
      url,
      images: [{ url: "/thumbnail.jpg", alt: "Commentsy website comment system" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/thumbnail.jpg"],
    },
  };
}

export const homeMetadata = () => publicPageMetadata(SITE_DATA.title, SITE_DATA.description, "/");
