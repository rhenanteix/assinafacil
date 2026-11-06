import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/prisma";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72).refine(value => new TextEncoder().encode(value).length <= 72),
});

export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    ...(googleEnabled ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })] : []),
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        const valid = await compare(parsed.data.password, user?.passwordHash ?? "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW");
        return valid && user?.passwordHash ? { id: user.id, email: user.email, name: user.name } : null;
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await db.user.updateMany({ where: { id: user.id, emailVerified: null }, data: { emailVerified: new Date() } });
      }
    },
  },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider !== "google" || (profile as { email_verified?: boolean } | undefined)?.email_verified === true;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};
export async function currentUserId() {
  return (await getServerSession(authOptions))?.user?.id;
}


export async function currentAccount() {
  const id = await currentUserId();
  return id ? db.user.findUnique({ where: { id }, select: { id: true, email: true, emailVerified: true } }) : null;
}

export async function verifiedUserId() {
  const account = await currentAccount();
  return account?.emailVerified ? account.id : undefined;
}
