"use client";
import { useTranslation } from "@/lib/i18n/client";

import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";
import posthog from "posthog-js";
import { readDraftMeta } from "@/hooks/use-signature-draft";

export function AuthForm({ register = false, google, destination, embedded = false }: { register?: boolean; google: boolean; destination: "precos" | "dashboard" | "gerador"; embedded?: boolean }) {
  const t = useTranslation();
  const router = useRouter();
  const { busy, run } = useSignatureActions();
  const suffix = `?destino=${destination}`;
  const wrap = (inner: React.ReactNode) => embedded ? inner : <div className="shell py-14"><div className="panel mx-auto max-w-md">{inner}</div></div>;
  return wrap(<>
    <p className="eyebrow">{t("Sua conta")}</p><h1 className="my-4 text-3xl font-bold">{register ? t("Crie sua conta") : t("Entre no Maily")}</h1>
    <form className="space-y-4" onSubmit={event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const method = "credentials";
      if (register) track("register_started", { method, destination });
      else track("login_started", { method, destination });
      void run("auth", async () => {
        let verificationSent = false;
        if (register) {
          const { verificationSent: sent } = await jsonRequest<{ verificationSent: boolean }>("/api/register", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, destination }),
          });
          posthog.capture("signup_completed", { destination, ...(readDraftMeta()?.utm ?? {}) });
          if (verificationSent) toast.success(t("Conta criada com sucesso."));
          if (!verificationSent) toast.info(t("Conta criada. Use a opção de enviar um novo link para confirmar o e-mail."));
        }
        const result = await signIn("credentials", { ...values, redirect: false });
        if (!result?.ok) {
          track("login_failed", { method, reason: "invalid_credentials" });
          if (register) { router.replace("/login" + suffix); return; }
          throw new Error(t("Confira seu e-mail e sua senha."));
        }
        if (!register) {
          track("login_completed", { method, email_verified: false, destination });
          toast.success(t("Você entrou com sucesso."));
        }
        router.replace("/verificar-email" + suffix);
        router.refresh();
      });
    }}>
      {register && <label className="grid gap-2 text-sm font-medium">{t("Nome")}<Input name="name" minLength={2} maxLength={100} autoComplete="name" required /></label>}
      <label className="grid gap-2 text-sm font-medium">{t("E-mail")}<Input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label className="grid gap-2 text-sm font-medium">{t("Senha")}<Input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} maxLength={72} required /></label>
      <Button type="submit" disabled={!!busy} className="w-full">{busy === "auth" ? t("Aguarde…") : register ? t("Criar conta") : t("Entrar")}</Button>
    </form>
    {!register && <Link href="/recuperar-senha" className="mt-4 block text-sm text-brand underline">Esqueci minha senha</Link>}
    {register && <p className="mt-4 text-xs text-slate-500">Ao criar sua conta, você concorda com os <Link href="/termos" className="underline">Termos de Uso</Link> e conhece a <Link href="/privacidade" className="underline">Política de Privacidade</Link>.</p>}
    {/* Login com Google desativado no fluxo atual (confirmado: não necessário por enquanto). Reativar quando priorizado. */}
    {false && google && <Button variant="outline" className="mt-3 w-full" disabled={!!busy} onClick={() => void run("google", async () => { await signIn("google", { callbackUrl: "/verificar-email" + suffix }); })}>{t("Continuar com Google")}</Button>}
    <p className="mt-5 text-sm"><Link className="text-brand underline" href={(register ? "/login" : "/cadastro") + suffix}>{register ? t("Já tenho conta") : t("Criar conta gratuita")}</Link></p>
  </>);
}
