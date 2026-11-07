import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, type GuideSlug } from "@/lib/guides";
import { Button } from "@/components/ui/button";
export function generateStaticParams() { return Object.keys(guides).map(guide => ({ guide })); }
function getGuide(slug: string) { if (!Object.hasOwn(guides, slug)) notFound(); return guides[slug as GuideSlug]; }
export async function generateMetadata({ params }: { params: Promise<{ guide: string }> }) {
  const { guide } = await params; const data = getGuide(guide);
  return { title: data.title, description: data.description, alternates: { canonical: `/${guide}` } };
}
export default async function Guide({ params }: { params: Promise<{ guide: string }> }) {
  const data = getGuide((await params).guide);
  return <article className="shell max-w-4xl py-14"><Link href="/ajuda" className="text-sm text-brand">← Guias Maily</Link><p className="eyebrow mt-8">Sua assinatura, do seu jeito</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{data.title}</h1><p className="my-6 text-lg leading-relaxed text-slate-600">{data.description}</p><Button asChild><Link href="/gerador">Criar minha assinatura</Link></Button><div className="my-10 space-y-5">{data.sections.map(([title, body]) => <section key={title} className="panel"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-slate-600">{body}</p></section>)}</div><div className="space-y-3 text-sm">{data.sources.map(source => <a key={source.url} href={source.url} className="block text-brand underline">{source.label}</a>)}<Link href="/compatibilidade" className="block text-brand underline">Confira o registro de compatibilidade por modelo</Link><Link href="/precos" className="block text-brand underline">Compare o Free com o Pro</Link></div></article>;
}
