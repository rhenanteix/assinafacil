"use client";

import Image from "next/image";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { Toaster } from "sonner";
import { useTranslation } from "@/lib/i18n/client";

function MascotIcon({ kind }: { kind: "success" | "error" | "info" | "warning" }) {
  const Icon = kind === "success" ? Check : kind === "error" ? X : kind === "warning" ? TriangleAlert : Info;
  return <span className="maily-toast-mascot" aria-hidden="true">
    <Image src="/mascote/boas-vindas.png" alt="" width={48} height={48} sizes="48px" />
    <span className={`maily-toast-badge maily-toast-badge-${kind}`}><Icon size={12} strokeWidth={3} /></span>
  </span>;
}

export function MailyToaster({ id }: { id?: string }) {
  const t = useTranslation();
  return <Toaster id={id} position="bottom-right" theme="light" duration={3000} closeButton visibleToasts={3}
    mobileOffset={16} gap={12} containerAriaLabel={t("Notificações da Maily")}
    icons={{ success: <MascotIcon kind="success" />, error: <MascotIcon kind="error" />, info: <MascotIcon kind="info" />, warning: <MascotIcon kind="warning" /> }}
    toastOptions={{ className: "maily-toast", closeButtonAriaLabel: t("Fechar notificação") }} />;
}
