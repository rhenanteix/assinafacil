import { NextResponse } from "next/server";
export const failure = (error: string, status: number) => NextResponse.json({ error }, { status });
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.NEXTAUTH_URL;
  // In production, a missing or misconfigured base URL must not silently allow
  // every origin — refuse instead of falling back to the request URL.
  if (!configured) {
    if (process.env.VERCEL_ENV === "production") return false;
    return true;
  }
  try {
    return origin === new URL(configured).origin;
  } catch {
    return false;
  }
}
