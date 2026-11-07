import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { commercialInfo } from "@/lib/commercial";
export function PaymentTrust() {
  const info = commercialInfo();
  return <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-xs leading-5 text-slate-600"><p className="flex items-center gap-2 font-semibold text-violet-800"><ShieldCheck size={15} />Pix ou cartão · Pagamento único no Pro</p><p className="mt-1">Arrependimento em até 7 dias da contratação. <Link href="/termos#reembolso" className="underline">Como solicitar</Link></p>{info.invoice && <p>{info.invoice}</p>}<p><Link href="/ajuda" className="underline">Suporte{info.supportEmail ? `: ${info.supportEmail}` : " e dúvidas"}</Link>{info.supportResponse ? ` · ${info.supportResponse}` : ""}</p></div>;
}
