import Link from "next/link";
import Image from "next/image";
export function Header() {
  return <header className="border-b border-violet-100 bg-white"><nav aria-label="Navegação principal" className="shell flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
    <Link href="/" aria-label="Página inicial — AssinaFácil" className="shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"><Image src="/mascote/logo.png" alt="maily" width={2172} height={724} sizes="180px" priority className="h-auto w-[156px] sm:w-[180px]" /></Link>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold sm:gap-6">
      <Link href="/#sobre" className="hover:text-brand">Sobre</Link>
      <Link href="/#modelos" className="hover:text-brand">Modelos</Link>
      <Link href="/precos" className="hover:text-brand">Planos</Link>
      <Link href="/#empresas" className="hover:text-brand">Empresas</Link>
      <Link href="/dashboard" className="rounded-lg border border-violet-200 px-3 py-2 text-brand hover:bg-violet-50">Minha conta</Link>
    </div>
  </nav></header>;
}
