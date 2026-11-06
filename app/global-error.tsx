"use client";

import { useEffect } from "react";
import NextError from "next/error";
import posthog from "posthog-js";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="shell py-16">
          <NextError statusCode={0} />
          <button onClick={reset} type="button">
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
