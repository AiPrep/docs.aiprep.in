"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RequestBar } from "./request-bar"
import { RequestConfig } from "./request-config"
import { ResponseViewer } from "./response-viewer"
import { CodeGenerator } from "./code-generator"
import { createPair } from "./key-value-editor"
import type {
  HttpMethod,
  KeyValuePair,
  AuthConfig,
  ProxyResponse,
  ProxyError,
} from "./types"

type ApiPlaygroundProps = {
  method?: HttpMethod
  url?: string
  params?: { key: string; value: string }[]
  headers?: { key: string; value: string }[]
  body?: string
  auth?: AuthConfig
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
  auth: initialAuth = { type: "none" },
}: ApiPlaygroundProps) {
  const [method, setMethod] = useState<HttpMethod>(initialMethod)
  const [url, setUrl] = useState(initialUrl)
  const [params, setParams] = useState<KeyValuePair[]>(() => toPairs(initialParams))
  const [headers, setHeaders] = useState<KeyValuePair[]>(() => toPairs(initialHeaders))
  const [body, setBody] = useState(initialBody)
  const [auth, setAuth] = useState<AuthConfig>(initialAuth)

  const [response, setResponse] = useState<ProxyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

        <Separator />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <RequestConfig
              params={params}
              headers={headers}
              body={body}
              auth={auth}
              onParamsChange={setParams}
              onHeadersChange={setHeaders}
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
