import { NextRequest, NextResponse } from "next/server"
import { validateUrl, checkRateLimit } from "@/lib/proxy/validate"
import type { ProxyRequest } from "@/components/api-playground/types"

const TIMEOUT_MS = 15_000
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024 // 5MB

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 }
    )
  }

  let body: ProxyRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { method, url, headers, body: requestBody, turnstileToken } = body

  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Turnstile verification required" },
      { status: 400 }
    )
  }

  const turnstileRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: ip,
      }),
    }
  )
  const turnstileData = await turnstileRes.json()

  if (!turnstileData.success) {
    return NextResponse.json(
      { error: "Turnstile verification failed. Please try again." },
      { status: 403 }
    )
  }

  if (!method || !ALLOWED_METHODS.has(method)) {
    return NextResponse.json({ error: "Invalid HTTP method" }, { status: 400 })
  }

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  const validation = await validateUrl(url)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const start = performance.now()

  try {
    const fetchHeaders: Record<string, string> = { ...headers }
    // Remove host header to avoid conflicts
    delete fetchHeaders["host"]
    delete fetchHeaders["Host"]

    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
      signal: controller.signal,
      redirect: "follow",
    }

    if (requestBody && method !== "GET") {
      fetchOptions.body = requestBody
    }

    const response = await fetch(validation.url.toString(), fetchOptions)

    const duration = Math.round(performance.now() - start)

    // Read response with size limit
    const reader = response.body?.getReader()
    const chunks: Uint8Array[] = []
    let totalSize = 0

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        totalSize += value.byteLength
        if (totalSize > MAX_RESPONSE_SIZE) {
          reader.cancel()
          return NextResponse.json(
            { error: "Response too large (max 5MB)" },
            { status: 413 }
          )
        }
        chunks.push(value)
      }
    }

    const responseBody = new TextDecoder().decode(
      Buffer.concat(chunks.map((c) => Buffer.from(c)))
    )

    // Extract response headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      duration,
      size: totalSize,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out (15s limit)" },
        { status: 408 }
      )
    }
    return NextResponse.json(
      { error: `Request failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 502 }
    )
  } finally {
    clearTimeout(timeout)
  }
}
