
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import posthog from "posthog-js";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { MailyToaster } from "@/components/shared/MailyToaster";
import { useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";

type GalleryModel = {
  id: string;
  label: string;
  tier: string;
  html: string;
};

type ModelGalleryProps = {
  models: GalleryModel[];
};

type BusinessContactProps = {
  enabled: boolean;
  contactEmail?: string;
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-slate-300 " +
  "!bg-white !text-slate-900 !opacity-100 " +
  "px-4 py-3 text-sm shadow-sm " +
  "placeholder:!text-slate-400 " +
  "focus:border-violet-500 focus:outline-none " +
  "focus:ring-4 focus:ring-violet-500/15 " +
  "disabled:bg-slate-100 disabled:text-slate-500 " +
  "transition-colors duration-200";

const labelClass =
  "mb-2 block text-sm font-semibold !text-slate-800";

const modalClass =
  "fixed inset-0 m-auto box-border " +
  "w-[calc(100%-24px)] max-w-[640px] " +
  "max-h-[calc(100dvh-24px)] " +
  "overflow-y-auto overscroll-contain " +
  "rounded-2xl sm:rounded-3xl " +
  "!border !border-slate-200 " +
  "!bg-white !text-slate-900 " +
  "!opacity-100 shadow-2xl " +
  "backdrop:bg-slate-950/75 " +
  "backdrop:backdrop-blur-sm " +
  "p-0";

function CloseButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        "inline-flex h-10 w-10 shrink-0 items-center " +
        "justify-center rounded-xl border border-white/20 " +
        "bg-white/15 text-white transition " +
        "hover:bg-white/25 focus-visible:outline-none " +
        "focus-visible:ring-2 focus-visible:ring-white"
      }
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export function ModelGallery({
  models,
}: ModelGalleryProps) {
  const t = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);

  const [selected, setSelected] =
    useState<GalleryModel | null>(null);

  const openPreview = useCallback((model: GalleryModel) => {
    setSelected(model);

    if (!dialog.current?.open) {
      dialog.current?.showModal();
    }
  }, []);

  const closePreview = useCallback(() => {
    dialog.current?.close();
  }, []);

  return (
    <section
      aria-labelledby="models-title"
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2
          id="models-title"
          className="text-2xl font-bold tracking-tight"
        >
          {t("Veja os modelos")}
        </h2>

        <p className="text-sm leading-relaxed text-slate-600">
          {t(
            "Exemplos fictícios e enxutos. Adicione só o que faz sentido para você."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => openPreview(model)}
            aria-label={`${t("Ampliar modelo")}: ${model.label}`}
            className={
              "group min-w-0 overflow-hidden rounded-2xl " +
              "border border-slate-200 bg-white text-left " +
              "shadow-sm transition-all duration-200 " +
              "hover:-translate-y-1 hover:border-violet-300 " +
              "hover:shadow-lg focus-visible:outline-none " +
              "focus-visible:ring-4 focus-visible:ring-violet-300"
            }
          >
            <div
              className={
                "pointer-events-none relative h-44 " +
                "overflow-hidden bg-slate-100"
              }
              aria-hidden="true"
            >
              <iframe
                tabIndex={-1}
                title={model.label}
                sandbox=""
                srcDoc={model.html}
                loading="lazy"
                className={
                  "h-[320px] w-[560px] origin-top-left " +
                  "scale-[0.60] border-0 bg-white"
                }
              />

              <div
                className={
                  "absolute bottom-3 right-3 flex h-9 w-9 " +
                  "items-center justify-center rounded-xl " +
                  "bg-white text-violet-700 shadow-md"
                }
              >
                <Eye className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-4">
              <strong className="min-w-0 text-sm font-semibold text-slate-900">
                {model.label}
              </strong>

              <span
                className={
                  "shrink-0 rounded-full bg-violet-100 " +
                  "px-3 py-1 text-xs font-semibold text-violet-800"
                }
              >
                {model.tier}
              </span>
            </div>
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="model-dialog-title"
        className={modalClass + " max-w-4xl"}
      >
        {selected && (
          <>
            <div
              className={
                "flex items-center justify-between gap-4 " +
                "bg-gradient-to-r from-violet-700 to-indigo-700 " +
                "px-5 py-5 text-white sm:px-7"
              }
            >
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium text-violet-100">
                  {t("Prévia")}
                </p>

                <h3
                  id="model-dialog-title"
                  className="text-lg font-bold text-white sm:text-xl"
                >
                  {selected.label}
                </h3>

                <p className="mt-1 text-xs text-violet-100">
                  {selected.tier}
                </p>
              </div>

              <CloseButton
                onClick={closePreview}
                label={t("Fechar")}
              />
            </div>

            <div className="bg-white p-3 sm:p-6">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <iframe
                  title={`${t("Prévia")}: ${selected.label}`}
                  sandbox=""
                  srcDoc={selected.html}
                  className="block h-[360px] w-full border-0 bg-white sm:h-[440px]"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={closePreview}
                className="border-slate-300 bg-white text-slate-800"
              >
                {t("Fechar")}
              </Button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}

export function BusinessContact({
  enabled,
  contactEmail,
}: BusinessContactProps) {
  const t = useTranslation();

  const dialog = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sending = useRef(false);

  const toasterId = useId();
  const titleId = useId();
  const descriptionId = useId();

  const [busy, setBusy] = useState(false);

  const openModal = useCallback(() => {
    if (!dialog.current?.open) {
      dialog.current?.showModal();
    }
  }, []);

  const closeModal = useCallback(() => {
    if (sending.current) return;
    dialog.current?.close();
  }, []);

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;

    const handleCancel = (event: Event) => {
      if (sending.current) {
        event.preventDefault();
      }
    };

    modal.addEventListener("cancel", handleCancel);

    return () => {
      modal.removeEventListener("cancel", handleCancel);
    };
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!enabled || sending.current) return;

    const form = event.currentTarget;

    sending.current = true;
    setBusy(true);

    try {
      const data = Object.fromEntries(
        new FormData(form).entries()
      );

      const response = await fetch("/api/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000),
      });

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ??
          "Não foi possível enviar. Tente novamente mais tarde."
        );
      }

      try {
        posthog.capture("business_contact_requested");
      } catch {
        // Falha de analytics não interfere no envio.
      }

      form.reset();
      dialog.current?.close();

      toast.success(
        t(
          "Solicitação enviada para a equipe. Responderemos pelo e-mail informado."
        )
      );
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        (error.name === "TimeoutError" ||
          error.name === "AbortError");

      const message = isTimeout
        ? "Não foi possível confirmar o envio. Aguarde antes de tentar novamente."
        : error instanceof Error
          ? error.message
          : "Não foi possível enviar. Tente novamente mais tarde.";

      toast.error(t(message), {
        toasterId,
      });
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={openModal}
        className={
          "inline-flex items-center gap-2 rounded-xl " +
          "border-violet-200 bg-white px-5 py-3 " +
          "font-semibold text-violet-700 shadow-sm " +
          "transition hover:border-violet-400 " +
          "hover:bg-violet-50"
        }
      >
        <Users className="h-4 w-4" aria-hidden="true" />
        {t("Falar com a equipe")}
        <ArrowRight
          className="h-4 w-4"
          aria-hidden="true"
        />
      </Button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={modalClass}
      >
        {/* CABEÇALHO */}
        <div
          className={
            "relative overflow-hidden bg-gradient-to-br " +
            "from-violet-700 via-violet-650 to-indigo-800 " +
            "px-5 py-6 text-white sm:px-7 sm:py-7"
          }
          style={{
            background:
              "linear-gradient(135deg, #6d28d9 0%, #5b21b6 55%, #3730a3 100%)",
          }}
        >
          <div
            className={
              "relative z-10 flex items-start " +
              "justify-between gap-3"
            }
          >
            <div
              className={
                "flex h-12 w-12 shrink-0 items-center " +
                "justify-center rounded-2xl border " +
                "border-white/20 bg-white/15"
              }
            >
              <Users className="h-6 w-6 text-white" />
            </div>

            <CloseButton
              onClick={closeModal}
              label={t("Fechar")}
            />
          </div>

          <div className="relative z-10 mt-5">
            <span
              className={
                "inline-flex items-center gap-2 rounded-full " +
                "border border-white/20 bg-white/15 " +
                "px-3 py-1.5 text-xs font-semibold text-white"
              }
            >
              <Building2 className="h-3.5 w-3.5" />
              Maily Business
            </span>

            <h2
              id={titleId}
              className={
                "mt-3 text-2xl font-bold tracking-tight " +
                "!text-white sm:text-3xl"
              }
            >
              {t("Falar com a equipe")}
            </h2>

            <p
              id={descriptionId}
              className={
                "mt-3 max-w-lg text-sm leading-6 " +
                "!text-violet-100"
              }
            >
              Padronize as assinaturas de e-mail da sua
              empresa com uma solução profissional,
              simples e pronta para sua equipe.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white">
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                Equipe ilimitada
              </span>

              <span className="rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                Sem cobrança automática
              </span>
            </div>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="space-y-6 !bg-white px-5 py-6 sm:px-7 sm:py-7">
          {/* INFORMAÇÕES DO PLANO */}
          {contactEmail && (
            <div
              className={
                "overflow-hidden rounded-2xl border " +
                "border-violet-200 !bg-violet-50"
              }
            >
              <div className="border-b border-violet-200 px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide !text-violet-700">
                      Plano empresarial
                    </p>

                    <h3 className="mt-1 text-lg font-bold !text-slate-900">
                      Maily Business
                    </h3>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 text-violet-700 shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-4 py-5 sm:px-5">
                <p className="text-xs font-medium !text-slate-600">
                  Valores iniciais de referência,
                  sujeitos à confirmação comercial.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-violet-100 !bg-white p-4">
                    <p className="text-xs font-medium !text-slate-600">
                      Implantação + 1º mês
                    </p>

                    <p className="mt-2 text-2xl font-extrabold !text-violet-800">
                      R$ 89,90
                    </p>

                    <p className="mt-1 text-xs !text-slate-500">
                      por empresa
                    </p>
                  </div>

                  <div className="rounded-xl border border-violet-100 !bg-white p-4">
                    <p className="text-xs font-medium !text-slate-600">
                      Meses seguintes
                    </p>

                    <p className="mt-2 text-2xl font-extrabold !text-violet-800">
                      R$ 19,90
                      <span className="ml-1 text-sm font-medium !text-slate-500">
                        /mês
                      </span>
                    </p>

                    <p className="mt-1 text-xs !text-slate-500">
                      por empresa
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl !bg-white p-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />

                  <p className="text-xs leading-5 !text-slate-700">
                    Enquanto a recorrência automática
                    não estiver disponível, os meses
                    seguintes serão cobrados ou ajustados
                    manualmente com nossa equipe.
                  </p>
                </div>

                <p className="flex items-center gap-2 text-xs font-semibold !text-violet-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Este formulário não gera cobrança.
                </p>
              </div>
            </div>
          )}

          {/* CONTATO */}
          {contactEmail && (
            <div
              className={
                "flex items-start gap-3 rounded-2xl " +
                "border border-slate-200 !bg-slate-50 p-4"
              }
            >
              <div
                className={
                  "flex h-10 w-10 shrink-0 items-center " +
                  "justify-center rounded-xl bg-violet-100"
                }
              >
                <Mail className="h-5 w-5 text-violet-700" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold !text-slate-900">
                  Contato comercial
                </p>

                <p className="mt-1 text-xs leading-5 !text-slate-600">
                  Sua solicitação será encaminhada
                  para nossa equipe. Você também pode
                  entrar em contato diretamente:
                </p>

                <a
                  href={`mailto:${contactEmail}`}
                  className={
                    "mt-2 block break-all text-sm " +
                    "font-semibold !text-violet-700 " +
                    "underline underline-offset-2 " +
                    "hover:!text-violet-900"
                  }
                >
                  {contactEmail}
                </a>
              </div>
            </div>
          )}

          {/* FORMULÁRIO */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold !text-slate-900">
                Solicitar atendimento
              </h3>

              <p className="mt-1 text-sm !text-slate-600">
                Preencha os dados abaixo e nossa equipe
                entrará em contato.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${titleId}-name`} className={labelClass}>
                  {t("Nome")} <span className="text-red-600">*</span>
                </label>

                <input
                  id={`${titleId}-name`}
                  name="name"
                  type="text"
                  required
                  maxLength={254}
                  pattern=".*\S.*"
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={`${titleId}-email`} className={labelClass}>
                  {t("E-mail")} <span className="text-red-600">*</span>
                </label>

                <input
                  id={`${titleId}-email`}
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="voce@empresa.com.br"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${titleId}-company`} className={labelClass}>
                  {t("Empresa")} <span className="text-red-600">*</span>
                </label>

                <input
                  id={`${titleId}-company`}
                  name="company"
                  type="text"
                  required
                  maxLength={254}
                  pattern=".*\S.*"
                  autoComplete="organization"
                  placeholder="Nome da empresa"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={`${titleId}-employees`} className={labelClass}>
                  {t("Nº de colaboradores")}
                  <span className="text-red-600"> *</span>
                </label>

                <input
                  id={`${titleId}-employees`}
                  name="employees"
                  type="number"
                  required
                  min={1}
                  step={1}
                  placeholder="Ex.: 15"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor={`${titleId}-message`} className={labelClass}>
                {t("Mensagem (opcional)")}
              </label>

              <textarea
                id={`${titleId}-message`}
                name="message"
                rows={4}
                maxLength={1500}
                placeholder="Conte um pouco sobre o que sua empresa precisa..."
                className={inputClass + " resize-y"}
              />
            </div>

            {/* HONEYPOT ANTISPAM */}
            <div
              className="hidden"
              aria-hidden="true"
            >
              <label htmlFor={`${titleId}-website`}>
                Website
              </label>

              <input
                id={`${titleId}-website`}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {!enabled && (
              <div
                role="status"
                className={
                  "rounded-xl border border-amber-200 " +
                  "bg-amber-50 p-4 text-sm !text-amber-900"
                }
              >
                Contato comercial a confirmar.
                Nenhuma mensagem será enviada
                enquanto o atendimento estiver indisponível.
              </div>
            )}

            <div className="flex items-start gap-2">
              <ShieldCheck
                className={
                  "mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                }
              />

              <p className="text-xs leading-5 !text-slate-600">
                Usamos seus dados exclusivamente para
                responder à sua solicitação comercial.
                Consulte nossa{" "}
                <a
                  href="/privacidade"
                  className={
                    "font-semibold !text-violet-700 " +
                    "underline underline-offset-2"
                  }
                >
                  Política de Privacidade
                </a>
                .
              </p>
            </div>

            <Button
              type="submit"
              disabled={!enabled || busy}
              aria-busy={busy}
              className={
                "flex min-h-12 w-full items-center " +
                "justify-center gap-2 rounded-xl " +
                "!bg-violet-700 px-5 py-3 " +
                "!text-white font-semibold shadow-md " +
                "transition hover:!bg-violet-800 " +
                "disabled:cursor-not-allowed " +
                "disabled:!bg-slate-400 " +
                "disabled:opacity-70"
              }
            >
              {busy ? (
                <>
                  <span
                    className={
                      "h-4 w-4 animate-spin rounded-full " +
                      "border-2 border-white/30 border-t-white"
                    }
                    aria-hidden="true"
                  />
                  {t("Enviando…")}
                </>
              ) : (
                <>
                  {t("Enviar solicitação")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs !text-slate-500">
              Sem compromisso e sem cobrança automática.
            </p>
          </form>

          <MailyToaster id={toasterId} />
        </div>
      </dialog>
    </>
  );
}
