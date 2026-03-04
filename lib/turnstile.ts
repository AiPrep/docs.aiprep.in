/**
 * Cloudflare Turnstile Integration
 *
 * Invisible CAPTCHA for bot protection on expensive endpoints.
 * Used to protect video generation and other resource-intensive operations.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: unknown) => void;
          "expired-callback"?: () => void;
          size?: "invisible" | "normal" | "compact";
          theme?: "light" | "dark" | "auto";
          action?: string;
          cData?: string;
          execution?: "render" | "execute";
        }
      ) => string;
      execute: (container: HTMLElement | string, options?: object) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Token cache — Turnstile tokens are valid for 5 minutes; refresh at 4 min.
const TOKEN_LIFETIME_MS = 4 * 60 * 1000;
let tokenCache: { token: string; expiresAt: number } | null = null;

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
  // Fire-and-forget; errors are swallowed (getTurnstileToken logs them).
  getTurnstileToken(action).catch(() => {});
}

/**
 * Get a Turnstile token for CAPTCHA verification
 *
 * This creates an invisible CAPTCHA challenge and returns a token
 * that must be verified server-side.
 *
 * @param action - Optional action name for analytics
 * @returns Promise resolving to the CAPTCHA token, or null if Turnstile is not available
 */
export async function getTurnstileToken(action?: string): Promise<string | null> {
  // Skip if not configured (development mode)
  if (!TURNSTILE_SITE_KEY) {
    console.warn("[Turnstile] Site key not configured, skipping CAPTCHA");
    return null;
  }

  // Return cached token if still valid
  const cached = getCachedTurnstileToken();
  if (cached) return cached;

  // Wait for Turnstile script to load
  if (!window.turnstile) {
    await waitForTurnstile();
  }

  if (!window.turnstile) {
    console.error("[Turnstile] Script not loaded after waiting");
    return null;
  }

  return new Promise((resolve, reject) => {
    // Create a temporary container for the invisible widget
    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);

    let widgetId: string | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
      container.remove();
    };

    // Timeout after 30 seconds
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Turnstile token generation timed out"));
    }, 30000);

    try {
      widgetId = window.turnstile!.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "invisible",
        action: action,
        callback: (token: string) => {
          cleanup();
          tokenCache = { token, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
          resolve(token);
        },
        "error-callback": (error: unknown) => {
          cleanup();
          console.error("[Turnstile] Challenge failed:", error);
          reject(new Error("CAPTCHA challenge failed"));
        },
        "expired-callback": () => {
          cleanup();
          reject(new Error("CAPTCHA token expired"));
        },
      });
    } catch (error) {
      cleanup();
      console.error("[Turnstile] Render failed:", error);
      reject(error);
    }
  });
}

/**
 * Wait for the Turnstile script to load
 */
function waitForTurnstile(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error("Turnstile script load timeout"));
      }
    }, 100);
  });
}
