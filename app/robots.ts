import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/utils/site-url";
export default function robots(): MetadataRoute.Robots {
  const url = publicSiteUrl();
  return {
    rules: url ? { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard"] } : { userAgent: "*", disallow: "/" },
    ...(url ? { sitemap: new URL("/sitemap.xml", url).href } : {}),
  };
}
