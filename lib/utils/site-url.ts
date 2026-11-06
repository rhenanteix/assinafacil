export function publicSiteUrl(): URL | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    if (!configured) return undefined;
    const url = new URL(configured);
    return url.protocol === "https:" ? new URL(url.origin) : undefined;
  } catch { return undefined; }
}
