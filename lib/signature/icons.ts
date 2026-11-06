import { socialNetworks } from "@/types/social";
import { publicSiteUrl } from "@/lib/utils/site-url";

export function renderSocialIcons(data: Partial<Record<typeof socialNetworks[number]["key"], string>>) {
  const origin = publicSiteUrl() ?? new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");
  return socialNetworks.flatMap(network => {
    try {
      const url = new URL(data[network.key] ?? "");
      if (url.protocol !== "https:" || url.username || url.password ||
          !network.domains.some(domain => url.hostname === domain || url.hostname.endsWith("." + domain))) return [];
      const href = url.href.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const image = new URL(`/social/${network.key}.png`, origin).href;
      return [`<td style="padding:0 7px 0 0"><a href="${href}" style="text-decoration:none"><img src="${image}" alt="${network.label}" width="20" height="20" style="display:block;border:0;width:20px;height:20px"></a></td>`];
    } catch { return []; }
  }).join("");
}
