import { socialNetworks } from "@/types/social";

import { publicSiteUrl } from "@/lib/utils/site-url";
export function renderSocialIcons(data: Partial<Record<typeof socialNetworks[number]["key"], string>>, assetBase = publicSiteUrl()?.origin ?? "") {
  const icons = socialNetworks.flatMap(network => {
    const value = data[network.key];
    if (!value) return [];
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password || !network.domains.some(domain => url.hostname === domain || url.hostname.endsWith("." + domain))) return [];
      const href = url.href.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const src = `${assetBase}/social/${network.key}.png`.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      return [`<td style="padding:0 8px 0 0"><a href="${href}" aria-label="${network.label}" style="text-decoration:none"><img src="${src}" alt="${network.label}" width="20" height="20" style="display:block;border:0;width:20px;height:20px"></a></td>`];
    } catch { return []; }
  }).join("");
  return icons ? `<tr>${icons}</tr>` : "";
}
