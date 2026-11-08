"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
export function NotFoundScene() {
  const [take, setTake] = useState(0);
  return <div><div key={take} className="nf-scene" role="img" aria-label="O gatinho Maily dá uma patadinha em um vaso de planta, que balança e cai da prateleira.">
    <div className="nf-halo" /><span className="nf-number" aria-hidden="true">404</span>
    <div className="nf-shelf" />
    <img src="/mascote/boas-vindas.png" alt="" width={220} height={240} className="nf-cat" />
    <div className="nf-paw" />
    <div className="nf-plant"><svg viewBox="0 0 130 190" fill="none" aria-hidden="true"><path d="M66 135C69 96 46 73 52 22M67 105C76 75 91 64 97 35" stroke="#397e67" strokeWidth="5" strokeLinecap="round"/><path d="M54 65C23 66 19 40 25 29C49 30 57 44 54 65Z" fill="#7cc4a3"/><path d="M54 38C35 25 44 6 55 2C73 17 68 31 54 38Z" fill="#a1d9b9"/><path d="M77 86C76 58 98 51 114 56C111 79 96 90 77 86Z" fill="#69ae91"/><path d="M65 112C35 112 27 92 33 78C57 79 67 94 65 112Z" fill="#93d1ae"/><path d="M94 48C79 29 90 12 106 10C119 30 111 44 94 48Z" fill="#94d3b4"/><path d="M28 131H107L96 181C94 190 42 190 40 181L28 131Z" fill="#c88c73"/><path d="M28 131H107L103 149H32L28 131Z" fill="#b77862"/><rect x="22" y="122" width="91" height="16" rx="6" fill="#e1aa8d"/><path d="M50 156V174" stroke="#e7b69d" strokeWidth="5" strokeLinecap="round"/></svg></div>
    <span className="nf-oops" aria-hidden="true">Ops…</span><div className="nf-dust" /><div className="nf-soil nf-soil-one" /><div className="nf-soil nf-soil-two" />
  </div><button type="button" onClick={() => setTake(t => t + 1)} className="mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-xs text-violet-600 hover:bg-violet-100"><RotateCcw size={13} />Mais uma patadinha</button></div>;
}
