"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type LinkWithOnClickProps = React.ComponentProps<typeof Link> & {
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Link do Next.js que aceita `onClick` sem falhar na serialização
 * do Server Component. O handler é registrado via event listener no DOM.
 */
export function LinkWithOnClick({ onClick, ...props }: LinkWithOnClickProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = linkRef.current;
    if (!link || !onClick) return;
    const handler = (e: MouseEvent) => {
      onClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
    };
    link.addEventListener("click", handler);
    return () => link.removeEventListener("click", handler);
  }, [onClick]);

  return <Link {...props} ref={linkRef} />;
}