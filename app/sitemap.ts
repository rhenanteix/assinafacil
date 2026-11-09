import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/lib/utils/site-url";
import { professionPacksEnabled } from "@/lib/feature-flags";
import { professionPacks } from "@/lib/professions";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = publicSiteUrl();
  if (!url) return [];
  const pages = ["/", "/gerador", "/precos", "/ajuda", "/termos", "/privacidade", "/compatibilidade", "/assinatura-de-email-para-corretor", "/como-colocar-assinatura-no-gmail", "/assinatura-no-outlook"];
  if (professionPacksEnabled()) pages.push(...professionPacks.map(p => `/modelos/${p.slug}`));
  return pages.map(path => ({ url: new URL(path, url).href }));
}

