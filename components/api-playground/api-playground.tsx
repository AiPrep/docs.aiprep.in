"use client"

import { useState, useCallback, useEffect } from "react"
import { Turnstile } from "react-turnstile"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RequestBar } from "./request-bar"
import { RequestConfig } from "./request-config"
import { ResponseViewer } from "./response-viewer"
import { CodeGenerator } from "./code-generator"
import { createPair } from "./key-value-editor"
import { useTurnstile } from "@/hooks/use-turnstile"
import { useApiKey } from "@/providers/api-key-provider"
import type {
  HttpMethod,
  KeyValuePair,
  AuthConfig,
  ProxyResponse,
  ProxyError,
} from "./types"

type ApiPlaygroundProps = {
  method?: string
  url?: string
  params?: string
  headers?: string
  body?: string
  auth?: string
}

function parseJsonProp<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function toPairs(items?: { key: string; value: string }[]): KeyValuePair[] {
  if (!items || items.length === 0) return [createPair()]
  return items.map((item) => createPair(item.key, item.value))
}

export function ApiPlayground({
  method: initialMethod = "GET",
  url: initialUrl = "",
  params: initialParams,
  headers: initialHeaders,
  body: initialBody = "",
  auth: initialAuth,
}: ApiPlaygroundProps) {
  const parsedHeaders = parseJsonProp<{ key: string; value: string }[]>(initialHeaders, [])
  const parsedParams = parseJsonProp<{ key: string; value: string }[]>(initialParams, [])
  const parsedAuth = parseJsonProp<AuthConfig>(initialAuth, { type: "none" })

  const [method, setMethod] = useState<HttpMethod>(initialMethod as HttpMethod)
  const [url, setUrl] = useState(initialUrl)
  const [params, setParams] = useState<KeyValuePair[]>(() => toPairs(parsedParams))
  const [headers, setHeaders] = useState<KeyValuePair[]>(() => toPairs(parsedHeaders))
  const [body, setBody] = useState(() => {
    if (!initialBody) return ""
    try {
      return JSON.stringify(JSON.parse(initialBody), null, 2)
    } catch {
      return initialBody
    }
  })
  const [auth, setAuth] = useState<AuthConfig>(parsedAuth)

  const [response, setResponse] = useState<ProxyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstile = useTurnstile()
  const { apiKey, setApiKey } = useApiKey()

  // Populate X-API-Key header from stored API key on mount
  useEffect(() => {
    if (apiKey) {
      setHeaders((prev) =>
        prev.map((h) =>
          h.key === "X-API-Key" && !h.value ? { ...h, value: apiKey } : h
        )
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  // Sync header changes back to stored API key
  function handleHeadersChange(newHeaders: KeyValuePair[]) {
    setHeaders(newHeaders)
    const apiKeyHeader = newHeaders.find((h) => h.key === "X-API-Key")
    if (apiKeyHeader) {
      setApiKey(apiKeyHeader.value)
    }
  }

  const buildUrl = useCallback((): string => {
    if (!url) return ""
    try {
      const u = new URL(url)
      for (const p of params) {
        if (p.enabled && p.key) {
          u.searchParams.set(p.key, p.value)
        }
      }
      if (auth.type === "api-key" && auth.addTo === "query" && auth.key) {
        u.searchParams.set(auth.key, auth.value)
      }
      return u.toString()
    } catch {
      return url
    }
  }, [url, params, auth])

  const buildHeaders = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {}
    for (const h of headers) {
      if (h.enabled && h.key) result[h.key] = h.value
    }
    if (auth.type === "bearer" && auth.token) {
      result["Authorization"] = `Bearer ${auth.token}`
    } else if (auth.type === "basic" && auth.username) {
      const encoded = btoa(`${auth.username}:${auth.password}`)
      result["Authorization"] = `Basic ${encoded}`
    } else if (auth.type === "api-key" && auth.addTo === "header" && auth.key) {
      result[auth.key] = auth.value
    }
    if (body && method !== "GET" && !result["Content-Type"] && !result["content-type"]) {
      result["Content-Type"] = "application/json"
    }
    return result
  }, [headers, auth, body, method])

  async function handleSend() {
    if (!url) return

    if (!turnstile.token) {
      setError("Please complete the verification challenge first.")
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          url: buildUrl(),
          headers: buildHeaders(),
          body: body && method !== "GET" ? body : null,
          turnstileToken: turnstile.token,
        }),
      })

      const data: ProxyResponse | ProxyError = await res.json()

      if ("error" in data) {
        setError(data.error)
      } else {
        setResponse(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
      turnstile.reset()
    }
  }

  return (
    <Card className="my-6">
      <CardContent className="space-y-4">
        <RequestBar
          method={method}
          url={url}
          loading={loading}
          onMethodChange={setMethod}
          onUrlChange={setUrl}
          onSend={handleSend}
        />

        <Turnstile
          sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onVerify={turnstile.onVerify}
          onExpire={turnstile.onExpire}
          onError={turnstile.onError}
          refreshExpired="auto"
        />

        <Separator />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <RequestConfig
              params={params}
              headers={headers}
              body={body}
              auth={auth}
              onParamsChange={setParams}
              onHeadersChange={handleHeadersChange}
              onBodyChange={setBody}
              onAuthChange={setAuth}
            />

            <Separator />

            <CodeGenerator
              method={method}
              url={buildUrl() || url}
              headers={headers}
              body={body}
              auth={auth}
            />
          </div>

          <div>
            <ResponseViewer
              response={response}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
