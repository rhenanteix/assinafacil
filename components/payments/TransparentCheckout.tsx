"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jsonRequest } from "@/hooks/use-signature-actions";
import type { CheckoutOrder } from "@/lib/payments/state";
import type { CardCheckout } from "@/types/abacatepay";

type Method = "PIX" | "BOLETO" | "CARD";
export function TransparentCheckout({ plan, cents, email, publicKey, devMode, initial }: {
  plan: string; cents: number; email: string; publicKey?: string; devMode: boolean; initial: CheckoutOrder | null;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const [method, setMethod] = useState<Method>("PIX");
  const [order, setOrder] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [cardError, setCardError] = useState(false);
  const [customer, setCustomer] = useState({ name: "", taxId: "", cellphone: "" });
  const cardContainer = useRef<HTMLDivElement>(null);
  const card = useRef<CardCheckout | null>(null);
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  const pending = !!order && ["creating", "uncertain", "pending"].includes(order.status);

  useEffect(() => {
    if (method !== "CARD" || order || !scriptReady || !publicKey || !cardContainer.current || !window.AbacatePay) return;
    let active = true;
    let instance: CardCheckout | undefined;
    setCardReady(false);
    setCardError(false);
    try {
      instance = window.AbacatePay.create({ publicKey, amount: cents, locale: locale === "en" ? "en" : "pt", icons: true,
        onCardChange: state => { if (active) setCardReady(state.canTokenize); } });
      card.current = instance;
      void instance.mount(cardContainer.current).catch(() => { if (active) setCardError(true); });
    } catch { setCardError(true); }
    return () => { active = false; instance?.destroy(); card.current = null; };
  }, [method, order, scriptReady, publicKey, cents, locale]);

  useEffect(() => {
    if (!order || !pending) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      if (document.visibilityState === "visible") {
        try {
          const result = await jsonRequest<{ order: CheckoutOrder }>(`/api/payments/orders/${order!.id}`, { signal: controller.signal, cache: "no-store" });
          if (!controller.signal.aborted) {
            setOrder(result.order);
            setError("");
            if (!["creating", "uncertain", "pending"].includes(result.order.status)) return;
          }
        } catch {
          if (!controller.signal.aborted) setError("Não foi possível consultar o pagamento. Tente novamente.");
        }
      }
      if (!controller.signal.aborted) timer = setTimeout(poll, 12000);
    }
    timer = setTimeout(poll, 4000);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [order?.id, pending]);

  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); toast.success(t("Código copiado.")); }
    catch { toast.error(t("Selecione o código e copie manualmente.")); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError("");
    try {
      let token: string | undefined;
      if (method === "CARD") {
        if (!card.current) throw new Error("Cartão indisponível no momento.");
        try { token = (await card.current.tokenize({ ...customer, email })).token; }
        catch { throw new Error("Não foi possível validar o cartão. Confira os dados e tente novamente."); }
      }
      requestId.current ??= crypto.randomUUID();
      const result = await jsonRequest<{ order: CheckoutOrder }>("/api/payments/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, method, requestId: requestId.current, ...(token ? { token } : {}), ...(method !== "PIX" ? { customer } : {}) }),
      });
      setOrder(result.order);
      router.replace(`/checkout?plan=${plan}&order=${result.order.id}`, { scroll: false });
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "Não foi possível iniciar o pagamento.";
      setError(message);
      toast.error(t(message));
    } finally { setBusy(false); submitting.current = false; }
  }
  const payment = order?.paymentData;
  const statuses: Record<string, string> = {
    approved: "Pagamento confirmado. Seu acesso foi liberado.",
    pending: "Aguardando pagamento. A confirmação aparecerá aqui automaticamente.",
    creating: "Preparando seu pagamento. Aguarde a confirmação.",
    uncertain: "Estamos verificando o pagamento. Não faça outra compra enquanto a confirmação estiver pendente.",
    failed: "O pagamento não foi concluído. Confira os dados ou tente outro meio de pagamento.",
    expired: "O prazo deste pagamento expirou. Você pode iniciar uma nova tentativa.",
    cancelled: "Pagamento cancelado.", refunded: "Pagamento reembolsado.",
    charged_back: "Pagamento estornado.", in_mediation: "Pagamento em análise de contestação.",
  };
  return <section className="panel space-y-5">
    {publicKey && <Script src="https://abacatepay.com/abacatepay.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} onError={() => setCardError(true)} />}
    {devMode && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{t("Ambiente de teste. Nenhum pagamento real será realizado.")}</p>}
    {order ? <div className="space-y-4">
      <p role="status" className="font-semibold">{t(statuses[order.status] ?? statuses.pending)}</p>
      <p className="break-all text-xs text-slate-500">{t("Pedido")}: {order.id}</p>
      {order.status === "pending" && payment && <>
        {payment.brCodeBase64 && <img src={payment.brCodeBase64} alt={t("QR Code para pagamento Pix")} width={256} height={256} className="mx-auto h-64 w-64 max-w-full" />}
        {payment.brCode && <div className="space-y-2"><label className="block text-sm font-medium" htmlFor="pix-code">{t("Pix copia e cola")}</label>
          <textarea id="pix-code" readOnly value={payment.brCode} className="w-full rounded-lg border p-3 text-xs" rows={3} />
          <Button type="button" variant="outline" onClick={() => void copy(payment.brCode)}>{t("Copiar código Pix")}</Button></div>}
        {(payment.identificationNumber || payment.barCode) && <div className="space-y-2"><label htmlFor="boleto-code" className="block text-sm font-medium">{t("Linha digitável do boleto")}</label>
          <Input id="boleto-code" readOnly value={payment.identificationNumber || payment.barCode} />
          <Button type="button" variant="outline" onClick={() => void copy(payment.identificationNumber || payment.barCode)}>{t("Copiar linha digitável")}</Button></div>}
        {payment.url && <a href={payment.url} target="_blank" rel="noopener noreferrer" className="block text-brand underline">{t("Abrir boleto para impressão")}</a>}
        {payment.expiresAt && <p className="text-sm text-slate-600">{t("Vencimento")}: {new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(payment.expiresAt))} (Brasília)</p>}
        {order.method === "BOLETO" && <p className="text-sm text-slate-600">{t("A liberação ocorre após a compensação do boleto.")}</p>}
      </>}
      {order.status === "approved" && <Button asChild><Link href="/dashboard">{t("Abrir minhas assinaturas")}</Link></Button>}
      {order.status === "approved" && payment?.receiptUrl && <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="block text-brand underline">{t("Ver comprovante")}</a>}
      {["failed", "expired", "cancelled"].includes(order.status) && <Button type="button" onClick={() => {
        requestId.current = null; setOrder(null); setError(""); router.replace(`/checkout?plan=${plan}`, { scroll: false });
      }}>{t("Tentar novamente")}</Button>}
    </div> : <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={busy}><legend className="mb-3 font-semibold">{t("Forma de pagamento")}</legend>
        <div className="flex flex-wrap gap-4">{(["PIX", "BOLETO", ...(publicKey ? ["CARD"] : [])] as Method[]).map(value =>
          <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3"><input type="radio" name="method" checked={method === value} value={value} onChange={() => { setMethod(value); setError(""); }} />{value === "PIX" ? "Pix" : t(value === "CARD" ? "Cartão de crédito" : "Boleto")}</label>
        )}</div>
      </fieldset>
      {method !== "PIX" && <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-semibold">{t("Dados do pagador")}</legend>
        <label className="grid gap-2 text-sm">{t("Nome completo")}<Input autoComplete="name" required minLength={2} maxLength={150} value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} /></label>
        <label className="grid gap-2 text-sm">{t("CPF ou CNPJ")}<Input inputMode="numeric" required minLength={11} maxLength={18} value={customer.taxId} onChange={e => setCustomer({ ...customer, taxId: e.target.value })} /></label>
        <label className="grid gap-2 text-sm">{t("Celular")}<Input autoComplete="tel" type="tel" required minLength={8} maxLength={20} value={customer.cellphone} onChange={e => setCustomer({ ...customer, cellphone: e.target.value })} /></label>
        <label className="grid gap-2 text-sm">{t("E-mail")}<Input readOnly type="email" value={email} /></label>
      </fieldset>}
      {method === "CARD" && <div><div ref={cardContainer} />{cardError ? <p role="alert" className="text-sm text-red-700">{t("Cartão indisponível no momento.")}</p> : !scriptReady && <p role="status">{t("Carregando formulário de cartão…")}</p>}</div>}
      <Button disabled={busy || (method === "CARD" && (!cardReady || cardError))} type="submit">
        {t(busy ? "Processando pagamento…" : method === "PIX" ? "Gerar Pix" : method === "BOLETO" ? "Gerar boleto" : "Pagar com cartão")}
      </Button>
    </form>}
    {error && <p role="alert" className="text-sm text-red-700">{t(error)}</p>}
    <p className="text-xs text-slate-500">{t("Pagamento processado com segurança pelo AbacatePay. Valores em reais (BRL).")}</p>
  </section>;
}
