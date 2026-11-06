"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="shell py-16"><h1 className="text-3xl font-bold">Algo deu errado</h1>
    <p className="my-4 text-slate-600">Tente carregar a página novamente.</p><Button onClick={reset}>Tentar novamente</Button></div>;
}
