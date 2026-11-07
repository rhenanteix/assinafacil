"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { jsonRequest } from "@/hooks/use-signature-actions";
export function RecoveryForm({ reset = false }: { reset?: boolean }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (reset) { setToken(window.location.hash.slice(1)); history.replaceState(null, "", window.location.pathname); }
  }, [reset]);
  return <div className="shell py-14"><section className="panel mx-auto max-w-md"><p className="eyebrow">Sua conta, de volta com você</p><h1 className="my-4 text-3xl font-bold">{reset ? "Escolha uma nova senha" : "Esqueceu sua senha?"}</h1><p className="mb-6 text-sm leading-6 text-slate-500">{reset ? "Use uma senha exclusiva para sua conta Maily." : "Informe o e-mail da conta para receber um link de recuperação."}</p>{message ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p> : <form className="space-y-4" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (reset && data.password !== data.confirm) { setError("As senhas precisam ser iguais."); setBusy(false); return; }
    try {
      const result = await jsonRequest<{ message?: string }>(reset ? "/api/auth/reset-password" : "/api/auth/recover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reset ? { password: data.password, token } : { email: data.email }) });
      setMessage(reset ? "Senha alterada. Entre novamente com sua nova senha." : result.message ?? "Confira seu e-mail.");
    } catch (e) { setError(e instanceof Error ? e.message : "Tente novamente."); } finally { setBusy(false); }
  }}>{reset ? <><label className="grid gap-2 text-sm">Nova senha<Input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label><label className="grid gap-2 text-sm">Confirme a senha<Input name="confirm" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label>{!token && <p className="text-sm text-amber-800">Abra o link recebido por e-mail ou <Link href="/recuperar-senha" className="underline">solicite outro</Link>.</p>}</> : <label className="grid gap-2 text-sm">E-mail<Input name="email" type="email" autoComplete="email" maxLength={254} required /></label>}{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}<Button type="submit" disabled={busy || (reset && !token)} className="w-full">{busy ? "Aguarde…" : reset ? "Salvar nova senha" : "Enviar link"}</Button></form>}<Link href="/login" className="mt-6 inline-block text-sm text-brand underline">Voltar para entrar</Link></section></div>;
}
