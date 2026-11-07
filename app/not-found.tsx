import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NotFoundScene } from "@/components/shared/NotFoundScene";
export default function NotFound() {
  return <section className="shell flex min-h-[78vh] flex-col items-center justify-center py-10 text-center">
    <span className="eyebrow">Uma pequena catástrofe</span>
    <div className="w-full max-w-xl"><NotFoundScene /></div>
    <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">Acho que derrubei essa página.</h1>
    <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500">O vaso estava bem na beiradinha… e esta página não está por aqui. Mas o caminho de volta está a salvo.</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/"><ArrowLeft size={16} />Voltar para o início</Link></Button><Button asChild variant="outline"><Link href="/dashboard">Meu espaço<ArrowRight size={16} /></Link></Button></div>
    <p className="mt-7 text-xs text-slate-400">Erro 404 · Página não encontrada. Gatinho encontrado.</p>
  </section>;
}
