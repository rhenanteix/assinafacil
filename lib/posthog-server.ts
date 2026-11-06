import { PostHog } from "posthog-node";

type ServerEvent = {
  distinctId: string;
  event: string;
  properties?: Record<string, boolean | number | string | null | undefined>;
};

let client: PostHog | null | undefined;

function getPostHogClient() {
  if (client !== undefined) return client;

  const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) {
    if (process.env.NODE_ENV === "development") {
      const missingVariable = !key ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN" : "NEXT_PUBLIC_POSTHOG_HOST";
      throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      );
    }
    client = null;
    return client;
  }

  client = new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
  return client;
}

export async function captureServerEvent({ distinctId, event, properties }: ServerEvent) {
  const posthog = getPostHogClient();
  if (!posthog) return;

  try {
    posthog.capture({ distinctId, event, properties });
    await posthog.flush();
  } catch {
    console.error("posthog.capture_failed", { event });
  }
}
