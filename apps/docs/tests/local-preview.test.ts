import {NextRequest} from "next/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const posthogMocks = vi.hoisted(() => ({
  capture: vi.fn(),
  construct: vi.fn(),
  shutdown: vi.fn(),
}));

vi.mock("posthog-node", () => ({
  PostHog: class {
    capture = posthogMocks.capture;
    shutdown = posthogMocks.shutdown;

    constructor() {
      posthogMocks.construct();
    }
  },
}));

describe("Docs local preview", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_LOCAL_PREVIEW", "true");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    vi.stubEnv("LOOPS_API_KEY", "test-loops-key");
    vi.stubEnv("FEATUREBASE_API_KEY", "test-featurebase-key");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "test-posthog-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({success: true})));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each(["newsletter", "changelog"] as const)(
    "blocks %s subscriptions before contacting an external service",
    async (service) => {
      const {POST} =
        service === "newsletter"
          ? await import("@/app/api/newsletter/route")
          : await import("@/app/api/changelog/route");
      const response = await POST(
        new NextRequest(`http://localhost:3000/api/${service}`, {
          body: JSON.stringify({email: "preview@example.com"}),
          method: "POST",
        }),
      );

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({
        error: "Subscriptions are disabled in local preview.",
      });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each(["newsletter", "changelog"] as const)(
    "keeps %s subscriptions enabled outside local preview",
    async (service) => {
      vi.stubEnv("NEXT_PUBLIC_LOCAL_PREVIEW", "false");

      const {POST} =
        service === "newsletter"
          ? await import("@/app/api/newsletter/route")
          : await import("@/app/api/changelog/route");
      const response = await POST(
        new NextRequest(`http://localhost:3000/api/${service}`, {
          body: JSON.stringify({email: "preview@example.com"}),
          method: "POST",
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({success: true});
      expect(fetch).toHaveBeenCalledOnce();
    },
  );

  it("does not initialize PostHog in local preview, even with production credentials", async () => {
    const {captureEvent, getPostHogClient} = await import("@/libs/posthog");

    expect(getPostHogClient()).toBeNull();
    await captureEvent({event: "local-preview-test"});

    expect(posthogMocks.construct).not.toHaveBeenCalled();
    expect(posthogMocks.capture).not.toHaveBeenCalled();
  });

  it("preserves production PostHog events outside local preview", async () => {
    vi.stubEnv("NEXT_PUBLIC_LOCAL_PREVIEW", "false");

    const {captureEvent} = await import("@/libs/posthog");

    await captureEvent({event: "local-preview-test"});

    expect(posthogMocks.capture).toHaveBeenCalledWith({
      distinctId: "unknown",
      event: "local-preview-test",
    });
    expect(posthogMocks.shutdown).toHaveBeenCalledOnce();
  });
});
