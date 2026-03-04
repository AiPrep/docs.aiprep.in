/**
 * Cloudflare Turnstile Integration via iframe bridge
 *
 * Turnstile is only whitelisted for aiprep.in. This module communicates with
 * a bridge page on aiprep.in via postMessage to obtain tokens.
 */

const BRIDGE_URL =
  process.env.NEXT_PUBLIC_TURNSTILE_BRIDGE_URL ||
  "https://aiprep.in/docs";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Token cache — Turnstile tokens are valid for 5 minutes; refresh at 4 min.
const TOKEN_LIFETIME_MS = 4 * 60 * 1000;
let tokenCache: { token: string; expiresAt: number } | null = null;

// Singleton iframe
let bridgeIframe: HTMLIFrameElement | null = null;
let iframeReady: Promise<void> | null = null;

/**
 * Check if Turnstile is available and configured
 */
export function isTurnstileEnabled(): boolean {
  return !!TURNSTILE_SITE_KEY;
}

/**
 * Return a cached token if it's still fresh, otherwise null.
 */
export function getCachedTurnstileToken(): string | null {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  tokenCache = null;
  return null;
}

/**
 * Pre-warm the Turnstile token cache so `getTurnstileToken` returns instantly
 * on the next call. Safe to call multiple times — no-ops when a valid token
 * is already cached.
 */
export function preWarmTurnstileToken(action?: string): void {
  if (!isTurnstileEnabled()) return;
  if (getCachedTurnstileToken()) return;
  getTurnstileToken(action).catch(() => {});
}

/**
 * Ensure the bridge iframe is created and loaded.
 */
function ensureBridgeIframe(): Promise<void> {
  if (iframeReady) return iframeReady;

  iframeReady = new Promise<void>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.src = BRIDGE_URL;
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("tabindex", "-1");

    const timeout = setTimeout(() => {
      reject(new Error("[Turnstile] Bridge iframe load timeout"));
    }, 15000);

    iframe.onload = () => {
      clearTimeout(timeout);
      bridgeIframe = iframe;
      resolve();
    };

    iframe.onerror = () => {
      clearTimeout(timeout);
      iframeReady = null;
      reject(new Error("[Turnstile] Bridge iframe failed to load"));
    };

    document.body.appendChild(iframe);
  });

  return iframeReady;
}

/**
 * Get a Turnstile token via the iframe bridge.
 *
 * @param action - Optional action name for analytics
 * @returns Promise resolving to the CAPTCHA token, or null if not available
 */
export async function getTurnstileToken(
  action?: string
): Promise<string | null> {
  if (!TURNSTILE_SITE_KEY) {
    console.warn("[Turnstile] Site key not configured, skipping CAPTCHA");
    return null;
  }

  const cached = getCachedTurnstileToken();
  if (cached) return cached;

  try {
    await ensureBridgeIframe();
  } catch (error) {
    console.error("[Turnstile] Failed to load bridge iframe:", error);
    return null;
  }

  if (!bridgeIframe?.contentWindow) {
    console.error("[Turnstile] Bridge iframe not available");
    return null;
  }

  const bridgeOrigin = new URL(BRIDGE_URL).origin;

  return new Promise<string | null>((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function handleResponse(event: MessageEvent) {
      if (event.origin !== bridgeOrigin) return;

      if (event.data?.type === "turnstile-response") {
        cleanup();
        const token = event.data.token as string;
        tokenCache = { token, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
        console.log("[Turnstile] Token obtained via bridge");
        resolve(token);
      } else if (event.data?.type === "turnstile-error") {
        cleanup();
        console.error("[Turnstile] Bridge error:", event.data.error);
        reject(new Error(event.data.error || "Turnstile bridge error"));
      }
    }

    function cleanup() {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("message", handleResponse);
    }

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("[Turnstile] Token request timed out"));
    }, 30000);

    window.addEventListener("message", handleResponse);

    bridgeIframe!.contentWindow!.postMessage(
      { type: "turnstile-request", action },
      bridgeOrigin
    );
  });
}
