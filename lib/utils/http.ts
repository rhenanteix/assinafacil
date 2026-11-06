import { NextResponse } from "next/server";
export const failure = (error: string, status: number) => NextResponse.json({ error }, { status });
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXTAUTH_URL || request.url).origin;
  return origin === expected;
}
