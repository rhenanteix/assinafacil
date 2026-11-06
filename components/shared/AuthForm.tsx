"use client";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jsonRequest, useSignatureActions } from "@/hooks/use-signature-actions";

export function AuthForm({ register = false, google, destination }: { register?: boolean; google: boolean; destination: "precos" | "dashboard" | "gerador" }) {
  const router = useRouter();
  const { busy, run } = useSignatureActions();
  const suffix = `?destino=${destination}`;
  return <div className="shell py-14"><div className="panel mx-auto max-w-md">
    <p className="eyebrow">Sua conta</p><h1 className="my-4 text-3xl font-bold">{register ? "Crie sua conta" : "Entre no AssinaFácil"}</h1>
    <form className="space-y-4" onSubmit={event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      void run("auth", async () => {
        if (register) {
          const { verificationSent } = await jsonRequest<{ verificationSent: boolean }>("/api/register", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, destination }),
          });
          if (!verificationSent) toast.info("Conta criada. Use a opção de enviar um novo link para confirmar o e-mail.");
        }
        const result = await signIn("credentials", { ...values, redirect: false });
        if (!result?.ok) {
          if (register) { router.replace("/login" + suffix); return; }
          throw new Error("Confira seu e-mail e sua senha.");
        }
        router.replace("/verificar-email" + suffix);
        router.refresh();
      });
    }}>
      {register && <label className="grid gap-2 text-sm font-medium">Nome<Input name="name" minLength={2} maxLength={100} autoComplete="name" required /></label>}
      <label className="grid gap-2 text-sm font-medium">E-mail<Input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label className="grid gap-2 text-sm font-medium">Senha<Input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} maxLength={72} required /></label>
      <Button type="submit" disabled={!!busy} className="w-full">{busy === "auth" ? "Aguarde…" : register ? "Criar conta" : "Entrar"}</Button>
    </form>
    {google && <Button variant="outline" className="mt-3 w-full" disabled={!!busy} onClick={() => void run("google", async () => { await signIn("google", { callbackUrl: "/verificar-email" + suffix }); })}>Continuar com Google</Button>}
    <p className="mt-5 text-sm"><Link className="text-brand underline" href={(register ? "/login" : "/cadastro") + suffix}>{register ? "Já tenho conta" : "Criar conta gratuita"}</Link></p>
  </div></div>;
}
