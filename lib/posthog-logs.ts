import { SeverityNumber } from "@opentelemetry/api-logs";
import { after } from "next/server";
import { loggerProvider } from "@/instrumentation";

const logger = loggerProvider?.getLogger("posthog-exporter");

type LogAttributes = Record<string, boolean | number | string>;

export function emitPostHogLog(
  body: string,
  severityNumber: SeverityNumber,
  attributes: LogAttributes,
) {
  if (!logger || !loggerProvider) return;

  logger.emit({ body, severityNumber, attributes });
  after(async () => {
    await loggerProvider.forceFlush().catch(() => undefined);
  });
}

export { SeverityNumber };
