import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/utils/site-url";
export default function sitemap(): MetadataRoute.Sitemap {
  const url = publicSiteUrl();
  return url ? ["/", "/gerador", "/precos", "/ajuda", "/termos", "/privacidade", "/compatibilidade", "/assinatura-de-email-para-corretor", "/como-colocar-assinatura-no-gmail", "/assinatura-no-outlook"].map(path => ({ url: new URL(path, url).href })) : [];
}
