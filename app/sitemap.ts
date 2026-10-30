import type { MetadataRoute } from "next";
import { siteUrl } from "@/utils/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/docs", "/contact", "/legal/privacy-policy", "/legal/terms-of-service"].map(path => ({
    url: new URL(path, siteUrl).href,
  }));
}
