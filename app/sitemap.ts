import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/utils/site-url";
export default function sitemap(): MetadataRoute.Sitemap {
  const url = publicSiteUrl();
  return url ? ["/", "/gerador", "/precos"].map(path => ({ url: new URL(path, url).href })) : [];
}
