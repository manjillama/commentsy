import type { MetadataRoute } from "next";
import { siteUrl } from "@/utils/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Let crawlers read page-level noindex directives on non-public pages.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
